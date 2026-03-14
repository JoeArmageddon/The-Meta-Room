"use client";

import Link from "next/link";
import { 
  Bot, 
  MessageSquare, 
  Wrench, 
  GitBranch, 
  Plug, 
  BookOpen,
  ArrowRight,
  Sparkles
} from "lucide-react";

const collections = [
  {
    name: "Agent Patterns",
    description: "Core architectural patterns for building reliable AI agents",
    icon: Bot,
    color: "#8B5CF6",
    slug: "agent-patterns",
    count: 45,
    featured: ["ReAct Pattern", "Multi-Agent Systems", "Tool Use"]
  },
  {
    name: "Prompt Engineering",
    description: "Techniques and templates for effective prompting",
    icon: MessageSquare,
    color: "#10B981",
    slug: "prompt-engineering",
    count: 128,
    featured: ["Chain-of-Thought", "Few-Shot", "System Prompts"]
  },
  {
    name: "Skills Library",
    description: "Reusable capabilities you can add to any agent",
    icon: Wrench,
    color: "#3B82F6",
    slug: "skills-library",
    count: 89,
    featured: ["Web Search", "Code Execution", "File Operations"]
  },
  {
    name: "Workflows",
    description: "Multi-step processes and automation workflows",
    icon: GitBranch,
    color: "#F59E0B",
    slug: "workflows",
    count: 56,
    featured: ["Research Pipeline", "Content Creation", "Data Processing"]
  },
  {
    name: "Tools & APIs",
    description: "Integrations and external tool connections",
    icon: Plug,
    color: "#EC4899",
    slug: "tools",
    count: 72,
    featured: ["REST APIs", "Databases", "Cloud Services"]
  },
  {
    name: "Best Practices",
    description: "Guidelines and recommendations from the community",
    icon: BookOpen,
    color: "#14B8A6",
    slug: "best-practices",
    count: 34,
    featured: ["Error Handling", "Testing", "Security"]
  }
];

export function FeaturedCollections() {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-400" />
            Featured Collections
          </h2>
          <p className="text-muted-foreground mt-1">Curated categories to jumpstart your journey</p>
        </div>
        <Link
          href="/explore"
          className="hidden sm:flex items-center gap-1 text-sm text-purple-400 hover:text-purple-300 transition-colors"
        >
          View All
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {collections.map((collection) => (
          <Link
            key={collection.slug}
            href={`/explore?collection=${collection.slug}`}
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-6 transition-all hover:border-white/20 hover:bg-white/[0.04]"
          >
            {/* Glow Effect */}
            <div
              className="absolute -right-20 -top-20 h-40 w-40 rounded-full blur-[60px] opacity-0 transition-opacity group-hover:opacity-50"
              style={{ backgroundColor: collection.color }}
            />

            <div className="relative">
              <div className="flex items-start justify-between mb-4">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-xl"
                  style={{ backgroundColor: `${collection.color}20` }}
                >
                  <collection.icon
                    className="h-6 w-6"
                    style={{ color: collection.color }}
                  />
                </div>
                <span className="text-xs text-muted-foreground bg-white/5 px-2 py-1 rounded-full">
                  {collection.count} items
                </span>
              </div>

              <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-purple-300 transition-colors">
                {collection.name}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {collection.description}
              </p>

              <div className="flex flex-wrap gap-2">
                {collection.featured.map((item) => (
                  <span
                    key={item}
                    className="text-xs px-2 py-1 rounded-md bg-white/5 text-muted-foreground border border-white/5"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
