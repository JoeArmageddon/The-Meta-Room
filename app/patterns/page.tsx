"use client";

import Link from "next/link";
import { BookOpen, ArrowRight, Sparkles } from "lucide-react";

export default function PatternsPage() {
  return (
    <div className="min-h-screen px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl text-center">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-pink-500/10 mb-6">
          <BookOpen className="h-8 w-8 text-pink-400" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-4">Patterns</h1>
        <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
          Design patterns and architectural approaches for building AI systems.
        </p>
        <Link
          href="/explore?type=pattern"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-purple-500 text-white font-medium hover:bg-purple-600 transition-colors"
        >
          <Sparkles className="h-4 w-4" />
          Browse Patterns
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
