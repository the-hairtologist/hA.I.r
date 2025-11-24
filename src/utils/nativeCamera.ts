import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';

export interface CaptureOptions {
  quality?: number;
  allowEditing?: boolean;
  source?: 'camera' | 'photos';
}

export interface CaptureResult {
  dataUrl: string;
  format: string;
}

/**
 * Captures a photo using native camera on mobile or file input on web
 */
export const capturePhoto = async (
  options: CaptureOptions = {}
): Promise<CaptureResult> => {
  const { quality = 90, allowEditing = false, source = 'camera' } = options;

  // Check if native camera is available (mobile)
  if (Capacitor.isNativePlatform()) {
    try {
      const image = await Camera.getPhoto({
        quality,
        allowEditing,
        resultType: CameraResultType.DataUrl,
        source: source === 'camera' ? CameraSource.Camera : CameraSource.Photos,
      });

      return {
        dataUrl: image.dataUrl || '',
        format: image.format,
      };
    } catch (error) {
      console.error('Native camera error:', error);
      throw new Error('Failed to capture photo with native camera');
    }
  }

  // Fallback to browser file input
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';

    if (source === 'camera') {
      input.capture = 'environment';
    }

    input.onchange = async e => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) {
        reject(new Error('No file selected'));
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        resolve({
          dataUrl: reader.result as string,
          format: file.type.split('/')[1] || 'jpeg',
        });
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    };

    input.click();
  });
};

/**
 * Checks if native camera is available
 */
export const isCameraAvailable = (): boolean => {
  return Capacitor.isNativePlatform();
};

/**
 * Requests camera permissions (mobile only)
 */
export const requestCameraPermission = async (): Promise<boolean> => {
  if (!Capacitor.isNativePlatform()) {
    return true; // No permission needed for web
  }

  try {
    const result = await Camera.checkPermissions();
    if (result.camera === 'granted' && result.photos === 'granted') {
      return true;
    }

    const requestResult = await Camera.requestPermissions();
    return (
      requestResult.camera === 'granted' && requestResult.photos === 'granted'
    );
  } catch (error) {
    console.error('Permission request error:', error);
    return false;
  }
};
