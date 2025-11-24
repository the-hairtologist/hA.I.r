import { DashboardLayout } from '@/components/DashboardLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Copy,
  ExternalLink,
  Share2,
  QrCode,
  Eye,
  Facebook,
  Twitter,
  Mail,
  Instagram,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import QRCode from 'qrcode';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { sanitizeInput, rateLimiter, RATE_LIMITS } from '@/lib';
import { PageHeader } from '@/components/PageHeader';
import { logger } from '@/lib/logger';

const BookingPage = () => {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const [isPublic, setIsPublic] = useState(true);
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [bookingInstructions, setBookingInstructions] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [showQrDialog, setShowQrDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { data: stylistProfile } = useQuery({
    queryKey: ['stylist-profile', session?.user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('stylist_profiles')
        .select('*')
        .eq('user_id', session?.user?.id || '')
        .maybeSingle();
      return data;
    },
    enabled: !!session?.user?.id,
  });

  // Initialize form values when profile loads
  useEffect(() => {
    if (stylistProfile) {
      setIsPublic(stylistProfile.accepts_new_clients ?? true);
      setWelcomeMessage(stylistProfile.bio || '');
      setBookingInstructions(stylistProfile.parking_instructions || '');
    }
  }, [stylistProfile]);

  const bookingUrl = stylistProfile?.id
    ? `${window.location.origin}/stylist/${stylistProfile.id}/book`
    : '';

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(bookingUrl);
      toast.success('Link copied!', {
        icon: '✓',
        duration: 2000,
      });
      // Add haptic feedback if available
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }
    } catch (error) {
      toast.error('Failed to copy link');
    }
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
        logger.info('Share cancelled', 'BookingPage', { feature: 'share' });
      }
    } else {
      copyToClipboard();
    }
  };

  const shareOnFacebook = () => {
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(bookingUrl)}`;
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  const shareOnTwitter = () => {
    const text = encodeURIComponent(
      `Book your next hair appointment with me! 💇‍♀️`
    );
    const shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(bookingUrl)}&text=${text}`;
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent('Book Your Next Hair Appointment');
    const body = encodeURIComponent(
      `Hi,\n\nI'd love to help you with your hair! You can book an appointment with me using this link:\n\n${bookingUrl}\n\nLooking forward to seeing you!`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const copyInstagramLink = async () => {
    await copyToClipboard();
    toast.success('Link copied! Paste it in your Instagram bio or stories', {
      icon: '✓',
      duration: 4000,
    });
  };

  const generateQrCode = async () => {
    try {
      const qrDataUrl = await QRCode.toDataURL(bookingUrl, {
        width: 512,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });
      setQrCodeUrl(qrDataUrl);
      setShowQrDialog(true);
    } catch (error) {
      logger.error('Error generating QR code', 'BookingPage', error as Error);
      toast.error('Failed to generate QR code');
    }
  };

  const downloadQrCode = () => {
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = 'booking-qr-code.png';
    link.click();
  };

  const saveSettings = async () => {
    if (!stylistProfile?.id) return;

    // Rate limiting
    if (!rateLimiter.isAllowed('booking-settings', RATE_LIMITS.FORM)) {
      toast.error('Too many requests. Please wait a moment.');
      return;
    }

    setIsSaving(true);
    try {
      // Sanitize inputs
      const sanitizedData = {
        accepts_new_clients: isPublic,
        bio: sanitizeInput(welcomeMessage),
        parking_instructions: sanitizeInput(bookingInstructions),
      };

      const { error } = await supabase
        .from('stylist_profiles')
        .update(sanitizedData)
        .eq('id', stylistProfile.id);

      if (error) throw error;

      toast.success('Perfect. Your settings are locked in.');
      queryClient.invalidateQueries({ queryKey: ['stylist-profile'] });
    } catch (error) {
      logger.error('Error saving settings', 'BookingPage', error as Error);
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="My Booking Page"
        icon={<Share2 className="h-6 w-6" />}
        backTo="/settings"
      />
      <div className="space-y-6 max-w-4xl px-4 py-6">

        {/* Booking Link Card */}
        <Card>
          <CardHeader>
            <CardTitle>Your Booking Link</CardTitle>
            <CardDescription>
              Share this link with clients to book appointments
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  value={bookingUrl}
                  readOnly
                  className="font-mono text-sm overflow-x-auto"
                  title={bookingUrl}
                />
                <Button
                  onClick={copyToClipboard}
                  variant="outline"
                  className="flex-shrink-0"
                  title="Copy link"
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  onClick={shareLink}
                  variant="outline"
                  className="flex-shrink-0"
                  title="Share link"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Click to copy or use the share button to send via text/email
              </p>
            </div>

            <div className="flex gap-2">
              <Button asChild variant="outline" className="flex-1">
                <a href={bookingUrl} target="_blank" rel="noopener noreferrer">
                  <Eye className="h-4 w-4 mr-2" />
                  Preview Page
                </a>
              </Button>
              <Button
                onClick={generateQrCode}
                variant="outline"
                className="flex-1"
              >
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
                value={welcomeMessage}
                onChange={e => setWelcomeMessage(e.target.value)}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label>Booking Instructions</Label>
              <Textarea
                placeholder="Please arrive 5 minutes early. Parking is available..."
                value={bookingInstructions}
                onChange={e => setBookingInstructions(e.target.value)}
                rows={3}
              />
            </div>

            <Button onClick={saveSettings} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Settings'}
            </Button>
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
              <Button
                onClick={shareOnFacebook}
                variant="outline"
                className="justify-start"
              >
                <Facebook className="h-4 w-4 mr-2" />
                Share on Facebook
              </Button>
              <Button
                onClick={copyInstagramLink}
                variant="outline"
                className="justify-start"
              >
                <Instagram className="h-4 w-4 mr-2" />
                Copy for Instagram
              </Button>
              <Button
                onClick={shareOnTwitter}
                variant="outline"
                className="justify-start"
              >
                <Twitter className="h-4 w-4 mr-2" />
                Share on Twitter
              </Button>
              <Button
                onClick={shareViaEmail}
                variant="outline"
                className="justify-start"
              >
                <Mail className="h-4 w-4 mr-2" />
                Email Link
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* QR Code Dialog */}
        <Dialog open={showQrDialog} onOpenChange={setShowQrDialog} modal={true}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Booking Page QR Code</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center space-y-4 py-4">
              {qrCodeUrl && (
                <>
                  <img
                    src={qrCodeUrl}
                    alt="QR Code"
                    className="w-64 h-64 border-4 border-primary rounded-lg"
                  />
                  <p className="text-sm text-muted-foreground text-center">
                    Clients can scan this QR code to book appointments
                  </p>
                  <Button onClick={downloadQrCode} className="w-full">
                    Download QR Code
                  </Button>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default BookingPage;
