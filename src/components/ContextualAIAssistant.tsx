import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, X, Loader2, ChevronUp, ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

interface AISuggestion {
  action: string;
  reason: string;
  priority: "high" | "medium" | "low";
}

interface ContextualAIAssistantProps {
  userRole?: string;
  recentData?: any;
}

export const ContextualAIAssistant = ({ userRole, recentData }: ContextualAIAssistantProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => {
    const savedPosition = localStorage.getItem('ai-assistant-position');
    if (savedPosition) {
      try {
        setPosition(JSON.parse(savedPosition));
      } catch (e) {
        console.error('Failed to parse saved position:', e);
      }
    }
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isExpanded) return;
    setIsDragging(true);
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) {
      setDragStart({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isExpanded) return;
    setIsDragging(true);
    const touch = e.touches[0];
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) {
      setDragStart({
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      });
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const newX = Math.max(0, Math.min(e.clientX - dragStart.x, window.innerWidth - 80));
      const newY = Math.max(0, Math.min(e.clientY - dragStart.y, window.innerHeight - 80));
      setPosition({ x: newX, y: newY });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      const touch = e.touches[0];
      const newX = Math.max(0, Math.min(touch.clientX - dragStart.x, window.innerWidth - 80));
      const newY = Math.max(0, Math.min(touch.clientY - dragStart.y, window.innerHeight - 80));
      setPosition({ x: newX, y: newY });
    };

    const handleEnd = () => {
      if (isDragging) {
        setIsDragging(false);
        localStorage.setItem('ai-assistant-position', JSON.stringify(position));
      }
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleEnd);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, dragStart, position]);

  const fetchSuggestions = async () => {
    setLoading(true);
    try {
      const context = getContextFromRoute(location.pathname);
      
      const { data, error } = await supabase.functions.invoke('contextual-ai-suggestions', {
        body: { context, userRole, recentData }
      });

      if (error) throw error;
      
      if (data?.suggestions && data.suggestions.length > 0) {
        setSuggestions(data.suggestions);
        setIsVisible(true);
      }
    } catch (error) {
      console.error('Failed to fetch AI suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getContextFromRoute = (path: string): string => {
    const contexts: Record<string, string> = {
      '/dashboard': 'viewing dashboard overview',
      '/appointments': 'managing appointments',
      '/clients': 'managing clients',
      '/formulas': 'working with formulas',
      '/messages': 'viewing messages',
      '/services': 'managing services',
      '/schedule': 'managing schedule',
      '/portfolio': 'managing portfolio',
    };
    return contexts[path] || 'using the app';
  };

  useEffect(() => {
    // Fetch suggestions when route changes
    const timer = setTimeout(() => {
      fetchSuggestions();
    }, 2000); // Wait 2s after route change

    return () => clearTimeout(timer);
  }, [location.pathname]);

  if (!isVisible) return null;

  return (
    <div 
      ref={buttonRef}
      className={cn(
        "animate-fade-in",
        isDragging && "cursor-grabbing",
        position ? "fixed z-40" : "fixed bottom-24 md:bottom-6 right-24 z-40"
      )}
      style={position ? {
        left: `${position.x}px`,
        top: `${position.y}px`,
      } : undefined}
    >
      <Card className={cn(
        "transition-all duration-300",
        isExpanded ? "w-80 shadow-lg border bg-card" : "border-0 shadow-none bg-transparent"
      )}>
        <CardContent className="p-0">
          {/* Collapsed State */}
          {!isExpanded && (
            <Button
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
              onClick={(e) => {
                if (!isDragging) {
                  setIsExpanded(true);
                }
              }}
              className={cn(
                "w-14 h-14 rounded-full cursor-grab active:cursor-grabbing",
                "bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700",
                "shadow-lg hover:shadow-xl transition-all hover:scale-105 border-0",
                isDragging && "cursor-grabbing scale-105"
              )}
            >
              <Sparkles className="h-5 w-5 text-white animate-pulse" />
            </Button>
          )}

          {/* Expanded State */}
          {isExpanded && (
            <div className="p-4 space-y-3">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm font-display font-bold">AI Assist</span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsExpanded(false)}
                    className="h-7 w-7 p-0"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsVisible(false)}
                    className="h-7 w-7 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Suggestions */}
              {loading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              ) : (
                <div className="space-y-2">
                  {suggestions.map((suggestion, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "p-3 rounded-lg border-2 transition-all hover:translate-x-[2px] hover:translate-y-[2px] cursor-pointer",
                        suggestion.priority === "high" 
                          ? "border-primary/30 bg-primary/5 hover:border-primary/50"
                          : "border-border bg-background hover:border-primary/30"
                      )}
                    >
                      <p className="text-xs font-medium mb-1">{suggestion.action}</p>
                      <p className="text-[10px] text-muted-foreground">{suggestion.reason}</p>
                    </div>
                  ))}
                  
                  {/* Refresh Button */}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={fetchSuggestions}
                    className="w-full text-xs h-8 mt-2"
                  >
                    <Sparkles className="h-3 w-3 mr-1.5" />
                    Get New Suggestions
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};