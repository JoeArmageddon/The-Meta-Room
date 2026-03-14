import Groq from 'groq-sdk';
import { AIExplanation } from '@/app/types';

const groqApiKey = process.env.GROQ_API_KEY;

if (!groqApiKey && typeof window === 'undefined') {
  console.warn('GROQ_API_KEY not set. AI explanations will not work.');
}

export const groq = groqApiKey ? new Groq({ apiKey: groqApiKey }) : null;

const DEFAULT_MODEL = 'llama-3.3-70b-versatile';

interface GenerateExplanationOptions {
  model?: string;
  temperature?: number;
}

export function isGroqConfigured(): boolean {
  return !!groqApiKey && !!groq;
}

export async function generateExplanation(
  content: string,
  title: string,
  type: string,
  options: GenerateExplanationOptions = {}
): Promise<Partial<AIExplanation>> {
  if (!groq) {
    throw new Error('GROQ_API_KEY not configured');
  }

  const model = options.model || DEFAULT_MODEL;
  const temperature = options.temperature ?? 0.3;

  const prompt = buildExplanationPrompt(content, title, type);

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are an expert AI systems analyst. Your task is to analyze and explain AI-related artifacts including skills, agents, prompts, and workflows. Provide clear, structured explanations that help users understand when and how to use these artifacts.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      model,
      temperature,
      response_format: { type: 'json_object' }
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('Empty response from Groq');
    }

    const parsed = JSON.parse(response);
    
    return {
      summary: parsed.summary || '',
      detailed_explanation: parsed.detailed_explanation || '',
      use_cases: Array.isArray(parsed.use_cases) ? parsed.use_cases : [],
      examples: Array.isArray(parsed.examples) ? parsed.examples : [],
      related_tools: Array.isArray(parsed.related_tools) ? parsed.related_tools : [],
      model_used: model
    };
  } catch (error) {
    console.error('Error generating explanation:', error);
    throw error;
  }
}

function buildExplanationPrompt(content: string, title: string, type: string): string {
  return `Analyze the following ${type} and provide a structured explanation.

Title: ${title}
Type: ${type}

Content:
---
${content.slice(0, 8000)}
---

Provide your analysis in the following JSON format:
{
  "summary": "A concise 2-3 sentence summary of what this ${type} does",
  "detailed_explanation": "A comprehensive explanation covering the purpose, functionality, and key aspects of this ${type}",
  "use_cases": [
    "Specific scenario 1 where this is useful",
    "Specific scenario 2 where this is useful",
    "Specific scenario 3 where this is useful"
  ],
  "examples": [
    "Concrete example 1 of using this ${type}",
    "Concrete example 2 of using this ${type}"
  ],
  "related_tools": [
    "Related tool, technology, or concept 1",
    "Related tool, technology, or concept 2"
  ]
}

Be specific and actionable in your explanations. Focus on practical value for AI practitioners.`;
}

export async function generateEmbedding(text: string): Promise<number[]> {
  // For now, return a placeholder embedding
  // In production, you would use OpenAI or another embedding service
  // This is a simplified version that creates a deterministic pseudo-embedding
  const hash = await simpleHash(text);
  const embedding: number[] = [];
  
  // Generate 1536-dimensional vector (standard for text-embedding-3-small)
  for (let i = 0; i < 1536; i++) {
    embedding.push(Math.sin(hash + i) * 0.5 + 0.5);
  }
  
  return embedding;
}

async function simpleHash(str: string): Promise<number> {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

export async function suggestRelationships(
  entryContent: string,
  entryTitle: string,
  potentialMatches: { id: string; title: string; type: string; content: string }[]
): Promise<{ targetId: string; relationshipType: string; confidence: number }[]> {
  if (!groq || potentialMatches.length === 0) {
    return [];
  }

  const prompt = `Analyze the following entry and suggest relationships with other entries.

Main Entry: ${entryTitle}
Content Preview: ${entryContent.slice(0, 2000)}

Potential Related Entries:
${potentialMatches.map(m => `- ${m.title} (${m.type}): ${m.content.slice(0, 200)}`).join('\n')}

Identify which entries have meaningful relationships with the main entry. Consider:
- depends_on: The main entry requires or builds upon another entry
- uses: The main entry utilizes another entry
- related_to: The entries are conceptually related
- part_of: The main entry is a component of another entry
- extends: The main entry builds upon or extends another entry

Return ONLY a JSON array of objects with targetId (the related entry ID), relationshipType, and confidence (0-1). Maximum 5 relationships.

Example: [{"targetId": "uuid-1", "relationshipType": "uses", "confidence": 0.9}]`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a relationship analysis system. Return only valid JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      model: DEFAULT_MODEL,
      temperature: 0.1,
      response_format: { type: 'json_object' }
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) return [];

    const parsed = JSON.parse(response);
    return Array.isArray(parsed.relationships) ? parsed.relationships : [];
  } catch (error) {
    console.error('Error suggesting relationships:', error);
    return [];
  }
}

// New: Generate comprehensive metadata for entries
export async function generateEntryMetadata(
  content: string,
  title: string,
  type: string
): Promise<{
  summary: string;
  tags: string[];
  complexity: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  prerequisites: string[];
}> {
  if (!groq) {
    return {
      summary: '',
      tags: [],
      complexity: 'intermediate',
      estimatedTime: 'unknown',
      prerequisites: []
    };
  }

  const prompt = `Analyze this ${type} and extract key metadata.

Title: ${title}

Content:
---
${content.slice(0, 3000)}
---

Provide a JSON response with:
1. summary: A 1-2 sentence summary
2. tags: Array of 5-8 relevant tags (lowercase, single words or hyphenated)
3. complexity: "beginner", "intermediate", or "advanced"
4. estimatedTime: Estimated time to learn/use (e.g., "5 min", "30 min", "1 hour")
5. prerequisites: Array of skills/knowledge needed before using this

Format:
{
  "summary": "...",
  "tags": ["tag1", "tag2", ...],
  "complexity": "intermediate",
  "estimatedTime": "30 min",
  "prerequisites": ["prereq1", "prereq2"]
}`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a metadata extraction system. Return only valid JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 0.3,
      response_format: { type: 'json_object' }
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('Empty response');
    }

    const parsed = JSON.parse(response);
    
    return {
      summary: parsed.summary || '',
      tags: Array.isArray(parsed.tags) ? parsed.tags : [],
      complexity: ['beginner', 'intermediate', 'advanced'].includes(parsed.complexity) 
        ? parsed.complexity 
        : 'intermediate',
      estimatedTime: parsed.estimatedTime || 'unknown',
      prerequisites: Array.isArray(parsed.prerequisites) ? parsed.prerequisites : []
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      summary: '',
      tags: [],
      complexity: 'intermediate',
      estimatedTime: 'unknown',
      prerequisites: []
    };
  }
}

export async function generateSearchQuerySuggestions(
  query: string,
  availableTags: string[]
): Promise<string[]> {
  if (!groq) {
    return [];
  }

  const prompt = `Given the search query "${query}", suggest 3-5 related search queries that might help find relevant AI skills, agents, or prompts.

Return ONLY a JSON array of strings. Example: ["ai agent design patterns", "prompt engineering techniques"]`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a search assistant. Return only valid JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 0.5,
      response_format: { type: 'json_object' }
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) return [];

    const parsed = JSON.parse(response);
    return Array.isArray(parsed.suggestions) ? parsed.suggestions : [];
  } catch (error) {
    console.error('Error generating suggestions:', error);
    return [];
  }
}
