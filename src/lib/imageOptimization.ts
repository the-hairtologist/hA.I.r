/**
 * Image Optimization Utilities
 * Provides utilities for optimizing images before upload
 */

export interface ImageOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'image/jpeg' | 'image/png' | 'image/webp';
}

const DEFAULT_OPTIONS: ImageOptimizationOptions = {
  maxWidth: 1920,
  maxHeight: 1920,
  quality: 0.85,
  format: 'image/jpeg'
};

/**
 * Optimizes an image file by resizing and compressing
 * @param file - The image file to optimize
 * @param options - Optimization options
 * @returns Promise<File> - The optimized image file
 */
export const optimizeImage = async (
  file: File,
  options: ImageOptimizationOptions = {}
): Promise<File> => {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        // Calculate new dimensions maintaining aspect ratio
        if (width > opts.maxWidth! || height > opts.maxHeight!) {
          const ratio = Math.min(opts.maxWidth! / width, opts.maxHeight! / height);
          width *= ratio;
          height *= ratio;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to create blob'));
              return;
            }

            const optimizedFile = new File(
              [blob],
              file.name.replace(/\.\w+$/, `.${opts.format!.split('/')[1]}`),
              { type: opts.format!, lastModified: Date.now() }
            );

            resolve(optimizedFile);
          },
          opts.format!,
          opts.quality!
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

/**
 * Validates image file before upload
 * @param file - The file to validate
 * @param maxSizeMB - Maximum file size in megabytes
 * @returns Object with isValid boolean and error message if invalid
 */
export const validateImageFile = (
  file: File,
  maxSizeMB: number = 5
): { isValid: boolean; error?: string } => {
  // Check file type
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!validTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Please upload a valid image file (JPG, PNG, WebP, or GIF)'
    };
  }

  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      isValid: false,
      error: `Image must be less than ${maxSizeMB}MB`
    };
  }

  return { isValid: true };
};

/**
 * Generates a responsive srcset string for an image
 * @param baseUrl - The base URL of the image
 * @param widths - Array of widths to generate
 * @returns srcset string
 */
export const generateSrcSet = (baseUrl: string, widths: number[] = [320, 640, 960, 1280, 1920]): string => {
  return widths.map(w => `${baseUrl}?w=${w} ${w}w`).join(', ');
};

/**
 * Gets the optimal sizes attribute for responsive images
 * @returns sizes attribute string
 */
export const getOptimalSizes = (): string => {
  return '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';
};