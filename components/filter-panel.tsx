"use client";

import { useState } from "react";
import { SlidersHorizontal, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const complexityOptions = [
  { value: "beginner", label: "Beginner", color: "text-emerald-400" },
  { value: "intermediate", label: "Intermediate", color: "text-amber-400" },
  { value: "advanced", label: "Advanced", color: "text-orange-400" },
  { value: "expert", label: "Expert", color: "text-red-400" }
];

const sortOptions = [
  { value: "relevance", label: "Relevance" },
  { value: "newest", label: "Newest" },
  { value: "popular", label: "Most Popular" },
  { value: "rated", label: "Highest Rated" }
];

export function FilterPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedComplexity, setSelectedComplexity] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("relevance");

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all",
          isOpen 
            ? "bg-purple-500/20 border-purple-500/50 text-purple-300" 
            : "bg-white/5 border-white/10 text-white hover:bg-white/10"
        )}
      >
        <SlidersHorizontal className="h-4 w-4" />
        Filters
        {selectedComplexity.length > 0 && (
          <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-purple-500 text-xs">
            {selectedComplexity.length}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-72 rounded-xl border border-white/10 bg-card/95 backdrop-blur-xl p-4 shadow-xl z-50">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-white">Filters</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-muted-foreground hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Sort */}
            <div className="mb-6">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500/50"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Complexity */}
            <div className="mb-6">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
                Complexity
              </label>
              <div className="space-y-2">
                {complexityOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setSelectedComplexity(prev => 
                        prev.includes(opt.value)
                          ? prev.filter(v => v !== opt.value)
                          : [...prev, opt.value]
                      );
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all",
                      selectedComplexity.includes(opt.value)
                        ? "bg-white/10"
                        : "hover:bg-white/5"
                    )}
                  >
                    <div className={cn(
                      "flex h-5 w-5 items-center justify-center rounded border transition-all",
                      selectedComplexity.includes(opt.value)
                        ? "bg-purple-500 border-purple-500"
                        : "border-white/20"
                    )}>
                      {selectedComplexity.includes(opt.value) && (
                        <Check className="h-3 w-3 text-white" />
                      )}
                    </div>
                    <span className={opt.color}>{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Apply Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="w-full py-2 rounded-lg bg-purple-500/20 text-purple-300 font-medium hover:bg-purple-500/30 transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </>
      )}
    </div>
  );
}
