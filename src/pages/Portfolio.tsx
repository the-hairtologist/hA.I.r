import { useState, useEffect, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  Upload,
  X,
  Image as ImageIcon,
  Loader2,
  ArrowUp,
  ArrowDown,
  Trash2,
  Sparkles,
} from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { Switch } from '@/components/ui/switch';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { PortfolioSkeleton } from '@/components/LoadingSkeleton';
import { PortfolioGridSkeleton } from '@/components/skeletons/PortfolioGridSkeleton';
import { useRealtimeUpdates } from '@/hooks/useRealtimeUpdates';
import { PortfolioInsights } from '@/components/PortfolioInsights';
import { CameraCapture } from '@/components/CameraCapture';
import { VoiceControl } from '@/components/VoiceControl';
import { offlineQueue } from '@/lib/offlineQueue';
import { OptimizedImage } from '@/components/OptimizedImage';
import { EmptyState } from '@/components/EmptyState';
import { networkErrors } from '@/lib/errorMessages';
import { logger } from '@/lib/logger';
import { cn } from '@/lib/utils';
import { mobileFirst, touchButton } from '@/lib/responsive/mobile-first-utils';
import { StandardFormField } from '@/components/forms/StandardFormField';
import { typography } from '@/lib/design/typography';
import { DataErrorBoundary } from '@/components/errors/DataErrorBoundary';
import { FormErrorBoundary } from '@/components/errors/FormErrorBoundary';

const BackgroundRemovalDialog = lazy(() =>
  import('@/components/BackgroundRemovalDialog').then(m => ({
    default: m.BackgroundRemovalDialog,
  }))
);

interface PortfolioPhoto {
  id: string;
  photo_url: string;
  caption: string | null;
  is_before_after: boolean;
  before_photo_url: string | null;
  display_order: number;
}

const Portfolio = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [photos, setPhotos] = useState<PortfolioPhoto[]>([]);
  const [stylistProfileId, setStylistProfileId] = useState<string>('');
  const [newPhoto, setNewPhoto] = useState<File | null>(null);
  const [newPhotoPreview, setNewPhotoPreview] = useState<string>('');
  const [caption, setCaption] = useState('');
  const [isBeforeAfter, setIsBeforeAfter] = useState(false);
  const [beforePhoto, setBeforePhoto] = useState<File | null>(null);
  const [beforePhotoPreview, setBeforePhotoPreview] = useState<string>('');
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({ open: false, title: '', description: '', onConfirm: () => {} });
  const [bgRemovalDialog, setBgRemovalDialog] = useState<{
    open: boolean;
    imageUrl: string;
  }>({ open: false, imageUrl: '' });

  useEffect(() => {
    checkUserAndLoadPhotos();
  }, []);

  const checkUserAndLoadPhotos = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }

      // Get stylist profile
      const { data: profile, error } = await supabase
        .from('stylist_profiles')
        .select('id')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (error) {
        logger.error('Error fetching stylist profile', 'Portfolio', error as Error);
        toast.error('Failed to load portfolio');
        navigate('/dashboard');
        return;
      }

      if (!profile) {
        toast.error('Stylist profile not found');
        navigate('/dashboard');
        return;
      }

      setStylistProfileId(profile.id);
      await loadPhotos(profile.id);
    } catch (error) {
      logger.error('Error loading portfolio', 'Portfolio', error as Error);
      toast.error('Failed to load portfolio');
    } finally {
      setLoading(false);
    }
  };

  const loadPhotos = async (profileId: string) => {
    const { data, error } = await supabase
      .from('portfolio_photos')
      .select('*')
      .eq('stylist_id', profileId)
      .order('display_order');

    if (error) {
      logger.error('Error loading photos', 'Portfolio', error as Error);
      toast.error('Failed to load photos');
    } else {
      setPhotos(data as any || []);
    }
  };

  // Real-time updates
  useRealtimeUpdates(
    'portfolio_photos',
    () => loadPhotos(stylistProfileId),
    stylistProfileId
  );

  const handleFileSelect = async (
    imageUrl: string,
    isBefore: boolean = false
  ) => {
    if (isBefore) {
      setBeforePhotoPreview(imageUrl);
    } else {
      setNewPhotoPreview(imageUrl);
    }
  };

  const uploadPhoto = async (file: File, path: string): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${path}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('hair-photos')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const {
      data: { publicUrl },
    } = supabase.storage.from('hair-photos').getPublicUrl(filePath);

    return publicUrl;
  };

  const handleUpload = async () => {
    if (!newPhotoPreview) {
      toast.error('Please capture a photo');
      return;
    }

    if (isBeforeAfter && !beforePhotoPreview) {
      toast.error('Please capture a before photo');
      return;
    }

    setUploading(true);
    try {
      // Convert data URLs to blobs
      const afterBlob = await (await fetch(newPhotoPreview)).blob();
      const afterUrl = await uploadPhoto(afterBlob as any, 'portfolio');
      let beforeUrl = null;

      if (isBeforeAfter && beforePhotoPreview) {
        const beforeBlob = await (await fetch(beforePhotoPreview)).blob();
        beforeUrl = await uploadPhoto(beforeBlob as any, 'portfolio');
      }

      if (!navigator.onLine) {
        // Queue for later if offline
        offlineQueue.enqueue({
          type: 'insert',
          table: 'portfolio_photos',
          data: {
            stylist_id: stylistProfileId,
            photo_url: afterUrl,
            caption: caption || null,
            is_before_after: isBeforeAfter,
            before_photo_url: beforeUrl,
            display_order: photos.length,
          },
          userId: (await supabase.auth.getSession()).data.session!.user.id,
        });

        toast.success('Photo queued for upload', {
          description: 'Will sync when connection is restored',
        });
      } else {
        const { error } = await supabase.from('portfolio_photos').insert({
          stylist_id: stylistProfileId,
          photo_url: afterUrl,
          caption,
          is_before_after: isBeforeAfter,
          before_photo_url: beforeUrl,
          display_order: photos.length,
        });

        if (error) throw error;
        toast.success('Photo uploaded successfully');
      }

      setNewPhoto(null);
      setNewPhotoPreview('');
      setBeforePhoto(null);
      setBeforePhotoPreview('');
      setCaption('');
      setIsBeforeAfter(false);
      await loadPhotos(stylistProfileId);
    } catch (error: any) {
      logger.error('Upload error', 'Portfolio', error as Error);
      if (!navigator.onLine) {
        toast.error('Connection unavailable', {
          description: 'Photo will upload when connection is restored',
        });
      } else {
        toast.error('Failed to upload photo', {
          description: 'Check connection and try again',
        });
      }
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const photo = photos.find(p => p.id === id);
    setConfirmDialog({
      open: true,
      title: 'Delete Photo',
      description: photo?.is_before_after
        ? 'This will permanently delete this before & after photo set.'
        : 'This will permanently delete this photo.',
      onConfirm: async () => {
        try {
          const { error } = await supabase
            .from('portfolio_photos')
            .delete()
            .eq('id', id);

          if (error) throw error;

          toast.success('Photo deleted');
          await loadPhotos(stylistProfileId);
        } catch (error) {
          logger.error('Delete error', 'Portfolio', error as Error);
          toast.error('Failed to delete photo');
        }
      },
    });
  };

  const movePhoto = async (id: string, direction: 'up' | 'down') => {
    const currentIndex = photos.findIndex(p => p.id === id);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= photos.length) return;

    try {
      const photo1 = photos[currentIndex];
      const photo2 = photos[newIndex];

      await supabase
        .from('portfolio_photos')
        .update({ display_order: photo2.display_order })
        .eq('id', photo1.id);

      await supabase
        .from('portfolio_photos')
        .update({ display_order: photo1.display_order })
        .eq('id', photo2.id);

      await loadPhotos(stylistProfileId);
    } catch (error) {
      logger.error('Reorder error', 'Portfolio', error as Error);
      toast.error('Failed to reorder photos');
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className={cn("container mx-auto max-w-6xl", mobileFirst.padding.md)}>
        <div className="mb-8">
          <h1 className={cn(typography.title.page, "mb-2 break-words")}>My Portfolio</h1>
          <p className={cn(typography.description.default, "break-words")}>
            Showcase your best work to attract more clients
          </p>
        </div>
          <PortfolioGridSkeleton />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className={cn("container mx-auto max-w-6xl animate-fade-in", mobileFirst.padding.md)}>
        <div className="mb-8">
          <h1 className={cn(typography.title.page, "mb-2 break-words")}>My Portfolio</h1>
          <p className={typography.description.default}>
            Showcase your best work to attract more clients
          </p>
        </div>

        {/* AI Portfolio Insights */}
        {photos.length > 0 && (
          <DataErrorBoundary feature="Portfolio Insights">
            <div className="mb-8">
              <PortfolioInsights stylistId={stylistProfileId} />
            </div>
          </DataErrorBoundary>
        )}

        {/* Upload Section */}
        <Card className="mb-8 brutal-border shadow-brutal-lg bg-gradient-to-br from-purple-400 to-pink-400">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Upload className="h-5 w-5" />
              Upload New Photo
            </CardTitle>
            <CardDescription className="text-foreground/80 font-medium">
              Add photos to your portfolio gallery
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormErrorBoundary fallbackMessage="An error occurred while uploading. Your photo data has been preserved.">
              <div className="flex items-center space-x-2 bg-card/20 p-3 rounded-lg">
              <Switch
                checked={isBeforeAfter}
                onCheckedChange={setIsBeforeAfter}
                id="before-after"
              />
              <Label
                htmlFor="before-after"
                className="text-foreground font-medium"
              >
                This is a before & after photo
              </Label>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {isBeforeAfter && (
                <div className="space-y-2">
                  <Label className="text-foreground font-medium">
                    Before Photo
                  </Label>
                  {beforePhotoPreview ? (
                    <div className="relative">
                      <OptimizedImage
                        src={beforePhotoPreview}
                        alt="Before preview"
                        width={400}
                        height={192}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <Button
                        size="sm"
                        variant="destructive"
                        className="absolute top-2 right-2"
                        onClick={() => {
                          setBeforePhoto(null);
                          setBeforePhotoPreview('');
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <CameraCapture
                      context="portfolio"
                      variant="default"
                      onCapture={imageUrl => handleFileSelect(imageUrl, true)}
                      maxSizeMB={3}
                      quality={0.92}
                    />
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-foreground font-medium">
                  {isBeforeAfter ? 'After Photo' : 'Photo'}
                </Label>
                {newPhotoPreview ? (
                  <div className="relative">
                    <OptimizedImage
                      src={newPhotoPreview}
                      alt="Photo preview"
                      width={400}
                      height={192}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <Button
                      size="sm"
                      variant="destructive"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        setNewPhoto(null);
                        setNewPhotoPreview('');
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <CameraCapture
                    context="portfolio"
                    variant="default"
                    onCapture={imageUrl => handleFileSelect(imageUrl, false)}
                    maxSizeMB={3}
                    quality={0.92}
                  />
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">Caption (Optional)</span>
                <VoiceControl
                  variant="minimal"
                  context="notes"
                  onTranscription={text =>
                    setCaption(prev => (prev ? `${prev}\n${text}` : text))
                  }
                />
              </div>
              <StandardFormField
                name="caption"
                label=""
                type="textarea"
                value={caption}
                onChange={(val) => setCaption(String(val))}
                placeholder="Describe the style, technique, or products used... (or use voice input)"
                rows={3}
                maxLength={500}
              />
            </div>

            <Button
              onClick={handleUpload}
              disabled={
                uploading ||
                !newPhotoPreview ||
                (isBeforeAfter && !beforePhotoPreview)
              }
              className="w-full"
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Photo
                </>
              )}
            </Button>
            </FormErrorBoundary>
          </CardContent>
        </Card>

        {/* Gallery */}
        <DataErrorBoundary feature="Portfolio Gallery" onReset={() => loadPhotos(stylistProfileId)}>
          <div className="mb-8">
            <h2 className={cn(typography.title.section, "mb-4")}>
              Your Gallery ({photos.length} photos)
            </h2>
            {photos.length === 0 ? (
              <EmptyState
                icon={ImageIcon}
                title="Start Building Your Portfolio"
                description="Upload your best work to attract new clients. Showcase transformations, color work, cuts, and special occasion styles."
                aria-label="No portfolio photos found"
                gradient="bg-gradient-to-br from-yellow-400 to-orange-400"
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {photos.map((photo, index) => (
                  <Card
                    key={photo.id}
                    className="border-[3px] border-foreground shadow-[5px_5px_0px_0px_hsl(var(--foreground))] hover:shadow-[7px_7px_0px_0px_hsl(var(--primary))] hover:-translate-y-1 transition-all bg-card"
                  >
                    <CardContent className="p-4">
                      <div className="relative">
                        {photo.is_before_after && photo.before_photo_url ? (
                          <div className="grid grid-cols-2 gap-2 mb-2">
                            <div>
                              <p className="text-xs font-bold mb-1 text-center">
                                BEFORE
                              </p>
                              <OptimizedImage
                                src={photo.before_photo_url}
                                alt="Before"
                                width={200}
                                height={128}
                                className="w-full h-32 object-cover rounded-lg border-2 border-foreground"
                              />
                            </div>
                            <div>
                              <p className="text-xs font-bold mb-1 text-center">
                                AFTER
                              </p>
                              <OptimizedImage
                                src={photo.photo_url}
                                alt="After"
                                width={200}
                                height={128}
                                className="w-full h-32 object-cover rounded-lg border-2 border-foreground"
                              />
                            </div>
                          </div>
                        ) : (
                          <img
                            src={photo.photo_url}
                            alt="Portfolio"
                            loading="lazy"
                            className="w-full h-48 object-cover rounded-lg mb-2 border-2 border-foreground"
                          />
                        )}
                        {photo.caption && (
                          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                            {photo.caption}
                          </p>
                        )}
                        {/* Action Buttons - Optimized for mobile */}
                        <div className="flex flex-col sm:flex-row gap-2 mb-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() =>
                              setBgRemovalDialog({
                                open: true,
                                imageUrl:
                                  photo.is_before_after && photo.before_photo_url
                                    ? photo.before_photo_url
                                    : photo.photo_url,
                              })
                            }
                            className="w-full sm:flex-1 gap-2"
                            title="Remove background with AI"
                            aria-label="Remove background with AI"
                          >
                            <Sparkles className="h-4 w-4" />
                            <span className="sm:hidden">Remove Background</span>
                          </Button>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => movePhoto(photo.id, 'up')}
                              disabled={index === 0}
                              className="flex-1"
                              aria-label="Move photo up"
                            >
                              <ArrowUp className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => movePhoto(photo.id, 'down')}
                              disabled={index === photos.length - 1}
                              className="flex-1"
                              aria-label="Move photo down"
                            >
                              <ArrowDown className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(photo.id)}
                              className="flex-1"
                              aria-label="Delete photo"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </DataErrorBoundary>

        <ConfirmDialog
          open={confirmDialog.open}
          onOpenChange={open => setConfirmDialog({ ...confirmDialog, open })}
          onConfirm={confirmDialog.onConfirm}
          title={confirmDialog.title}
          description={confirmDialog.description}
          confirmText="Delete"
          variant="destructive"
        />

        {bgRemovalDialog.open && (
          <Suspense
            fallback={
              <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            }
          >
            <BackgroundRemovalDialog
              open={bgRemovalDialog.open}
              onOpenChange={open =>
                setBgRemovalDialog({ ...bgRemovalDialog, open })
              }
              imageUrl={bgRemovalDialog.imageUrl}
            />
          </Suspense>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Portfolio;
