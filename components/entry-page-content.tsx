"use client";

import { Entry } from "@/app/types";
import { 
  Bot, 
  MessageSquare, 
  Workflow, 
  BookOpen, 
  Star, 
  Eye, 
  Bookmark,
  Copy,
  Clock,
  Share2,
  ChevronRight,
  CheckCircle2,
  Wrench
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
// Toast not available

const typeIcons: Record<string, any> = {
  agent: Bot,
  prompt: MessageSquare,
  workflow: Workflow,
  skill: Wrench,
  pattern: BookOpen,
  tool: Wrench,
  resource: BookOpen
};

const typeColors: Record<string, string> = {
  agent: "text-purple-400",
  prompt: "text-emerald-400",
  workflow: "text-amber-400",
  skill: "text-blue-400",
  pattern: "text-pink-400",
  tool: "text-cyan-400",
  resource: "text-slate-400"
};

const complexityColors: Record<string, string> = {
  beginner: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  intermediate: "text-amber-400 bg-amber-500/10 border-amber-500/30",
  advanced: "text-orange-400 bg-orange-500/10 border-orange-500/30",
  expert: "text-red-400 bg-red-500/10 border-red-500/30"
};

const mockEntries: Record<string, Entry> = {
  "react-agent-pattern": {
    id: "1",
    title: "ReAct Agent Pattern",
    slug: "react-agent-pattern",
    type: "pattern",
    description: "Reasoning and Acting pattern for building agents that can think step by step",
    original_content: `# ReAct Agent Pattern

The ReAct (Reasoning + Acting) pattern is a powerful approach for building AI agents.

## How It Works

1. **Thought**: The agent thinks about what to do
2. **Action**: Takes an action
3. **Observation**: Observes the result
4. **Repeat** until done`,
    complexity: "intermediate",
    tags: ["agents", "reasoning", "planning"],
    ai_tags: [],
    categories: [],
    view_count: 1250,
    copy_count: 340,
    bookmark_count: 120,
    rating_avg: 4.8,
    rating_count: 45,
    is_featured: true,
    is_published: true,
    source_id: "",
    created_at: "2024-01-01",
    updated_at: "2024-01-01",
    estimated_time: "15 min",
    quality_score: 92
  }
};

interface EntryPageContentProps {
  type: string;
  slug: string;
}

export function EntryPageContent({ type, slug }: EntryPageContentProps) {
  const entry = mockEntries[slug] || mockEntries["react-agent-pattern"];
  const Icon = typeIcons[entry.type] || BookOpen;

  const handleCopy = () => {
    navigator.clipboard.writeText(entry.original_content);
    alert("Copied to clipboard!");
  };

  const handleBookmark = () => {
    alert("Bookmarked!");
  };

  return (
    <div className="min-h-screen">
      {/* Hero Header */}
      <div className="border-b border-white/5 bg-gradient-to-b from-white/[0.03] to-transparent">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <a href="/explore" className="hover:text-white transition-colors">Explore</a>
            <ChevronRight className="h-4 w-4" />
            <span className="capitalize">{entry.type}s</span>
            <ChevronRight className="h-4 w-4" />
            <span className="text-white">{entry.title}</span>
          </nav>

          <div className="flex items-center gap-2 mb-4">
            <div className={cn("flex items-center gap-1.5 text-sm font-medium", typeColors[entry.type])}>
              <Icon className="h-4 w-4" />
              <span className="capitalize">{entry.type}</span>
            </div>
            {entry.complexity && (
              <>
                <span className="text-muted-foreground">•</span>
                <span className={cn("text-xs px-2 py-0.5 rounded-full border capitalize", complexityColors[entry.complexity])}>
                  {entry.complexity}
                </span>
              </>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            {entry.title}
          </h1>

          <p className="text-lg text-muted-foreground mb-6 max-w-3xl">
            {entry.description}
          </p>

          <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground mb-8">
            <span className="flex items-center gap-1.5">
              <Eye className="h-4 w-4" />
              {entry.view_count.toLocaleString()} views
            </span>
            <span className="flex items-center gap-1.5">
              <Copy className="h-4 w-4" />
              {entry.copy_count.toLocaleString()} copies
            </span>
            <span className="flex items-center gap-1.5">
              <Star className="h-4 w-4 text-amber-400" />
              {entry.rating_avg.toFixed(1)} ({entry.rating_count} ratings)
            </span>
            {entry.estimated_time && (
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {entry.estimated_time} read
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <Button onClick={handleCopy} className="bg-purple-500 hover:bg-purple-600 text-white gap-2">
              <Copy className="h-4 w-4" />
              Copy Content
            </Button>
            <Button variant="outline" onClick={handleBookmark} className="gap-2 border-white/10 hover:bg-white/5">
              <Bookmark className="h-4 w-4" />
              Bookmark
            </Button>
            <Button variant="outline" className="gap-2 border-white/10 hover:bg-white/5">
              <Share2 className="h-4 w-4" />
              Share
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-[1fr,300px] gap-8">
          <div>
            <Tabs defaultValue="content" className="w-full">
              <TabsList className="w-full sm:w-auto bg-white/5 border border-white/10 mb-6">
                <TabsTrigger value="content" className="data-[state=active]:bg-purple-500/20">Content</TabsTrigger>
                <TabsTrigger value="explanation" className="data-[state=active]:bg-purple-500/20">AI Explanation</TabsTrigger>
                <TabsTrigger value="related" className="data-[state=active]:bg-purple-500/20">Related</TabsTrigger>
              </TabsList>

              <TabsContent value="content" className="mt-0">
                <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-gray-300">
                    {entry.original_content}
                  </pre>
                </div>
              </TabsContent>

              <TabsContent value="explanation" className="mt-0">
                <div className="bg-gradient-to-br from-purple-500/10 to-cyan-500/10 rounded-xl p-6 border border-purple-500/20">
                  <h3 className="text-lg font-semibold text-white mb-3">AI Summary</h3>
                  <p className="text-muted-foreground">
                    This pattern is one of the most effective approaches for building agents that need to solve complex, multi-step problems.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="related" className="mt-0">
                <div className="grid sm:grid-cols-2 gap-4">
                  {["Tool Use Pattern", "Multi-Agent Systems"].map((related) => (
                    <a key={related} href="#" className="flex items-center gap-3 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10">
                      <BookOpen className="h-5 w-5 text-purple-400" />
                      <span className="font-medium text-white">{related}</span>
                    </a>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <aside className="space-y-6">
            <div className="bg-white/5 rounded-xl p-5 border border-white/10">
              <h4 className="font-medium text-white mb-3">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {entry.tags.map((tag) => (
                  <span key={tag} className="text-xs px-2 py-1 rounded-md bg-white/5 text-muted-foreground border border-white/5">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {entry.quality_score && (
              <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                <h4 className="font-medium text-white mb-3">Quality Score</h4>
                <div className="flex items-center gap-3">
                  <div className="relative w-16 h-16">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#8B5CF6" strokeWidth="3" strokeDasharray={`${entry.quality_score}, 100`} />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white">{entry.quality_score}</span>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-emerald-400 font-medium">Excellent</div>
                    <div className="text-xs text-muted-foreground">Based on community feedback</div>
                  </div>
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
