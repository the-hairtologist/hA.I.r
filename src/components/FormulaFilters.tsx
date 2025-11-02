import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, SlidersHorizontal } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';

export interface FormulaFilters {
  clientId: string;
  colorLine: string;
  dateRange: string;
  sortBy: string;
  tags: string[];
}

interface FormulaFiltersProps {
  filters: FormulaFilters;
  onFiltersChange: (filters: FormulaFilters) => void;
  clients: Array<{ id: string; full_name: string }>;
  colorLines: string[];
  availableTags: string[];
}

export const FormulaFiltersComponent = ({
  filters,
  onFiltersChange,
  clients,
  colorLines,
  availableTags,
}: FormulaFiltersProps) => {
  const hasActiveFilters =
    filters.clientId ||
    filters.colorLine ||
    filters.dateRange !== 'all' ||
    filters.tags.length > 0;

  const handleReset = () => {
    onFiltersChange({
      clientId: '',
      colorLine: '',
      dateRange: 'all',
      sortBy: 'date-desc',
      tags: [],
    });
  };

  const toggleTag = (tag: string) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter(t => t !== tag)
      : [...filters.tags, tag];
    onFiltersChange({ ...filters, tags: newTags });
  };

  return (
    <div className="flex flex-wrap items-center gap-3 p-4 bg-card rounded-lg border-2 border-foreground/10">
      {/* Sort */}
      <div className="flex items-center gap-2">
        <Label htmlFor="sort" className="text-sm font-medium whitespace-nowrap">
          Sort:
        </Label>
        <Select
          value={filters.sortBy}
          onValueChange={value =>
            onFiltersChange({ ...filters, sortBy: value })
          }
        >
          <SelectTrigger id="sort" className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date-desc">Newest First</SelectItem>
            <SelectItem value="date-asc">Oldest First</SelectItem>
            <SelectItem value="client-asc">Client A-Z</SelectItem>
            <SelectItem value="client-desc">Client Z-A</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Filters Popover */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {hasActiveFilters && (
              <Badge
                variant="secondary"
                className="ml-1 h-5 w-5 p-0 flex items-center justify-center"
              >
                {
                  [
                    filters.clientId,
                    filters.colorLine,
                    filters.dateRange !== 'all',
                    filters.tags.length > 0,
                  ].filter(Boolean).length
                }
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="start">
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-3">Filter Formulas</h4>
            </div>

            {/* Client Filter */}
            <div className="space-y-2">
              <Label htmlFor="client-filter">Client</Label>
              <Select
                value={filters.clientId}
                onValueChange={value =>
                  onFiltersChange({ ...filters, clientId: value })
                }
              >
                <SelectTrigger id="client-filter">
                  <SelectValue placeholder="All clients" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All clients</SelectItem>
                  {clients.map(client => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Color Line Filter */}
            <div className="space-y-2">
              <Label htmlFor="color-line-filter">Color Line</Label>
              <Select
                value={filters.colorLine}
                onValueChange={value =>
                  onFiltersChange({ ...filters, colorLine: value })
                }
              >
                <SelectTrigger id="color-line-filter">
                  <SelectValue placeholder="All color lines" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All color lines</SelectItem>
                  {colorLines.map(line => (
                    <SelectItem key={line} value={line}>
                      {line}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Range Filter */}
            <div className="space-y-2">
              <Label htmlFor="date-range-filter">Date Range</Label>
              <Select
                value={filters.dateRange}
                onValueChange={value =>
                  onFiltersChange({ ...filters, dateRange: value })
                }
              >
                <SelectTrigger id="date-range-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All time</SelectItem>
                  <SelectItem value="week">Last 7 days</SelectItem>
                  <SelectItem value="month">Last 30 days</SelectItem>
                  <SelectItem value="quarter">Last 3 months</SelectItem>
                  <SelectItem value="year">Last year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tags Filter */}
            {availableTags.length > 0 && (
              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-2">
                  {availableTags.map(tag => (
                    <Badge
                      key={tag}
                      variant={
                        filters.tags.includes(tag) ? 'default' : 'outline'
                      }
                      className="cursor-pointer"
                      onClick={() => toggleTag(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {/* Active Filter Badges */}
      {hasActiveFilters && (
        <>
          {filters.clientId && (
            <Badge variant="secondary" className="gap-1">
              {clients.find(c => c.id === filters.clientId)?.full_name}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => onFiltersChange({ ...filters, clientId: '' })}
              />
            </Badge>
          )}
          {filters.colorLine && (
            <Badge variant="secondary" className="gap-1">
              {filters.colorLine}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => onFiltersChange({ ...filters, colorLine: '' })}
              />
            </Badge>
          )}
          {filters.dateRange !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              {filters.dateRange === 'week' && 'Last 7 days'}
              {filters.dateRange === 'month' && 'Last 30 days'}
              {filters.dateRange === 'quarter' && 'Last 3 months'}
              {filters.dateRange === 'year' && 'Last year'}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() =>
                  onFiltersChange({ ...filters, dateRange: 'all' })
                }
              />
            </Badge>
          )}
          {filters.tags.map(tag => (
            <Badge key={tag} variant="secondary" className="gap-1">
              {tag}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => toggleTag(tag)}
              />
            </Badge>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="h-7 text-xs"
          >
            Clear all
          </Button>
        </>
      )}
    </div>
  );
};
