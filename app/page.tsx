import { HeroSearch } from "@/components/hero-search";
import { StatsBar } from "@/components/stats-bar";
import { FeaturedCollections } from "@/components/featured-collections";
import { TrendingEntries } from "@/components/trending-entries";
import { LearningPaths } from "@/components/learning-paths";
import { Bot, Sparkles, ArrowRight, Zap } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 pt-20 pb-16 sm:px-6 lg:px-8">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-purple-500/20 blur-[120px]" />
          <div className="absolute top-20 right-20 h-96 w-96 rounded-full bg-cyan-500/10 blur-[100px]" />
          <div className="absolute bottom-0 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-emerald-500/10 blur-[80px]" />
        </div>

        <div className="relative mx-auto max-w-5xl text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5 text-sm text-purple-300 mb-8">
            <Sparkles className="h-4 w-4" />
            <span>The Ultimate AI Agent Resource</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight mb-6">
            <span className="text-white">Master </span>
            <span className="gradient-text">AI Agents</span>
            <br />
            <span className="text-white">& Prompt Engineering</span>
          </h1>

          {/* Subheadline */}
          <p className="mx-auto max-w-2xl text-lg sm:text-xl text-muted-foreground mb-10 leading-relaxed">
            Discover patterns, prompts, and workflows to build powerful AI systems. 
            From beginner basics to advanced techniques.
          </p>

          {/* Search */}
          <HeroSearch />

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href="/explore"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-medium shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all hover:scale-105"
            >
              <Bot className="h-5 w-5" />
              Explore Agents
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/patterns"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium transition-all"
            >
              <Zap className="h-5 w-5" />
              View Patterns
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <StatsBar />

      {/* Featured Collections */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <FeaturedCollections />
        </div>
      </section>

      {/* Trending Entries */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 border-t border-white/5 bg-gradient-to-b from-transparent to-white/[0.02]">
        <div className="mx-auto max-w-7xl">
          <TrendingEntries />
        </div>
      </section>

      {/* Learning Paths */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 border-t border-white/5">
        <div className="mx-auto max-w-7xl">
          <LearningPaths />
        </div>
      </section>

      {/* Footer CTA */}
      <section className="px-4 py-20 sm:px-6 lg:px-8 border-t border-white/5">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to build better AI?</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Join thousands of developers mastering AI agents. Start exploring our curated collection today.
          </p>
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-semibold shadow-xl shadow-purple-500/25 hover:shadow-purple-500/40 transition-all hover:scale-105"
          >
            Get Started Free
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
