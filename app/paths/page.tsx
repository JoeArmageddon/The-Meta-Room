"use client";

import { LearningPaths } from "@/components/learning-paths";
import { GraduationCap } from "lucide-react";

export default function PathsPage() {
  return (
    <div className="min-h-screen px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-500/10 mb-6">
            <GraduationCap className="h-8 w-8 text-purple-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">Learning Paths</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Structured learning journeys to master AI agent development.
          </p>
        </div>
        <LearningPaths />
      </div>
    </div>
  );
}
