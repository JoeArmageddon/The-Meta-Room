import { NextRequest, NextResponse } from 'next/server';
import { generateExplanation } from '@/lib/ai/groq';
import { supabase, createAIExplanation } from '@/lib/db/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { entryId, content, title, type } = body;

    // If entryId is provided, fetch the entry and generate explanation
    if (entryId) {
      const { data: entry } = await supabase
        .from('entries')
        .select('*')
        .eq('id', entryId)
        .single();

      if (!entry) {
        return NextResponse.json(
          { error: 'Entry not found' },
          { status: 404 }
        );
      }

      // Check if explanation already exists
      const { data: existing } = await supabase
        .from('ai_explanations')
        .select('*')
        .eq('entry_id', entryId)
        .maybeSingle();

      if (existing) {
        return NextResponse.json({
          explanation: existing,
          cached: true
        });
      }

      // Generate new explanation
      const explanation = await generateExplanation(
        entry.original_content,
        entry.title,
        entry.type
      );

      // Store explanation
      const saved = await createAIExplanation({
        entry_id: entryId,
        ...explanation
      });

      return NextResponse.json({
        explanation: saved,
        cached: false
      });
    }

    // If content/title/type provided directly, generate without storing
    if (content && title && type) {
      const explanation = await generateExplanation(content, title, type);
      
      return NextResponse.json({
        explanation: {
          ...explanation,
          generated_at: new Date().toISOString()
        },
        cached: false
      });
    }

    return NextResponse.json(
      { error: 'Either entryId or (content, title, type) must be provided' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Explanation generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate explanation', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
