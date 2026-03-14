"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Sparkles, ArrowRight, Zap, BookOpen, Bot } from "lucide-react";
import { cn } from "@/lib/utils";

const quickSearches = [
  { label: "Agent Patterns", icon: Bot, query: "agent patterns" },
  { label: "Prompt Engineering", icon: Sparkles, query: "prompt engineering" },
  { label: "Workflows", icon: Zap, query: "workflows" },
  { label: "Best Practices", icon: BookOpen, query: "best practices" },
];

export function HeroSearch() {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/explore?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <form onSubmit={handleSearch} className="relative">
        <div
          className={cn(
            "relative flex items-center rounded-2xl border transition-all duration-300",
            isFocused
              ? "border-purple-500/50 bg-white/10 shadow-2xl shadow-purple-500/20"
              : "border-white/10 bg-white/5 hover:border-white/20"
          )}
        >
          <Search className={cn(
            "absolute left-5 h-5 w-5 transition-colors",
            isFocused ? "text-purple-400" : "text-muted-foreground"
          )} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Search agents, prompts, patterns, workflows..."
            className="w-full bg-transparent py-5 pl-14 pr-32 text-lg text-white placeholder:text-muted-foreground focus:outline-none"
          />
          <button
            type="submit"
            className="absolute right-2 flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all hover:scale-105"
          >
            Search
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </form>

      {/* Quick Searches */}
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {quickSearches.map((item) => (
          <button
            key={item.label}
            onClick={() => router.push(`/explore?q=${encodeURIComponent(item.query)}`)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/30 transition-all text-sm text-muted-foreground hover:text-white"
          >
            <item.icon className="h-4 w-4 text-purple-400" />
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
