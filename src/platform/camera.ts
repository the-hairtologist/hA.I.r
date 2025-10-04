import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Platform } from './detector';

/**
 * Unified camera/file picker API for both web and mobile
 * Web: HTML5 file input
 * Mobile: Native camera and photo library
 */

interface CaptureImageOptions {
  /** Allow editing after capture (mobile only) */
  allowEditing?: boolean;
  /** Image quality (0-100) */
  quality?: number;
  /** Preferred source (camera or gallery) */
  source?: 'camera' | 'gallery' | 'prompt';
}

/**
 * Capture an image from camera or select from gallery
 */
export const captureImage = async (
  options: CaptureImageOptions = {}
): Promise<string | null> => {
  const {
    allowEditing = true,
    quality = 90,
    source = 'prompt',
  } = options;

  if (Platform.isMobile) {
    try {
      const sourceMap = {
        camera: CameraSource.Camera,
        gallery: CameraSource.Photos,
        prompt: CameraSource.Prompt,
      };

      const photo = await Camera.getPhoto({
        quality,
        allowEditing,
        resultType: CameraResultType.DataUrl,
        source: sourceMap[source],
      });

      return photo.dataUrl || null;
    } catch (error) {
      console.error('Camera error:', error);
      return null;
    }
  } else {
    // Web fallback
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      
      // Add capture attribute if camera is requested
      if (source === 'camera') {
        input.setAttribute('capture', 'environment');
      }

      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => resolve(null);
          reader.readAsDataURL(file);
        } else {
          resolve(null);
        }
      };

      input.oncancel = () => resolve(null);
      input.click();
    });
  }
};

/**
 * Select multiple images
 */
export const selectMultipleImages = async (): Promise<string[]> => {
  if (Platform.isMobile) {
    // Note: Capacitor Camera doesn't support multiple selection natively
    // Would need a custom plugin or multiple single selections
    const image = await captureImage({ source: 'gallery' });
    return image ? [image] : [];
  } else {
    // Web supports multiple selection
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.multiple = true;

      input.onchange = async (e) => {
        const files = Array.from((e.target as HTMLInputElement).files || []);
        const results: string[] = [];

        for (const file of files) {
          try {
            const dataUrl = await new Promise<string>((res, rej) => {
              const reader = new FileReader();
              reader.onload = () => res(reader.result as string);
              reader.onerror = rej;
              reader.readAsDataURL(file);
            });
            results.push(dataUrl);
          } catch (error) {
            console.error('Error reading file:', error);
          }
        }

        resolve(results);
      };

      input.oncancel = () => resolve([]);
      input.click();
    });
  }
};

/**
 * Check if camera is available
 */
export const isCameraAvailable = async (): Promise<boolean> => {
  if (Platform.isMobile) {
    // On mobile, camera is typically always available
    return true;
  } else {
    // Check for mediaDevices API on web
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }
};
