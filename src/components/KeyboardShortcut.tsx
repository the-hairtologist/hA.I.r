import { Badge } from "@/components/ui/badge";

interface KeyboardShortcutProps {
  keys: string[];
  action: string;
}

export const KeyboardShortcut = ({ keys, action }: KeyboardShortcutProps) => {
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <span>{action}</span>
      <div className="flex gap-1">
        {keys.map((key) => (
          <Badge key={key} variant="outline" className="px-1.5 py-0.5 text-xs font-mono">
            {key}
          </Badge>
        ))}
      </div>
    </div>
  );
};

export const KeyboardShortcutHint = ({ shortcut, description }: { shortcut: string; description: string }) => {
  return (
    <div className="text-xs text-muted-foreground flex items-center gap-2">
      <kbd className="px-2 py-1 bg-muted rounded text-xs border">{shortcut}</kbd>
      <span>{description}</span>
    </div>
  );
};
