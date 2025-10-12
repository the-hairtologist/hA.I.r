/**
 * Quick Review Button for Appointments
 * Allows clients to quickly leave a review after an appointment
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface QuickReviewButtonProps {
  appointmentId: string;
  stylistId: string;
  hasReview?: boolean;
  className?: string;
}

export function QuickReviewButton({
  appointmentId,
  stylistId,
  hasReview,
  className,
}: QuickReviewButtonProps) {
  const navigate = useNavigate();

  const handleReview = () => {
    if (hasReview) {
      toast.info("You've already reviewed this appointment");
      return;
    }
    
    // Navigate to reviews page with pre-filled data
    navigate(`/reviews/new?appointment=${appointmentId}&stylist=${stylistId}`);
  };

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={handleReview}
      disabled={hasReview}
      className={className}
    >
      <Star className="h-4 w-4 mr-2" />
      {hasReview ? "Reviewed" : "Review"}
    </Button>
  );
}
