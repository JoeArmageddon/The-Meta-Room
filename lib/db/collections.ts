import { supabase } from './supabase';
import { Collection, Entry } from '@/app/types';

/**
 * Get or create a collection
 */
export async function getOrCreateCollection(
  name: string,
  sourceId: string,
  options: {
    description?: string;
    path?: string;
    parentId?: string;
    color?: string;
    icon?: string;
  } = {}
): Promise<Collection> {
  // Check if collection exists
  let query = supabase
    .from('collections')
    .select('*')
    .eq('name', name)
    .eq('source_id', sourceId);
  
  if (options.path) {
    query = query.eq('path', options.path);
  }
  
  const { data: existing } = await query.maybeSingle();
  
  if (existing) {
    return existing as Collection;
  }
  
  // Create new collection
  const { data, error } = await supabase
    .from('collections')
    .insert({
      name,
      source_id: sourceId,
      description: options.description,
      path: options.path,
      parent_id: options.parentId,
      color: options.color || generateColor(name),
      icon: options.icon
    })
    .select()
    .single();
  
  if (error) throw error;
  return data as Collection;
}

/**
 * Create collections from folder structure
 */
export async function createCollectionsFromPaths(
  filePaths: string[],
  sourceId: string
): Promise<Map<string, Collection>> {
  const collections = new Map<string, Collection>();
  const pathHierarchy = new Map<string, string>(); // path -> parent_path
  
  // Parse all paths to find folders
  for (const filePath of filePaths) {
    const parts = filePath.split('/').filter(p => p && !p.includes('.'));
    
    for (let i = 0; i < parts.length; i++) {
      const path = parts.slice(0, i + 1).join('/');
      const parentPath = i > 0 ? parts.slice(0, i).join('/') : undefined;
      
      pathHierarchy.set(path, parentPath || '');
    }
  }
  
  // Create collections in order (parents first)
  const sortedPaths = Array.from(pathHierarchy.keys()).sort(
    (a, b) => a.split('/').length - b.split('/').length
  );
  
  for (const path of sortedPaths) {
    const parts = path.split('/');
    const name = parts[parts.length - 1];
    const parentPath = pathHierarchy.get(path);
    
    let parentId: string | undefined;
    if (parentPath) {
      const parent = collections.get(parentPath);
      if (parent) {
        parentId = parent.id;
      }
    }
    
    const collection = await getOrCreateCollection(name, sourceId, {
      path,
      parentId,
      description: `Auto-created from ${path}`,
      icon: getIconForFolder(name)
    });
    
    collections.set(path, collection);
  }
  
  return collections;
}

/**
 * Get collection for a file path
 */
export function getCollectionForPath(
  filePath: string,
  collections: Map<string, Collection>
): Collection | undefined {
  const parts = filePath.split('/').filter(p => p && !p.includes('.'));
  
  // Try longest match first
  for (let i = parts.length; i > 0; i--) {
    const path = parts.slice(0, i).join('/');
    const collection = collections.get(path);
    if (collection) {
      return collection;
    }
  }
  
  return undefined;
}

/**
 * Get all collections for a source
 */
export async function getCollections(sourceId?: string): Promise<Collection[]> {
  let query = supabase
    .from('collections')
    .select('*')
    .order('name');
  
  if (sourceId) {
    query = query.eq('source_id', sourceId);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  return (data || []) as Collection[];
}

/**
 * Get entries in a collection
 */
export async function getCollectionEntries(collectionId: string): Promise<Entry[]> {
  const { data, error } = await supabase
    .from('entries')
    .select(`
      *,
      source:sources(*),
      ai_explanation:ai_explanations(*)
    `)
    .eq('collection_id', collectionId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return (data || []) as Entry[];
}

/**
 * Move entry to collection
 */
export async function moveToCollection(
  entryId: string,
  collectionId: string | null
): Promise<void> {
  const { error } = await supabase
    .from('entries')
    .update({ collection_id: collectionId })
    .eq('id', entryId);
  
  if (error) throw error;
}

/**
 * Delete collection (entries become uncategorized)
 */
export async function deleteCollection(collectionId: string): Promise<void> {
  const { error } = await supabase
    .from('collections')
    .delete()
    .eq('id', collectionId);
  
  if (error) throw error;
}

// Helper: Generate consistent color from string
function generateColor(str: string): string {
  const colors = [
    '#3B82F6', // blue
    '#10B981', // green
    '#F59E0B', // yellow
    '#EF4444', // red
    '#8B5CF6', // purple
    '#EC4899', // pink
    '#06B6D4', // cyan
    '#F97316', // orange
    '#84CC16', // lime
    '#14B8A6', // teal
  ];
  
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
}

// Helper: Get icon for folder name
function getIconForFolder(name: string): string {
  const iconMap: Record<string, string> = {
    'skills': 'Wrench',
    'agents': 'Bot',
    'prompts': 'MessageSquare',
    'workflows': 'GitBranch',
    'docs': 'FileText',
    'documentation': 'Book',
    'coding': 'Code',
    'writing': 'PenTool',
    'design': 'Palette',
    'testing': 'TestTube',
    'api': 'Globe',
    'database': 'Database',
    'frontend': 'Layout',
    'backend': 'Server',
    'mobile': 'Smartphone',
    'ai': 'Brain',
    'ml': 'Brain',
    'devops': 'Cloud',
    'security': 'Shield',
    'utils': 'Tool',
    'utilities': 'Tool',
    'helpers': 'HelpCircle',
    'examples': 'BookOpen',
    'templates': 'FileCode',
  };
  
  const lowerName = name.toLowerCase();
  return iconMap[lowerName] || 'Folder';
}
