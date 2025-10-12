import { ReactNode } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Eye, EyeOff } from "lucide-react";
import { DashboardSection } from "@/hooks/useDashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
    <div
      ref={setNodeRef}
      style={style}
      className={`animate-fade-in relative ${
        isEditMode 
          ? "rounded-lg border-2 border-dashed border-primary/40 bg-accent/20 p-4 hover:border-primary/60 transition-all" 
          : ""
      }`}
    >
      {isEditMode && (
        <div className="absolute -top-4 left-4 z-10 flex items-center gap-2 bg-primary text-primary-foreground px-3 py-1.5 rounded-t-lg shadow-md">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  {...attributes}
                  {...listeners}
                  className="cursor-grab active:cursor-grabbing touch-none flex items-center gap-2 pr-2 border-r border-primary-foreground/30"
                >
                  <GripVertical className="h-4 w-4" />
                  <span className="text-xs font-semibold">{section.title}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p className="text-xs">Drag to reorder • Long-press on mobile</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggle}
                  className="h-7 w-7 p-0 hover:bg-primary-foreground/20"
                >
                  {section.enabled ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <EyeOff className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p className="text-xs">{section.enabled ? "Hide section" : "Show section"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}
      <div className={isEditMode ? "mt-2" : ""}>
        {children}
      </div>
    </div>
  );
}
