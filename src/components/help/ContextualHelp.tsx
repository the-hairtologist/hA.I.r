import { ReactNode, useState } from "react";
import { HelpCircle, X, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface ContextualHelpProps {
  title: string;
  content: ReactNode;
  videoUrl?: string;
  docsUrl?: string;
  position?: "inline" | "floating";
  className?: string;
}

export const ContextualHelp = ({
  title,
  content,
  videoUrl,
  docsUrl,
  position = "inline",
  className,
}: ContextualHelpProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-6 w-6 rounded-full",
            position === "floating" && "fixed bottom-20 right-6 h-12 w-12 brutal-shadow-sm z-40",
            className
          )}
          aria-label={`Help: ${title}`}
        >
          <HelpCircle className={cn(
            "text-muted-foreground hover:text-primary transition-colors",
            position === "floating" ? "h-6 w-6" : "h-4 w-4"
          )} />
        </Button>
      </DialogTrigger>
      <DialogContent className="brutal-border max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            {title}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            {content}
          </div>

          {videoUrl && (
            <div className="aspect-video rounded-lg overflow-hidden brutal-border">
              <iframe
                src={videoUrl}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}

          {docsUrl && (
            <Button
              variant="outline"
              className="w-full brutal-border"
              onClick={() => window.open(docsUrl, "_blank")}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View Documentation
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
