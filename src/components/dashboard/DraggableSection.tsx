import { ReactNode } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Eye, EyeOff } from "lucide-react";
import { DashboardSection } from "@/hooks/useDashboardLayout";
import { cn } from "@/lib/utils";

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
      className={cn(
        "animate-fade-in relative group transition-all",
        isEditMode && "rounded-lg border border-primary/10 hover:border-primary/20 shadow-sm hover:shadow-md"
      )}
    >
      {isEditMode && (
        <div className="absolute -top-2.5 left-2 right-2 z-10">
          {/* Single unified control bar - sleek & subtle */}
          <div className="flex items-center gap-2 bg-card/60 backdrop-blur-md border border-border/50 shadow-sm rounded-lg px-2.5 py-1">
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing touch-none p-1 rounded hover:bg-accent/50 transition-all hover:scale-105 active:scale-95"
              aria-label="Drag to reorder"
            >
              <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <span className="text-[11px] font-pixel font-black text-foreground uppercase tracking-wider flex-1">
              {section.title}
            </span>
            <button
              onClick={onToggle}
              className={cn(
                "p-1 rounded transition-all hover:scale-105 active:scale-95",
                section.enabled 
                  ? "hover:bg-accent/50" 
                  : "hover:bg-muted/50"
              )}
              aria-label={section.enabled ? "Hide section" : "Show section"}
              title={section.enabled ? "Click to hide this section" : "Click to show this section"}
            >
              {section.enabled ? (
                <Eye className="h-3.5 w-3.5 text-primary" />
              ) : (
                <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
              )}
            </button>
          </div>
        </div>
      )}
      <div className={isEditMode ? "pt-4 px-2 pb-2" : ""}>
        {children}
      </div>
    </div>
  );
}
