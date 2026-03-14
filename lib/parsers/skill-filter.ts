import { ParsedEntity, AITaggingResult, QualityScore, SkillCategory } from '@/app/types';

// Valid skill categories for filtering
export const SKILL_CATEGORIES = [
  'writing',
  'coding',
  'designing',
  'analysis',
  'research',
  'communication',
  'productivity',
  'learning',
  'creative',
  'business',
  'data',
  'marketing',
  'development',
  'testing',
  'debugging',
  'documentation',
  'planning',
  'automation',
  'integration',
  'security',
  'ai',
  'machine-learning',
  'devops',
  'frontend',
  'backend',
  'database',
  'api',
  'mobile',
  'web',
  'cloud',
  'infrastructure'
] as const;

export type { SkillCategory };

// Words that indicate a file is not a valid skill
const INVALID_INDICATORS = [
  'untitled',
  'draft',
  'temp',
  'tmp',
  'copy',
  'backup',
  'old',
  'new',
  'test',
  'example',
  'sample',
  'template',
  'readme',
  'license',
  'changelog',
  'contributing',
  'security',
  'todo',
  'fixme',
  'wip',
  'work in progress'
];

// File names/patterns to skip
const SKIP_PATTERNS = [
  /^\./,              // Hidden files
  /readme/i,
  /license/i,
  /changelog/i,
  /contributing/i,
  /security/i,
  /\.git/i,
  /package\.json/i,
  /package-lock/i,
  /requirements\.txt/i,
  /\.lock$/,
  /yarn\.lock/i,
  / Gemfile/i,
  /dockerfile/i,
  /makefile/i,
  /tsconfig/i,
  /eslint/i,
  /prettier/i,
  /next\.config/i,
  /tailwind/i,
  /postcss/i,
  /webpack/i,
  /vite/i,
  /rollup/i,
  /babel/i,
  /jest/i,
  /vitest/i,
  /cypress/i,
  /playwright/i,
  /storybook/i,
  /\.d\.ts$/         // TypeScript definition files
];

/**
 * Check if a file should be skipped based on its path/name
 */
export function shouldSkipFile(filePath: string): boolean {
  const fileName = filePath.toLowerCase().split('/').pop() || '';
  
  // Check skip patterns
  for (const pattern of SKIP_PATTERNS) {
    if (pattern.test(filePath) || pattern.test(fileName)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Check if a title indicates invalid/placeholder content
 */
export function isInvalidTitle(title: string): boolean {
  const lowerTitle = title.toLowerCase().trim();
  
  // Check for invalid indicators
  for (const indicator of INVALID_INDICATORS) {
    if (lowerTitle.includes(indicator)) {
      return true;
    }
  }
  
  // Check if title is too short (less than 3 chars)
  if (lowerTitle.length < 3) {
    return true;
  }
  
  // Check if title is just numbers or special chars
  if (!/[a-zA-Z]{2,}/.test(title)) {
    return true;
  }
  
  return false;
}

/**
 * Extract category from entity content/tags
 */
export function extractCategory(entity: ParsedEntity): SkillCategory | null {
  // Check tags first
  if (entity.tags && entity.tags.length > 0) {
    for (const tag of entity.tags) {
      const lowerTag = tag.toLowerCase();
      for (const category of SKILL_CATEGORIES) {
        if (lowerTag.includes(category)) {
          return category;
        }
      }
    }
  }
  
  // Check metadata with optional chaining
  if (entity.metadata?.category) {
    const cat = entity.metadata.category.toLowerCase();
    for (const category of SKILL_CATEGORIES) {
      if (cat.includes(category)) {
        return category;
      }
    }
  }
  
  // Detect from content with improved patterns
  const content = entity.content.toLowerCase();
  
  if (/react|vue|angular|svelte|frontend|ui component|css|html/i.test(content)) {
    return 'frontend';
  }
  if (/node\.?js|express|django|flask|fastapi|backend|server|api|rest|graphql/i.test(content)) {
    return 'backend';
  }
  if (/python|ruby|go|rust|java|c\+\+|typescript|javascript|programming|code|develop|script|function|class|debug/i.test(content)) {
    return 'coding';
  }
  if (/sql|database|mongodb|postgres|mysql|query|schema/i.test(content)) {
    return 'database';
  }
  if (/docker|kubernetes|k8s|terraform|aws|azure|gcp|devops|ci.?cd|pipeline/i.test(content)) {
    return 'devops';
  }
  if (/llm|gpt|claude|openai|anthropic|model|training|fine.?tune|embeddings|vector/i.test(content)) {
    return 'ai';
  }
  if (/write|content|blog|article|story|copy|edit/i.test(content)) {
    return 'writing';
  }
  if (/design|ui|ux|graphic|visual|layout|color|figma/i.test(content)) {
    return 'designing';
  }
  if (/data|analyze|statistics|chart|graph|metrics|pandas|numpy/i.test(content)) {
    return 'data';
  }
  if (/research|investigate|study|survey|find/i.test(content)) {
    return 'research';
  }
  if (/test|qa|quality|bug|verify|validate|jest|cypress/i.test(content)) {
    return 'testing';
  }
  if (/plan|schedule|organize|manage|project|roadmap/i.test(content)) {
    return 'planning';
  }
  if (/automate|script|workflow|batch|cron/i.test(content)) {
    return 'automation';
  }
  if (/learn|teach|educate|tutorial|guide|course/i.test(content)) {
    return 'learning';
  }
  if (/create|generate|imagine|brainstorm/i.test(content)) {
    return 'creative';
  }
  if (/security|auth|oauth|jwt|encrypt|vulnerability|penetration/i.test(content)) {
    return 'security';
  }
  if (/mobile|ios|android|react native|flutter|swift/i.test(content)) {
    return 'mobile';
  }
  
  return null;
}

/**
 * Extract what a skill is for (its purpose/use case)
 */
export function extractSkillPurpose(entity: ParsedEntity): string {
  const content = entity.content;
  
  // Look for "Use for", "Purpose", "What this does" sections
  const purposePatterns = [
    /use[\s\w]*for[:\s]+([^\n]+)/i,
    /purpose[:\s]+([^\n]+)/i,
    /what this (?:skill|does)[:\s]+([^\n]+)/i,
    /description[:\s]+([^\n]+)/i,
    /helps? you[:\s]+([^\n]+)/i,
    /ideal for[:\s]+([^\n]+)/i,
    /(?:this|the) skill(?:\s+\w+)*[:\s]+([^\n]{10,200})/i
  ];
  
  for (const pattern of purposePatterns) {
    const match = content.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  
  // Extract first meaningful sentence (not a heading)
  const sentences = content
    .replace(/#{1,6}\s+.*/g, '') // Remove headings
    .replace(/\[.*?\]\(.*?\)/g, '') // Remove markdown links
    .replace(/[*_`]/g, '') // Remove formatting
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 20 && s.length < 200);
  
  if (sentences.length > 0) {
    return sentences[0];
  }
  
  // Fallback to content preview
  return content.slice(0, 150).replace(/\s+/g, ' ').trim();
}

/**
 * Calculate quality score for an entity
 */
export function calculateQualityScore(entity: ParsedEntity): QualityScore {
  const content = entity.content;
  const lines = content.split('\n').filter(l => l.trim());
  
  // Completeness: Does it have examples, usage instructions, etc.
  let completeness = 50;
  if (/example|usage|how to|getting started/i.test(content)) completeness += 20;
  if (/```[\s\S]*```/.test(content)) completeness += 15; // Has code blocks
  if (entity.tags && entity.tags.length >= 3) completeness += 10;
  if (content.length > 500) completeness += 5;
  
  // Clarity: Well-structured with headers
  let clarity = 50;
  const headers = (content.match(/^#{1,6}\s+/gm) || []).length;
  if (headers >= 2) clarity += 20;
  if (headers >= 4) clarity += 15;
  if (!content.includes('TODO') && !content.includes('FIXME')) clarity += 10;
  if (lines.length > 5) clarity += 5;
  
  // Uniqueness: Based on title uniqueness (placeholder, checked against DB later)
  let uniqueness = 70;
  
  // Testability: Has test examples or verification steps
  let testability = 30;
  if (/test|verify|validate|check|assert/i.test(content)) testability += 30;
  if (/```[\s\S]*?(?:test|spec|expect)/i.test(content)) testability += 20;
  if (/input|output|result/i.test(content)) testability += 20;
  
  // Documentation: Has proper documentation structure
  let documentation = 40;
  if (/^#\s+/.test(content)) documentation += 20; // Has main title
  if (/##\s+(?:description|overview|introduction)/i.test(content)) documentation += 15;
  if (/##\s+(?:installation|setup|requirements)/i.test(content)) documentation += 15;
  if (/##\s+(?:api|reference|parameters)/i.test(content)) documentation += 10;
  
  const factors = {
    completeness: Math.min(100, completeness),
    clarity: Math.min(100, clarity),
    uniqueness: Math.min(100, uniqueness),
    testability: Math.min(100, testability),
    documentation: Math.min(100, documentation)
  };
  
  const overall = Math.round(
    (factors.completeness + factors.clarity + factors.uniqueness + 
     factors.testability + factors.documentation) / 5
  );
  
  // Generate suggestions
  const suggestions: string[] = [];
  if (factors.completeness < 60) suggestions.push('Add usage examples or getting started instructions');
  if (factors.clarity < 60) suggestions.push('Add more section headers to improve structure');
  if (factors.testability < 50) suggestions.push('Include test examples or verification steps');
  if (factors.documentation < 60) suggestions.push('Add a description/overview section');
  if (!entity.tags || entity.tags.length < 3) suggestions.push('Add more tags for better discoverability');
  
  return {
    overall,
    factors,
    suggestions
  };
}

/**
 * Suggest collection name based on file path
 */
export function suggestCollection(filePath: string): string {
  const parts = filePath.split('/').filter(p => p && !p.includes('.'));
  
  if (parts.length === 0) return 'General';
  
  // Use folder name as collection
  const folderName = parts[parts.length - 1];
  
  // Clean up and capitalize
  return folderName
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
}

/**
 * Detect potential relationships from content
 */
export function detectContentRelationships(entity: ParsedEntity): { target_name: string; type: 'depends_on' | 'uses' | 'related_to' | 'part_of' | 'extends'; evidence: string; confidence: number }[] {
  const relationships: { target_name: string; type: 'depends_on' | 'uses' | 'related_to' | 'part_of' | 'extends'; evidence: string; confidence: number }[] = [];
  const content = entity.content;
  
  // Pattern: "Uses/Requires/Depends on [Skill Name]"
  const patterns = [
    { regex: /(?:uses?|utilizes?|employs?)[:\s]+["']?([^"'\n.]{3,50})["']?/gi, type: 'uses' },
    { regex: /(?:requires?|depends? on|needs?)[:\s]+["']?([^"'\n.]{3,50})["']?/gi, type: 'depends_on' },
    { regex: /(?:based on|extends?|builds? on)[:\s]+["']?([^"'\n.]{3,50})["']?/gi, type: 'extends' },
    { regex: /(?:part of|component of|belongs? to)[:\s]+["']?([^"'\n.]{3,50})["']?/gi, type: 'part_of' },
    { regex: /(?:related to|similar to|see also)[:\s]+["']?([^"'\n.]{3,50})["']?/gi, type: 'related_to' },
    { regex: /\[([^\]]{3,50})\]\([^)]*\)/g, type: 'related_to' } // Markdown links
  ];
  
  for (const { regex, type } of patterns) {
    let match;
    while ((match = regex.exec(content)) !== null) {
      const targetName = match[1].trim();
      if (targetName && targetName.length > 2) {
        relationships.push({
          target_name: targetName,
          type: type as 'depends_on' | 'uses' | 'related_to' | 'part_of' | 'extends',
          evidence: match[0].slice(0, 100),
        confidence: 0.8
        });
      }
    }
  }
  
  // Remove duplicates
  const seen = new Set<string>();
  return relationships.filter(r => {
    const key = `${r.target_name.toLowerCase()}-${r.type}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Filter and clean entities
 */
export function filterValidEntities(entities: ParsedEntity[], filePath: string): ParsedEntity[] {
  // First check if file should be skipped entirely
  if (shouldSkipFile(filePath)) {
    return [];
  }
  
  return entities.filter(entity => {
    // Skip if title is invalid
    if (isInvalidTitle(entity.title)) {
      return false;
    }
    
    // Skip if content is too short (not a real skill)
    if (entity.content.length < 50) {
      return false;
    }
    
    // Skip if it looks like a config/data file
    if (entity.content.startsWith('{') && entity.content.includes('"dependencies"')) {
      return false;
    }
    
    // Ensure metadata exists
    if (!entity.metadata) {
      entity.metadata = {};
    }
    
    // Add category to metadata
    const category = extractCategory(entity);
    if (category) {
      entity.metadata.category = category;
    }
    
    // Add purpose to metadata
    entity.metadata.purpose = extractSkillPurpose(entity);
    
    // Calculate and add quality score
    entity.quality_score = calculateQualityScore(entity);
    
    // Detect content relationships
    const contentRels = detectContentRelationships(entity);
    if (contentRels.length > 0) {
      entity.detected_relationships = contentRels;
    }
    
    // Suggest collection
    entity.suggested_collection = suggestCollection(filePath);
    
    return true;
  });
}
