"use client";

import Link from "next/link";
import { Entry } from "@/app/types";
import { 
  Bot, 
  MessageSquare, 
  Workflow, 
  Wrench, 
  BookOpen, 
  Star, 
  Eye, 
  Bookmark,
  Copy,
  Clock,
  BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";

const typeIcons: Record<string, any> = {
  agent: Bot,
  prompt: MessageSquare,
  workflow: Workflow,
  skill: Wrench,
  pattern: BookOpen,
  tool: Wrench,
  resource: BookOpen,
  documentation: BookOpen
};

const typeColors: Record<string, string> = {
  agent: "text-purple-400 bg-purple-500/10",
  prompt: "text-emerald-400 bg-emerald-500/10",
  workflow: "text-amber-400 bg-amber-500/10",
  skill: "text-blue-400 bg-blue-500/10",
  pattern: "text-pink-400 bg-pink-500/10",
  tool: "text-cyan-400 bg-cyan-500/10",
  resource: "text-slate-400 bg-slate-500/10",
  documentation: "text-slate-400 bg-slate-500/10"
};

const complexityColors: Record<string, string> = {
  beginner: "text-emerald-400 border-emerald-500/30",
  intermediate: "text-amber-400 border-amber-500/30",
  advanced: "text-orange-400 border-orange-500/30",
  expert: "text-red-400 border-red-500/30"
};

interface EntryCardProps {
  entry: Entry;
  variant?: "default" | "compact" | "featured";
}

export function EntryCard({ entry, variant = "default" }: EntryCardProps) {
  const Icon = typeIcons[entry.type] || BookOpen;

  if (variant === "compact") {
    return (
      <Link
        href={`/${entry.type}s/${entry.slug}`}
        className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all group"
      >
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", typeColors[entry.type])}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-white truncate group-hover:text-purple-300 transition-colors">
            {entry.title}
          </h4>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="capitalize">{entry.type}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Star className="h-3 w-3" />
              {entry.rating_avg.toFixed(1)}
            </span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/${entry.type}s/${entry.slug}`}
      className="group flex flex-col rounded-2xl border border-white/10 bg-white/[0.02] p-5 transition-all hover:border-purple-500/30 hover:bg-white/[0.04]"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", typeColors[entry.type])}>
          <Icon className="h-5 w-5" />
        </div>
        {entry.complexity && (
          <span className={cn("text-xs px-2 py-1 rounded-full border capitalize", complexityColors[entry.complexity])}>
            {entry.complexity}
          </span>
        )}
      </div>

      {/* Content */}
      <h3 className="font-semibold text-white mb-2 group-hover:text-purple-300 transition-colors line-clamp-1">
        {entry.title}
      </h3>
      <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">
        {entry.description}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {entry.tags.slice(0, 3).map((tag) => (
          <span key={tag} className="text-xs px-2 py-0.5 rounded bg-white/5 text-muted-foreground">
            {tag}
          </span>
        ))}
        {entry.tags.length > 3 && (
          <span className="text-xs px-2 py-0.5 rounded bg-white/5 text-muted-foreground">
            +{entry.tags.length - 3}
          </span>
        )}
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground pt-3 border-t border-white/5">
        <span className="flex items-center gap-1">
          <Eye className="h-3.5 w-3.5" />
          {formatNumber(entry.view_count)}
        </span>
        <span className="flex items-center gap-1">
          <Copy className="h-3.5 w-3.5" />
          {formatNumber(entry.copy_count)}
        </span>
        <span className="flex items-center gap-1">
          <Bookmark className="h-3.5 w-3.5" />
          {formatNumber(entry.bookmark_count)}
        </span>
        <span className="flex items-center gap-1 ml-auto">
          <Star className="h-3.5 w-3.5 text-amber-400" />
          {entry.rating_avg.toFixed(1)}
        </span>
      </div>
    </Link>
  );
}

function formatNumber(num: number): string {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "k";
  }
  return num.toString();
}
