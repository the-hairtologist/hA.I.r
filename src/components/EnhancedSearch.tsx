/**
 * Enhanced Search Component with Recent Searches, Highlighting, and Better UX
 */

import { useState, useEffect, useRef } from 'react';
import { Search, X, Clock, TrendingUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { logger } from '@/lib/logging/productionLogger';

interface EnhancedSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  storageKey?: string; // Key for localStorage to persist recent searches
  showRecentSearches?: boolean;
  maxRecentSearches?: number;
  className?: string;
  onSearch?: (query: string) => void; // Optional callback when search is submitted
}

export const EnhancedSearch = ({
  value,
  onChange,
  placeholder = 'Search...',
  storageKey = 'recent_searches',
  showRecentSearches = true,
  maxRecentSearches = 5,
  className,
  onSearch,
}: EnhancedSearchProps) => {
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showRecent, setShowRecent] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    if (!showRecentSearches) return;

    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch (error) {
      logger.error('Error loading recent searches', error, { component: 'EnhancedSearch' });
    }
  }, [storageKey, showRecentSearches]);

  // Save to recent searches
  const saveToRecentSearches = (query: string) => {
    if (!showRecentSearches || !query.trim()) return;

    const trimmedQuery = query.trim().toLowerCase();

    // Remove if already exists and add to front
    const updated = [
      trimmedQuery,
      ...recentSearches.filter(s => s !== trimmedQuery),
    ].slice(0, maxRecentSearches);

    setRecentSearches(updated);

    try {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch (error) {
      logger.error('Error saving recent searches', error, { component: 'EnhancedSearch' });
    }
  };

  const handleSearchSubmit = () => {
    if (value.trim()) {
      saveToRecentSearches(value);
      onSearch?.(value);
      setShowRecent(false);
    }
  };

  const handleRecentSearchClick = (search: string) => {
    onChange(search);
    saveToRecentSearches(search);
    onSearch?.(search);
    setShowRecent(false);
    inputRef.current?.focus();
  };

  const clearRecentSearch = (search: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = recentSearches.filter(s => s !== search);
    setRecentSearches(updated);

    try {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch (error) {
      logger.error('Error clearing recent search', error, { component: 'EnhancedSearch' });
    }
  };

  const clearAllRecentSearches = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem(storageKey);
    } catch (error) {
      logger.error('Error clearing all recent searches', error, { component: 'EnhancedSearch' });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearchSubmit();
    } else if (e.key === 'Escape') {
      setShowRecent(false);
      inputRef.current?.blur();
    }
  };

  const shouldShowRecent =
    showRecentSearches &&
    recentSearches.length > 0 &&
    (isFocused || showRecent);

  return (
    <div className={cn('relative', className)}>
      <Popover open={shouldShowRecent} onOpenChange={setShowRecent}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              placeholder={placeholder}
              value={value}
              onChange={e => onChange(e.target.value)}
              onFocus={() => {
                setIsFocused(true);
                if (recentSearches.length > 0) {
                  setShowRecent(true);
                }
              }}
              onBlur={() => {
                setIsFocused(false);
                // Delay to allow clicking on recent searches
                setTimeout(() => setShowRecent(false), 200);
              }}
              onKeyDown={handleKeyDown}
              className="pl-10 pr-10"
            />
            {value && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                onClick={() => {
                  onChange('');
                  inputRef.current?.focus();
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </PopoverTrigger>

        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] p-2"
          align="start"
          onOpenAutoFocus={e => e.preventDefault()}
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between px-2 py-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>Recent Searches</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllRecentSearches}
                className="h-auto py-0 px-2 text-xs text-muted-foreground hover:text-foreground"
              >
                Clear all
              </Button>
            </div>

            <div className="space-y-1">
              {recentSearches.map(search => (
                <div
                  key={search}
                  onClick={() => handleRecentSearchClick(search)}
                  className="flex items-center justify-between px-3 py-2 hover:bg-secondary rounded-md cursor-pointer group transition-colors"
                >
                  <div className="flex items-center gap-2 flex-1">
                    <TrendingUp className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm">{search}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={e => clearRecentSearch(search, e)}
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

/**
 * Highlight matching text in search results
 */
interface HighlightedTextProps {
  text: string;
  query: string;
  className?: string;
}

export const HighlightedText = ({
  text,
  query,
  className,
}: HighlightedTextProps) => {
  if (!query.trim()) {
    return <span className={className}>{text}</span>;
  }

  const parts = text.split(new RegExp(`(${query})`, 'gi'));

  return (
    <span className={className}>
      {parts.map((part, index) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark
            key={`${part}-${index}`}
            className="bg-primary/20 text-foreground font-medium"
          >
            {part}
          </mark>
        ) : (
          <span key={`${part}-${index}`}>{part}</span>
        )
      )}
    </span>
  );
};

/**
 * Fuzzy search utility - checks if query matches text with tolerance for typos
 * Uses simple Levenshtein distance algorithm
 */
export const fuzzyMatch = (
  text: string,
  query: string,
  threshold: number = 2
): boolean => {
  const textLower = text.toLowerCase();
  const queryLower = query.toLowerCase();

  // Direct substring match
  if (textLower.includes(queryLower)) return true;

  // Split into words and check each
  const words = textLower.split(/\s+/);

  for (const word of words) {
    if (levenshteinDistance(word, queryLower) <= threshold) {
      return true;
    }
    // Check if query is a substring of the word
    if (word.includes(queryLower)) return true;
  }

  return false;
};

// Simple Levenshtein distance implementation
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    if (matrix[0]) {
      matrix[0][j] = j;
    }
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      const prevDiag = matrix[i - 1]?.[j - 1];
      const above = matrix[i - 1]?.[j];
      const left = matrix[i]?.[j - 1];
      
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        if (matrix[i] !== undefined && prevDiag !== undefined) {
          matrix[i][j] = prevDiag;
        }
      } else {
        if (matrix[i] !== undefined && prevDiag !== undefined && left !== undefined && above !== undefined) {
          matrix[i][j] = Math.min(
            prevDiag + 1,
            left + 1,
            above + 1
          );
        }
      }
    }
  }

  return matrix[b.length]?.[a.length] ?? 0;
}
