import { supabase } from '@/lib/db/supabase';
import { Entry, DuplicateMatch, ParsedEntity } from '@/app/types';
import { generateEmbedding } from '@/lib/ai/groq';

const SIMILARITY_THRESHOLD = 0.85;
const TITLE_SIMILARITY_THRESHOLD = 0.9;

/**
 * Find potential duplicate entries for a parsed entity
 */
export async function findDuplicates(
  entity: ParsedEntity
): Promise<DuplicateMatch[]> {
  const matches: DuplicateMatch[] = [];
  
  try {
    // 1. Exact title match (case insensitive)
    const { data: titleMatches } = await supabase
      .from('entries')
      .select('*')
      .ilike('title', entity.title)
      .limit(5);
    
    if (titleMatches) {
      for (const match of titleMatches) {
        matches.push({
          entry: match as Entry,
          similarity: 1.0,
          matchReason: 'Exact title match'
        });
      }
    }
    
    // 2. Similar title using trigram similarity (if available in Postgres)
    const { data: similarTitles } = await supabase
      .from('entries')
      .select('*')
      .filter('title', 'ilike', `%${entity.title.slice(0, 10)}%`)
      .limit(10);
    
    if (similarTitles) {
      for (const match of similarTitles) {
        // Check if already added
        if (matches.some(m => m.entry.id === match.id)) continue;
        
        const titleSim = calculateStringSimilarity(
          entity.title.toLowerCase(),
          match.title.toLowerCase()
        );
        
        if (titleSim >= TITLE_SIMILARITY_THRESHOLD) {
          matches.push({
            entry: match as Entry,
            similarity: titleSim,
            matchReason: 'Similar title'
          });
        }
      }
    }
    
    // 3. Content similarity using embeddings (if available)
    try {
      const entityEmbedding = await generateEmbedding(
        `${entity.title} ${entity.content.slice(0, 1000)}`
      );
      
      const { data: embeddingMatches } = await supabase.rpc(
        'find_similar_entries',
        {
          query_embedding: entityEmbedding,
          match_threshold: SIMILARITY_THRESHOLD,
          match_count: 5
        }
      );
      
      if (embeddingMatches) {
        for (const match of embeddingMatches) {
          if (matches.some(m => m.entry.id === match.id)) continue;
          
          matches.push({
            entry: match as Entry,
            similarity: match.similarity,
            matchReason: 'Content similarity (AI)'
          });
        }
      }
    } catch (e) {
      // Embedding search failed, continue with other methods
      console.warn('Embedding duplicate search failed:', e);
    }
    
    // 4. Content hash comparison (exact content match)
    const contentHash = await simpleHash(entity.content);
    const { data: hashMatches } = await supabase
      .from('entries')
      .select('*')
      .eq('metadata->>contentHash', contentHash)
      .limit(5);
    
    if (hashMatches) {
      for (const match of hashMatches) {
        if (matches.some(m => m.entry.id === match.id)) continue;
        
        matches.push({
          entry: match as Entry,
          similarity: 1.0,
          matchReason: 'Identical content'
        });
      }
    }
    
    // Sort by similarity
    matches.sort((a, b) => b.similarity - a.similarity);
    
    return matches;
  } catch (error) {
    console.error('Error finding duplicates:', error);
    return [];
  }
}

/**
 * Check for duplicates across multiple entities (batch)
 */
export async function batchFindDuplicates(
  entities: ParsedEntity[]
): Promise<Map<number, DuplicateMatch[]>> {
  const results = new Map<number, DuplicateMatch[]>();
  
  for (let i = 0; i < entities.length; i++) {
    const duplicates = await findDuplicates(entities[i]);
    if (duplicates.length > 0) {
      results.set(i, duplicates);
    }
  }
  
  return results;
}

/**
 * Calculate string similarity using Levenshtein distance
 */
function calculateStringSimilarity(str1: string, str2: string): number {
  if (str1 === str2) return 1.0;
  if (str1.length === 0 || str2.length === 0) return 0.0;
  
  const distance = levenshteinDistance(str1, str2);
  const maxLength = Math.max(str1.length, str2.length);
  
  return 1 - distance / maxLength;
}

/**
 * Levenshtein distance for string similarity
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

/**
 * Simple hash for content comparison
 */
async function simpleHash(str: string): Promise<string> {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(16);
}

/**
 * Merge duplicate entries
 */
export async function mergeDuplicateEntries(
  primaryId: string,
  duplicateIds: string[]
): Promise<void> {
  // Get primary entry
  const { data: primary } = await supabase
    .from('entries')
    .select('*')
    .eq('id', primaryId)
    .single();
  
  if (!primary) throw new Error('Primary entry not found');
  
  for (const dupId of duplicateIds) {
    // Get duplicate entry
    const { data: duplicate } = await supabase
      .from('entries')
      .select('*')
      .eq('id', dupId)
      .single();
    
    if (!duplicate) continue;
    
    // Merge tags
    const mergedTags = [...new Set([...primary.tags, ...duplicate.tags])];
    
    // Merge metadata
    const mergedMetadata = {
      ...primary.metadata,
      ...duplicate.metadata,
      mergedFrom: [...(primary.metadata?.mergedFrom || []), dupId],
      mergeDate: new Date().toISOString()
    };
    
    // Update primary entry
    await supabase
      .from('entries')
      .update({
        tags: mergedTags,
        metadata: mergedMetadata
      })
      .eq('id', primaryId);
    
    // Delete duplicate
    await supabase
      .from('entries')
      .delete()
      .eq('id', dupId);
  }
}

/**
 * Check if content is likely a duplicate before parsing
 */
export async function isLikelyDuplicate(
  content: string,
  title: string
): Promise<{ isDuplicate: boolean; confidence: number; matches?: DuplicateMatch[] }> {
  const entity: ParsedEntity = {
    type: 'skill',
    title,
    content,
    tags: [],
    metadata: {}
  };
  
  const matches = await findDuplicates(entity);
  
  if (matches.length === 0) {
    return { isDuplicate: false, confidence: 0 };
  }
  
  const topMatch = matches[0];
  const isDuplicate = topMatch.similarity >= 0.95;
  
  return {
    isDuplicate,
    confidence: topMatch.similarity,
    matches: matches.slice(0, 3)
  };
}
