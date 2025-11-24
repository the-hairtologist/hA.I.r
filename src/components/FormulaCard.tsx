import { withMemo } from '@/lib/optimizations/withMemo';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Edit,
  Copy,
  Trash2,
  ThumbsUp,
  Clock,
  Beaker,
  Tag as TagIcon,
  AlertTriangle,
} from 'lucide-react';
import { HighlightedText } from '@/components/EnhancedSearch';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface FormulaCardProps {
  formula: any;
  searchTerm: string;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onToggleSelection?: (id: string) => void;
  isSelected?: boolean;
}

const FormulaCardComponent = ({
  formula,
  searchTerm,
  onEdit,
  onDuplicate,
  onDelete,
  onToggleSelection,
  isSelected,
}: FormulaCardProps) => {
  return (
    <Card className={isSelected ? 'border-primary' : ''}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1">
            {onToggleSelection && (
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onToggleSelection(formula.id)}
                className="h-4 w-4"
              />
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">
                  <HighlightedText
                    text={formula.client?.full_name || 'Unknown Client'}
                    query={searchTerm}
                  />
                </h3>
                {formula.color_line && (
                  <Badge variant="secondary">
                    <HighlightedText
                      text={formula.color_line}
                      query={searchTerm}
                    />
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {new Date(formula.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={onEdit}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onDuplicate}>
              <Copy className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Formula Text */}
          <div>
            <p className="text-sm font-medium mb-1">Formula:</p>
            <p className="text-sm">
              <HighlightedText
                text={formula.formula_text || 'No formula'}
                query={searchTerm}
              />
            </p>
          </div>

          {/* Processing Time */}
          {formula.processing_time_minutes && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{formula.processing_time_minutes} minutes</span>
            </div>
          )}

          {/* Developer Volume */}
          {formula.developer_volume && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Beaker className="h-4 w-4" />
              <span>{formula.developer_volume}</span>
            </div>
          )}

          {/* Tags */}
          {formula.tags && formula.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {formula.tags.map((tag: string) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  <TagIcon className="h-3 w-3 mr-1" />
                  <HighlightedText text={tag} query={searchTerm} />
                </Badge>
              ))}
            </div>
          )}

          {/* Expandable Details */}
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="details" className="border-0">
              <AccordionTrigger className="text-sm py-2">
                View Details
              </AccordionTrigger>
              <AccordionContent className="space-y-2">
                {formula.instructions && (
                  <div>
                    <p className="text-sm font-medium mb-1">Instructions:</p>
                    <p className="text-sm text-muted-foreground">
                      {formula.instructions}
                    </p>
                  </div>
                )}
                {formula.result_notes && (
                  <div>
                    <p className="text-sm font-medium mb-1">Result Notes:</p>
                    <p className="text-sm text-muted-foreground">
                      {formula.result_notes}
                    </p>
                  </div>
                )}
                {formula.what_worked && (
                  <div className="flex gap-2">
                    <ThumbsUp className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">What Worked:</p>
                      <p className="text-sm text-muted-foreground">
                        {formula.what_worked}
                      </p>
                    </div>
                  </div>
                )}
                {formula.what_to_avoid && (
                  <div className="flex gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">What to Avoid:</p>
                      <p className="text-sm text-muted-foreground">
                        {formula.what_to_avoid}
                      </p>
                    </div>
                  </div>
                )}
                {formula.application_notes && (
                  <div>
                    <p className="text-sm font-medium mb-1">
                      Application Notes:
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formula.application_notes}
                    </p>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </CardContent>
    </Card>
  );
};

export const FormulaCard = withMemo(FormulaCardComponent, [
  'formula.id',
  'formula.updated_at',
  'searchTerm',
]);
