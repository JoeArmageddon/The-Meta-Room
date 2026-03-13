import { createClient } from '@supabase/supabase-js';
import { Entry, Source, AIExplanation, Relationship, UserNote, UserSkill, SearchResult } from '@/app/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://placeholder.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Flag to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
};

// Entry operations
export async function getEntries(type?: string, limit = 50, offset = 0): Promise<Entry[]> {
  if (!isSupabaseConfigured()) return [];
  
  let query = supabase
    .from('entries')
    .select(`
      *,
      source:sources(*),
      ai_explanation:ai_explanations(*)
    `)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (type) {
    query = query.eq('type', type);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function getEntryBySlug(slug: string): Promise<Entry | null> {
  if (!isSupabaseConfigured()) return null;
  
  const { data, error } = await supabase
    .from('entries')
    .select(`
      *,
      source:sources(*),
      ai_explanation:ai_explanations(*),
      user_notes:user_notes(*)
    `)
    .eq('slug', slug)
    .single();

  if (error) return null;
  return data;
}

export async function getEntryById(id: string): Promise<Entry | null> {
  if (!isSupabaseConfigured()) return null;
  
  const { data, error } = await supabase
    .from('entries')
    .select(`
      *,
      source:sources(*),
      ai_explanation:ai_explanations(*)
    `)
    .eq('id', id)
    .single();

  if (error) return null;
  return data;
}

export async function createEntry(entry: Partial<Entry>): Promise<Entry> {
  if (!isSupabaseConfigured()) throw new Error('Supabase not configured');
  
  const { data, error } = await supabase
    .from('entries')
    .insert(entry)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateEntry(id: string, updates: Partial<Entry>): Promise<Entry> {
  if (!isSupabaseConfigured()) throw new Error('Supabase not configured');
  
  const { data, error } = await supabase
    .from('entries')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Source operations
export async function getSources(): Promise<Source[]> {
  if (!isSupabaseConfigured()) return [];
  
  const { data, error } = await supabase
    .from('sources')
    .select('*')
    .order('import_date', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createSource(source: Partial<Source>): Promise<Source> {
  if (!isSupabaseConfigured()) throw new Error('Supabase not configured');
  
  const { data, error } = await supabase
    .from('sources')
    .insert(source)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// AI Explanation operations
export async function getAIExplanation(entryId: string): Promise<AIExplanation | null> {
  if (!isSupabaseConfigured()) return null;
  
  const { data, error } = await supabase
    .from('ai_explanations')
    .select('*')
    .eq('entry_id', entryId)
    .single();

  if (error) return null;
  return data;
}

export async function createAIExplanation(explanation: Partial<AIExplanation>): Promise<AIExplanation> {
  if (!isSupabaseConfigured()) throw new Error('Supabase not configured');
  
  const { data, error } = await supabase
    .from('ai_explanations')
    .insert(explanation)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Relationship operations
export async function getRelationships(entryId: string): Promise<Relationship[]> {
  if (!isSupabaseConfigured()) return [];
  
  const { data, error } = await supabase
    .from('relationships')
    .select(`
      *,
      target_entry:entries!relationships_target_entry_id_fkey(*)
    `)
    .eq('source_entry_id', entryId);

  if (error) throw error;
  return data || [];
}

export async function createRelationship(relationship: Partial<Relationship>): Promise<Relationship> {
  if (!isSupabaseConfigured()) throw new Error('Supabase not configured');
  
  const { data, error } = await supabase
    .from('relationships')
    .insert(relationship)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// User Notes operations
export async function getUserNotes(entryId: string): Promise<UserNote[]> {
  if (!isSupabaseConfigured()) return [];
  
  const { data, error } = await supabase
    .from('user_notes')
    .select('*')
    .eq('entry_id', entryId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createUserNote(note: Partial<UserNote>): Promise<UserNote> {
  if (!isSupabaseConfigured()) throw new Error('Supabase not configured');
  
  const { data, error } = await supabase
    .from('user_notes')
    .insert(note)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteUserNote(id: string): Promise<void> {
  if (!isSupabaseConfigured()) throw new Error('Supabase not configured');
  
  const { error } = await supabase
    .from('user_notes')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// User Skills operations
export async function getUserSkills(): Promise<UserSkill[]> {
  if (!isSupabaseConfigured()) return [];
  
  const { data, error } = await supabase
    .from('user_skills')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createUserSkill(skill: Partial<UserSkill>): Promise<UserSkill> {
  if (!isSupabaseConfigured()) throw new Error('Supabase not configured');
  
  const { data, error } = await supabase
    .from('user_skills')
    .insert(skill)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteUserSkill(id: string): Promise<void> {
  if (!isSupabaseConfigured()) throw new Error('Supabase not configured');
  
  const { error } = await supabase
    .from('user_skills')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Statistics
export async function getStats() {
  if (!isSupabaseConfigured()) {
    return {
      totalEntries: 0,
      totalSources: 0,
      typeCounts: {}
    };
  }
  
  const { data: entries, error: entriesError } = await supabase
    .from('entries')
    .select('type', { count: 'exact' });

  if (entriesError) throw entriesError;

  const { data: sources, error: sourcesError } = await supabase
    .from('sources')
    .select('*', { count: 'exact' });

  if (sourcesError) throw sourcesError;

  const typeCounts = entries?.reduce((acc, entry) => {
    acc[entry.type] = (acc[entry.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    totalEntries: entries?.length || 0,
    totalSources: sources?.length || 0,
    typeCounts: typeCounts || {}
  };
}

// Slug generation
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
