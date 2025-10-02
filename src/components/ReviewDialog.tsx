import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Star, Loader2 } from "lucide-react";

interface ReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: any;
  clientProfileId: string;
  onSuccess: () => void;
}

export const ReviewDialog = ({ open, onOpenChange, appointment, clientProfileId, onSuccess }: ReviewDialogProps) => {
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from("reviews")
        .insert({
          stylist_id: appointment.stylist_id,
          client_id: clientProfileId,
          appointment_id: appointment.id,
          rating,
          review_text: reviewText.trim() || null,
        });

      if (error) throw error;

      toast.success("Thank you for your review!");
      onSuccess();
      onOpenChange(false);
      setRating(0);
      setReviewText("");
    } catch (error: any) {
      console.error("Error submitting review:", error);
      if (error.code === '23505') {
        toast.error("You've already reviewed this appointment");
      } else {
        toast.error("Error submitting review");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rate Your Experience</DialogTitle>
          <DialogDescription>
            How was your appointment with {appointment?.stylist?.user?.full_name || appointment?.stylist?.business_name}?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Rating</Label>
            <div className="flex gap-2 justify-center py-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="transition-all hover:scale-110"
                >
                  <Star
                    className={`h-10 w-10 ${
                      star <= rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="review-text">Review (Optional)</Label>
            <Textarea
              id="review-text"
              placeholder="Share your experience..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground">
              {reviewText.length}/500 characters
            </p>
          </div>

          <Button onClick={handleSubmit} disabled={submitting || rating === 0} className="w-full">
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Review"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};