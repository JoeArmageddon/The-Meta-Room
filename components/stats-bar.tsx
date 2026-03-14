"use client";

import { Bot, MessageSquare, Workflow, BookOpen, Users, Star } from "lucide-react";

const stats = [
  { label: "AI Agents", value: "500+", icon: Bot },
  { label: "Prompts", value: "1,200+", icon: MessageSquare },
  { label: "Workflows", value: "350+", icon: Workflow },
  { label: "Patterns", value: "200+", icon: BookOpen },
  { label: "Contributors", value: "50+", icon: Users },
  { label: "Rating", value: "4.9", icon: Star },
];

export function StatsBar() {
  return (
    <div className="border-y border-white/5 bg-white/[0.02] backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-4 py-8 sm:grid-cols-3 lg:grid-cols-6">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex items-center gap-3 rounded-xl bg-white/5 px-4 py-3 border border-white/5"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
                <stat.icon className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <div className="text-xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
