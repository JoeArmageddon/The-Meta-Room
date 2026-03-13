import { ParsedEntity, EntityType } from '@/app/types';

interface ParserOptions {
  filePath?: string;
  defaultType?: EntityType;
}

export function parseJSON(content: string, options: ParserOptions = {}): ParsedEntity[] {
  const entities: ParsedEntity[] = [];
  
  try {
    const data = JSON.parse(content);
    
    // Handle array of entities
    if (Array.isArray(data)) {
      for (const item of data) {
        const entity = parseJSONEntity(item, options);
        if (entity) entities.push(entity);
      }
    } else {
      // Handle single entity
      const entity = parseJSONEntity(data, options);
      if (entity) entities.push(entity);
    }
  } catch (error) {
    console.error('Failed to parse JSON:', error);
  }
  
  return entities;
}

function parseJSONEntity(data: any, options: ParserOptions): ParsedEntity | null {
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
  
  // Extract content from various common fields
  const content = data.content || 
                  data.description || 
                  data.body || 
                  data.text || 
                  JSON.stringify(data, null, 2);
  
  // Extract tags
  const tags = [
    ...(data.tags || []),
    ...(data.categories || []),
    ...(data.keywords || []),
    type
  ].map((t: string) => t.toLowerCase().trim());
  
  return {
    type,
    title: String(title),
    content: typeof content === 'string' ? content : JSON.stringify(content, null, 2),
    metadata: {
      ...data,
      filePath: options.filePath,
      parsedFrom: 'json'
    },
    tags: [...new Set(tags)]
  };
}

export function isValidJSON(content: string): boolean {
  try {
    JSON.parse(content);
    return true;
  } catch {
    return false;
  }
}
