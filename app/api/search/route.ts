import { NextRequest, NextResponse } from 'next/server';
import { hybridSearch, fullTextSearch, semanticSearch, getPopularTags } from '@/lib/search';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const type = searchParams.get('type') || undefined;
    const tags = searchParams.get('tags')?.split(',').filter(Boolean);
    const mode = searchParams.get('mode') || 'hybrid';
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Query parameter "q" is required' },
        { status: 400 }
      );
    }

    let results;
    
    switch (mode) {
      case 'semantic':
        results = await semanticSearch(query, { type, tags, limit });
        break;
      case 'fulltext':
        results = await fullTextSearch(query, { type, tags, limit });
        break;
      case 'hybrid':
      default:
        results = await hybridSearch(query, { type, tags, limit });
        break;
    }

    return NextResponse.json({
      query,
      mode,
      count: results.length,
      results
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Search failed', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, type, tags, mode = 'hybrid', limit = 20 } = body;

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    let results;
    
    switch (mode) {
      case 'semantic':
        results = await semanticSearch(query, { type, tags, limit });
        break;
      case 'fulltext':
        results = await fullTextSearch(query, { type, tags, limit });
        break;
      case 'hybrid':
      default:
        results = await hybridSearch(query, { type, tags, limit });
        break;
    }

    return NextResponse.json({
      query,
      mode,
      count: results.length,
      results
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Search failed', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
