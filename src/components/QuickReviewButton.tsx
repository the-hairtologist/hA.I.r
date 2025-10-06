import { useState } from "react";
import { Star, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WriteReviewDialog } from "@/components/reviews/WriteReviewDialog";
import { cn } from "@/lib/utils";

interface QuickReviewButtonProps {
  appointmentId?: string;
  stylistId?: string;
  stylistName?: string;
  className?: string;
  onSuccess?: () => void;
}

export const QuickReviewButton = ({
  appointmentId,
  stylistId,
  stylistName,
  className,
  onSuccess,
}: QuickReviewButtonProps) => {
  const [open, setOpen] = useState(false);

  // Don't show button if required props are missing
  if (!appointmentId || !stylistId || !stylistName) {
    return null;
  }

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all z-40 group",
          "bg-amber-400 hover:bg-amber-500 text-foreground border-2 border-foreground",
          className
        )}
        size="icon"
        aria-label="Add review"
      >
        <div className="relative">
          <Star className="h-6 w-6 fill-current" />
          <Plus className="h-4 w-4 absolute -bottom-1 -right-1 bg-foreground text-amber-400 rounded-full p-0.5" />
        </div>
      </Button>

      <WriteReviewDialog
        open={open}
        onOpenChange={setOpen}
        appointmentId={appointmentId}
        stylistId={stylistId}
        stylistName={stylistName}
        onSuccess={onSuccess}
      />
    </>
  );
};
