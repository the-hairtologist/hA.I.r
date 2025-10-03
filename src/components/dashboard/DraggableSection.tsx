import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

interface DraggableSectionProps {
  id: string;
  children: React.ReactNode;
}

export const DraggableSection = ({ id, children }: DraggableSectionProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute -left-8 top-4 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity z-10"
      >
        <div className="w-6 h-6 rounded bg-secondary/20 hover:bg-secondary/40 flex items-center justify-center border-2 border-foreground shadow-[2px_2px_0px_0px_hsl(var(--foreground))]">
          <GripVertical className="h-4 w-4 text-secondary" />
        </div>
      </div>
      {children}
    </div>
  );
};
