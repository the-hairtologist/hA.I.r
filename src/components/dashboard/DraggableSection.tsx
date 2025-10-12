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
        isEditMode && "rounded-xl brutal-border brutal-shadow-md hover:brutal-shadow-lg bg-gradient-to-br from-background via-background to-primary/5"
      )}
    >
      {isEditMode && (
        <div className="absolute -top-3 left-2 right-2 z-10 flex items-center justify-between gap-2">
          {/* Left side - Drag handle */}
          <div className="flex items-center gap-2 bg-card brutal-border brutal-shadow-sm rounded-lg px-2 py-1.5">
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing touch-none p-1.5 rounded-md bg-gradient-to-br from-primary/20 to-accent/20 hover:from-primary/30 hover:to-accent/30 transition-all hover:scale-110 active:scale-95"
              aria-label="Drag to reorder"
            >
              <GripVertical className="h-4 w-4 text-primary" />
            </div>
            <span className="text-[11px] font-display font-bold text-foreground uppercase tracking-wider">
              {section.title}
            </span>
          </div>

          {/* Right side - Toggle visibility */}
          <button
            onClick={onToggle}
            className={cn(
              "brutal-border brutal-shadow-sm rounded-lg p-2 transition-all hover:brutal-shadow-md active:scale-95",
              section.enabled 
                ? "bg-gradient-to-br from-success/20 to-success/10 hover:from-success/30 hover:to-success/20" 
                : "bg-card hover:bg-muted"
            )}
            aria-label={section.enabled ? "Hide section" : "Show section"}
            title={section.enabled ? "Hide" : "Show"}
          >
            {section.enabled ? (
              <Eye className="h-4 w-4 text-success" />
            ) : (
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        </div>
      )}
      <div className={isEditMode ? "pt-5 px-3 pb-3" : ""}>
        {children}
      </div>
    </div>
  );
}
