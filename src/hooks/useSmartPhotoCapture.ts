/**
 * ✨ ENHANCEMENT: Smart Photo Capture Hook
 * Auto-optimizes photos, adds metadata, and provides before/after comparison
 */

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { captureImage } from '@/platform/camera';
import imageCompression from 'browser-image-compression';
import { toast } from 'sonner';

interface PhotoMetadata {
  serviceType?: string;
  stage: 'before' | 'after' | 'progress';
  clientId?: string;
  appointmentId?: string;
  capturedAt: string;
  autoEnhanced: boolean;
}

interface EnhancedPhoto {
  url: string;
  thumbnailUrl?: string;
  metadata: PhotoMetadata;
  quality: 'original' | 'compressed' | 'thumbnail';
}

export const useSmartPhotoCapture = () => {
  const [capturing, setCapturing] = useState(false);
  const [photos, setPhotos] = useState<EnhancedPhoto[]>([]);

  /**
   * ✨ Smart capture with auto-optimization
   */
  const smartCapture = useCallback(
    async (
      metadata: Omit<PhotoMetadata, 'capturedAt' | 'autoEnhanced'>,
      autoEnhance = true
    ): Promise<EnhancedPhoto | null> => {
      setCapturing(true);
      try {
        // Capture photo
        const photoDataUrl = await captureImage({
          source: 'camera',
          quality: 90,
        });

        if (!photoDataUrl) {
          toast.error('No photo captured');
          return null;
        }

        // Convert to blob
        const response = await fetch(photoDataUrl);
        const blob = await response.blob();

        // ✨ ENHANCEMENT: Auto-optimize image
        const optimizedBlob = await imageCompression(
          new File([blob], 'photo.jpg'),
          {
            maxSizeMB: 1,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
            fileType: 'image/jpeg',
          }
        );

        // ✨ ENHANCEMENT: Generate thumbnail
        const thumbnailBlob = await imageCompression(
          new File([blob], 'thumbnail.jpg'),
          {
            maxSizeMB: 0.1,
            maxWidthOrHeight: 400,
            useWebWorker: true,
            fileType: 'image/jpeg',
          }
        );

        // Upload both versions
        const timestamp = Date.now();
        const basePath = `${metadata.clientId || 'temp'}/${timestamp}`;

        // Upload full quality
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('hair-photos')
          .upload(`${basePath}/full.jpg`, optimizedBlob, {
            contentType: 'image/jpeg',
            cacheControl: '3600',
          });

        if (uploadError) throw uploadError;

        // Upload thumbnail
        const { data: thumbData } = await supabase.storage
          .from('hair-photos')
          .upload(`${basePath}/thumb.jpg`, thumbnailBlob, {
            contentType: 'image/jpeg',
            cacheControl: '3600',
          });

        // Get public URLs
        const {
          data: { publicUrl },
        } = supabase.storage.from('hair-photos').getPublicUrl(uploadData.path);

        const {
          data: { publicUrl: thumbUrl },
        } = supabase.storage
          .from('hair-photos')
          .getPublicUrl(thumbData?.path || uploadData.path);

        const enhancedPhoto: EnhancedPhoto = {
          url: publicUrl,
          thumbnailUrl: thumbUrl,
          metadata: {
            ...metadata,
            capturedAt: new Date().toISOString(),
            autoEnhanced: autoEnhance,
          },
          quality: 'compressed',
        };

        setPhotos(prev => [...prev, enhancedPhoto]);
        toast.success('Photo captured and optimized!');

        return enhancedPhoto;
      } catch (error) {
        console.error('Smart capture error:', error);
        toast.error('Failed to capture photo');
        return null;
      } finally {
        setCapturing(false);
      }
    },
    []
  );

  /**
   * ✨ Compare before/after photos
   */
  const comparePhotos = (beforeUrl: string, afterUrl: string) => {
    return {
      before: beforeUrl,
      after: afterUrl,
      comparisonUrl: `/compare?before=${encodeURIComponent(beforeUrl)}&after=${encodeURIComponent(afterUrl)}`,
    };
  };

  /**
   * ✨ Auto-tag photo with service type using AI
   */
  const autoTagPhoto = async (photoUrl: string): Promise<string | null> => {
    try {
      const { data, error } = await supabase.functions.invoke(
        'ai-visual-analysis',
        {
          body: {
            photoUrl,
            context: 'auto-tagging',
          },
        }
      );

      if (error) throw error;

      // Extract service type from AI analysis
      const serviceType = inferServiceType(data);
      return serviceType;
    } catch (error) {
      console.error('Auto-tagging failed:', error);
      return null;
    }
  };

  const inferServiceType = (analysis: any): string => {
    // Basic inference from analysis
    if (analysis.color_fade_percentage && analysis.color_fade_percentage > 40)
      return 'Color Refresh';
    if (analysis.damage_level === 'severe') return 'Deep Conditioning';
    return 'Haircut & Style';
  };

  return {
    smartCapture,
    capturing,
    photos,
    comparePhotos,
    autoTagPhoto,
    clearPhotos: () => setPhotos([]),
  };
};
