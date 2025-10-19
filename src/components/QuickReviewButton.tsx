import { useState } from "react";
import { Star, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WriteReviewDialog } from "@/components/reviews/WriteReviewDialog";
import { cn } from "@/lib/utils";

interface QuickReviewButtonProps {
  appointmentId: string;
  stylistId: string;
  stylistName?: string;
  hasReview?: boolean;
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
  const [isMinimized, setIsMinimized] = useState(false);

  // Don't show button if required props are missing
  if (!appointmentId || !stylistId || !stylistName) {
    return null;
  }

  // Hide the button when dialog is open to avoid blocking
  if (open) {
    return (
      <WriteReviewDialog
        open={open}
        onOpenChange={setOpen}
        appointmentId={appointmentId}
        stylistId={stylistId}
        stylistName={stylistName}
        onSuccess={onSuccess}
      />
    );
  }

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className={cn(
          "fixed bottom-[88px] right-20 h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-all z-30 group touch-manipulation active:scale-95",
          "bg-amber-400 hover:bg-amber-500 text-foreground border-2 border-foreground",
          "hover:scale-110 active:scale-95",
          isMinimized && "opacity-50 hover:opacity-100",
          className
        )}
        size="icon"
        aria-label="Write a review"
        title="Write a review"
      >
        <div className="relative">
          <Star className="h-5 w-5 fill-current" />
          <Plus className="h-3 w-3 absolute -bottom-0.5 -right-0.5 bg-foreground text-amber-400 rounded-full p-0.5" />
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
