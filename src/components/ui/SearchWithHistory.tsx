import { useState, useEffect } from 'react';
import { Search, Clock, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useSearchHistory } from '@/hooks/useSearchHistory';
import { cn } from '@/lib/utils';

interface SearchWithHistoryProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  suggestions?: string[];
  className?: string;
}

export const SearchWithHistory = ({
  value,
  onChange,
  placeholder = 'Search...',
  suggestions = [],
  className,
}: SearchWithHistoryProps) => {
  const { history, addToHistory, clearHistory } = useSearchHistory();
  const [showDropdown, setShowDropdown] = useState(false);
  const [focused, setFocused] = useState(false);

  const handleSelect = (query: string) => {
    onChange(query);
    addToHistory(query);
    setShowDropdown(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      addToHistory(value);
      setShowDropdown(false);
    }
  };

  const combinedItems = [
    ...history.map(h => ({ type: 'history' as const, value: h })),
    ...suggestions.map(s => ({ type: 'suggestion' as const, value: s })),
  ].slice(0, 5);

  return (
    <div className={cn('relative', className)}>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={value}
            onChange={e => onChange(e.target.value)}
            onFocus={() => {
              setFocused(true);
              setShowDropdown(true);
            }}
            onBlur={() => {
              setFocused(false);
              setTimeout(() => setShowDropdown(false), 200);
            }}
            placeholder={placeholder}
            className="pl-10 pr-10 min-h-[44px]"
          />
          {value && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
              onClick={() => onChange('')}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </form>

      {showDropdown && combinedItems.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-background border-2 border-border rounded-md shadow-lg z-50 max-h-60 overflow-auto">
          {combinedItems.map((item, idx) => (
            <button
              key={`${item.type}-${idx}`}
              className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2 transition-colors min-h-[44px]"
              onClick={() => handleSelect(item.value)}
            >
              {item.type === 'history' ? (
                <Clock className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Search className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="flex-1 truncate">{item.value}</span>
            </button>
          ))}

          {history.length > 0 && (
            <button
              className="w-full px-3 py-2 text-left text-xs text-muted-foreground hover:bg-muted border-t min-h-[44px]"
              onClick={clearHistory}
            >
              Clear history
            </button>
          )}
        </div>
      )}
    </div>
  );
};
