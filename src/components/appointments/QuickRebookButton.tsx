/**
 * Quick Rebook Button for Appointments
 * Allows clients to quickly rebook with the same stylist and service
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface QuickRebookButtonProps {
  appointmentId: string;
  stylistId: string;
  serviceId?: string;
  serviceType: string;
  className?: string;
}

export function QuickRebookButton({
  appointmentId,
  stylistId,
  serviceId,
  serviceType,
  className,
}: QuickRebookButtonProps) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleRebook = async () => {
    setIsLoading(true);
    try {
      // Navigate to booking page with pre-filled data
      const params = new URLSearchParams({
        stylist: stylistId,
        ...(serviceId && { service: serviceId }),
        ...(serviceType && { serviceType }),
      });
      
      navigate(`/book-appointment?${params.toString()}`);
      toast.success("Let's book your next appointment!");
    } catch (error) {
      console.error("Error rebooking:", error);
      toast.error("Failed to start rebooking");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      size="sm"
      variant="default"
      onClick={handleRebook}
      disabled={isLoading}
      className={className}
    >
      <Calendar className="h-4 w-4 mr-2" />
      {isLoading ? "Loading..." : "Rebook"}
    </Button>
  );
}
