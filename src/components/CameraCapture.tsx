import { useState, useRef } from "react";
import { Camera, Loader2, CheckCircle2, AlertCircle, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { captureImage } from "@/platform/camera";
import { haptic } from "@/platform/haptics";
import { cn } from "@/lib/utils";
import imageCompression from 'browser-image-compression';
import { PrivacyConsentDialog, getStoredConsent } from "./PrivacyConsentDialog";
import { z } from "zod";
import { MediaErrorBoundary } from "./MediaErrorBoundary";
import { OptimizedImage } from '@/components/OptimizedImage';

interface CameraCaptureProps {
  onCapture: (imageUrl: string, metadata?: CaptureMetadata) => void | Promise<void>;
  context?: 'portfolio' | 'profile' | 'analysis' | 'client_post';
  className?: string;
  variant?: "default" | "compact" | "fab";
  disabled?: boolean;
  maxSizeMB?: number;
  quality?: number;
}

export interface CaptureMetadata {
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  capturedAt: string;
  context: string;
}

// Validation schema for metadata
const metadataSchema = z.object({
  originalSize: z.number().positive("Original size must be positive"),
  compressedSize: z.number().positive("Compressed size must be positive"),
  compressionRatio: z.number().min(0).max(100, "Compression ratio must be 0-100%"),
  capturedAt: z.string().datetime("Invalid capture timestamp"),
  context: z.enum(['portfolio', 'profile', 'analysis', 'client_post'])
});

export const CameraCapture = ({ 
  onCapture, 
  context = 'portfolio',
  className,
  variant = "default",
  disabled = false,
  maxSizeMB = 2,
  quality = 0.9
}: CameraCaptureProps) => {
  const [capturing, setCapturing] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showConsentDialog, setShowConsentDialog] = useState(false);
  const [pendingCapture, setPendingCapture] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const contextMessages = {
    portfolio: { 
      capture: "Capture professional work",
      processing: "Optimizing image...",
      success: "Photo ready!",
      tip: "💡 Use good lighting for best results"
    },
    profile: { 
      capture: "Take profile photo",
      processing: "Processing portrait...",
      success: "Looking great!",
      tip: "💡 Center your face in frame"
    },
    analysis: { 
      capture: "Analyze hair photo",
      processing: "Preparing for AI analysis...",
      success: "Ready for analysis!",
      tip: "💡 Capture in natural light"
    },
    client_post: { 
      capture: "Share hair inspiration",
      processing: "Preparing image...",
      success: "Image ready to post!",
      tip: "💡 Show desired style clearly"
    }
  };

  const messages = contextMessages[context];

  const compressImage = async (file: Blob): Promise<{ blob: Blob; metadata: CaptureMetadata }> => {
    const originalSize = file.size;
    
    const options = {
      maxSizeMB,
      maxWidthOrHeight: context === 'profile' ? 800 : 1920,
      useWebWorker: true,
      quality,
      onProgress: (progress: number) => {
        setUploadProgress(progress);
      }
    };

    try {
      const compressedBlob = await imageCompression(file as File, options);
      const compressedSize = compressedBlob.size;
      
      const metadata: CaptureMetadata = {
        originalSize,
        compressedSize,
        compressionRatio: Math.round((1 - compressedSize / originalSize) * 100),
        capturedAt: new Date().toISOString(),
        context
      };

      // Validate metadata before returning
      metadataSchema.parse(metadata);

      return { blob: compressedBlob, metadata };
    } catch (error) {
      console.error('Compression error:', error);
      if (error instanceof z.ZodError) {
        throw new Error('Invalid image metadata: ' + error.errors[0].message);
      }
      throw new Error('Failed to optimize image');
    }
  };

  const handleCapture = async () => {
    if (disabled || capturing) return;

    // Check for stored consent first
    const hasConsent = getStoredConsent('camera');
    if (!hasConsent) {
      setPendingCapture(true);
      setShowConsentDialog(true);
      return;
    }

    await executeCapture();
  };

  const handleConsentResponse = async (granted: boolean) => {
    setPendingCapture(false);
    if (granted) {
      await executeCapture();
    } else {
      toast.error("Camera permission denied", {
        description: "You can grant permission later in Settings"
      });
    }
  };

  const executeCapture = async () => {
    setCapturing(true);
    setError(null);
    setUploadProgress(0);
    abortControllerRef.current = new AbortController();

    try {
      await haptic.tap();
      
      // Capture with native camera
      const photoDataUrl = await captureImage({ 
        source: 'camera',
        quality: 95,
        allowEditing: context === 'profile'
      });

      if (!photoDataUrl) {
        throw new Error('No image captured');
      }

      setPreview(photoDataUrl);
      setProcessing(true);
      
      // Convert data URL to blob
      const response = await fetch(photoDataUrl);
      const blob = await response.blob();

      // Compress and optimize
      const { blob: optimizedBlob, metadata } = await compressImage(blob);
      
      // Convert back to data URL
      const reader = new FileReader();
      reader.onloadend = async () => {
        const optimizedDataUrl = reader.result as string;
        
        try {
          await onCapture(optimizedDataUrl, metadata);
          
          await haptic.success();
          toast.success(messages.success, {
            description: `Saved ${metadata.compressionRatio}% space • ${(metadata.compressedSize / 1024).toFixed(0)}KB`
          });
          
          setPreview(null);
        } catch (error) {
          throw error;
        }
      };
      
      reader.readAsDataURL(optimizedBlob);
      
    } catch (error: any) {
      console.error('Capture error:', error);
      await haptic.error();
      
      const errorMessage = error.message || 'Failed to capture photo';
      setError(errorMessage);
      
      toast.error("Camera Error", {
        description: errorMessage,
      });
    } finally {
      setCapturing(false);
      setProcessing(false);
      setUploadProgress(0);
    }
  };

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setPreview(null);
    setProcessing(false);
    setUploadProgress(0);
  };

  // FAB variant (floating action button)
  if (variant === "fab") {
    return (
      <Button
        size="lg"
        onClick={handleCapture}
        disabled={disabled || capturing || processing}
        className={cn(
          "fixed bottom-[104px] right-20 h-14 w-14 rounded-full shadow-2xl z-50 touch-manipulation active:scale-95",
          "bg-gradient-to-br from-primary to-secondary",
          "hover:opacity-90",
          "transform transition-all duration-300 hover:scale-110",
          "ring-4 ring-primary/20",
          "text-primary-foreground",
          className
        )}
      >
        {capturing || processing ? (
          <Loader2 className="h-6 w-6 animate-spin" />
        ) : (
          <Camera className="h-6 w-6" />
        )}
      </Button>
    );
  }

  // Compact variant
  if (variant === "compact") {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleCapture}
        disabled={disabled || capturing || processing}
        className={cn("gap-2", className)}
      >
        {capturing || processing ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {processing ? "Processing..." : "Capturing..."}
          </>
        ) : (
          <>
            <Camera className="h-4 w-4" />
            Capture
          </>
        )}
      </Button>
    );
  }

  // Default full-featured variant
  return (
    <MediaErrorBoundary fallbackType="camera" onReset={() => {
      setPreview(null);
      setError(null);
      setCapturing(false);
      setProcessing(false);
    }}>
      <PrivacyConsentDialog
        open={showConsentDialog}
        onOpenChange={setShowConsentDialog}
        type="camera"
        onConsent={handleConsentResponse}
        context={context}
      />
      <Card className={cn("p-6 space-y-4", className)}>
        {preview && processing ? (
        <div className="space-y-4 animate-in fade-in-50">
          <div className="relative rounded-lg overflow-hidden">
            <OptimizedImage 
              src={preview} 
              alt="Camera preview" 
              priority={true}
              className="w-full h-48 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
              <div className="flex-1">
                <p className="text-white font-medium">{messages.processing}</p>
                <Progress value={uploadProgress} className="h-2 mt-2" />
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleCancel}
                className="text-white hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-gradient-to-br from-primary to-secondary">
                <Camera className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-semibold">{messages.capture}</h3>
                <p className="text-sm text-muted-foreground">{messages.tip}</p>
              </div>
            </div>
            {context === 'analysis' && (
              <Sparkles className="h-5 w-5 text-primary" />
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <Button
            onClick={handleCapture}
            disabled={disabled || capturing || processing}
            className="w-full h-12 bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-primary-foreground"
            aria-label={messages.capture}
            aria-live="polite"
          >
            {capturing || processing ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                {processing ? messages.processing : "Opening camera..."}
              </>
            ) : (
              <>
                <Camera className="mr-2 h-5 w-5" />
                {messages.capture}
              </>
            )}
          </Button>
        </div>
      )}
      </Card>
    </MediaErrorBoundary>
  );
};
