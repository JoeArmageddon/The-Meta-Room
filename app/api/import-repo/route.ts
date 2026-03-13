import { NextRequest, NextResponse } from 'next/server';
import { importFromGitHub, importFromFiles } from '@/lib/repo/importer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { repoUrl, files, sourceName } = body;

    if (repoUrl) {
      // Import from GitHub
      const result = await importFromGitHub(repoUrl, (progress) => {
        // In a real implementation, you'd use WebSockets or Server-Sent Events
        // to stream progress updates to the client
        console.log('Import progress:', progress);
      });

      return NextResponse.json({
        success: true,
        source: result.source,
        entriesCreated: result.entriesCreated,
        errors: result.errors
      });
    }

    if (files && Array.isArray(files) && files.length > 0) {
      // Import from uploaded files
      const name = sourceName || `Upload-${new Date().toISOString()}`;
      const result = await importFromFiles(files, name);

      return NextResponse.json({
        success: true,
        source: result.source,
        entriesCreated: result.entriesCreated,
        errors: result.errors
      });
    }

    return NextResponse.json(
      { error: 'Either repoUrl or files must be provided' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json(
      { error: 'Import failed', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
