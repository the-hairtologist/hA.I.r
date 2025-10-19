/**
 * 📱 TEAM 2: Native Mobile Integration
 * Before/After Photo Flow - Smart camera capture with haptics
 */

import { useState } from 'react';
import { useSmartPhotoCapture } from '@/hooks/useSmartPhotoCapture';
import { useRichHaptics } from '@/hooks/useRichHaptics';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Camera, Check, X, RefreshCw, Sparkles, Loader2, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface BeforeAfterPhotoFlowProps {
  clientId: string;
  appointmentId?: string;
  serviceType?: string;
  onComplete?: (photos: { before: string; after: string }) => void;
}

export const BeforeAfterPhotoFlow: React.FC<BeforeAfterPhotoFlowProps> = ({
  clientId,
  appointmentId,
  serviceType,
  onComplete
}) => {
  const { smartCapture, capturing, photos, comparePhotos } = useSmartPhotoCapture();
  const haptics = useRichHaptics();
  const triggerSuccess = () => haptics.patterns.successSequence();
  const triggerError = () => haptics.patterns.warningPattern();
  const triggerButton = () => haptics.trigger('button_tap');
  const { toast } = useToast();

  const [stage, setStage] = useState<'before' | 'after' | 'complete'>('before');
  const [beforePhoto, setBeforePhoto] = useState<string | null>(null);
  const [afterPhoto, setAfterPhoto] = useState<string | null>(null);
  const [showComparison, setShowComparison] = useState(false);

  const capturePhoto = async () => {
    triggerButton();
    
    const metadata = {
      stage: (stage === 'complete' ? 'after' : stage) as 'before' | 'after' | 'progress',
      clientId,
      appointmentId,
      serviceType
    };

    const photo = await smartCapture(metadata);
    
    if (photo) {
      triggerSuccess();
      
      if (stage === 'before') {
        setBeforePhoto(photo.url);
        toast({
          title: '✨ Before photo captured!',
          description: 'Photo optimized and saved. Ready for "After" photo.',
        });
        setStage('after');
      } else if (stage === 'after') {
        setAfterPhoto(photo.url);
        toast({
          title: '🎉 Transformation documented!',
          description: 'Before & After photos saved. Generating comparison...',
        });
        setStage('complete');
        
        if (beforePhoto && onComplete) {
          onComplete({ before: beforePhoto, after: photo.url });
        }
      }
    } else {
      triggerError();
      toast({
        title: 'Camera Error',
        description: 'Could not capture photo. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const resetFlow = () => {
    triggerButton();
    setStage('before');
    setBeforePhoto(null);
    setAfterPhoto(null);
    setShowComparison(false);
  };

  const viewComparison = () => {
    if (beforePhoto && afterPhoto) {
      const comparison = comparePhotos(beforePhoto, afterPhoto);
      setShowComparison(true);
    }
  };

  return (
    <div className="space-y-4">
      <Card className={`border-2 ${
        stage === 'before' ? 'border-blue-500' : 
        stage === 'after' ? 'border-purple-500' : 
        'border-green-500'
      }`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              <h3 className="font-semibold">
                {stage === 'before' && 'Capture BEFORE Photo'}
                {stage === 'after' && 'Capture AFTER Photo'}
                {stage === 'complete' && 'Photos Complete'}
              </h3>
            </div>
            <Badge variant={
              stage === 'before' ? 'secondary' : 
              stage === 'after' ? 'default' : 
              'outline'
            }>
              {stage === 'before' && 'Step 1/2'}
              {stage === 'after' && 'Step 2/2'}
              {stage === 'complete' && 'Done'}
            </Badge>
          </div>

          {/* Photo Preview Grid */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* Before Photo */}
            <div className={`relative aspect-square rounded-lg overflow-hidden border-2 ${
              beforePhoto ? 'border-green-500' : 'border-dashed border-muted'
            }`}>
              {beforePhoto ? (
                <>
                  <img 
                    src={beforePhoto} 
                    alt="Before" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2">
                    <Badge className="bg-blue-500 text-white">
                      <Check className="h-3 w-3 mr-1" />
                      Before
                    </Badge>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <Camera className="h-12 w-12 mb-2 opacity-30" />
                  <p className="text-xs">Before Photo</p>
                </div>
              )}
            </div>

            {/* After Photo */}
            <div className={`relative aspect-square rounded-lg overflow-hidden border-2 ${
              afterPhoto ? 'border-green-500' : 'border-dashed border-muted'
            }`}>
              {afterPhoto ? (
                <>
                  <img 
                    src={afterPhoto} 
                    alt="After" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2">
                    <Badge className="bg-purple-500 text-white">
                      <Check className="h-3 w-3 mr-1" />
                      After
                    </Badge>
                  </div>
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-green-500 text-white">
                      <Sparkles className="h-3 w-3 mr-1" />
                      AI Enhanced
                    </Badge>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <Camera className="h-12 w-12 mb-2 opacity-30" />
                  <p className="text-xs">After Photo</p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {stage !== 'complete' && (
              <Button 
                onClick={capturePhoto} 
                disabled={capturing}
                className="flex-1"
                size="lg"
              >
                {capturing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Capturing...
                  </>
                ) : (
                  <>
                    <Camera className="mr-2 h-5 w-5" />
                    Capture {stage === 'before' ? 'Before' : 'After'}
                  </>
                )}
              </Button>
            )}
            
            {stage === 'complete' && (
              <>
                <Button onClick={viewComparison} className="flex-1" size="lg">
                  <ImageIcon className="mr-2 h-5 w-5" />
                  View Comparison
                </Button>
                <Button onClick={resetFlow} variant="outline" size="lg">
                  <RefreshCw className="mr-2 h-5 w-5" />
                  Retake
                </Button>
              </>
            )}

            {stage === 'after' && beforePhoto && (
              <Button onClick={resetFlow} variant="outline" size="icon">
                <X className="h-5 w-5" />
              </Button>
            )}
          </div>

          {/* Auto-optimization notice */}
          {(capturing || photos.length > 0) && (
            <div className="mt-4 p-3 bg-primary/10 rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="font-medium">AI Optimization Active</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Photos automatically compressed, enhanced, and saved to cloud
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Comparison Dialog */}
      <Dialog open={showComparison} onOpenChange={setShowComparison}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Before & After Comparison</DialogTitle>
            <DialogDescription>
              Swipe to compare transformation
            </DialogDescription>
          </DialogHeader>
          {beforePhoto && afterPhoto && (
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Badge className="bg-blue-500 text-white">Before</Badge>
                <img 
                  src={beforePhoto} 
                  alt="Before" 
                  className="w-full rounded-lg border-2 border-blue-500"
                />
              </div>
              <div className="space-y-2">
                <Badge className="bg-purple-500 text-white">After</Badge>
                <img 
                  src={afterPhoto} 
                  alt="After" 
                  className="w-full rounded-lg border-2 border-purple-500"
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
