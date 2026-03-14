"use client";

import Link from "next/link";
import { 
  GraduationCap, 
  Clock, 
  Target, 
  CheckCircle2,
  ArrowLeft,
  Play
} from "lucide-react";
import { LearningPath } from "@/app/types";

const mockPath: LearningPath = {
  id: "1",
  title: "Agent Building Fundamentals",
  slug: "agent-fundamentals",
  description: "Learn the basics of building AI agents from scratch. Perfect for beginners.",
  difficulty: "beginner",
  estimated_hours: 10,
  outcomes: [
    "Understand agent architecture",
    "Build your first agent", 
    "Master basic prompting",
    "Implement tool use",
    "Deploy your agent"
  ],
  entry_ids: [],
  prerequisites: ["Basic Python", "Understanding of APIs"],
  is_featured: true,
  view_count: 2500,
  created_at: "2024-01-01"
};

const difficultyClass = "text-emerald-400 bg-emerald-500/10 border-emerald-500/30 px-3 py-1 rounded-full text-sm border";

export default function PathDetailPage() {
  const path = mockPath;

  return (
    <div className="min-h-screen">
      <div className="border-b border-white/5 bg-gradient-to-b from-white/[0.03] to-transparent">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
          <Link 
            href="/paths" 
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-white mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Paths
          </Link>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10">
              <GraduationCap className="h-6 w-6 text-purple-400" />
            </div>
            <span className={difficultyClass}>
              {path.difficulty}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            {path.title}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            {path.description}
          </p>

          <div className="flex flex-wrap items-center gap-6 mt-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {path.estimated_hours} hours
            </span>
            <span className="flex items-center gap-1.5">
              <Target className="h-4 w-4" />
              {path.outcomes.length} outcomes
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-[1fr,350px] gap-8">
          <div>
            <h2 className="text-xl font-semibold text-white mb-6">What You&apos;ll Learn</h2>
            <div className="space-y-4">
              {path.outcomes.map((outcome, index) => (
                <div 
                  key={outcome}
                  className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/20 text-purple-400 font-semibold text-sm">
                    {index + 1}
                  </div>
                  <span className="text-white">{outcome}</span>
                </div>
              ))}
            </div>

            <button className="mt-8 w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-semibold hover:opacity-90 transition-opacity">
              <Play className="h-5 w-5" />
              Start Learning
            </button>
          </div>

          <aside className="space-y-6">
            {path.prerequisites && path.prerequisites.length > 0 && (
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <h3 className="font-medium text-white mb-4">Prerequisites</h3>
                <ul className="space-y-2">
                  {path.prerequisites.map((prereq) => (
                    <li key={prereq} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      {prereq}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
