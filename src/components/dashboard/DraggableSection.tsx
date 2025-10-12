import { ReactNode } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Eye, EyeOff } from "lucide-react";
import { DashboardSection } from "@/hooks/useDashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

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
      className="animate-fade-in relative"
    >
      {isEditMode && (
        <Card className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 px-3 py-1.5 flex items-center gap-2 shadow-lg border-2">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing touch-none"
          >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>
          <span className="text-xs font-medium">{section.title}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="h-6 w-6 p-0"
          >
            {section.enabled ? (
              <Eye className="h-3.5 w-3.5" />
            ) : (
              <EyeOff className="h-3.5 w-3.5" />
            )}
          </Button>
        </Card>
      )}
      <div className={isEditMode ? "pt-6" : ""}>
        {children}
      </div>
    </div>
  );
}
