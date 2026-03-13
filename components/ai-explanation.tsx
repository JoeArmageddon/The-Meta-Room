'use client';

import { useState, useEffect } from 'react';
import { AIExplanation as AIExplanationType } from '@/app/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Sparkles, Lightbulb, Code, List, Wrench, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AIExplanationProps {
  entryId: string;
  content: string;
  title: string;
  type: string;
  existingExplanation?: AIExplanationType;
}

export function AIExplanationView({ 
  entryId, 
  content, 
  title, 
  type, 
  existingExplanation 
}: AIExplanationProps) {
  const [explanation, setExplanation] = useState<AIExplanationType | null>(existingExplanation || null);
  const [isLoading, setIsLoading] = useState(!existingExplanation);
  const [error, setError] = useState<string | null>(null);

  const generateExplanation = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entryId })
      });

      if (!response.ok) {
        throw new Error('Failed to generate explanation');
      }

      const data = await response.json();
      setExplanation(data.explanation);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate explanation');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!existingExplanation && entryId) {
      generateExplanation();
    }
  }, [entryId, existingExplanation]);

  if (isLoading) {
    return (
      <Card className="border-dashed border-primary/30 bg-primary/5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary animate-pulse" />
            <CardTitle className="text-base">Generating AI Explanation...</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive/30 bg-destructive/5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-destructive" />
            <CardTitle className="text-base">AI Explanation Failed</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <Button onClick={generateExplanation} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!explanation) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">AI Summary</CardTitle>
            </div>
            {explanation.model_used && (
              <Badge variant="outline" className="text-xs">
                {explanation.model_used}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed">{explanation.summary}</p>
        </CardContent>
      </Card>

      {/* Detailed Explanation */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium">Detailed Explanation</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {explanation.detailed_explanation}
          </p>
        </CardContent>
      </Card>

      {/* Use Cases */}
      {explanation.use_cases && explanation.use_cases.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <List className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-sm font-medium">When to Use</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {explanation.use_cases.map((useCase, index) => (
                <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  {useCase}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Examples */}
      {explanation.examples && explanation.examples.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Code className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-sm font-medium">Examples</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {explanation.examples.map((example, index) => (
              <div 
                key={index} 
                className="text-sm bg-muted p-3 rounded-md font-mono whitespace-pre-wrap"
              >
                {example}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Related Tools */}
      {explanation.related_tools && explanation.related_tools.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Wrench className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-sm font-medium">Related Tools & Concepts</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {explanation.related_tools.map((tool, index) => (
                <Badge key={index} variant="secondary">
                  {tool}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
