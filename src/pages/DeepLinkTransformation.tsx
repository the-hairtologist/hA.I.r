/**
 * Deep Link: Transformation View
 * Shareable before/after transformation page
 * CRITICAL for viral growth - clients share their transformations
 */

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/PageHeader';
import {
  Sparkles,
  Share2,
  Calendar,
  ArrowRight,
  Instagram,
  Loader2,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import {
  shareDeepLink,
  generateTransformationShare,
  generateInstagramStoryMeta,
  generateDeepLink,
} from '@/lib/deepLinks';
import { enhancedAnalytics, ANALYTICS_EVENTS } from '@/lib/enhancedAnalytics';
import { OptimizedImage } from '@/components/OptimizedImage';
import { logger } from '@/lib/logger';

export default function DeepLinkTransformation() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [appointment, setAppointment] = useState<any>(null);

  useEffect(() => {
    if (id) {
      loadTransformation(id);
      enhancedAnalytics.track(ANALYTICS_EVENTS.TRANSFORMATION_SHARED, {
        appointmentId: id,
      });
    }
  }, [id]);

  const loadTransformation = async (appointmentId: string) => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(
          `
          *,
          stylist:stylist_profiles!appointments_stylist_id_fkey(
            business_name,
            location,
            user:profiles(full_name, avatar_url)
          ),
          hair_photos(before_image_url, after_image_url)
        `
        )
        .eq('id', appointmentId)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        toast.error('Transformation not found');
        navigate('/');
        return;
      }

      setAppointment(data);
    } catch (error) {
      logger.error('Error loading transformation', 'DeepLinkTransformation', error as Error);
      toast.error('Failed to load transformation');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!appointment || !id) return;

    const photo = appointment.hair_photos?.[0];
    const stylistName = appointment.stylist?.user?.full_name || 'My Stylist';

    const { link, title, text } = generateTransformationShare(
      id,
      photo?.before_image_url || '',
      photo?.after_image_url || '',
      stylistName
    );

    const success = await shareDeepLink(link, title, text);

    if (success) {
      toast.success('Link copied! Share on social media 💫');
      enhancedAnalytics.track('transformation_shared', {
        appointmentId: id,
        stylist: stylistName,
      });
    }
  };

  const handleInstagramShare = () => {
    if (!appointment || !id) return;

    const link = generateDeepLink({ type: 'transformation', id });
    const meta = generateInstagramStoryMeta(link);

    toast.info('Open Instagram and paste the link in your story!', {
      duration: 5000,
    });

    // Copy link for easy pasting
    navigator.clipboard.writeText(link);
    enhancedAnalytics.track('instagram_story_intent', { appointmentId: id });
  };

  const handleBookStylist = () => {
    if (appointment?.stylist_id) {
      navigate(`/book-appointment?stylist=${appointment.stylist_id}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!appointment) {
    return null;
  }

  const photo = appointment.hair_photos?.[0];
  const stylistName = appointment.stylist?.user?.full_name || 'Stylist';
  const hasPhotos = photo?.before_image_url && photo?.after_image_url;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <PageHeader title="Hair Transformation" backTo="/" />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center brutal-border brutal-shadow-md">
              <Sparkles className="h-10 w-10 text-on-surface-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold gradient-text mb-2">
            Amazing Transformation ✨
          </h1>
          <p className="text-lg text-muted-foreground">By {stylistName}</p>
          {appointment.stylist?.business_name && (
            <p className="text-sm text-muted-foreground">
              {appointment.stylist.business_name}
            </p>
          )}
        </div>

        {/* Before/After Photos */}
        {hasPhotos && (
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card className="brutal-border overflow-hidden">
              <CardHeader className="bg-muted/50 pb-3">
                <CardTitle className="text-center text-sm">Before</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <OptimizedImage
                  src={photo.before_image_url}
                  alt="Before"
                  width={600}
                  height={600}
                  className="w-full aspect-square object-cover"
                />
              </CardContent>
            </Card>

            <Card className="brutal-border overflow-hidden">
              <CardHeader className="bg-primary/10 pb-3">
                <CardTitle className="text-center text-sm text-primary">
                  After
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <OptimizedImage
                  src={photo.after_image_url}
                  alt="After"
                  width={600}
                  height={600}
                  className="w-full aspect-square object-cover"
                />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Details */}
        <Card className="brutal-border brutal-shadow-md mb-6">
          <CardHeader>
            <CardTitle>Appointment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Date</p>
                <p className="font-semibold">
                  {format(
                    new Date(appointment.appointment_date),
                    'MMMM d, yyyy'
                  )}
                </p>
              </div>
            </div>

            {appointment.service_type && (
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Service</p>
                  <p className="font-semibold capitalize">
                    {appointment.service_type}
                  </p>
                </div>
              </div>
            )}

            {appointment.notes && (
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-2">Notes</p>
                <p className="text-sm">{appointment.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* CTA Section */}
        <div className="space-y-3">
          <Button
            onClick={handleBookStylist}
            size="lg"
            className="w-full brutal-shadow-md"
          >
            Book with {stylistName}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>

          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={handleShare}
              variant="outline"
              size="lg"
              className="w-full"
            >
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>

            <Button
              onClick={handleInstagramShare}
              variant="outline"
              size="lg"
              className="w-full"
            >
              <Instagram className="mr-2 h-4 w-4" />
              Story
            </Button>
          </div>
        </div>

        {/* Powered by footer */}
        <div className="text-center mt-8 pt-8 border-t">
          <p className="text-sm text-muted-foreground">
            Powered by{' '}
            <span className="font-semibold text-primary">hA.I.r</span>
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            AI-powered salon management & booking
          </p>
          <Button
            variant="link"
            size="sm"
            onClick={() => navigate('/')}
            className="mt-2"
          >
            Learn More
          </Button>
        </div>
      </main>
    </div>
  );
}
