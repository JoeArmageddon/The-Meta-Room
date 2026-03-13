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
  Bot, 
  ArrowLeft, 
  ExternalLink, 
  Tag, 
  FileText,
  GitBranch,
  Lightbulb,
  Users
} from 'lucide-react';

interface AgentPageProps {
  params: Promise<{ slug: string }>;
}

export default async function AgentPage({ params }: AgentPageProps) {
  const { slug } = await params;
  const agent = await getEntryBySlug(slug);

  if (!agent || agent.type !== 'agent') {
    notFound();
  }

  const [relationships, userNotes] = await Promise.all([
    getRelationships(agent.id),
    getUserNotes(agent.id)
  ]);

  // Parse agent metadata
  const metadata = agent.metadata || {};
  const role = metadata.role || metadata.Role;
  const goal = metadata.goal || metadata.Goal;
  const capabilities = metadata.capabilities || metadata.Capabilities || [];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link href="/agents">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Agents
          </Button>
        </Link>
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-purple-500/10">
            <Bot className="h-6 w-6 text-purple-400" />
          </div>
          <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/30">
            Agent
          </Badge>
        </div>
        <h1 className="text-4xl font-bold mb-4">{agent.title}</h1>
        
        {role && (
          <p className="text-lg text-muted-foreground mb-4">
            <span className="font-medium">Role:</span> {role}
          </p>
        )}
        
        {agent.tags && agent.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {agent.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                <Tag className="h-3 w-3 mr-1" />
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">
            <Lightbulb className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="original">
            <FileText className="h-4 w-4 mr-2" />
            Original Content
          </TabsTrigger>
          <TabsTrigger value="graph">
            <GitBranch className="h-4 w-4 mr-2" />
            Relationships
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* AI Explanation */}
            <div className="lg:col-span-2 space-y-6">
              {/* Agent Info Card */}
              {(goal || capabilities.length > 0) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Agent Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {goal && (
                      <div>
                        <h4 className="text-sm font-medium mb-1">Goal</h4>
                        <p className="text-sm text-muted-foreground">{goal}</p>
                      </div>
                    )}
                    {capabilities.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Capabilities</h4>
                        <div className="flex flex-wrap gap-2">
                          {capabilities.map((cap: string, i: number) => (
                            <Badge key={i} variant="outline">{cap}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              <AIExplanationView
                entryId={agent.id}
                content={agent.original_content}
                title={agent.title}
                type={agent.type}
                existingExplanation={agent.ai_explanation}
              />
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Source Info */}
              {agent.source && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Source</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{agent.source.name}</p>
                    {agent.source.repo_url && (
                      <a 
                        href={agent.source.repo_url}
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

        <TabsContent value="original">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Original Content
                </CardTitle>
                <Badge variant="outline">Read-Only</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <pre className="text-sm whitespace-pre-wrap font-mono bg-muted p-4 rounded-lg">
                  {agent.original_content}
                </pre>
              </ScrollArea>
            </CardContent>
          </Card>
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
                entries={[agent, ...relationships.map(r => r.target_entry).filter(Boolean) as any]}
                relationships={relationships}
                highlightedEntryId={agent.id}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
