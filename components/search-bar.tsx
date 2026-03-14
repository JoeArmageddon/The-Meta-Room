"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/explore?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div
        className={cn(
          "relative flex items-center rounded-xl border transition-all duration-300",
          isFocused
            ? "border-purple-500/50 bg-white/10 shadow-lg shadow-purple-500/10"
            : "border-white/10 bg-white/5 hover:border-white/20"
        )}
      >
        <Search className={cn(
          "absolute left-4 h-5 w-5 transition-colors",
          isFocused ? "text-purple-400" : "text-muted-foreground"
        )} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Search agents, prompts, patterns..."
          className="w-full bg-transparent py-3.5 pl-12 pr-24 text-white placeholder:text-muted-foreground focus:outline-none"
        />
        <div className="absolute right-2 flex items-center gap-2">
          <kbd className="hidden sm:inline-flex h-7 items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 text-xs text-muted-foreground">
            <span className="text-xs">⌘</span>K
          </kbd>
        </div>
      </div>
      
      {/* Search Suggestions Dropdown - can be expanded */}
      {isFocused && (
        <div className="absolute top-full left-0 right-0 mt-2 rounded-xl border border-white/10 bg-card/95 backdrop-blur-xl p-2 shadow-xl z-50">
          <div className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground">
            <Sparkles className="h-3 w-3" />
            Popular searches
          </div>
          {["ReAct pattern", "System prompts", "Multi-agent", "Tool use"].map((term) => (
            <button
              key={term}
              type="button"
              onClick={() => {
                setQuery(term);
                router.push(`/explore?q=${encodeURIComponent(term)}`);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-white/5 hover:text-white transition-colors"
            >
              {term}
            </button>
          ))}
        </div>
      )}
    </form>
  );
}
