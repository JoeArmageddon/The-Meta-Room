"use client";

import { Grid3X3, List } from "lucide-react";
import { cn } from "@/lib/utils";

interface ViewToggleProps {
  view: "grid" | "list";
  onChange: (view: "grid" | "list") => void;
}

export function ViewToggle({ view, onChange }: ViewToggleProps) {
  return (
    <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 p-1">
      <button
        onClick={() => onChange("grid")}
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-md transition-all",
          view === "grid" 
            ? "bg-white/10 text-white" 
            : "text-muted-foreground hover:text-white"
        )}
        title="Grid view"
      >
        <Grid3X3 className="h-4 w-4" />
      </button>
      <button
        onClick={() => onChange("list")}
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-md transition-all",
          view === "list" 
            ? "bg-white/10 text-white" 
            : "text-muted-foreground hover:text-white"
        )}
        title="List view"
      >
        <List className="h-4 w-4" />
      </button>
    </div>
  );
}
