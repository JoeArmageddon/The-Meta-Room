import Link from 'next/link';
import { getEntries } from '@/lib/db/supabase';
import { EntryCard } from '@/components/entry-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bot, ArrowRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AgentsPage() {
  const agents = await getEntries('agent', 100);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-purple-500/10">
            <Bot className="h-6 w-6 text-purple-400" />
          </div>
          <h1 className="text-3xl font-bold">Agents</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl">
          Discover AI agents and their capabilities. Agents are autonomous systems 
          designed to perform specific tasks with defined roles and goals.
        </p>
      </div>

      {/* Stats */}
      <div className="flex flex-wrap gap-4 mb-8">
        <Badge variant="secondary" className="px-4 py-2 text-base">
          {agents.length} Agents Available
        </Badge>
      </div>

      {/* Agents Grid */}
      {agents.length === 0 ? (
        <div className="text-center py-20 bg-muted/30 rounded-lg">
          <Bot className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">No agents yet</h3>
          <p className="text-muted-foreground mb-4">
            Import a repository to discover agents.
          </p>
          <Link href="/import">
            <Button>
              Import Repository
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map((agent) => (
            <EntryCard key={agent.id} entry={agent} />
          ))}
        </div>
      )}
    </div>
  );
}
