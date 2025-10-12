import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, ExternalLink, Share2, QrCode, Eye } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

const BookingPage = () => {
  const { session } = useAuth();
  const [isPublic, setIsPublic] = useState(true);

  const { data: stylistProfile } = useQuery({
    queryKey: ['stylist-profile', session?.user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('stylist_profiles')
        .select('*')
        .eq('user_id', session?.user?.id)
        .single();
      return data;
    },
    enabled: !!session?.user?.id,
  });

  const bookingUrl = stylistProfile?.id 
    ? `${window.location.origin}/stylist/${stylistProfile.id}/book`
    : "";

  const copyToClipboard = () => {
    navigator.clipboard.writeText(bookingUrl);
    toast.success("Booking link copied!");
  };

  const shareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Book an appointment with me',
          text: 'Schedule your next hair appointment',
          url: bookingUrl,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      copyToClipboard();
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-3xl font-display font-bold">My Booking Page</h1>
          <p className="text-muted-foreground">Share your booking link with clients</p>
        </div>

        {/* Booking Link Card */}
        <Card>
          <CardHeader>
            <CardTitle>Your Booking Link</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={bookingUrl}
                readOnly
                className="font-mono text-sm overflow-x-auto"
              />
              <Button onClick={copyToClipboard} variant="outline" className="flex-shrink-0">
                <Copy className="h-4 w-4" />
              </Button>
              <Button onClick={shareLink} variant="outline" className="flex-shrink-0">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex gap-2">
              <Button asChild variant="outline" className="flex-1">
                <a href={bookingUrl} target="_blank" rel="noopener noreferrer">
                  <Eye className="h-4 w-4 mr-2" />
                  Preview Page
                </a>
              </Button>
              <Button variant="outline" className="flex-1">
                <QrCode className="h-4 w-4 mr-2" />
                Generate QR Code
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Page Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Page Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label>Public Booking</Label>
                <p className="text-sm text-muted-foreground">
                  Allow anyone with the link to book appointments
                </p>
              </div>
              <Switch checked={isPublic} onCheckedChange={setIsPublic} />
            </div>

            <div className="space-y-2">
              <Label>Welcome Message</Label>
              <Textarea
                placeholder="Welcome! I'm excited to work with you..."
                defaultValue={stylistProfile?.bio || ""}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label>Booking Instructions</Label>
              <Textarea
                placeholder="Please arrive 5 minutes early. Parking is available..."
                rows={3}
              />
            </div>

            <Button>Save Settings</Button>
          </CardContent>
        </Card>

        {/* Quick Share */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Share</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground mb-4">
              Share your booking link on social media
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button variant="outline" className="justify-start">
                <ExternalLink className="h-4 w-4 mr-2" />
                Share on Facebook
              </Button>
              <Button variant="outline" className="justify-start">
                <ExternalLink className="h-4 w-4 mr-2" />
                Share on Instagram
              </Button>
              <Button variant="outline" className="justify-start">
                <ExternalLink className="h-4 w-4 mr-2" />
                Share on Twitter
              </Button>
              <Button variant="outline" className="justify-start">
                <ExternalLink className="h-4 w-4 mr-2" />
                Email Link
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default BookingPage;
