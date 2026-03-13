import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db/supabase';

export async function POST(request: NextRequest) {
  try {
    // Delete in order to respect foreign key constraints
    // 1. Delete embeddings (references entries)
    await supabase.from('embeddings').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    // 2. Delete AI explanations (references entries)
    await supabase.from('ai_explanations').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    // 3. Delete relationships (references entries)
    await supabase.from('relationships').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    // 4. Delete user notes (references entries)
    await supabase.from('user_notes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    // 5. Delete entries (references sources)
    await supabase.from('entries').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    // 6. Delete sources
    await supabase.from('sources').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    // 7. Delete import jobs
    await supabase.from('import_jobs').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    return NextResponse.json({ 
      success: true, 
      message: 'Database reset successfully' 
    });
  } catch (error) {
    console.error('Reset error:', error);
    return NextResponse.json(
      { error: 'Reset failed', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
