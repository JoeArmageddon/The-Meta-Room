import { NextRequest, NextResponse } from 'next/server';
import { getEntries, getEntryById, getStats } from '@/lib/db/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const stats = searchParams.get('stats') === 'true';

    if (stats) {
      const statistics = await getStats();
      return NextResponse.json(statistics);
    }

    const entries = await getEntries(type, limit, offset);

    return NextResponse.json({
      entries,
      count: entries.length,
      limit,
      offset
    });
  } catch (error) {
    console.error('Error fetching entries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch entries', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
