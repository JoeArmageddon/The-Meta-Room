import { supabase } from '@/lib/db/supabase';
import { Entry, SearchResult } from '@/app/types';
import { generateEmbedding } from '@/lib/ai/groq';

interface SearchOptions {
  type?: string;
  tags?: string[];
  sourceId?: string;
  limit?: number;
  offset?: number;
}

export async function hybridSearch(
  query: string,
  options: SearchOptions = {}
): Promise<SearchResult[]> {
  const limit = options.limit || 20;
  const results: SearchResult[] = [];
  const seenIds = new Set<string>();

  // Run semantic and full-text search in parallel
  const [semanticResults, fulltextResults] = await Promise.all([
    semanticSearch(query, { ...options, limit: Math.ceil(limit / 2) }),
    fullTextSearch(query, { ...options, limit: Math.ceil(limit / 2) })
  ]);

  // Merge results with deduplication
  for (const result of semanticResults) {
    if (!seenIds.has(result.entry.id)) {
      results.push(result);
      seenIds.add(result.entry.id);
    }
  }

  for (const result of fulltextResults) {
    if (!seenIds.has(result.entry.id)) {
      results.push(result);
      seenIds.add(result.entry.id);
    }
  }

  // Sort by score
  results.sort((a, b) => b.score - a.score);

  return results.slice(0, limit);
}

export async function semanticSearch(
  query: string,
  options: SearchOptions = {}
): Promise<SearchResult[]> {
  try {
    // Generate embedding for the query
    const embedding = await generateEmbedding(query);
    
    // Call the Supabase function for semantic search
    const { data, error } = await supabase.rpc('search_entries_semantic', {
      query_embedding: embedding,
      match_threshold: 0.5,
      match_count: options.limit || 10
    });

    if (error) {
      console.error('Semantic search error:', error);
      return [];
    }

    // Apply filters
    let results = data || [];
    
    if (options.type) {
      results = results.filter((r: any) => r.type === options.type);
    }
    
    if (options.tags && options.tags.length > 0) {
      results = results.filter((r: any) => 
        options.tags!.some(tag => r.tags?.includes(tag))
      );
    }

    return results.map((r: any) => ({
      entry: r as Entry,
      score: r.similarity,
      match_type: 'semantic'
    }));
  } catch (error) {
    console.error('Semantic search failed:', error);
    return [];
  }
}

export async function fullTextSearch(
  query: string,
  options: SearchOptions = {}
): Promise<SearchResult[]> {
  try {
    // Use Supabase's full-text search
    let dbQuery = supabase
      .from('entries')
      .select('*')
      .textSearch('title', query, {
        type: 'websearch',
        config: 'english'
      });

    // Apply filters
    if (options.type) {
      dbQuery = dbQuery.eq('type', options.type);
    }

    if (options.sourceId) {
      dbQuery = dbQuery.eq('source_id', options.sourceId);
    }

    const { data, error } = await dbQuery.limit(options.limit || 10);

    if (error) {
      // Fallback to ilike search if textSearch fails
      return fallbackSearch(query, options);
    }

    // Filter by tags if specified
    let results = data || [];
    if (options.tags && options.tags.length > 0) {
      results = results.filter((r: any) => 
        options.tags!.some(tag => r.tags?.includes(tag))
      );
    }

    return results.map((r: any) => ({
      entry: r as Entry,
      score: 0.8, // Full-text search doesn't give scores easily
      match_type: 'fulltext'
    }));
  } catch (error) {
    console.error('Full-text search failed:', error);
    return fallbackSearch(query, options);
  }
}

async function fallbackSearch(
  query: string,
  options: SearchOptions = {}
): Promise<SearchResult[]> {
  // Simple ILIKE fallback
  let dbQuery = supabase
    .from('entries')
    .select('*')
    .or(`title.ilike.%${query}%,original_content.ilike.%${query}%`);

  if (options.type) {
    dbQuery = dbQuery.eq('type', options.type);
  }

  const { data, error } = await dbQuery.limit(options.limit || 10);

  if (error) {
    console.error('Fallback search error:', error);
    return [];
  }

  return (data || []).map((r: any) => ({
    entry: r as Entry,
    score: 0.5,
    match_type: 'fulltext'
  }));
}

export async function getRelatedEntries(
  entryId: string,
  limit: number = 5
): Promise<Entry[]> {
  // Get entries with similar tags
  const { data: entry } = await supabase
    .from('entries')
    .select('tags, type')
    .eq('id', entryId)
    .single();

  if (!entry || !entry.tags || entry.tags.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from('entries')
    .select('*')
    .neq('id', entryId)
    .overlaps('tags', entry.tags)
    .limit(limit);

  if (error) {
    console.error('Error fetching related entries:', error);
    return [];
  }

  return data || [];
}

export async function getPopularTags(limit: number = 50): Promise<{ tag: string; count: number }[]> {
  const { data, error } = await supabase
    .from('entries')
    .select('tags');

  if (error || !data) {
    return [];
  }

  const tagCounts: Record<string, number> = {};
  
  for (const entry of data) {
    if (entry.tags) {
      for (const tag of entry.tags) {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      }
    }
  }

  return Object.entries(tagCounts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export async function storeEmbedding(entryId: string, content: string): Promise<void> {
  try {
    const embedding = await generateEmbedding(content);
    const contentHash = await simpleHash(content);

    await supabase.from('embeddings').upsert({
      entry_id: entryId,
      embedding,
      content_hash: contentHash
    });
  } catch (error) {
    console.error('Error storing embedding:', error);
  }
}

async function simpleHash(str: string): Promise<string> {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(16);
}
