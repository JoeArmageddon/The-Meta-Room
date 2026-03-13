import { NextRequest, NextResponse } from 'next/server';
import { getEntryBySlug, getEntryById, getRelationships, getUserNotes } from '@/lib/db/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Try to get by slug first, then by ID
    let entry = await getEntryBySlug(id);
    
    if (!entry) {
      entry = await getEntryById(id);
    }

    if (!entry) {
      return NextResponse.json(
        { error: 'Entry not found' },
        { status: 404 }
      );
    }

    // Fetch related data
    const [relationships, userNotes] = await Promise.all([
      getRelationships(entry.id),
      getUserNotes(entry.id)
    ]);

    return NextResponse.json({
      entry,
      relationships,
      userNotes
    });
  } catch (error) {
    console.error('Error fetching entry:', error);
    return NextResponse.json(
      { error: 'Failed to fetch entry', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
