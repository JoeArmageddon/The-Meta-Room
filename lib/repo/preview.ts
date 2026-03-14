import { parseFile } from '@/lib/parsers';
import { filterValidEntities, suggestCollection } from '@/lib/parsers/skill-filter';
import { generateAITags } from '@/lib/ai/tagger';
import { findDuplicates } from '@/lib/search/duplicates';
import { ImportPreview, ImportPreviewFile, ParsedEntity } from '@/app/types';


interface PreviewOptions {
  enableAI?: boolean;
  checkDuplicates?: boolean;
  maxFileSize?: number; // in bytes
}

/**
 * Generate import preview for files
 */
export async function generateImportPreview(
  files: { name: string; content: string }[],
  options: PreviewOptions = {}
): Promise<ImportPreview> {
  const {
    enableAI = true,
    checkDuplicates = true,
    maxFileSize = 1024 * 1024 // 1MB
  } = options;
  
  const previewFiles: ImportPreviewFile[] = [];
  const collectionSuggestions = new Map<string, number>();
  let totalEntities = 0;
  let potentialDuplicates = 0;
  
  for (const file of files) {
    // Skip files that are too large
    if (file.content.length > maxFileSize) {
      previewFiles.push({
        path: file.name,
        entities: [],
        willImport: false,
        suggestedCollection: 'Too Large',
        warnings: [`File too large (${Math.round(file.content.length / 1024)}KB)`]
      });
      continue;
    }
    
    try {
      // Parse the file
      const parseResult = parseFile(file.content, file.name);
      
      // Filter valid entities
      const validEntities = filterValidEntities(parseResult.entities, file.name);
      
      // Enhance with AI if enabled
      if (enableAI) {
        for (const entity of validEntities) {
          try {
            const aiTags = await generateAITags(
              entity.content,
              entity.title,
              entity.type
            );
            
            // Merge AI tags with existing tags
            entity.tags = [...new Set([...(entity.tags || []), ...aiTags.tags])];
            
            // Add AI metadata
            if (!entity.metadata) entity.metadata = {};
            entity.metadata.aiTags = aiTags;
            entity.metadata.complexity = aiTags.complexity;
            entity.metadata.estimatedTime = aiTags.estimatedTime;
            entity.metadata.keywords = aiTags.keywords;
          } catch (e) {
            console.warn(`AI tagging failed for ${entity.title}:`, e);
          }
        }
      }
      
      // Check for duplicates
      const warnings: string[] = [...parseResult.errors];
      const duplicateMatches: ImportPreviewFile['duplicates'] = [];
      
      if (checkDuplicates) {
        for (const entity of validEntities) {
          try {
            const duplicates = await findDuplicates(entity);
            if (duplicates.length > 0) {
              duplicateMatches.push(...duplicates);
              potentialDuplicates++;
              
              if (duplicates.some(d => d.similarity > 0.95)) {
                warnings.push(`Possible duplicate: "${duplicates[0].entry.title}" (${Math.round(duplicates[0].similarity * 100)}% match)`);
              }
            }
          } catch (e) {
            console.warn(`Duplicate check failed for ${entity.title}:`, e);
          }
        }
      }
      
      // Determine suggested collection
      const suggestedCollection = validEntities.length > 0
        ? validEntities[0].suggested_collection || suggestCollection(file.name)
        : suggestCollection(file.name);
      
      // Track collection suggestions
      collectionSuggestions.set(
        suggestedCollection,
        (collectionSuggestions.get(suggestedCollection) || 0) + validEntities.length
      );
      
      previewFiles.push({
        path: file.name,
        entities: validEntities,
        willImport: validEntities.length > 0,
        suggestedCollection,
        duplicates: duplicateMatches.length > 0 ? duplicateMatches : undefined,
        warnings: warnings.length > 0 ? warnings : undefined
      });
      
      totalEntities += validEntities.length;
    } catch (error) {
      previewFiles.push({
        path: file.name,
        entities: [],
        willImport: false,
        suggestedCollection: 'Error',
        warnings: [`Parse error: ${error instanceof Error ? error.message : 'Unknown error'}`]
      });
    }
  }
  
  // Determine suggested collections based on frequency
  const sortedCollections = Array.from(collectionSuggestions.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([name]) => name)
    .slice(0, 5);
  
  // Calculate new entities (those without high-confidence duplicates)
  const newEntities = previewFiles.reduce((count, file) => {
    return count + file.entities.filter(e => {
      const hasHighConfidenceDup = file.duplicates?.some(
        d => d.similarity > 0.95 && d.entry.title === e.title
      );
      return !hasHighConfidenceDup;
    }).length;
  }, 0);
  
  return {
    files: previewFiles,
    stats: {
      totalFiles: files.length,
      totalEntities,
      newEntities,
      potentialDuplicates,
      suggestedCollections: sortedCollections
    }
  };
}

/**
 * Generate preview for GitHub repository
 */
export async function generateGitHubPreview(
  owner: string,
  repo: string,
  branch: string = 'main',
  path: string = ''
): Promise<ImportPreview> {
  const GITHUB_API_URL = 'https://api.github.com';
  
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'The-Meta-Room-Importer'
  };
  
  const githubToken = process.env.GITHUB_TOKEN;
  if (githubToken) {
    headers['Authorization'] = `token ${githubToken}`;
  }
  
  // Fetch repository contents
  async function fetchContents(repoPath: string): Promise<{ name: string; download_url: string; path: string }[]> {
    const apiUrl = `${GITHUB_API_URL}/repos/${owner}/${repo}/contents/${repoPath}?ref=${branch}`;
    
    const response = await fetch(apiUrl, { headers });
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.statusText}`);
    }
    
    const contents = await response.json();
    const files: { name: string; download_url: string; path: string }[] = [];
    
    for (const item of Array.isArray(contents) ? contents : [contents]) {
      if (item.type === 'file' && isSupportedFile(item.name)) {
        files.push({
          name: item.name,
          download_url: item.download_url,
          path: item.path
        });
      } else if (item.type === 'dir') {
        const subFiles = await fetchContents(item.path);
        files.push(...subFiles);
      }
    }
    
    return files;
  }
  
  // Fetch files
  const files = await fetchContents(path);
  
  // Download file contents
  const fileContents: { name: string; content: string }[] = [];
  
  for (const file of files.slice(0, 50)) { // Limit to 50 files for preview
    try {
      const response = await fetch(file.download_url);
      if (response.ok) {
        const content = await response.text();
        fileContents.push({ name: file.path, content });
      }
    } catch (e) {
      console.warn(`Failed to fetch ${file.path}:`, e);
    }
  }
  
  return generateImportPreview(fileContents, { enableAI: true, checkDuplicates: true });
}

/**
 * Filter preview to only include selected files
 */
export function filterPreview(
  preview: ImportPreview,
  selectedPaths: string[]
): ImportPreview {
  const selectedSet = new Set(selectedPaths);
  
  const filteredFiles = preview.files.map(file => ({
    ...file,
    willImport: selectedSet.has(file.path) && file.willImport
  }));
  
  const totalEntities = filteredFiles.reduce(
    (sum, file) => sum + (file.willImport ? file.entities.length : 0),
    0
  );
  
  return {
    files: filteredFiles,
    stats: {
      ...preview.stats,
      totalEntities,
      newEntities: totalEntities // Simplified - could recalculate duplicates
    }
  };
}

function isSupportedFile(filename: string): boolean {
  const supportedExtensions = ['.md', '.mdx', '.json', '.yaml', '.yml', '.txt'];
  const ext = filename.toLowerCase().slice(filename.lastIndexOf('.'));
  return supportedExtensions.includes(ext);
}

// Helper function for hashing
async function simpleHash(str: string): Promise<string> {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(16);
}
