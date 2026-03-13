import Link from 'next/link';
import { getEntries } from '@/lib/db/supabase';
import { EntryCard } from '@/components/entry-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, ArrowRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function SkillsPage() {
  const skills = await getEntries('skill', 100);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-blue-500/10">
            <Sparkles className="h-6 w-6 text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold">Skills</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl">
          Browse AI capabilities and competencies. Skills define what AI systems can do—
          from code generation to data analysis to creative tasks.
        </p>
      </div>

      {/* Stats */}
      <div className="flex flex-wrap gap-4 mb-8">
        <Badge variant="secondary" className="px-4 py-2 text-base">
          {skills.length} Skills Available
        </Badge>
      </div>

      {/* Skills Grid */}
      {skills.length === 0 ? (
        <div className="text-center py-20 bg-muted/30 rounded-lg">
          <Sparkles className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">No skills yet</h3>
          <p className="text-muted-foreground mb-4">
            Import a repository to discover skills.
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
          {skills.map((skill) => (
            <EntryCard key={skill.id} entry={skill} />
          ))}
        </div>
      )}
    </div>
  );
}
