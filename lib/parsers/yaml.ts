import YAML from 'js-yaml';
import { ParsedEntity, EntityType } from '@/app/types';

interface ParserOptions {
  filePath?: string;
  defaultType?: EntityType;
}

export function parseYAML(content: string, options: ParserOptions = {}): ParsedEntity[] {
  const entities: ParsedEntity[] = [];
  
  try {
    const data = YAML.load(content);
    
    // Handle array of entities
    if (Array.isArray(data)) {
      for (const item of data) {
        const entity = parseYAMLEntity(item, options);
        if (entity) entities.push(entity);
      }
    } else if (data && typeof data === 'object') {
      // Handle single entity
      const entity = parseYAMLEntity(data, options);
      if (entity) entities.push(entity);
    }
  } catch (error) {
    console.error('Failed to parse YAML:', error);
  }
  
  return entities;
}

function parseYAMLEntity(data: any, options: ParserOptions): ParsedEntity | null {
  if (!data || typeof data !== 'object') return null;
  
  // Detect type from various common patterns
  let type: EntityType = options.defaultType || 'documentation';
  
  if (data.type || data.entityType || data.kind) {
    const detectedType = (data.type || data.entityType || data.kind).toLowerCase();
    if (['skill', 'agent', 'prompt', 'workflow', 'documentation'].includes(detectedType)) {
      type = detectedType as EntityType;
    }
  }
  
  // Extract title from various common fields
  const title = data.title || 
                data.name || 
                data.label || 
                data.id || 
                'Untitled';
  
  // Extract content - combine multiple fields if needed
  let content = '';
  
  if (data.content || data.description || data.body || data.text) {
    content = data.content || data.description || data.body || data.text;
  } else {
    // If no explicit content field, serialize the whole object except metadata fields
    const contentObj = { ...data };
    delete contentObj.type;
    delete contentObj.entityType;
    delete contentObj.kind;
    delete contentObj.tags;
    delete contentObj.categories;
    delete contentObj.keywords;
    content = YAML.dump(contentObj);
  }
  
  // Extract tags
  const tags = [
    ...(data.tags || []),
    ...(data.categories || []),
    ...(data.keywords || []),
    type
  ].filter((t): t is string => typeof t === 'string').map(t => t.toLowerCase().trim());
  
  return {
    type,
    title: String(title),
    content: typeof content === 'string' ? content : YAML.dump(content),
    metadata: {
      ...data,
      filePath: options.filePath,
      parsedFrom: 'yaml'
    },
    tags: [...new Set(tags)]
  };
}

export function isValidYAML(content: string): boolean {
  try {
    YAML.load(content);
    return true;
  } catch {
    return false;
  }
}
