import { groq } from './groq';
import { AITaggingResult, ParsedEntity, EntityType } from '@/app/types';

const DEFAULT_MODEL = 'llama-3.1-8b-instant';

/**
 * Generate AI-powered tags and metadata for an entity
 */
export async function generateAITags(
  content: string,
  title: string,
  type: EntityType
): Promise<AITaggingResult> {
  if (!groq) {
    return fallbackTagging(content, title, type);
  }

  const prompt = `Analyze this ${type} and generate comprehensive metadata.

Title: ${title}
Type: ${type}

Content:
---
${content.slice(0, 3000)}
---

Provide a JSON response with:
1. tags: Array of 5-10 relevant tags (lowercase, no spaces)
2. categories: Array of 2-4 high-level categories
3. complexity: "beginner", "intermediate", or "advanced"
4. estimatedTime: Estimated time to learn/use (e.g., "5 min", "1 hour", "1 day")
5. keywords: Array of 5-8 important keywords found in the content

Format:
{
  "tags": ["tag1", "tag2", ...],
  "categories": ["category1", "category2"],
  "complexity": "intermediate",
  "estimatedTime": "30 min",
  "keywords": ["keyword1", "keyword2", ...]
}`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a metadata generation system. Return only valid JSON with the requested fields.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      model: DEFAULT_MODEL,
      temperature: 0.3,
      response_format: { type: 'json_object' }
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      return fallbackTagging(content, title, type);
    }

    const parsed = JSON.parse(response);

    return {
      tags: Array.isArray(parsed.tags) ? parsed.tags.slice(0, 10) : [],
      categories: Array.isArray(parsed.categories) ? parsed.categories.slice(0, 4) : [],
      complexity: ['beginner', 'intermediate', 'advanced'].includes(parsed.complexity) 
        ? parsed.complexity 
        : 'intermediate',
      estimatedTime: parsed.estimatedTime || 'unknown',
      keywords: Array.isArray(parsed.keywords) ? parsed.keywords.slice(0, 8) : []
    };
  } catch (error) {
    console.error('Error generating AI tags:', error);
    return fallbackTagging(content, title, type);
  }
}

/**
 * Fallback tagging when AI is unavailable
 */
function fallbackTagging(content: string, title: string, type: EntityType): AITaggingResult {
  const lowerContent = content.toLowerCase();
  
  // Extract keywords using simple frequency analysis
  const words = lowerContent
    .replace(/[^a-zA-Z\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 3 && !isStopWord(w));
  
  const wordFreq: Record<string, number> = {};
  for (const word of words) {
    wordFreq[word] = (wordFreq[word] || 0) + 1;
  }
  
  const keywords = Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([word]) => word);
  
  // Determine complexity
  let complexity: 'beginner' | 'intermediate' | 'advanced' = 'intermediate';
  const codeBlockCount = (content.match(/```/g) || []).length / 2;
  const lineCount = content.split('\n').length;
  
  if (codeBlockCount > 3 || lineCount > 100) {
    complexity = 'advanced';
  } else if (codeBlockCount === 0 && lineCount < 30) {
    complexity = 'beginner';
  }
  
  // Generate tags from keywords
  const tags = [
    type,
    ...keywords.slice(0, 5),
    complexity
  ].filter(Boolean);
  
  // Detect categories
  const categories: string[] = [type];
  if (/api|http|rest|graphql/i.test(content)) categories.push('api');
  if (/ui|css|html|component/i.test(content)) categories.push('frontend');
  if (/database|sql|query/i.test(content)) categories.push('database');
  if (/test|spec|jest/i.test(content)) categories.push('testing');
  
  return {
    tags: [...new Set(tags)],
    categories: [...new Set(categories)],
    complexity,
    estimatedTime: lineCount > 100 ? '1 hour' : lineCount > 50 ? '30 min' : '10 min',
    keywords
  };
}

const STOP_WORDS = new Set([
  'this', 'that', 'with', 'from', 'they', 'have', 'will', 'what',
  'when', 'where', 'which', 'their', 'there', 'would', 'could',
  'should', 'about', 'after', 'before', 'being', 'between',
  'through', 'during', 'above', 'below', 'under', 'over'
]);

function isStopWord(word: string): boolean {
  return STOP_WORDS.has(word.toLowerCase());
}

/**
 * Batch process multiple entities for tagging
 */
export async function batchGenerateTags(
  entities: ParsedEntity[],
  onProgress?: (completed: number, total: number) => void
): Promise<Map<string, AITaggingResult>> {
  const results = new Map<string, AITaggingResult>();
  const batchSize = 3; // Process 3 at a time to avoid rate limits
  
  for (let i = 0; i < entities.length; i += batchSize) {
    const batch = entities.slice(i, i + batchSize);
    
    await Promise.all(
      batch.map(async (entity, idx) => {
        const tags = await generateAITags(
          entity.content,
          entity.title,
          entity.type
        );
        results.set(`${i + idx}-${entity.title}`, tags);
      })
    );
    
    onProgress?.(Math.min(i + batchSize, entities.length), entities.length);
    
    // Small delay between batches
    if (i + batchSize < entities.length) {
      await new Promise(r => setTimeout(r, 500));
    }
  }
  
  return results;
}

/**
 * Suggest collection name based on AI analysis
 */
export async function suggestCollectionName(
  entities: ParsedEntity[]
): Promise<string> {
  if (entities.length === 0) return 'General';
  
  // Use common tags to determine collection
  const tagCounts: Record<string, number> = {};
  const categoryCounts: Record<string, number> = {};
  
  for (const entity of entities) {
    for (const tag of entity.tags || []) {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    }
    if (entity.metadata?.category) {
      categoryCounts[entity.metadata.category] = 
        (categoryCounts[entity.metadata.category] || 0) + 1;
    }
  }
  
  // Find most common category
  const topCategory = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])[0];
  
  if (topCategory) {
    return topCategory[0].charAt(0).toUpperCase() + topCategory[0].slice(1);
  }
  
  // Fallback to common tags
  const topTag = Object.entries(tagCounts)
    .filter(([tag]) => !['skill', 'agent', 'prompt'].includes(tag))
    .sort((a, b) => b[1] - a[1])[0];
  
  if (topTag) {
    return topTag[0].charAt(0).toUpperCase() + topTag[0].slice(1);
  }
  
  return 'General';
}
