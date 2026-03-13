import { parseMarkdown, extractCodeBlocks, extractLinks } from './markdown';
import { parseJSON, isValidJSON } from './json';
import { parseYAML, isValidYAML } from './yaml';
import { filterValidEntities, SKILL_CATEGORIES } from './skill-filter';
import { ParsedEntity, EntityType } from '@/app/types';

export { SKILL_CATEGORIES };
export type { SkillCategory } from './skill-filter';

export interface ParseResult {
  entities: ParsedEntity[];
  errors: string[];
}

export interface ParserOptions {
  filePath?: string;
  defaultType?: EntityType;
  contentType?: string;
}

export function parseContent(content: string, options: ParserOptions = {}): ParseResult {
  const errors: string[] = [];
  let entities: ParsedEntity[] = [];
  
  try {
    // Determine parser based on content type or content analysis
    const contentType = options.contentType || detectContentType(content, options.filePath);
    
    switch (contentType) {
      case 'json':
        if (isValidJSON(content)) {
          entities = parseJSON(content, options);
        } else {
          errors.push('Invalid JSON content');
        }
        break;
        
      case 'yaml':
        if (isValidYAML(content)) {
          entities = parseYAML(content, options);
        } else {
          errors.push('Invalid YAML content');
        }
        break;
        
      case 'markdown':
      default:
        entities = parseMarkdown(content, options);
        break;
    }
    
    // Post-process entities
    entities = entities.map(entity => ({
      ...entity,
      // Ensure type is valid
      type: validateEntityType(entity.type),
      // Clean up title
      title: entity.title.trim() || 'Untitled',
      // Clean up content
      content: entity.content.trim(),
      // Ensure tags are unique
      tags: [...new Set(entity.tags || [])]
    }));
    
  } catch (error) {
    errors.push(`Parse error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
  
  return { entities, errors };
}

function detectContentType(content: string, filePath?: string): 'markdown' | 'json' | 'yaml' {
  // Check file extension first
  if (filePath) {
    const ext = filePath.toLowerCase().split('.').pop();
    if (ext === 'json') return 'json';
    if (ext === 'yaml' || ext === 'yml') return 'yaml';
    if (ext === 'md' || ext === 'mdx') return 'markdown';
  }
  
  // Try to detect from content
  const trimmedContent = content.trim();
  
  // JSON detection
  if ((trimmedContent.startsWith('{') && trimmedContent.endsWith('}')) ||
      (trimmedContent.startsWith('[') && trimmedContent.endsWith(']'))) {
    try {
      JSON.parse(trimmedContent);
      return 'json';
    } catch {
      // Not valid JSON, continue
    }
  }
  
  // YAML detection
  if (trimmedContent.includes('---') || 
      /^\w+:\s/m.test(trimmedContent)) {
    try {
      const YAML = require('js-yaml');
      YAML.load(trimmedContent);
      return 'yaml';
    } catch {
      // Not valid YAML, continue
    }
  }
  
  // Default to markdown
  return 'markdown';
}

function validateEntityType(type: string): EntityType {
  const validTypes: EntityType[] = ['skill', 'agent', 'prompt', 'workflow', 'documentation'];
  const normalizedType = type.toLowerCase() as EntityType;
  return validTypes.includes(normalizedType) ? normalizedType : 'documentation';
}

export function parseFile(fileContent: string, fileName: string, defaultType?: EntityType): ParseResult {
  const ext = fileName.toLowerCase().split('.').pop();
  let contentType: string;
  
  switch (ext) {
    case 'json':
      contentType = 'json';
      break;
    case 'yaml':
    case 'yml':
      contentType = 'yaml';
      break;
    case 'md':
    case 'mdx':
    case 'txt':
    default:
      contentType = 'markdown';
      break;
  }
  
  const result = parseContent(fileContent, {
    filePath: fileName,
    defaultType,
    contentType
  });
  
  // Filter out invalid/untitled entities
  const validEntities = filterValidEntities(result.entities, fileName);
  
  return {
    entities: validEntities,
    errors: result.errors
  };
}

// Re-export individual parsers
export { parseMarkdown, parseJSON, parseYAML, extractCodeBlocks, extractLinks };
