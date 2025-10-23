import { useState } from "react";
import { Star, Send, Sparkles, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useFormSubmit } from "@/hooks/useFormSubmit";

interface ReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: any;
  clientProfileId: string;
  onSuccess: () => void;
}

export const ReviewDialog = ({ open, onOpenChange, appointment, clientProfileId, onSuccess }: ReviewDialogProps) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [reviewText, setReviewText] = useState("");

  const {
    handleSubmit: submitReview,
    isSubmitting: submitting,
  } = useFormSubmit(
    async () => {
      // Validation
      if (rating === 0) {
        throw new Error("Please select a rating");
      }
      if (reviewText.trim() && reviewText.length < 10) {
        throw new Error("Review must be at least 10 characters");
      }
      if (reviewText.length > 500) {
        throw new Error("Review must be less than 500 characters");
      }

      // Insert review
      const { data, error } = await supabase.from("reviews").insert({
        stylist_id: appointment.stylist_id,
        client_id: clientProfileId,
        appointment_id: appointment.id,
        rating,
        review_text: reviewText.trim() || null,
      }).select();

      if (error) throw error;

      // Trigger Zapier webhook (non-blocking)
      try {
        const { triggerReviewReceived } = await import("@/lib/zapierTriggers");
        await triggerReviewReceived(appointment.stylist_id, {
          review_id: data?.[0]?.id,
          rating,
          review_text: reviewText,
          appointment_id: appointment.id,
          client_id: clientProfileId,
        });
      } catch (error) {
        console.error("[Zapier] Failed to trigger review received webhook:", error);
      }

      // Reset form
      setRating(0);
      setReviewText("");
    },
    {
      successMessage: "Review submitted successfully! Thank you for your feedback!",
      errorMessage: "Failed to submit review",
      onSuccess: () => {
        onOpenChange(false);
        onSuccess();
      },
      onError: (error: any) => {
        if (error.code === '23505') {
          toast.error("You've already reviewed this appointment");
        }
      },
    }
  );

  const displayRating = hoveredRating || rating;
  const stylistName = appointment?.stylist?.user?.full_name || appointment?.stylist?.business_name;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg brutal-border brutal-shadow-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="h-5 w-5 text-primary" />
            How was your experience?
          </DialogTitle>
          <DialogDescription>
            Share your thoughts about your appointment with <span className="font-semibold">{stylistName}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Star Rating */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Your Rating</Label>
            <div className="flex items-center gap-2 justify-center py-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-all duration-200 hover:scale-125 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-full p-1"
                >
                  <Star
                    className={`h-10 w-10 transition-all duration-200 ${
                      star <= displayRating
                        ? "fill-amber-400 text-amber-400 drop-shadow-md"
                        : "text-muted-foreground/30 hover:text-muted-foreground/50"
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-center text-sm text-muted-foreground animate-fade-in">
                {rating === 5 && "⭐ Amazing! We're so glad you loved it!"}
                {rating === 4 && "😊 Great! Thanks for the positive feedback!"}
                {rating === 3 && "👍 Good! We appreciate your honesty!"}
                {rating === 2 && "🤔 Thanks for your feedback. We'll do better!"}
                {rating === 1 && "😔 We're sorry. Let us make it right!"}
              </p>
            )}
          </div>

          {/* Review Text */}
          <div className="space-y-3">
            <Label htmlFor="review-text" className="text-base font-semibold">
              Your Review <span className="text-muted-foreground font-normal text-sm">(Optional)</span>
            </Label>
            <Textarea
              id="review-text"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Share details about your experience... What did you love? Any suggestions?"
              rows={4}
              maxLength={500}
              className="resize-none"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>
                {reviewText.length > 0 && reviewText.length < 10 && "At least 10 characters"}
              </span>
              <span className={reviewText.length > 450 ? "text-warning" : ""}>
                {reviewText.length}/500
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={submitReview}
            disabled={submitting || rating === 0}
            className="flex-1 min-h-[44px]"
            aria-busy={submitting}
            aria-label={submitting ? "Submitting review" : "Submit review"}
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden="true" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Submit Review
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};