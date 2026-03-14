import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db/supabase';
import { Entry, Relationship } from '@/app/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { entryId } = body;
    
    if (!entryId) {
      return NextResponse.json(
        { error: 'Entry ID is required' },
        { status: 400 }
      );
    }
    
    // Get the entry
    const { data: entry, error: entryError } = await supabase
      .from('entries')
      .select('*')
      .eq('id', entryId)
      .single();
    
    if (entryError || !entry) {
      return NextResponse.json(
        { error: 'Entry not found' },
        { status: 404 }
      );
    }
    
    // Find potential relationships
    const relationships = await detectRelationships(entry);
    
    return NextResponse.json({
      entryId,
      relationshipsFound: relationships.length,
      relationships
    });
  } catch (error) {
    console.error('Relationship detection error:', error);
    return NextResponse.json(
      { error: 'Failed to detect relationships' },
      { status: 500 }
    );
  }
}

async function detectRelationships(entry: Entry): Promise<Partial<Relationship>[]> {
  const relationships: Partial<Relationship>[] = [];
  const content = entry.original_content.toLowerCase();
  
  // Get all other entries to search for mentions
  const { data: allEntries } = await supabase
    .from('entries')
    .select('id, title, type')
    .neq('id', entry.id)
    .limit(100);
  
  if (!allEntries) return relationships;
  
  // Check for mentions of other entries
  for (const other of allEntries) {
    const title = other.title.toLowerCase();
    const titleWords = title.split(/\s+/).filter((w: string) => w.length > 3);
    
    // Look for exact title match in content
    if (content.includes(title)) {
      relationships.push({
        source_entry_id: entry.id,
        target_entry_id: other.id,
        relationship_type: 'related_to',
        strength: 0.8,
        evidence: `Mentioned in content: "${title}"`,
        confidence: 0.8,
        detected_by: 'content_analysis'
      });
      continue;
    }
    
    // Look for significant word matches (for multi-word titles)
    if (titleWords.length > 1) {
      const matches = titleWords.filter((word: string) => content.includes(word));
      if (matches.length >= Math.min(2, titleWords.length)) {
        relationships.push({
          source_entry_id: entry.id,
          target_entry_id: other.id,
          relationship_type: 'related_to',
          strength: 0.6,
          evidence: `Related terms found: ${matches.join(', ')}`,
          confidence: 0.6,
          detected_by: 'content_analysis'
        });
      }
    }
  }
  
  // Check for dependency keywords
  const dependencyPatterns = [
    { pattern: /requires?\s+["']?([^"'\n]{3,50})["']?/gi, type: 'depends_on' as const },
    { pattern: /depends?\s+on\s+["']?([^"'\n]{3,50})["']?/gi, type: 'depends_on' as const },
    { pattern: /uses?\s+["']?([^"'\n]{3,50})["']?/gi, type: 'uses' as const },
    { pattern: /extends?\s+["']?([^"'\n]{3,50})["']?/gi, type: 'extends' as const },
    { pattern: /builds?\s+on\s+["']?([^"'\n]{3,50})["']?/gi, type: 'extends' as const },
  ];
  
  for (const { pattern, type } of dependencyPatterns) {
    let match;
    while ((match = pattern.exec(entry.original_content)) !== null) {
      const mentionedName = match[1].trim();
      
      // Try to find matching entry
      const matchingEntry = allEntries.find(e => 
        e.title.toLowerCase().includes(mentionedName.toLowerCase()) ||
        mentionedName.toLowerCase().includes(e.title.toLowerCase())
      );
      
      if (matchingEntry) {
        // Check if not already added
        const exists = relationships.some(r => 
          r.target_entry_id === matchingEntry.id && r.relationship_type === type
        );
        
        if (!exists) {
          relationships.push({
            source_entry_id: entry.id,
            target_entry_id: matchingEntry.id,
            relationship_type: type,
            strength: 0.9,
            evidence: `Keyword "${type.replace('_', ' ')}" found with mention: "${mentionedName}"`,
            confidence: 0.9,
            detected_by: 'content_analysis'
          });
        }
      }
    }
  }
  
  // Sort by confidence
  return relationships.sort((a, b) => (b.confidence || 0) - (a.confidence || 0));
}
