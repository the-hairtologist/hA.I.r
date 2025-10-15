/**
 * Sidebar Search Component
 * Quick search within sidebar for admin users
 */

import { useState, useMemo } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface SidebarSearchProps {
  items: any[];
  collapsed: boolean;
}

export function SidebarSearch({ items, collapsed }: SidebarSearchProps) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  // Flatten items with children
  const allItems = useMemo(() => {
    const flattened: any[] = [];
    items.forEach(item => {
      flattened.push(item);
      if (item.children) {
        flattened.push(...item.children);
      }
    });
    return flattened;
  }, [items]);

  // Filter items based on search
  const filteredItems = useMemo(() => {
    if (!search) return [];
    
    const searchLower = search.toLowerCase();
    return allItems.filter(item => 
      item.title.toLowerCase().includes(searchLower) ||
      item.description?.toLowerCase().includes(searchLower)
    );
  }, [search, allItems]);

  const handleSelect = (url: string) => {
    navigate(url);
    setSearch("");
    setIsExpanded(false);
  };

  const handleClear = () => {
    setSearch("");
    setIsExpanded(false);
  };

  if (collapsed) return null;

  return (
    <div className="px-3 py-2 border-b">
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setIsExpanded(true);
          }}
          onFocus={() => setIsExpanded(true)}
          placeholder="Search navigation..."
          className="pl-8 pr-8 h-9"
        />
        {search && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-0 top-0 h-9 w-9 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Search Results */}
      {isExpanded && search && (
        <div className="absolute left-0 right-0 top-full mt-1 mx-3 z-50">
          <div className="bg-background border rounded-lg shadow-lg overflow-hidden">
            {filteredItems.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No results found
              </div>
            ) : (
              <ScrollArea className="max-h-[300px]">
                <div className="p-1">
                  {filteredItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleSelect(item.url)}
                        disabled={item.comingSoon}
                        className={cn(
                          "w-full flex items-center gap-2 px-2 py-2 rounded-md transition-colors text-left",
                          "hover:bg-muted",
                          item.comingSoon && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        <div className={cn("flex-shrink-0", item.color)}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                            <span className="text-sm font-medium truncate">
                              {item.title}
                            </span>
                            {item.comingSoon && (
                              <span className="text-[9px] px-1 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                                SOON
                              </span>
                            )}
                          </div>
                          {item.description && (
                            <p className="text-xs text-muted-foreground truncate">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
