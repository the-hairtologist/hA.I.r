import { ReactNode } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Eye, EyeOff } from "lucide-react";
import { DashboardSection } from "@/hooks/useDashboardLayout";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface DraggableSectionProps {
  section: DashboardSection;
  isEditMode: boolean;
  onToggle: () => void;
  children: ReactNode;
  animationDelay?: string;
}

export function DraggableSection({
  section,
  isEditMode,
  onToggle,
  children,
  animationDelay,
}: DraggableSectionProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: section.id, 
    disabled: !isEditMode || !section.enabled 
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : section.enabled ? 1 : 0.5,
    animationDelay,
  };

  if (!section.enabled && !isEditMode) {
    return null;
  }

  return (
    <TooltipProvider>
      <div
        ref={setNodeRef}
        style={style}
        className={`animate-fade-in relative ${
          isEditMode ? "rounded-lg border-2 border-dashed border-primary/30 p-4 bg-muted/20" : ""
        }`}
      >
        {isEditMode && (
          <div className="absolute -top-3 left-3 z-10 flex items-center gap-1.5 bg-background border border-border rounded-md px-2 py-1 shadow-sm">
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  {...attributes}
                  {...listeners}
                  className="cursor-grab active:cursor-grabbing touch-none p-0.5 hover:bg-accent rounded transition-colors"
                  aria-label="Drag to reorder section"
                >
                  <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p className="text-xs">Drag to reorder</p>
              </TooltipContent>
            </Tooltip>
            
            <span className="text-xs font-medium text-foreground px-1">{section.title}</span>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggle}
                  className="h-5 w-5 p-0 hover:bg-accent"
                  aria-label={section.enabled ? "Hide section" : "Show section"}
                >
                  {section.enabled ? (
                    <Eye className="h-3 w-3 text-muted-foreground" />
                  ) : (
                    <EyeOff className="h-3 w-3 text-muted-foreground" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p className="text-xs">{section.enabled ? "Hide" : "Show"}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        )}
        <div className={isEditMode ? "mt-2" : ""}>
          {children}
        </div>
      </div>
    </TooltipProvider>
  );
}
