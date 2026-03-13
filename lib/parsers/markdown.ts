import matter from 'gray-matter';
import { ParsedEntity, EntityType } from '@/app/types';

interface ParserOptions {
  filePath?: string;
  defaultType?: EntityType;
}

export function parseMarkdown(content: string, options: ParserOptions = {}): ParsedEntity[] {
  const entities: ParsedEntity[] = [];
  
  try {
    // Try to parse frontmatter
    const { data, content: body } = matter(content);
    
    // Determine entity type from frontmatter or content
    const type = detectEntityType(data, body, options.defaultType);
    
    // Extract title from frontmatter or first heading
    const title = data.title || 
                  data.name || 
                  extractFirstHeading(body) || 
                  'Untitled';
    
    // Extract tags
    const tags = [
      ...(data.tags || []),
      ...(data.categories || []),
      ...(data.keywords || [])
    ].map((t: string) => t.toLowerCase().trim());
    
    // Build metadata
    const metadata = {
      ...data,
      filePath: options.filePath,
      hasFrontmatter: Object.keys(data).length > 0
    };
    
    entities.push({
      type,
      title,
      content: body.trim(),
      metadata,
      tags: [...new Set(tags)]
    });
    
    // Check for multiple entities in the same file (e.g., skill sections)
    const subEntities = extractSubEntities(body, options.filePath);
    entities.push(...subEntities);
    
  } catch (error) {
    // If frontmatter parsing fails, treat as plain markdown
    const type = options.defaultType || detectEntityTypeFromContent(content);
    const title = extractFirstHeading(content) || 'Untitled';
    
    entities.push({
      type,
      title,
      content: content.trim(),
      metadata: { filePath: options.filePath },
      tags: []
    });
  }
  
  return entities;
}

function detectEntityType(frontmatter: any, content: string, defaultType?: EntityType): EntityType {
  // Check frontmatter type field
  if (frontmatter.type) {
    const type = frontmatter.type.toLowerCase();
    if (['skill', 'agent', 'prompt', 'workflow', 'documentation'].includes(type)) {
      return type as EntityType;
    }
  }
  
  // Check frontmatter entity field
  if (frontmatter.entity) {
    const entity = frontmatter.entity.toLowerCase();
    if (['skill', 'agent', 'prompt', 'workflow', 'documentation'].includes(entity)) {
      return entity as EntityType;
    }
  }
  
  return detectEntityTypeFromContent(content, defaultType);
}

function detectEntityTypeFromContent(content: string, defaultType?: EntityType): EntityType {
  const lowerContent = content.toLowerCase();
  
  // Check for agent indicators
  if (lowerContent.includes('# agent') || 
      lowerContent.includes('## agent') ||
      lowerContent.includes('role:') && lowerContent.includes('goal:') ||
      lowerContent.match(/\*\*agent\*\*/)) {
    return 'agent';
  }
  
  // Check for prompt indicators
  if (lowerContent.includes('# prompt') ||
      lowerContent.includes('system prompt') ||
      lowerContent.includes('user prompt') ||
      lowerContent.includes('prompt template')) {
    return 'prompt';
  }
  
  // Check for workflow indicators
  if (lowerContent.includes('# workflow') ||
      lowerContent.includes('## workflow') ||
      lowerContent.includes('steps:') && lowerContent.includes('input:')) {
    return 'workflow';
  }
  
  // Check for skill indicators
  if (lowerContent.includes('# skill') ||
      lowerContent.includes('## skill') ||
      lowerContent.includes('capability')) {
    return 'skill';
  }
  
  // Check for documentation indicators
  if (lowerContent.includes('# documentation') ||
      lowerContent.includes('## overview') ||
      lowerContent.includes('## description')) {
    return 'documentation';
  }
  
  return defaultType || 'documentation';
}

function extractFirstHeading(content: string): string | null {
  const match = content.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : null;
}

function extractSubEntities(content: string, filePath?: string): ParsedEntity[] {
  const entities: ParsedEntity[] = [];
  
  // Look for sections that might be separate skills/agents
  // Pattern: ## Skill Name or ### Agent Name
  const sectionRegex = /^(#{2,3})\s+(Skill|Agent|Prompt|Workflow):?\s+(.+)$/gim;
  let match;
  
  while ((match = sectionRegex.exec(content)) !== null) {
    const level = match[1].length;
    const typeIndicator = match[2].toLowerCase();
    const title = match[3].trim();
    
    let type: EntityType = 'documentation';
    if (typeIndicator === 'skill') type = 'skill';
    else if (typeIndicator === 'agent') type = 'agent';
    else if (typeIndicator === 'prompt') type = 'prompt';
    else if (typeIndicator === 'workflow') type = 'workflow';
    
    // Extract section content
    const startIdx = match.index + match[0].length;
    const nextSectionRegex = new RegExp(`^#{1,${level}}\\s+`, 'm');
    const endMatch = content.slice(startIdx).match(nextSectionRegex);
    const endIdx = endMatch ? startIdx + endMatch.index! : content.length;
    const sectionContent = content.slice(startIdx, endIdx).trim();
    
    entities.push({
      type,
      title,
      content: sectionContent,
      metadata: { 
        filePath,
        extractedFromSection: true,
        parentFile: filePath 
      },
      tags: [typeIndicator]
    });
  }
  
  return entities;
}

export function extractCodeBlocks(content: string): { language?: string; code: string }[] {
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  const blocks: { language?: string; code: string }[] = [];
  let match;
  
  while ((match = codeBlockRegex.exec(content)) !== null) {
    blocks.push({
      language: match[1],
      code: match[2].trim()
    });
  }
  
  return blocks;
}

export function extractLinks(content: string): { text: string; url: string }[] {
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const links: { text: string; url: string }[] = [];
  let match;
  
  while ((match = linkRegex.exec(content)) !== null) {
    links.push({
      text: match[1],
      url: match[2]
    });
  }
  
  return links;
}
