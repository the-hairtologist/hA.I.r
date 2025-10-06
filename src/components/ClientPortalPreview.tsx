import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Calendar, Clock, MapPin, ExternalLink, Share2 } from "lucide-react";
import { haptic } from "@/platform/haptics";
import { toast } from "sonner";

interface ClientPortalPreviewProps {
  stylistName: string;
  stylistBio?: string;
  stylistSpecialty?: string;
  stylistLocation?: string;
  stylistRating?: number;
  stylistReviews?: number;
  className?: string;
}

/**
 * Preview of what clients will see when booking
 * This is a preview component - full client portal is Phase 2
 */
export const ClientPortalPreview = ({
  stylistName,
  stylistBio,
  stylistSpecialty,
  stylistLocation,
  stylistRating,
  stylistReviews,
  className,
}: ClientPortalPreviewProps) => {
  const handleShare = async () => {
    haptic.tap();
    
    const shareData = {
      title: `Book with ${stylistName}`,
      text: `Check out ${stylistName}'s profile on hA.I.r`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.error("Share failed:", error);
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  const handleBooking = () => {
    haptic.tap();
    toast.info("Client booking portal coming soon!", {
      description: "Clients will be able to book directly from your profile link",
    });
  };

  return (
    <Card className={`${className} brutal-border bg-gradient-to-br from-primary/5 to-background`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Client View Preview
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          This is what clients will see when they visit your booking page
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stylist Profile */}
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <h3 className="text-2xl font-bold gradient-text">{stylistName}</h3>
              {stylistSpecialty && (
                <Badge variant="secondary" className="text-xs">
                  {stylistSpecialty}
                </Badge>
              )}
              {stylistRating && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-yellow-500">★</span>
                  <span className="font-semibold">{stylistRating.toFixed(1)}</span>
                  {stylistReviews && (
                    <span className="text-muted-foreground">
                      ({stylistReviews} reviews)
                    </span>
                  )}
                </div>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="gap-1"
            >
              <Share2 className="h-3 w-3" />
              Share
            </Button>
          </div>

          {stylistBio && (
            <p className="text-sm text-muted-foreground">{stylistBio}</p>
          )}

          {stylistLocation && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              {stylistLocation}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={handleBooking}
            className="gap-2"
          >
            <Calendar className="h-4 w-4" />
            Book Now
          </Button>
          <Button
            variant="outline"
            onClick={() => toast.info("View availability coming soon!")}
            className="gap-2"
          >
            <Clock className="h-4 w-4" />
            View Hours
          </Button>
        </div>

        {/* Coming Soon Features */}
        <div className="p-4 bg-success/10 rounded-lg brutal-border border-success/20">
          <p className="text-xs font-semibold text-success-foreground mb-2">
            🚀 Coming Soon in Phase 2:
          </p>
          <ul className="text-xs text-success-foreground/80 space-y-1">
            <li>• Public booking page at hair.app/your-name</li>
            <li>• Clients can book without your help</li>
            <li>• Automatic account creation for clients</li>
            <li>• Portfolio gallery of your work</li>
            <li>• Real-time availability calendar</li>
            <li>• Instant booking confirmations</li>
          </ul>
        </div>

        {/* CTA */}
        <div className="text-center pt-2">
          <Button
            variant="link"
            className="gap-1 text-primary"
            onClick={() => {
              window.open("https://docs.lovable.dev", "_blank");
            }}
          >
            Learn more about client portals
            <ExternalLink className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
