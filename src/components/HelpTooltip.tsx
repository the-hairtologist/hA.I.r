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

interface HelpTooltipProps {
  content: string;
  title?: string;
}

export const HelpTooltip = ({ content, title = "Help" }: HelpTooltipProps) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-secondary hover:bg-secondary/90 transition-all brutal-border brutal-shadow-xs brutal-hover"
          aria-label="Help"
        >
          <HelpCircle className="h-4 w-4 text-secondary-foreground" />
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent className="brutal-border brutal-shadow-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-display text-xl">{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-base leading-relaxed whitespace-pre-wrap">
            {content}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction className="brutal-border brutal-shadow-sm brutal-hover bg-secondary text-secondary-foreground">
            Got it!
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
