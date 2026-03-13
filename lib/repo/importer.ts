import { v4 as uuidv4 } from 'uuid';
import { parseFile } from '@/lib/parsers';
import { supabase, generateSlug, createSource, createEntry, createAIExplanation } from '@/lib/db/supabase';
import { generateExplanation, generateEmbedding } from '@/lib/ai/groq';
import { ParsedEntity, EntityType, Source } from '@/app/types';

const GITHUB_RAW_URL = 'https://raw.githubusercontent.com';
const GITHUB_API_URL = 'https://api.github.com';

export interface ImportProgress {
  totalFiles: number;
  processedFiles: number;
  entriesFound: number;
  currentFile?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
}

export interface ImportResult {
  source: Source;
  entriesCreated: number;
  errors: string[];
}

export async function importFromGitHub(
  repoUrl: string,
  onProgress?: (progress: ImportProgress) => void
): Promise<ImportResult> {
  const errors: string[] = [];
  
  // Parse repository URL
  const repoInfo = parseGitHubUrl(repoUrl);
  if (!repoInfo) {
    throw new Error('Invalid GitHub URL');
  }

  const { owner, repo, branch = 'main', path = '' } = repoInfo;
  
  // Create source record
  const source = await createSource({
    name: `${owner}/${repo}`,
    type: 'github',
    repo_url: repoUrl
  });

  // Fetch repository contents
  const files = await fetchRepoContents(owner, repo, branch, path);
  
  const progress: ImportProgress = {
    totalFiles: files.length,
    processedFiles: 0,
    entriesFound: 0,
    status: 'processing'
  };

  onProgress?.(progress);

  let entriesCreated = 0;

  // Process files in batches
  const batchSize = 5;
  for (let i = 0; i < files.length; i += batchSize) {
    const batch = files.slice(i, i + batchSize);
    
    await Promise.all(batch.map(async (file) => {
      try {
        progress.currentFile = file.path;
        onProgress?.(progress);

        const content = await fetchFileContent(file.download_url);
        if (!content) return;

        const parseResult = parseFile(content, file.path);
        
        if (parseResult.errors.length > 0) {
          errors.push(...parseResult.errors.map(e => `${file.path}: ${e}`));
        }

        for (const entity of parseResult.entities) {
          try {
            await createEntryFromEntity(entity, source.id, file.path);
            entriesCreated++;
            progress.entriesFound++;
          } catch (e) {
            errors.push(`Failed to create entry from ${file.path}: ${e}`);
          }
        }

        progress.processedFiles++;
        onProgress?.(progress);
      } catch (error) {
        errors.push(`Error processing ${file.path}: ${error}`);
      }
    }));
  }

  progress.status = 'completed';
  onProgress?.(progress);

  return {
    source,
    entriesCreated,
    errors
  };
}

export async function importFromFiles(
  files: { name: string; content: string }[],
  sourceName: string
): Promise<ImportResult> {
  const errors: string[] = [];
  
  // Create source record
  const source = await createSource({
    name: sourceName,
    type: 'upload'
  });

  let entriesCreated = 0;

  for (const file of files) {
    try {
      const parseResult = parseFile(file.content, file.name);
      
      if (parseResult.errors.length > 0) {
        errors.push(...parseResult.errors.map(e => `${file.name}: ${e}`));
      }

      for (const entity of parseResult.entities) {
        try {
          await createEntryFromEntity(entity, source.id, file.name);
          entriesCreated++;
        } catch (e) {
          errors.push(`Failed to create entry from ${file.name}: ${e}`);
        }
      }
    } catch (error) {
      errors.push(`Error processing ${file.name}: ${error}`);
    }
  }

  return {
    source,
    entriesCreated,
    errors
  };
}

async function createEntryFromEntity(
  entity: ParsedEntity,
  sourceId: string,
  filePath: string
): Promise<void> {
  const slug = generateSlug(entity.title);
  
  // Check if slug already exists
  const { data: existing } = await supabase
    .from('entries')
    .select('id')
    .eq('slug', slug)
    .maybeSingle();

  // If exists, append a unique suffix
  const finalSlug = existing ? `${slug}-${Date.now().toString(36)}` : slug;

  // Create entry
  const { data: entry, error } = await supabase
    .from('entries')
    .insert({
      type: entity.type,
      title: entity.title,
      slug: finalSlug,
      original_content: entity.content,
      source_id: sourceId,
      file_path: filePath,
      tags: entity.tags,
      metadata: entity.metadata
    })
    .select()
    .single();

  if (error) throw error;

  // Generate and store embedding for semantic search
  try {
    const embedding = await generateEmbedding(entity.content);
    await supabase.from('embeddings').insert({
      entry_id: entry.id,
      embedding,
      content_hash: await simpleHash(entity.content)
    });
  } catch (e) {
    console.warn('Failed to generate embedding:', e);
  }
}

interface GitHubFile {
  name: string;
  path: string;
  download_url: string;
  type: 'file' | 'dir';
}

function parseGitHubUrl(url: string): { owner: string; repo: string; branch?: string; path?: string } | null {
  // Handle various GitHub URL formats
  const patterns = [
    /github\.com\/([^\/]+)\/([^\/]+)(?:\/tree\/([^\/]+)(?:\/(.+))?)?/,
    /github\.com\/([^\/]+)\/([^\/]+)(?:\/blob\/([^\/]+)(?:\/(.+))?)?/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return {
        owner: match[1],
        repo: match[2].replace(/\.git$/, ''),
        branch: match[3],
        path: match[4]
      };
    }
  }

  return null;
}

async function fetchRepoContents(
  owner: string,
  repo: string,
  branch: string = 'main',
  path: string = ''
): Promise<GitHubFile[]> {
  const apiUrl = `${GITHUB_API_URL}/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;
  
  const response = await fetch(apiUrl, {
    headers: {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'The-Meta-Room-Importer'
    }
  });

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.statusText}`);
  }

  const contents = await response.json();
  const files: GitHubFile[] = [];

  for (const item of Array.isArray(contents) ? contents : [contents]) {
    if (item.type === 'file' && isSupportedFile(item.name)) {
      files.push({
        name: item.name,
        path: item.path,
        download_url: item.download_url,
        type: 'file'
      });
    } else if (item.type === 'dir') {
      // Recursively fetch directory contents
      const subFiles = await fetchRepoContents(owner, repo, branch, item.path);
      files.push(...subFiles);
    }
  }

  return files;
}

async function fetchFileContent(url: string): Promise<string | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    return await response.text();
  } catch (error) {
    console.error('Error fetching file:', error);
    return null;
  }
}

function isSupportedFile(filename: string): boolean {
  const supportedExtensions = ['.md', '.mdx', '.json', '.yaml', '.yml', '.txt'];
  const ext = filename.toLowerCase().slice(filename.lastIndexOf('.'));
  return supportedExtensions.includes(ext);
}

async function simpleHash(str: string): Promise<string> {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(16);
}

export async function generateAndStoreExplanation(entryId: string): Promise<void> {
  const { data: entry } = await supabase
    .from('entries')
    .select('*')
    .eq('id', entryId)
    .single();

  if (!entry) throw new Error('Entry not found');

  // Check if explanation already exists
  const { data: existing } = await supabase
    .from('ai_explanations')
    .select('id')
    .eq('entry_id', entryId)
    .maybeSingle();

  if (existing) return; // Already has explanation

  // Generate explanation
  const explanation = await generateExplanation(
    entry.original_content,
    entry.title,
    entry.type
  );

  // Store explanation
  await createAIExplanation({
    entry_id: entryId,
    ...explanation
  });
}
