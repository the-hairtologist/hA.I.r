import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface CollapsibleSectionProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const CollapsibleSection = ({
  title,
  defaultOpen = true,
  children,
  className,
}: CollapsibleSectionProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={cn("space-y-3", className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full group"
      >
        <h2 className="text-xl font-bold font-display">{title}</h2>
        <ChevronDown
          className={cn(
            "h-5 w-5 transition-transform duration-200 text-muted-foreground group-hover:text-foreground",
            isOpen ? "rotate-180" : ""
          )}
        />
      </button>
      <div
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out",
          isOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        {children}
      </div>
    </div>
  );
};
