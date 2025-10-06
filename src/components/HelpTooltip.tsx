import { HelpCircle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogAction,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { useUserRole } from "@/hooks/useUserRole";
import { Badge } from "@/components/ui/badge";

interface RoleSpecificContent {
  client?: string;
  stylist?: string;
}

interface HelpTooltipProps {
  content: string | RoleSpecificContent;
  title?: string;
  examples?: string[];
  tips?: string[];
}

export const HelpTooltip = ({ content, title = "Help", examples, tips }: HelpTooltipProps) => {
  const { isStylist, isClient } = useUserRole();
  
  // Determine what content to show based on role
  const displayContent = typeof content === 'string' 
    ? content 
    : isClient && content.client
      ? content.client
      : isStylist && content.stylist
        ? content.stylist
        : content.stylist || content.client || '';
  
  const roleLabel = isClient ? 'For Clients' : isStylist ? 'For Stylists' : '';
  
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-purple-500 hover:bg-purple-600 transition-all brutal-border brutal-shadow-xs hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_hsl(var(--foreground))]"
          aria-label="Help"
        >
          <HelpCircle className="h-4 w-4 text-white" />
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent className="brutal-border brutal-shadow-lg max-w-lg">
        <AlertDialogHeader>
          <div className="flex items-center justify-between mb-2">
            <AlertDialogTitle className="font-display text-2xl">{title}</AlertDialogTitle>
            {typeof content !== 'string' && roleLabel && (
              <Badge className="bg-purple-500 text-white brutal-border brutal-shadow-xs">
                {roleLabel}
              </Badge>
            )}
          </div>
          <AlertDialogDescription className="text-base leading-relaxed whitespace-pre-wrap space-y-4">
            <div className="text-foreground/90">{displayContent}</div>
            
            {examples && examples.length > 0 && (
              <div className="pt-3 border-t-2 border-foreground/10">
                <p className="font-semibold text-foreground mb-2">💡 Examples:</p>
                <ul className="space-y-1 list-disc list-inside text-sm text-foreground/80">
                  {examples.map((example, i) => (
                    <li key={i}>{example}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {tips && tips.length > 0 && (
              <div className="pt-3 border-t-2 border-foreground/10">
                <p className="font-semibold text-foreground mb-2">✨ Pro Tips:</p>
                <ul className="space-y-1 list-disc list-inside text-sm text-foreground/80">
                  {tips.map((tip, i) => (
                    <li key={i}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction className="brutal-border brutal-shadow-sm brutal-hover bg-purple-500 text-white hover:bg-purple-600">
            Got it!
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
