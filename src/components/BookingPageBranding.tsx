import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, ExternalLink } from "lucide-react";

interface BookingPageBrandingProps {
  className?: string;
}

export const BookingPageBranding = ({ className = "" }: BookingPageBrandingProps) => {
  return (
    <Card className={`border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 ${className}`}>
      <CardContent className="p-6 space-y-4">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-on-surface-primary" />
          </div>
          <div className="flex-1 space-y-2">
            <h3 className="font-semibold text-lg">Client Booking - Coming Soon!</h3>
            <p className="text-sm text-muted-foreground">
              We're building an amazing client booking experience. Soon your clients will be able to book appointments, make payments, and manage their hair journey—all in one place.
            </p>
          </div>
        </div>

        <p className="text-xs text-center text-muted-foreground">
          Stay tuned for updates ✨
        </p>
      </CardContent>
    </Card>
  );
};
