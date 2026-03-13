import Link from 'next/link';
import { getEntries } from '@/lib/db/supabase';
import { EntryCard } from '@/components/entry-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, ArrowRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function PromptsPage() {
  const prompts = await getEntries('prompt', 100);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-green-500/10">
            <FileText className="h-6 w-6 text-green-400" />
          </div>
          <h1 className="text-3xl font-bold">Prompts</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl">
          Browse prompt templates and patterns. Prompts are carefully crafted 
          instructions that guide AI behavior and output.
        </p>
      </div>

      {/* Stats */}
      <div className="flex flex-wrap gap-4 mb-8">
        <Badge variant="secondary" className="px-4 py-2 text-base">
          {prompts.length} Prompts Available
        </Badge>
      </div>

      {/* Prompts Grid */}
      {prompts.length === 0 ? (
        <div className="text-center py-20 bg-muted/30 rounded-lg">
          <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">No prompts yet</h3>
          <p className="text-muted-foreground mb-4">
            Import a repository to discover prompts.
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
          {prompts.map((prompt) => (
            <EntryCard key={prompt.id} entry={prompt} />
          ))}
        </div>
      )}
    </div>
  );
}
