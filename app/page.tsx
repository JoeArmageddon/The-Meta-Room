import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { SearchBar } from '@/components/search-bar';
import { 
  Sparkles, 
  Bot, 
  FileText, 
  Workflow, 
  ArrowRight,
  Database,
  Search,
  GitBranch
} from 'lucide-react';

const features = [
  {
    icon: Database,
    title: 'Knowledge Indexing',
    description: 'Ingest and index skills, agents, prompts, and documentation from any repository.',
  },
  {
    icon: Search,
    title: 'Semantic Search',
    description: 'Find what you need with AI-powered semantic and full-text search.',
  },
  {
    icon: Sparkles,
    title: 'AI Explanations',
    description: 'Get AI-generated explanations and use cases for every entry.',
  },
  {
    icon: GitBranch,
    title: 'Relationship Graphs',
    description: 'Visualize connections between skills, agents, and workflows.',
  },
];

const entityTypes = [
  { icon: Sparkles, label: 'Skills', href: '/skills', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { icon: Bot, label: 'Agents', href: '/agents', color: 'text-purple-400', bg: 'bg-purple-500/10' },
  { icon: FileText, label: 'Prompts', href: '/prompts', color: 'text-green-400', bg: 'bg-green-500/10' },
  { icon: Workflow, label: 'Workflows', href: '/explore?type=workflow', color: 'text-orange-400', bg: 'bg-orange-500/10' },
];

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.1),transparent_50%)]" />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
              <Sparkles className="h-4 w-4" />
              AI Knowledge Discovery Platform
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              The Meta Room
            </h1>
            
            <p className="text-xl text-muted-foreground mb-4">
              A searchable knowledge base and explorer for AI skills, agents, and prompt systems.
            </p>
            
            <p className="text-muted-foreground mb-10 max-w-xl mx-auto">
              Index, explore, and understand AI capabilities from any repository. 
              Never modify original content—only enhance discovery.
            </p>

            {/* Search */}
            <div className="max-w-xl mx-auto mb-12">
              <SearchBar />
            </div>

            {/* Quick Links */}
            <div className="flex flex-wrap justify-center gap-3">
              {entityTypes.map((type) => (
                <Link key={type.label} href={type.href}>
                  <Button variant="outline" className="gap-2">
                    <type.icon className={`h-4 w-4 ${type.color}`} />
                    {type.label}
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why The Meta Room?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Built for scale and designed for discovery. Preserve original content 
              while unlocking new levels of understanding.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="group hover:border-primary/50 transition-colors">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Explore?</h2>
            <p className="text-muted-foreground mb-8">
              Start by importing a repository or browse our growing collection of 
              AI skills and agents.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/explore">
                <Button size="lg" className="gap-2">
                  <Search className="h-4 w-4" />
                  Explore Entries
                </Button>
              </Link>
              <Link href="/import">
                <Button size="lg" variant="outline" className="gap-2">
                  <GitBranch className="h-4 w-4" />
                  Import Repository
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
