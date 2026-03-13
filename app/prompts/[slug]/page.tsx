import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getEntryBySlug, getRelationships, getUserNotes } from '@/lib/db/supabase';
import { AIExplanationView } from '@/components/ai-explanation';
import { GraphView } from '@/components/graph-view';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  FileText, 
  ArrowLeft, 
  ExternalLink, 
  Tag, 
  GitBranch,
  Lightbulb,
  Copy,
  Check
} from 'lucide-react';
import { CopyButton } from '@/components/copy-button';

interface PromptPageProps {
  params: Promise<{ slug: string }>;
}

export default async function PromptPage({ params }: PromptPageProps) {
  const { slug } = await params;
  const prompt = await getEntryBySlug(slug);

  if (!prompt || prompt.type !== 'prompt') {
    notFound();
  }

  const [relationships, userNotes] = await Promise.all([
    getRelationships(prompt.id),
    getUserNotes(prompt.id)
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link href="/prompts">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Prompts
          </Button>
        </Link>
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-green-500/10">
            <FileText className="h-6 w-6 text-green-400" />
          </div>
          <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30">
            Prompt
          </Badge>
        </div>
        <h1 className="text-4xl font-bold mb-4">{prompt.title}</h1>
        
        {prompt.tags && prompt.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {prompt.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                <Tag className="h-3 w-3 mr-1" />
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Main Content */}
      <Tabs defaultValue="prompt" className="space-y-6">
        <TabsList>
          <TabsTrigger value="prompt">
            <FileText className="h-4 w-4 mr-2" />
            Prompt
          </TabsTrigger>
          <TabsTrigger value="overview">
            <Lightbulb className="h-4 w-4 mr-2" />
            AI Explanation
          </TabsTrigger>
          <TabsTrigger value="graph">
            <GitBranch className="h-4 w-4 mr-2" />
            Relationships
          </TabsTrigger>
        </TabsList>

        <TabsContent value="prompt" className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Prompt Content */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Prompt Template
                  </CardTitle>
                  <CopyButton text={prompt.original_content} />
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[600px]">
                    <pre className="text-sm whitespace-pre-wrap font-mono bg-muted p-4 rounded-lg">
                      {prompt.original_content}
                    </pre>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Source Info */}
              {prompt.source && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Source</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{prompt.source.name}</p>
                    {prompt.source.repo_url && (
                      <a 
                        href={prompt.source.repo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline flex items-center gap-1 mt-1"
                      >
                        View Repository
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Related */}
              {relationships.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Related</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {relationships.map((rel) => (
                        rel.target_entry && (
                          <Link 
                            key={rel.id}
                            href={`/${rel.target_entry.type}s/${rel.target_entry.slug}`}
                          >
                            <div className="text-sm p-2 rounded hover:bg-muted transition-colors">
                              <div className="font-medium">{rel.target_entry.title}</div>
                              <div className="text-xs text-muted-foreground capitalize">
                                {rel.relationship_type.replace('_', ' ')}
                              </div>
                            </div>
                          </Link>
                        )
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="overview">
          <AIExplanationView
            entryId={prompt.id}
            content={prompt.original_content}
            title={prompt.title}
            type={prompt.type}
            existingExplanation={prompt.ai_explanation}
          />
        </TabsContent>

        <TabsContent value="graph">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="h-5 w-5" />
                Relationship Graph
              </CardTitle>
            </CardHeader>
            <CardContent>
              <GraphView
                entries={[prompt, ...relationships.map(r => r.target_entry).filter(Boolean) as any]}
                relationships={relationships}
                highlightedEntryId={prompt.id}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
