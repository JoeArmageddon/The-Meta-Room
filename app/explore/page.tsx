'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Entry, SearchResult } from '@/app/types';
import { EntryCard } from '@/components/entry-card';
import { PromptBuilder } from '@/components/prompt-builder';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { SKILL_CATEGORIES } from '@/lib/parsers';
import { Search, X, LayoutGrid, List, Wand2, Filter, Tag } from 'lucide-react';

const CATEGORY_ICONS: Record<string, string> = {
  writing: '✍️',
  coding: '💻',
  designing: '🎨',
  analysis: '📊',
  research: '🔍',
  communication: '💬',
  productivity: '⚡',
  learning: '📚',
  creative: '✨',
  business: '💼',
  data: '📈',
  marketing: '📢',
  development: '🛠️',
  testing: '🧪',
  debugging: '🐛',
  documentation: '📄',
  planning: '📋',
  automation: '🤖',
  integration: '🔗',
  security: '🔒'
};

function ExploreContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialType = searchParams.get('type') || '';
  const initialCategory = searchParams.get('category') || '';

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [allEntries, setAllEntries] = useState<Entry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<string>(initialType || 'all');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showPromptBuilder, setShowPromptBuilder] = useState(false);
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);

  const performSearch = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.append('q', query);
      if (selectedType && selectedType !== 'all') params.append('type', selectedType);
      params.append('limit', '50');

      const response = await fetch(`/api/search?${params}`);
      if (response.ok) {
        const data = await response.json();
        setResults(data.results);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [query, selectedType]);

  const fetchAllEntries = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (selectedType && selectedType !== 'all') params.append('type', selectedType);
      params.append('limit', '100');

      const response = await fetch(`/api/entries?${params}`);
      if (response.ok) {
        const data = await response.json();
        setAllEntries(data.entries);
      }
    } catch (error) {
      console.error('Error fetching entries:', error);
    }
  }, [selectedType]);

  useEffect(() => {
    if (query) {
      performSearch();
    } else {
      fetchAllEntries();
    }
  }, [query, selectedType, performSearch, fetchAllEntries]);

  // Filter entries by category
  const filteredEntries = (query ? results.map(r => r.entry) : allEntries).filter(entry => {
    if (selectedCategory === 'all') return true;
    return entry.metadata?.category === selectedCategory;
  });

  const typeCounts = {
    all: allEntries.length,
    skill: allEntries.filter(e => e.type === 'skill').length,
    agent: allEntries.filter(e => e.type === 'agent').length,
    prompt: allEntries.filter(e => e.type === 'prompt').length,
    workflow: allEntries.filter(e => e.type === 'workflow').length,
    documentation: allEntries.filter(e => e.type === 'documentation').length,
  };

  // Count entries by category
  const categoryCounts = SKILL_CATEGORIES.reduce((acc, cat) => {
    acc[cat] = allEntries.filter(e => e.metadata?.category === cat).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Explore</h1>
        <p className="text-muted-foreground">
          Search and discover AI skills, agents, prompts, and workflows.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search entries..."
            className="pl-10"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7"
              onClick={() => setQuery('')}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            variant={showCategoryFilter ? 'secondary' : 'outline'}
            onClick={() => setShowCategoryFilter(!showCategoryFilter)}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            Categories
          </Button>

          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="icon"
            onClick={() => setViewMode('grid')}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            size="icon"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>

          <Button
            variant={showPromptBuilder ? 'secondary' : 'outline'}
            onClick={() => setShowPromptBuilder(!showPromptBuilder)}
            className="gap-2"
          >
            <Wand2 className="h-4 w-4" />
            Builder
          </Button>
        </div>
      </div>

      {/* Category Filter */}
      {showCategoryFilter && (
        <div className="mb-6 p-4 border rounded-lg bg-muted/30">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Filter by Category
            </h3>
            {selectedCategory !== 'all' && (
              <Button variant="ghost" size="sm" onClick={() => setSelectedCategory('all')}>
                Clear
              </Button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('all')}
            >
              All
            </Button>
            {SKILL_CATEGORIES.map((cat) => (
              categoryCounts[cat] > 0 && (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(cat)}
                  className="capitalize"
                >
                  <span className="mr-1">{CATEGORY_ICONS[cat] || '📌'}</span>
                  {cat}
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {categoryCounts[cat]}
                  </Badge>
                </Button>
              )
            ))}
          </div>
        </div>
      )}

      {/* Type Filter Tabs */}
      <Tabs value={selectedType} onValueChange={(value) => setSelectedType(value || 'all')} className="mb-6">
        <TabsList className="flex-wrap h-auto gap-2">
          <TabsTrigger value="all" className="gap-2">
            All
            <Badge variant="secondary" className="ml-1">{typeCounts.all}</Badge>
          </TabsTrigger>
          <TabsTrigger value="skill" className="gap-2">
            Skills
            <Badge variant="secondary" className="ml-1">{typeCounts.skill}</Badge>
          </TabsTrigger>
          <TabsTrigger value="agent" className="gap-2">
            Agents
            <Badge variant="secondary" className="ml-1">{typeCounts.agent}</Badge>
          </TabsTrigger>
          <TabsTrigger value="prompt" className="gap-2">
            Prompts
            <Badge variant="secondary" className="ml-1">{typeCounts.prompt}</Badge>
          </TabsTrigger>
          <TabsTrigger value="workflow" className="gap-2">
            Workflows
            <Badge variant="secondary" className="ml-1">{typeCounts.workflow}</Badge>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Prompt Builder */}
      {showPromptBuilder && (
        <div className="mb-8">
          <PromptBuilder availableEntries={allEntries} />
        </div>
      )}

      {/* Results */}
      {isLoading ? (
        <div className={viewMode === 'grid' ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      ) : filteredEntries.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-muted-foreground">No entries found.</p>
          {(query || selectedCategory !== 'all') && (
            <Button 
              variant="outline" 
              className="mt-4" 
              onClick={() => { setQuery(''); setSelectedCategory('all'); }}
            >
              Clear Filters
            </Button>
          )}
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}>
          {filteredEntries.map((entry) => (
            <EntryCard 
              key={entry.id} 
              entry={entry} 
              className={viewMode === 'list' ? 'flex flex-row items-center' : ''}
            />
          ))}
        </div>
      )}
    </>
  );
}

export default function ExplorePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96" />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        </div>
      }>
        <ExploreContent />
      </Suspense>
    </div>
  );
}
