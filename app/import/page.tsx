'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Github, 
  Upload, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  FileText,
  ExternalLink,
  RefreshCw,
  Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImportProgress {
  totalFiles: number;
  processedFiles: number;
  entriesFound: number;
  currentFile?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
}

export default function ImportPage() {
  const router = useRouter();
  const [repoUrl, setRepoUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState<ImportProgress | null>(null);
  const [result, setResult] = useState<{ success: boolean; entriesCreated: number; errors: string[] } | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [resetStatus, setResetStatus] = useState<'idle' | 'resetting' | 'success' | 'error'>('idle');

  const handleResetDatabase = async () => {
    if (!confirm('WARNING: This will delete ALL entries, sources, and import history. Are you sure?')) {
      return;
    }
    
    setResetStatus('resetting');
    try {
      const response = await fetch('/api/reset-db', { method: 'POST' });
      if (response.ok) {
        setResetStatus('success');
        setTimeout(() => setResetStatus('idle'), 3000);
      } else {
        setResetStatus('error');
      }
    } catch (error) {
      setResetStatus('error');
    }
  };

  const handleGitHubImport = async () => {
    if (!repoUrl.trim()) return;

    setIsLoading(true);
    setProgress({
      totalFiles: 0,
      processedFiles: 0,
      entriesFound: 0,
      status: 'processing'
    });
    setResult(null);

    try {
      const response = await fetch('/api/import-repo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoUrl })
      });

      const data = await response.json();

      if (response.ok) {
        setResult({
          success: true,
          entriesCreated: data.entriesCreated,
          errors: data.errors
        });
        setProgress(prev => prev ? { ...prev, status: 'completed' } : null);
      } else {
        setResult({
          success: false,
          entriesCreated: 0,
          errors: [data.message || 'Import failed']
        });
        setProgress(prev => prev ? { ...prev, status: 'failed', error: data.message } : null);
      }
    } catch (error) {
      setResult({
        success: false,
        entriesCreated: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      });
      setProgress(prev => prev ? { ...prev, status: 'failed' } : null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async () => {
    if (uploadedFiles.length === 0) return;

    setIsLoading(true);
    setResult(null);

    try {
      // Read files
      const files = await Promise.all(
        uploadedFiles.map(async (file) => ({
          name: file.name,
          content: await file.text()
        }))
      );

      const response = await fetch('/api/import-repo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          files,
          sourceName: `Upload-${new Date().toISOString()}`
        })
      });

      const data = await response.json();

      if (response.ok) {
        setResult({
          success: true,
          entriesCreated: data.entriesCreated,
          errors: data.errors
        });
      } else {
        setResult({
          success: false,
          entriesCreated: 0,
          errors: [data.message || 'Import failed']
        });
      }
    } catch (error) {
      setResult({
        success: false,
        entriesCreated: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setUploadedFiles(Array.from(e.target.files));
    }
  };

  const progressPercentage = progress?.totalFiles 
    ? Math.round((progress.processedFiles / progress.totalFiles) * 100)
    : 0;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Import Repository</h1>
        <p className="text-muted-foreground">
          Import AI skills, agents, and prompts from GitHub repositories or upload files directly.
        </p>
      </div>

      <Tabs defaultValue="github" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="github">
            <Github className="h-4 w-4 mr-2" />
            GitHub Repository
          </TabsTrigger>
          <TabsTrigger value="upload">
            <Upload className="h-4 w-4 mr-2" />
            Upload Files
          </TabsTrigger>
        </TabsList>

        <TabsContent value="github" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Import from GitHub</CardTitle>
              <CardDescription>
                Enter a GitHub repository URL to automatically parse and index all supported files.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="https://github.com/username/repository"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  disabled={isLoading}
                />
                <Button 
                  onClick={handleGitHubImport}
                  disabled={isLoading || !repoUrl.trim()}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Github className="h-4 w-4 mr-2" />
                      Import
                    </>
                  )}
                </Button>
              </div>

              {/* Progress */}
              {progress && progress.status === 'processing' && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Processing...</span>
                    <span>{progress.processedFiles} / {progress.totalFiles} files</span>
                  </div>
                  <Progress value={progressPercentage} />
                  {progress.currentFile && (
                    <p className="text-xs text-muted-foreground">
                      Current: {progress.currentFile}
                    </p>
                  )}
                </div>
              )}

              {/* Result */}
              {result && (
                <div className={cn(
                  'p-4 rounded-lg border',
                  result.success ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'
                )}>
                  <div className="flex items-start gap-3">
                    {result.success ? (
                      <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
                    )}
                    <div className="flex-1">
                      <h4 className={cn(
                        'font-medium',
                        result.success ? 'text-green-700' : 'text-red-700'
                      )}>
                        {result.success ? 'Import Successful' : 'Import Failed'}
                      </h4>
                      {result.success && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Created {result.entriesCreated} entries
                        </p>
                      )}
                      {result.errors.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm font-medium">Errors:</p>
                          <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                            {result.errors.slice(0, 5).map((error, i) => (
                              <li key={i}>• {error}</li>
                            ))}
                            {result.errors.length > 5 && (
                              <li>... and {result.errors.length - 5} more</li>
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Example Repos */}
          <Card>
            <CardHeader>
              <CardTitle>Example Repositories</CardTitle>
              <CardDescription>
                Try importing these popular AI resources.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  'https://github.com/microsoft/ai-agents-for-beginners',
                  'https://github.com/anthropics/prompt-eng-interactive-tutorial',
                ].map((url) => (
                  <button
                    key={url}
                    onClick={() => setRepoUrl(url)}
                    className="w-full text-left p-3 rounded-lg border hover:border-primary/50 transition-colors flex items-center justify-between"
                  >
                    <span className="text-sm font-mono">{url}</span>
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upload Files</CardTitle>
              <CardDescription>
                Upload markdown, JSON, or YAML files containing skills, agents, or prompts.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                <input
                  type="file"
                  multiple
                  accept=".md,.mdx,.json,.yaml,.yml,.txt"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                  disabled={isLoading}
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-sm font-medium mb-1">Click to upload files</p>
                  <p className="text-xs text-muted-foreground">
                    Supports .md, .json, .yaml, .txt
                  </p>
                </label>
              </div>

              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Selected files:</p>
                  <div className="flex flex-wrap gap-2">
                    {uploadedFiles.map((file, i) => (
                      <Badge key={i} variant="secondary">
                        <FileText className="h-3 w-3 mr-1" />
                        {file.name}
                      </Badge>
                    ))}
                  </div>
                  <Button 
                    onClick={handleFileUpload}
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Upload className="h-4 w-4 mr-2" />
                    )}
                    Import {uploadedFiles.length} file{uploadedFiles.length !== 1 ? 's' : ''}
                  </Button>
                </div>
              )}

              {/* Result */}
              {result && (
                <div className={cn(
                  'p-4 rounded-lg border',
                  result.success ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'
                )}>
                  <div className="flex items-start gap-3">
                    {result.success ? (
                      <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
                    )}
                    <div className="flex-1">
                      <h4 className={cn(
                        'font-medium',
                        result.success ? 'text-green-700' : 'text-red-700'
                      )}>
                        {result.success ? 'Import Successful' : 'Import Failed'}
                      </h4>
                      {result.success && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Created {result.entriesCreated} entries
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Supported Formats */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Supported File Formats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-blue-400 shrink-0" />
              <div>
                <h4 className="font-medium">Markdown (.md, .mdx)</h4>
                <p className="text-sm text-muted-foreground">
                  Frontmatter metadata and content parsing
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-green-400 shrink-0" />
              <div>
                <h4 className="font-medium">JSON (.json)</h4>
                <p className="text-sm text-muted-foreground">
                  Structured data with entity detection
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-orange-400 shrink-0" />
              <div>
                <h4 className="font-medium">YAML (.yaml, .yml)</h4>
                <p className="text-sm text-muted-foreground">
                  Configuration and definition files
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-gray-400 shrink-0" />
              <div>
                <h4 className="font-medium">Text (.txt)</h4>
                <p className="text-sm text-muted-foreground">
                  Plain text with auto-detection
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reset Database */}
      <Card className="mt-8 border-red-500/20">
        <CardHeader>
          <CardTitle className="text-red-500 flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Reset the entire database. This action cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            variant="destructive" 
            onClick={handleResetDatabase}
            disabled={resetStatus === 'resetting'}
          >
            {resetStatus === 'resetting' ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Trash2 className="h-4 w-4 mr-2" />
            )}
            {resetStatus === 'success' ? 'Database Reset!' : 
             resetStatus === 'error' ? 'Reset Failed' : 
             'Reset Database'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
