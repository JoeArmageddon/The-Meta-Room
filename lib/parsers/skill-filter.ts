import { ParsedEntity } from '@/app/types';

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
  'security'
] as const;

export type SkillCategory = typeof SKILL_CATEGORIES[number];

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
  
  // Check metadata
  if (entity.metadata?.category) {
    const cat = entity.metadata.category.toLowerCase();
    for (const category of SKILL_CATEGORIES) {
      if (cat.includes(category)) {
        return category;
      }
    }
  }
  
  // Detect from content
  const content = entity.content.toLowerCase();
  
  if (/code|program|develop|script|function|class|api|debug/i.test(content)) {
    return 'coding';
  }
  if (/write|content|blog|article|story|copy|edit/i.test(content)) {
    return 'writing';
  }
  if (/design|ui|ux|graphic|visual|layout|color/i.test(content)) {
    return 'designing';
  }
  if (/data|analyze|statistics|chart|graph|metrics/i.test(content)) {
    return 'analysis';
  }
  if (/research|investigate|study|survey|find/i.test(content)) {
    return 'research';
  }
  if (/test|qa|quality|bug|verify|validate/i.test(content)) {
    return 'testing';
  }
  if (/plan|schedule|organize|manage|project/i.test(content)) {
    return 'planning';
  }
  if (/automate|script|workflow|batch/i.test(content)) {
    return 'automation';
  }
  if (/learn|teach|educate|tutorial|guide/i.test(content)) {
    return 'learning';
  }
  if (/create|generate|imagine|brainstorm/i.test(content)) {
    return 'creative';
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
    
    // Add category to metadata
    const category = extractCategory(entity);
    if (!entity.metadata) {
      entity.metadata = {};
    }
    if (category) {
      entity.metadata.category = category;
    }
    
    // Add purpose to metadata
    entity.metadata.purpose = extractSkillPurpose(entity);
    
    return true;
  });
}
