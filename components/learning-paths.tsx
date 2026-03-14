"use client";

import Link from "next/link";
import { LearningPath } from "@/app/types";
import { 
  GraduationCap, 
  Clock, 
  Target, 
  ArrowRight,
  CheckCircle2,
  BookOpen
} from "lucide-react";

const paths: LearningPath[] = [
  {
    id: "1",
    title: "Agent Building Fundamentals",
    slug: "agent-fundamentals",
    description: "Learn the basics of building AI agents from scratch. Perfect for beginners.",
    difficulty: "beginner",
    estimated_hours: 10,
    outcomes: ["Understand agent architecture", "Build your first agent", "Master basic prompting"],
    entry_ids: [],
    prerequisites: [],
    is_featured: true,
    view_count: 2500,
    created_at: "2024-01-01"
  },
  {
    id: "2",
    title: "Advanced Prompt Engineering",
    slug: "advanced-prompts",
    description: "Master complex prompting techniques for better results with LLMs.",
    difficulty: "advanced",
    estimated_hours: 15,
    outcomes: ["Chain-of-thought prompting", "Few-shot learning", "Prompt optimization"],
    entry_ids: [],
    prerequisites: ["Basic LLM knowledge", "Python fundamentals"],
    is_featured: true,
    view_count: 1800,
    created_at: "2024-01-01"
  },
  {
    id: "3",
    title: "Production-Ready Agents",
    slug: "production-agents",
    description: "Take your agents from prototype to production with best practices.",
    difficulty: "intermediate",
    estimated_hours: 20,
    outcomes: ["Error handling strategies", "Monitoring and logging", "Scaling techniques"],
    entry_ids: [],
    prerequisites: ["Agent basics", "API development"],
    is_featured: true,
    view_count: 1200,
    created_at: "2024-01-01"
  }
];

const difficultyColors: Record<string, string> = {
  beginner: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  intermediate: "text-amber-400 bg-amber-500/10 border-amber-500/30",
  advanced: "text-orange-400 bg-orange-500/10 border-orange-500/30",
  expert: "text-red-400 bg-red-500/10 border-red-500/30"
};

export function LearningPaths() {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-purple-400" />
          <h2 className="text-2xl font-bold text-white">Learning Paths</h2>
        </div>
        <Link
          href="/paths"
          className="hidden sm:flex items-center gap-1 text-sm text-purple-400 hover:text-purple-300 transition-colors"
        >
          View All
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {paths.map((path) => (
          <Link
            key={path.slug}
            href={`/paths/${path.slug}`}
            className="group flex flex-col rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-transparent p-6 transition-all hover:border-purple-500/30"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10">
                <BookOpen className="h-6 w-6 text-purple-400" />
              </div>
              <span className={cn(
                "text-xs px-3 py-1 rounded-full border capitalize",
                difficultyColors[path.difficulty || "beginner"]
              )}>
                {path.difficulty}
              </span>
            </div>

            {/* Content */}
            <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-purple-300 transition-colors">
              {path.title}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {path.description}
            </p>

            {/* Meta */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {path.estimated_hours} hours
              </span>
              <span className="flex items-center gap-1.5">
                <Target className="h-4 w-4" />
                {path.outcomes.length} outcomes
              </span>
            </div>

            {/* Outcomes */}
            <div className="space-y-2 mb-4 flex-1">
              {path.outcomes.slice(0, 3).map((outcome) => (
                <div key={outcome} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                  <span>{outcome}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="flex items-center gap-2 text-sm font-medium text-purple-400 group-hover:text-purple-300 pt-4 border-t border-white/5">
              Start Learning
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function cn(...classes: (string | undefined | boolean)[]) {
  return classes.filter(Boolean).join(" ");
}
