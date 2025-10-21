/**
 * Memoized Formula Card Component
 * Optimized for list rendering performance
 */

import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Palette, Calendar, Tag } from "lucide-react";
import { format } from "date-fns";

interface FormulaCardProps {
  formula: {
    id: string;
    formula_name: string;
    formula_notes?: string;
    color_result?: string;
    tags?: string[];
    created_at: string;
    client?: {
      full_name: string;
    };
  };
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

const FormulaCardComponent = ({ formula, onClick, onEdit, onDelete }: FormulaCardProps) => {
  // Memoize formatted date
  const createdDate = useMemo(
    () => format(new Date(formula.created_at), "MMM d, yyyy"),
    [formula.created_at]
  );

  // Memoize color swatches rendering
  const colorSwatches = useMemo(() => {
    if (!formula.color_result) return null;
    
    return (
      <div className="flex gap-2 flex-wrap">
        <div
          className="h-8 w-8 rounded-full border-2 border-foreground"
          style={{ backgroundColor: formula.color_result }}
          title={formula.color_result}
        />
      </div>
    );
  }, [formula.color_result]);

  // Memoize tags rendering
  const tagElements = useMemo(() => {
    if (!formula.tags || formula.tags.length === 0) return null;

    return (
      <div className="flex gap-1 flex-wrap">
        {formula.tags.slice(0, 3).map((tag, index) => (
          <Badge key={index} variant="outline" className="text-xs">
            {tag}
          </Badge>
        ))}
        {formula.tags.length > 3 && (
          <Badge variant="outline" className="text-xs">
            +{formula.tags.length - 3}
          </Badge>
        )}
      </div>
    );
  }, [formula.tags]);

  return (
    <Card
      className="brutal-border hover:shadow-brutal-lg transition-all cursor-pointer"
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Palette className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{formula.formula_name}</CardTitle>
              {formula.client && (
                <p className="text-sm text-muted-foreground">
                  {formula.client.full_name}
                </p>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {formula.formula_notes && (
          <p className="text-sm line-clamp-2">{formula.formula_notes}</p>
        )}
        
        {colorSwatches}
        
        {tagElements && (
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-muted-foreground" />
            {tagElements}
          </div>
        )}
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{createdDate}</span>
        </div>

        {(onEdit || onDelete) && (
          <div className="flex gap-2 mt-4">
            {onEdit && (
              <Button size="sm" variant="outline" onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}>
                Edit
              </Button>
            )}
            {onDelete && (
              <Button size="sm" variant="destructive" onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}>
                Delete
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Memoize the component with custom comparison
export const FormulaCard = React.memo(FormulaCardComponent, (prevProps, nextProps) => {
  return (
    prevProps.formula.id === nextProps.formula.id &&
    prevProps.formula.formula_name === nextProps.formula.formula_name &&
    prevProps.formula.formula_notes === nextProps.formula.formula_notes &&
    prevProps.formula.color_result === nextProps.formula.color_result &&
    JSON.stringify(prevProps.formula.tags) === JSON.stringify(nextProps.formula.tags) &&
    prevProps.formula.created_at === nextProps.formula.created_at
  );
});

FormulaCard.displayName = "FormulaCard";
