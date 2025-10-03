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
          className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-secondary hover:bg-secondary/90 transition-all border-2 border-foreground shadow-[2px_2px_0px_0px_hsl(var(--foreground))] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
          aria-label="Help"
        >
          <HelpCircle className="h-4 w-4 text-secondary-foreground" />
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent className="border-[3px] border-foreground shadow-[6px_6px_0px_0px_hsl(var(--foreground))]">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-display text-xl">{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-base leading-relaxed whitespace-pre-wrap">
            {content}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction className="border-2 border-foreground shadow-[3px_3px_0px_0px_hsl(var(--foreground))] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] bg-secondary text-secondary-foreground">
            Got it!
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
