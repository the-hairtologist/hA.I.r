import { useState } from "react";
import { Star, Send, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useFormSubmit } from "@/hooks/useFormSubmit";
import { reviewSchema, type ReviewInput } from "@/lib/validation";
import { StandardFormField } from "@/components/forms/StandardFormField";

interface ReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: any;
  clientProfileId: string;
  onSuccess: () => void;
}

export const ReviewDialog = ({
  open,
  onOpenChange,
  appointment,
  clientProfileId,
  onSuccess,
}: ReviewDialogProps) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);

  const appointmentId = appointment?.id;
  const stylistId = appointment?.stylist_id;
  const clientId = clientProfileId;

  const {
    values,
    errors,
    touched,
    isSubmitting,
    setFieldValue,
    setFieldTouched,
    handleSubmit,
    reset,
  } = useFormSubmit<ReviewInput>(
    async (data) => {
      const { error } = await supabase.from("reviews").insert({
        appointment_id: appointmentId,
        client_id: clientId,
        stylist_id: stylistId,
        rating: data.rating,
        review_text: data.review_text || null,
      });

      if (error) throw error;

      // Trigger Zapier webhook (non-blocking)
      try {
        const { triggerReviewReceived } = await import("@/lib/zapierTriggers");
        await triggerReviewReceived(stylistId, {
          review_id: appointmentId,
          rating: data.rating,
          review_text: data.review_text,
          appointment_id: appointmentId,
          client_id: clientId,
        });
      } catch (error) {
        console.error("[Zapier] Failed to trigger review received webhook:", error);
      }
    },
    {
      schema: reviewSchema,
      initialValues: {
        rating: 0,
        review_text: "",
        appointment_id: appointmentId,
      },
      successMessage: "Thank you for your review! ⭐",
      onSuccess: () => {
        reset();
        setRating(0);
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
            <Label className="text-base font-semibold">Your Rating *</Label>
            <div className="flex items-center gap-2 justify-center py-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => {
                    setRating(star);
                    setFieldValue("rating", star);
                  }}
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
            {touched.rating && errors.rating && (
              <p className="text-sm text-destructive text-center">{errors.rating}</p>
            )}
          </div>

          <StandardFormField
            name="review_text"
            label="Your Review"
            type="textarea"
            value={values.review_text || ""}
            onChange={(value) => setFieldValue("review_text", value)}
            onBlur={() => setFieldTouched("review_text")}
            error={errors.review_text}
            touched={touched.review_text}
            placeholder="Share details about your experience... What did you love? Any suggestions?"
            maxLength={500}
            rows={4}
            disabled={isSubmitting}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || rating === 0}
            className="flex-1 min-h-[44px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
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
