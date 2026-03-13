'use client';

import Link from 'next/link';
import { Entry } from '@/app/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { FileText, Bot, Sparkles, Workflow, BookOpen, Tag } from 'lucide-react';

interface EntryCardProps {
  entry: Entry;
  className?: string;
  showAIExplanation?: boolean;
}

const typeConfig = {
  skill: {
    icon: Sparkles,
    color: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    bgGradient: 'from-blue-500/5 to-transparent',
    label: 'Skill'
  },
  agent: {
    icon: Bot,
    color: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    bgGradient: 'from-purple-500/5 to-transparent',
    label: 'Agent'
  },
  prompt: {
    icon: FileText,
    color: 'bg-green-500/10 text-green-400 border-green-500/20',
    bgGradient: 'from-green-500/5 to-transparent',
    label: 'Prompt'
  },
  workflow: {
    icon: Workflow,
    color: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    bgGradient: 'from-orange-500/5 to-transparent',
    label: 'Workflow'
  },
  documentation: {
    icon: BookOpen,
    color: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    bgGradient: 'from-gray-500/5 to-transparent',
    label: 'Documentation'
  }
};

// Category colors for badges
const categoryColors: Record<string, string> = {
  writing: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  coding: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  designing: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  analysis: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  research: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  communication: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  productivity: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
  learning: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  creative: 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20',
  business: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  data: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  marketing: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  development: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  testing: 'bg-red-500/10 text-red-400 border-red-500/20',
  debugging: 'bg-lime-500/10 text-lime-400 border-lime-500/20',
  documentation: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  planning: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  automation: 'bg-green-500/10 text-green-400 border-green-500/20',
  integration: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  security: 'bg-red-600/10 text-red-600 border-red-600/20'
};

export function EntryCard({ entry, className, showAIExplanation = true }: EntryCardProps) {
  const config = typeConfig[entry.type] || typeConfig.documentation;
  const Icon = config.icon;

  // Get purpose from metadata or AI explanation
  const purpose = entry.metadata?.purpose || 
                  entry.ai_explanation?.use_cases?.[0] || 
                  entry.ai_explanation?.summary ||
                  entry.original_content.slice(0, 150);
  
  const hasAIExplanation = entry.ai_explanation && showAIExplanation;
  
  // Get category from metadata
  const category = entry.metadata?.category as string | undefined;
  const categoryColor = category ? (categoryColors[category] || 'bg-muted text-muted-foreground') : null;

  return (
    <Link href={`/${entry.type}s/${entry.slug}`}>
      <Card className={cn(
        'group relative overflow-hidden transition-all duration-300',
        'hover:shadow-lg hover:border-primary/20',
        'cursor-pointer h-full',
        className
      )}>
        {/* Gradient Background */}
        <div className={cn(
          'absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity',
          config.bgGradient
        )} />

        <CardHeader className="relative pb-2">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <div className={cn('p-2 rounded-lg', config.color)}>
                <Icon className="h-4 w-4" />
              </div>
              <Badge variant="outline" className={cn('text-xs capitalize', config.color)}>
                {config.label}
              </Badge>
              {category && categoryColor && (
                <Badge variant="outline" className={cn('text-xs capitalize', categoryColor)}>
                  <Tag className="h-3 w-3 mr-1" />
                  {category}
                </Badge>
              )}
            </div>
            {hasAIExplanation && (
              <Badge variant="secondary" className="text-xs shrink-0">
                AI Explained
              </Badge>
            )}
          </div>
          <CardTitle className="text-lg mt-3 line-clamp-2 group-hover:text-primary transition-colors">
            {entry.title}
          </CardTitle>
        </CardHeader>

        <CardContent className="relative pt-0">
          {/* Purpose / What this skill is for */}
          <div className="mb-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
              What it&apos;s for
            </p>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {typeof purpose === 'string' ? purpose : String(purpose).slice(0, 150)}
              {typeof purpose === 'string' && purpose.length > 150 && '...'}
            </p>
          </div>

          {entry.tags && entry.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {entry.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {entry.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{entry.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
