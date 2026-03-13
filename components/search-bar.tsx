'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { SearchResult } from '@/app/types';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  className?: string;
  onSearch?: (query: string, results: SearchResult[]) => void;
  showResults?: boolean;
}

export function SearchBar({ className, onSearch, showResults = false }: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&limit=10`);
      if (response.ok) {
        const data = await response.json();
        setResults(data.results);
        onSearch?.(searchQuery, data.results);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [onSearch]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query) performSearch(query);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, performSearch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/explore?q=${encodeURIComponent(query)}`);
      setIsOpen(false);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    const path = `/${result.entry.type}s/${result.entry.slug}`;
    router.push(path);
    setIsOpen(false);
    setQuery('');
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'skill': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'agent': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'prompt': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'workflow': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className={cn('relative w-full max-w-2xl', className)}>
      <form onSubmit={handleSubmit} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search skills, agents, prompts..."
          className="pl-10 pr-20 h-11 bg-background/50 backdrop-blur-sm border-muted"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {query && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => {
                setQuery('');
                setResults([]);
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
          {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        </div>
      </form>

      {isOpen && (query || results.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50">
          <Command className="rounded-lg border shadow-lg bg-popover">
            <CommandList>
              {results.length === 0 && query && !isLoading && (
                <CommandEmpty>No results found for "{query}"</CommandEmpty>
              )}
              {results.length > 0 && (
                <CommandGroup heading={`Results for "${query}"`}>
                  {results.map((result) => (
                    <CommandItem
                      key={result.entry.id}
                      onSelect={() => handleResultClick(result)}
                      className="flex items-center justify-between py-3 cursor-pointer"
                    >
                      <div className="flex flex-col gap-1 min-w-0">
                        <span className="font-medium truncate">{result.entry.title}</span>
                        <span className="text-xs text-muted-foreground truncate">
                          {result.entry.original_content.slice(0, 100)}...
                        </span>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={cn('ml-2 shrink-0 capitalize', getTypeColor(result.entry.type))}
                      >
                        {result.entry.type}
                      </Badge>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
            {query && (
              <div className="border-t p-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-center"
                  onClick={handleSubmit}
                >
                  View all results for "{query}"
                </Button>
              </div>
            )}
          </Command>
        </div>
      )}
    </div>
  );
}
