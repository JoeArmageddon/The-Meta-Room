"use client";

import Link from "next/link";
import { Workflow, ArrowRight, Zap } from "lucide-react";

export default function WorkflowsPage() {
  return (
    <div className="min-h-screen px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl text-center">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 mb-6">
          <Workflow className="h-8 w-8 text-amber-400" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-4">Workflows</h1>
        <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
          Multi-step processes and automation workflows for AI agents.
        </p>
        <Link
          href="/explore?type=workflow"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-purple-500 text-white font-medium hover:bg-purple-600 transition-colors"
        >
          <Zap className="h-4 w-4" />
          Browse Workflows
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
