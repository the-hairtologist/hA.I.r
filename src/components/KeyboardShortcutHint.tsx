import { cn } from "@/lib/utils";

interface KeyboardShortcutHintProps {
  keys: string[];
  action: string;
  className?: string;
}

/**
 * Visual hint for keyboard shortcuts
 * Shows keyboard key combinations with description
 */
export const KeyboardShortcutHint = ({ 
  keys, 
  action, 
  className 
}: KeyboardShortcutHintProps) => {
  return (
    <div 
      className={cn(
        "inline-flex items-center gap-2 text-xs text-muted-foreground",
        className
      )}
      aria-label={`Keyboard shortcut: ${keys.join(' + ')} for ${action}`}
    >
      <span className="hidden sm:inline">{action}:</span>
      <div className="flex items-center gap-1">
        {keys.map((key, index) => (
          <span key={index} className="inline-flex items-center gap-1">
            <kbd className="inline-flex items-center justify-center px-2 py-1 text-xs font-semibold bg-muted text-muted-foreground rounded border border-border shadow-sm min-w-[24px]">
              {key}
            </kbd>
            {index < keys.length - 1 && (
              <span className="text-muted-foreground/50">+</span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
};