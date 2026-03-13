'use client';

import Link from 'next/link';
import { Entry } from '@/app/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { FileText, Bot, Sparkles, Workflow, BookOpen } from 'lucide-react';

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

export function EntryCard({ entry, className, showAIExplanation = true }: EntryCardProps) {
  const config = typeConfig[entry.type] || typeConfig.documentation;
  const Icon = config.icon;

  const contentPreview = entry.original_content.slice(0, 150);
  const hasAIExplanation = entry.ai_explanation && showAIExplanation;

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
            <div className="flex items-center gap-2">
              <div className={cn('p-2 rounded-lg', config.color)}>
                <Icon className="h-4 w-4" />
              </div>
              <Badge variant="outline" className={cn('text-xs capitalize', config.color)}>
                {config.label}
              </Badge>
            </div>
            {hasAIExplanation && (
              <Badge variant="secondary" className="text-xs">
                AI Explained
              </Badge>
            )}
          </div>
          <CardTitle className="text-lg mt-3 line-clamp-2 group-hover:text-primary transition-colors">
            {entry.title}
          </CardTitle>
        </CardHeader>

        <CardContent className="relative pt-0">
          {hasAIExplanation ? (
            <p className="text-sm text-muted-foreground line-clamp-3">
              {entry.ai_explanation?.summary}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground line-clamp-3">
              {contentPreview}
              {entry.original_content.length > 150 && '...'}
            </p>
          )}

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
