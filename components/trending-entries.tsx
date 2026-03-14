"use client";

import Link from "next/link";
import { Entry } from "@/app/types";
import { EntryCard } from "./entry-card";
import { TrendingUp, ArrowRight } from "lucide-react";

// Mock data - would come from API
const trendingEntries: Entry[] = [
  {
    id: "1",
    title: "ReAct Agent Pattern",
    slug: "react-agent-pattern",
    type: "pattern",
    description: "Reasoning and Acting pattern for building agents that can think step by step",
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
  }
];

export function TrendingEntries() {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-emerald-400" />
          <h2 className="text-2xl font-bold text-white">Trending Now</h2>
        </div>
        <Link
          href="/explore?sort=trending"
          className="hidden sm:flex items-center gap-1 text-sm text-purple-400 hover:text-purple-300 transition-colors"
        >
          View All
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {trendingEntries.map((entry) => (
          <EntryCard key={entry.id} entry={entry} />
        ))}
      </div>
    </div>
  );
}
