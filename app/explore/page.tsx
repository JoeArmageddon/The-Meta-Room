"use client";

import { useState } from "react";
import { Entry } from "@/app/types";
import { EntryCard } from "@/components/entry-card";
import { SearchBar } from "@/components/search-bar";
import { FilterPanel } from "@/components/filter-panel";
import { ViewToggle } from "@/components/view-toggle";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Grid3X3, List, Sparkles } from "lucide-react";

// Mock data
const mockEntries: Entry[] = [
  {
    id: "1",
    title: "ReAct Agent Pattern",
    slug: "react-agent-pattern",
    type: "pattern",
    description: "Reasoning and Acting pattern for building agents that can think step by step",
    complexity: "intermediate",
    tags: ["agents", "reasoning", "planning", "react"],
    ai_tags: [],
    categories: [],
    view_count: 1250,
    copy_count: 340,
    bookmark_count: 120,
    rating_avg: 4.8,
    rating_count: 45,
    is_featured: true,
    is_published: true,
    original_content: "",
    source_id: "",
    created_at: "2024-01-01",
    updated_at: "2024-01-01"
  },
  {
    id: "2",
    title: "System Prompt Template",
    slug: "system-prompt-template",
    type: "prompt",
    description: "A comprehensive system prompt template with role definition and constraints",
    complexity: "beginner",
    tags: ["prompts", "templates", "system"],
    ai_tags: [],
    categories: [],
    view_count: 980,
    copy_count: 520,
    bookmark_count: 200,
    rating_avg: 4.9,
    rating_count: 62,
    is_featured: true,
    is_published: true,
    original_content: "",
    source_id: "",
    created_at: "2024-01-01",
    updated_at: "2024-01-01"
  },
  {
    id: "3",
    title: "Multi-Agent Workflow",
    slug: "multi-agent-workflow",
    type: "workflow",
    description: "Coordinate multiple specialized agents to solve complex tasks",
    complexity: "advanced",
    tags: ["workflows", "multi-agent", "coordination"],
    ai_tags: [],
    categories: [],
    view_count: 850,
    copy_count: 180,
    bookmark_count: 95,
    rating_avg: 4.7,
    rating_count: 38,
    is_featured: true,
    is_published: true,
    original_content: "",
    source_id: "",
    created_at: "2024-01-01",
    updated_at: "2024-01-01"
  },
  {
    id: "4",
    title: "Chain-of-Thought Prompting",
    slug: "chain-of-thought",
    type: "skill",
    description: "Technique to improve reasoning by asking the model to show its work",
    complexity: "beginner",
    tags: ["prompting", "reasoning", "techniques"],
    ai_tags: [],
    categories: [],
    view_count: 1100,
    copy_count: 410,
    bookmark_count: 150,
    rating_avg: 4.9,
    rating_count: 55,
    is_featured: true,
    is_published: true,
    original_content: "",
    source_id: "",
    created_at: "2024-01-01",
    updated_at: "2024-01-01"
  },
  {
    id: "5",
    title: "Tool Use Pattern",
    slug: "tool-use-pattern",
    type: "pattern",
    description: "Enable agents to use external tools and APIs effectively",
    complexity: "intermediate",
    tags: ["agents", "tools", "api", "function-calling"],
    ai_tags: [],
    categories: [],
    view_count: 920,
    copy_count: 280,
    bookmark_count: 110,
    rating_avg: 4.6,
    rating_count: 42,
    is_featured: false,
    is_published: true,
    original_content: "",
    source_id: "",
    created_at: "2024-01-01",
    updated_at: "2024-01-01"
  },
  {
    id: "6",
    title: "Few-Shot Prompting Guide",
    slug: "few-shot-prompting",
    type: "skill",
    description: "Learn how to use examples to improve model performance",
    complexity: "beginner",
    tags: ["prompting", "few-shot", "examples"],
    ai_tags: [],
    categories: [],
    view_count: 780,
    copy_count: 350,
    bookmark_count: 130,
    rating_avg: 4.7,
    rating_count: 38,
    is_featured: false,
    is_published: true,
    original_content: "",
    source_id: "",
    created_at: "2024-01-01",
    updated_at: "2024-01-01"
  }
];

export default function ExplorePage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeTab, setActiveTab] = useState("all");

  const filteredEntries = activeTab === "all" 
    ? mockEntries 
    : mockEntries.filter(e => e.type === activeTab);

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-purple-400" />
            Explore
          </h1>
          <p className="text-muted-foreground">
            Discover AI agents, prompts, patterns, and workflows
          </p>
        </div>

        {/* Search & Filters */}
        <div className="mb-8 space-y-4">
          <SearchBar />
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="bg-white/5 border border-white/10">
                <TabsTrigger value="all" className="data-[state=active]:bg-purple-500/20">All</TabsTrigger>
                <TabsTrigger value="agent" className="data-[state=active]:bg-purple-500/20">Agents</TabsTrigger>
                <TabsTrigger value="prompt" className="data-[state=active]:bg-purple-500/20">Prompts</TabsTrigger>
                <TabsTrigger value="workflow" className="data-[state=active]:bg-purple-500/20">Workflows</TabsTrigger>
                <TabsTrigger value="pattern" className="data-[state=active]:bg-purple-500/20">Patterns</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex items-center gap-3">
              <FilterPanel />
              <ViewToggle view={viewMode} onChange={setViewMode} />
            </div>
          </div>
        </div>

        {/* Results */}
        <div className={cn(
          "gap-4",
          viewMode === "grid" ? "grid sm:grid-cols-2 lg:grid-cols-3" : "flex flex-col"
        )}>
          {filteredEntries.map((entry) => (
            <EntryCard 
              key={entry.id} 
              entry={entry} 
              variant={viewMode === "list" ? "compact" : "default"}
            />
          ))}
        </div>

        {/* Empty State */}
        {filteredEntries.length === 0 && (
          <div className="text-center py-20">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-white/5 mb-4">
              <Sparkles className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No results found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}

function cn(...classes: (string | undefined | boolean)[]) {
  return classes.filter(Boolean).join(" ");
}
