import { NextRequest, NextResponse } from 'next/server';
import { generateImportPreview, generateGitHubPreview } from '@/lib/repo/preview';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, files, owner, repo, branch, path } = body;
    
    if (type === 'files' && files) {
      // Preview uploaded files
      const preview = await generateImportPreview(files, {
        enableAI: true,
        checkDuplicates: true
      });
      
      return NextResponse.json(preview);
    } else if (type === 'github' && owner && repo) {
      // Preview GitHub repository
      const preview = await generateGitHubPreview(owner, repo, branch || 'main', path || '');
      
      return NextResponse.json(preview);
    } else {
      return NextResponse.json(
        { error: 'Invalid request. Provide either files or GitHub owner/repo.' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Preview generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate preview', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
