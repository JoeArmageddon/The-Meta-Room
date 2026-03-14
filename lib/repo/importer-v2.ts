import { v4 as uuidv4 } from 'uuid';
import { parseFile } from '@/lib/parsers';
import { filterValidEntities } from '@/lib/parsers/skill-filter';
import { generateAITags } from '@/lib/ai/tagger';
import { findDuplicates } from '@/lib/search/duplicates';
import { createCollectionsFromPaths, getCollectionForPath } from '@/lib/db/collections';
import { supabase, generateSlug, createSource, createEntry, createAIExplanation } from '@/lib/db/supabase';
import { generateExplanation, generateEmbedding } from '@/lib/ai/groq';
import { ParsedEntity, EntityType, Source, ImportPreview, ImportPreviewFile } from '@/app/types';
import { filterPreview } from './preview';

const GITHUB_RAW_URL = 'https://raw.githubusercontent.com';
const GITHUB_API_URL = 'https://api.github.com';

export interface ImportProgress {
  totalFiles: number;
  processedFiles: number;
  entriesCreated: number;
  currentFile?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
}

export interface ImportResult {
  source: Source;
  entriesCreated: number;
  collectionsCreated: number;
  relationshipsDetected: number;
  errors: string[];
}

export interface ImportOptions {
  enableAI?: boolean;
  checkDuplicates?: boolean;
  createCollections?: boolean;
  skipDuplicates?: boolean;
  selectedFiles?: string[]; // For selective import from preview
}

/**
 * Import from GitHub with preview support
 */
export async function importFromGitHubV2(
  repoUrl: string,
  options: ImportOptions = {},
  onProgress?: (progress: ImportProgress) => void
): Promise<ImportResult> {
  const {
    enableAI = true,
    checkDuplicates = true,
    createCollections = true,
    skipDuplicates = false
  } = options;
  
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
  
  // Filter to selected files if specified
  const filesToProcess = options.selectedFiles 
    ? files.filter(f => options.selectedFiles!.includes(f.path))
    : files;
  
  const progress: ImportProgress = {
    totalFiles: filesToProcess.length,
    processedFiles: 0,
    entriesCreated: 0,
    status: 'processing'
  };

  onProgress?.(progress);

  // Create collections from folder structure
  let collections: Map<string, any> = new Map();
  if (createCollections) {
    try {
      collections = await createCollectionsFromPaths(
        filesToProcess.map(f => f.path),
        source.id
      );
    } catch (e) {
      errors.push(`Failed to create collections: ${e}`);
    }
  }

  let entriesCreated = 0;
  let relationshipsDetected = 0;

  // Process files in batches
  const batchSize = 3;
  for (let i = 0; i < filesToProcess.length; i += batchSize) {
    const batch = filesToProcess.slice(i, i + batchSize);
    
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

        const validEntities = filterValidEntities(parseResult.entities, file.path);

        for (const entity of validEntities) {
          try {
            // Check for duplicates
            if (checkDuplicates) {
              const duplicates = await findDuplicates(entity);
              const highConfidenceDups = duplicates.filter(d => d.similarity > 0.95);
              
              if (highConfidenceDups.length > 0 && skipDuplicates) {
                continue; // Skip this entity
              }
            }

            // Generate AI tags if enabled
            if (enableAI) {
              try {
                const aiTags = await generateAITags(
                  entity.content,
                  entity.title,
                  entity.type
                );
                entity.tags = [...new Set([...(entity.tags || []), ...aiTags.tags])];
                if (!entity.metadata) entity.metadata = {};
                entity.metadata.aiTags = aiTags;
                entity.metadata.complexity = aiTags.complexity;
              } catch (e) {
                console.warn(`AI tagging failed for ${entity.title}:`, e);
              }
            }

            // Get collection for this file
            const collection = createCollections 
              ? getCollectionForPath(file.path, collections)
              : undefined;

            // Create entry
            await createEntryFromEntity(entity, source.id, file.path, collection?.id);
            entriesCreated++;
            progress.entriesCreated++;

            // Count detected relationships
            if (entity.detected_relationships) {
              relationshipsDetected += entity.detected_relationships.length;
            }
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
    collectionsCreated: collections.size,
    relationshipsDetected,
    errors
  };
}

/**
 * Import from files with preview support
 */
export async function importFromFilesV2(
  files: { name: string; content: string }[],
  sourceName: string,
  options: ImportOptions = {}
): Promise<ImportResult> {
  const {
    enableAI = true,
    checkDuplicates = true,
    createCollections = true,
    skipDuplicates = false
  } = options;
  
  const errors: string[] = [];
  
  // Filter to selected files if specified
  const filesToProcess = options.selectedFiles
    ? files.filter(f => options.selectedFiles!.includes(f.name))
    : files;
  
  // Create source record
  const source = await createSource({
    name: sourceName,
    type: 'upload'
  });

  // Create collections from folder structure
  let collections: Map<string, any> = new Map();
  if (createCollections) {
    try {
      collections = await createCollectionsFromPaths(
        filesToProcess.map(f => f.name),
        source.id
      );
    } catch (e) {
      errors.push(`Failed to create collections: ${e}`);
    }
  }

  let entriesCreated = 0;
  let relationshipsDetected = 0;

  for (const file of filesToProcess) {
    try {
      const parseResult = parseFile(file.content, file.name);
      
      if (parseResult.errors.length > 0) {
        errors.push(...parseResult.errors.map(e => `${file.name}: ${e}`));
      }

      const validEntities = filterValidEntities(parseResult.entities, file.name);

      for (const entity of validEntities) {
        try {
          // Check for duplicates
          if (checkDuplicates) {
            const duplicates = await findDuplicates(entity);
            const highConfidenceDups = duplicates.filter(d => d.similarity > 0.95);
            
            if (highConfidenceDups.length > 0 && skipDuplicates) {
              continue;
            }
          }

          // Generate AI tags if enabled
          if (enableAI) {
            try {
              const aiTags = await generateAITags(
                entity.content,
                entity.title,
                entity.type
              );
              entity.tags = [...new Set([...(entity.tags || []), ...aiTags.tags])];
              if (!entity.metadata) entity.metadata = {};
              entity.metadata.aiTags = aiTags;
            } catch (e) {
              console.warn(`AI tagging failed for ${entity.title}:`, e);
            }
          }

          // Get collection for this file
          const collection = createCollections 
            ? getCollectionForPath(file.name, collections)
            : undefined;

          await createEntryFromEntity(entity, source.id, file.name, collection?.id);
          entriesCreated++;

          if (entity.detected_relationships) {
            relationshipsDetected += entity.detected_relationships.length;
          }
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
    collectionsCreated: collections.size,
    relationshipsDetected,
    errors
  };
}

/**
 * Import from preview (selective import)
 */
export async function importFromPreview(
  preview: ImportPreview,
  sourceName: string,
  options: Omit<ImportOptions, 'selectedFiles'> = {}
): Promise<ImportResult> {
  const selectedFiles = preview.files
    .filter(f => f.willImport)
    .map(f => f.path);
  
  const files = preview.files
    .filter(f => f.willImport)
    .map(f => ({
      name: f.path,
      content: f.entities.map(e => e.content).join('\n\n')
    }));
  
  return importFromFilesV2(files, sourceName, {
    ...options,
    selectedFiles
  });
}

// Helper functions
async function createEntryFromEntity(
  entity: ParsedEntity,
  sourceId: string,
  filePath: string,
  collectionId?: string
): Promise<void> {
  const slug = generateSlug(entity.title);
  
  // Check if slug already exists
  const { data: existing } = await supabase
    .from('entries')
    .select('id')
    .eq('slug', slug)
    .maybeSingle();

  const finalSlug = existing ? `${slug}-${Date.now().toString(36)}` : slug;

  // Build metadata
  const metadata = {
    ...entity.metadata,
    category: entity.metadata?.category || null,
    purpose: entity.metadata?.purpose || null,
    filePath,
    contentHash: await simpleHash(entity.content)
  };

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
      collection_id: collectionId,
      tags: entity.tags || [],
      ai_tags: entity.metadata?.aiTags?.tags || [],
      metadata: metadata,
      quality_score: entity.quality_score?.overall || null,
      quality_factors: entity.quality_score?.factors || {}
    })
    .select()
    .single();

  if (error) throw error;

  // Generate and store embedding
  try {
    const embedding = await generateEmbedding(entity.content);
    await supabase.from('embeddings').insert({
      entry_id: entry.id,
      embedding,
      content_hash: metadata.contentHash
    });
  } catch (e) {
    console.warn('Failed to generate embedding:', e);
  }

  // Create detected relationships
  if (entity.detected_relationships && entity.detected_relationships.length > 0) {
    for (const rel of entity.detected_relationships) {
      try {
        // Find target entry by name
        const { data: targetEntries } = await supabase
          .from('entries')
          .select('id')
          .ilike('title', rel.target_name)
          .limit(1);
        
        if (targetEntries && targetEntries.length > 0) {
          await supabase.from('relationships').insert({
            source_entry_id: entry.id,
            target_entry_id: targetEntries[0].id,
            relationship_type: rel.type,
            evidence: rel.evidence,
            confidence: rel.confidence,
            detected_by: 'content_analysis'
          });
        }
      } catch (e) {
        console.warn('Failed to create relationship:', e);
      }
    }
  }
}

function parseGitHubUrl(url: string): { owner: string; repo: string; branch?: string; path?: string } | null {
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
): Promise<{ name: string; path: string; download_url: string; type: string }[]> {
  const apiUrl = `${GITHUB_API_URL}/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;
  
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'The-Meta-Room-Importer'
  };
  
  const githubToken = process.env.GITHUB_TOKEN;
  if (githubToken) {
    headers['Authorization'] = `token ${githubToken}`;
  }
  
  const response = await fetch(apiUrl, { headers });

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.statusText}`);
  }

  const contents = await response.json();
  const files: { name: string; path: string; download_url: string; type: string }[] = [];

  for (const item of Array.isArray(contents) ? contents : [contents]) {
    if (item.type === 'file' && isSupportedFile(item.name)) {
      files.push({
        name: item.name,
        path: item.path,
        download_url: item.download_url,
        type: 'file'
      });
    } else if (item.type === 'dir') {
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
