/**
 * Background Removal Dialog Component
 * Provides UI for removing backgrounds from portfolio photos
 */

import { useState, useEffect } from 'react';
import { OptimizedImage } from '@/components/OptimizedImage';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Sparkles, Download, Loader2, AlertCircle, Zap } from 'lucide-react';
import {
  removeBackground,
  loadImage,
  isWebGPUAvailable,
} from '@/utils/backgroundRemoval';
import { toast } from 'sonner';
import { logger } from '@/lib/logging/productionLogger';

interface BackgroundRemovalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string;
  onProcessed?: (blob: Blob) => void;
}

export const BackgroundRemovalDialog = ({
  open,
  onOpenChange,
  imageUrl,
  onProcessed,
}: BackgroundRemovalDialogProps) => {
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState('');
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [hasWebGPU, setHasWebGPU] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check WebGPU on mount
  useEffect(() => {
    isWebGPUAvailable().then(setHasWebGPU);
  }, []);

  const handleProcess = async () => {
    setProcessing(true);
    setProgress(0);
    setProgressText('Loading image...');
    setError(null);

    try {
      // Load the image
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const img = await loadImage(blob);

      // Process with background removal
      const resultBlob = await removeBackground(img, (stage, progressValue) => {
        setProgressText(stage);
        setProgress(progressValue);
      });

      // Create preview URL
      const previewUrl = URL.createObjectURL(resultBlob);
      setProcessedImage(previewUrl);

      // Store blob for use
      if (onProcessed) {
        onProcessed(resultBlob);
      }

      toast.success('Background removed successfully!', {
        description: 'You can now download or use this image',
      });
    } catch (err) {
      logger.error('Background removal failed', err, { component: 'BackgroundRemovalDialog' });
      setError(
        err instanceof Error ? err.message : 'Failed to remove background'
      );
      toast.error('Background removal failed', {
        description: 'Please try again or use a different image',
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (processedImage) {
      const a = document.createElement('a');
      a.href = processedImage;
      a.download = `no-background-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success('Image downloaded!');
    }
  };

  const handleReset = () => {
    if (processedImage) {
      URL.revokeObjectURL(processedImage);
    }
    setProcessedImage(null);
    setProgress(0);
    setProgressText('');
    setError(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Background Removal
          </DialogTitle>
          <DialogDescription>
            Remove messy backgrounds and make your work look professional
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* WebGPU Status */}
          {hasWebGPU !== null && (
            <Alert>
              <Zap className="h-4 w-4" />
              <AlertDescription>
                {hasWebGPU
                  ? '🚀 WebGPU acceleration enabled - Lightning fast processing!'
                  : '⚡ Running in compatibility mode - Processing may take longer'}
              </AlertDescription>
            </Alert>
          )}

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Image Preview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <p className="text-sm font-medium mb-2">Original</p>
              <OptimizedImage
                src={imageUrl}
                alt="Original"
                width={600}
                height={256}
                className="w-full h-64 object-contain rounded-lg border-2 border-border bg-secondary/20"
              />
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Processed</p>
              {processedImage ? (
                <OptimizedImage
                  src={processedImage}
                  alt="Processed"
                  width={600}
                  height={256}
                  className="w-full h-64 object-contain rounded-lg border-2 border-border"
                  style={{
                    backgroundImage:
                      'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)',
                    backgroundSize: '20px 20px',
                    backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
                  }}
                />
              ) : (
                <div className="w-full h-64 rounded-lg border-2 border-dashed border-border bg-secondary/20 flex items-center justify-center">
                  <p className="text-sm text-muted-foreground">
                    {processing ? 'Processing...' : 'Preview will appear here'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          {processing && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-muted-foreground text-center">
                {progressText}
              </p>
            </div>
          )}

          {/* Action Buttons - Mobile optimized */}
          <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
            {!processedImage ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={processing}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleProcess}
                  disabled={processing}
                  className="w-full sm:w-auto"
                >
                  {processing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Remove Background
                    </>
                  )}
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={handleReset}
                  className="w-full sm:w-auto"
                >
                  Try Again
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDownload}
                  className="w-full sm:w-auto"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button
                  onClick={() => onOpenChange(false)}
                  className="w-full sm:w-auto"
                >
                  Done
                </Button>
              </>
            )}
          </div>

          {/* Privacy Notice */}
          <Alert>
            <AlertDescription className="text-xs">
              🔒 <strong>Privacy First:</strong> All processing happens in your
              browser. Your photos never leave your device.
            </AlertDescription>
          </Alert>
        </div>
      </DialogContent>
    </Dialog>
  );
};
