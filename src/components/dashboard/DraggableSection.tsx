import { ReactNode } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Eye, EyeOff } from "lucide-react";
import { DashboardSection } from "@/hooks/useDashboardLayout";
import { Button } from "@/components/ui/button";

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
      className={`animate-fade-in relative group ${
        isEditMode ? "rounded-lg border-2 border-dashed border-primary/20 hover:border-primary/40 transition-colors" : ""
      }`}
    >
      {isEditMode && (
        <div className="absolute -top-2.5 left-2 right-2 z-10 flex items-center justify-between">
          {/* Left side - Drag handle */}
          <div className="flex items-center gap-1 bg-background/95 backdrop-blur-sm border border-border rounded-md px-1.5 py-0.5 shadow-sm">
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing touch-none p-1 hover:bg-accent rounded transition-colors"
              aria-label="Drag to reorder"
            >
              <GripVertical className="h-3 w-3 text-muted-foreground" />
            </div>
            <span className="text-[10px] font-semibold text-foreground uppercase tracking-wide">
              {section.title}
            </span>
          </div>

          {/* Right side - Toggle visibility */}
          <button
            onClick={onToggle}
            className="bg-background/95 backdrop-blur-sm border border-border rounded-md p-1.5 hover:bg-accent transition-all shadow-sm active:scale-95"
            aria-label={section.enabled ? "Hide section" : "Show section"}
            title={section.enabled ? "Hide" : "Show"}
          >
            {section.enabled ? (
              <Eye className="h-3 w-3 text-green-600" />
            ) : (
              <EyeOff className="h-3 w-3 text-muted-foreground" />
            )}
          </button>
        </div>
      )}
      <div className={isEditMode ? "pt-4 px-2 pb-2" : ""}>
        {children}
      </div>
    </div>
  );
}
