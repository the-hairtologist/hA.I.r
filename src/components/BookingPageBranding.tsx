import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, ExternalLink } from "lucide-react";

interface BookingPageBrandingProps {
  className?: string;
}

export const BookingPageBranding = ({ className = "" }: BookingPageBrandingProps) => {
  const handleLearnMore = () => {
    window.open("https://hair-ai.com", "_blank");
  };

  return (
    <Card className={`border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 ${className}`}>
      <CardContent className="p-6 space-y-4">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-on-surface-primary" />
          </div>
          <div className="flex-1 space-y-2">
            <h3 className="font-semibold text-lg">Powered by hA.I.r</h3>
            <p className="text-sm text-muted-foreground">
              Your stylist uses hA.I.r - the AI-powered salon assistant that creates professional color formulas instantly, manages appointments, and keeps your hair history organized.
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleLearnMore} variant="outline" size="sm" className="w-full">
            <ExternalLink className="h-4 w-4 mr-2" />
            Want Your Own AI Assistant?
          </Button>
        </div>

        <p className="text-xs text-center text-muted-foreground">
          Join thousands of stylists using AI to grow their business
        </p>
      </CardContent>
    </Card>
  );
};
