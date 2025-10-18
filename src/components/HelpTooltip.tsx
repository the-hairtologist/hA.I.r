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
  let displayContent = '';
  let shouldShow = true;
  
  if (typeof content === 'string') {
    // Generic content - show to everyone
    displayContent = content;
  } else {
    // Role-specific content - only show if relevant
    if (isClient && content.client) {
      displayContent = content.client;
    } else if (isStylist && content.stylist) {
      displayContent = content.stylist;
    } else {
      // No content for this role - don't show the tooltip at all
      shouldShow = false;
    }
  }
  
  // Don't render if there's no relevant content for this user
  if (!shouldShow || !displayContent) {
    return null;
  }
  
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center justify-center min-w-[44px] min-h-[44px] rounded-full bg-primary hover:bg-primary/90 transition-all brutal-border brutal-shadow-xs hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_hsl(var(--foreground))] touch-manipulation active:scale-95"
          aria-label="Help"
        >
          <HelpCircle className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent className="brutal-border brutal-shadow-lg max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-pixel text-2xl">{title}</AlertDialogTitle>
          <AlertDialogDescription className="font-sans text-base leading-relaxed space-y-4">
            <div className="text-foreground/90 whitespace-pre-wrap text-sm sm:text-base">{displayContent}</div>
            
            {examples && examples.length > 0 && (
              <div className="pt-3 border-t-2 border-foreground/10">
                <p className="font-semibold text-foreground mb-2 text-sm sm:text-base">💡 Examples:</p>
                <ul className="space-y-1.5 text-xs sm:text-sm text-foreground/80">
                  {examples.map((example, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-secondary">•</span>
                      <span>{example}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {tips && tips.length > 0 && (
              <div className="pt-3 border-t-2 border-foreground/10">
                <p className="font-semibold text-foreground mb-2 text-sm sm:text-base">✨ Tips:</p>
                <ul className="space-y-1.5 text-xs sm:text-sm text-foreground/80">
                  {tips.map((tip, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-secondary">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction className="brutal-border brutal-shadow-sm brutal-hover bg-primary text-primary-foreground hover:bg-primary/90">
            Got it!
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
