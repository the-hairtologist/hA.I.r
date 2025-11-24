/**
 * Image Optimization Utilities
 * Handles lazy loading, compression, and responsive images
 */

import imageCompression from 'browser-image-compression';
import { logger } from '@/lib/logger';

export interface ImageOptimizationOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  useWebWorker?: boolean;
  quality?: number;
}

/**
 * Compress an image file
 */
export async function compressImage(
  file: File,
  options: ImageOptimizationOptions = {}
): Promise<File> {
  const defaultOptions = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    quality: 0.85,
    ...options,
  };

  try {
    logger.debug('Compressing image', 'imageOptimization', {
      originalSize: file.size,
      name: file.name,
    });

    const compressedFile = await imageCompression(file, defaultOptions);

    logger.info('Image compressed successfully', 'imageOptimization', {
      originalSize: file.size,
      compressedSize: compressedFile.size,
      reduction: `${Math.round((1 - compressedFile.size / file.size) * 100)}%`,
    });

    return compressedFile;
  } catch (error) {
    logger.error('Image compression failed', 'imageOptimization', error);
    return file; // Return original if compression fails
  }
}

/**
 * Generate srcset for responsive images
 */
export function generateSrcSet(baseUrl: string, widths: number[]): string {
  return widths.map(width => `${baseUrl}?width=${width} ${width}w`).join(', ');
}

/**
 * Get optimal image size based on device
 */
export function getOptimalImageSize(): number {
  const dpr = window.devicePixelRatio || 1;
  const width = window.innerWidth;

  if (width <= 640) return Math.round(640 * dpr);
  if (width <= 768) return Math.round(768 * dpr);
  if (width <= 1024) return Math.round(1024 * dpr);
  if (width <= 1280) return Math.round(1280 * dpr);
  return Math.round(1920 * dpr);
}

/**
 * Preload critical images
 */
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Create blur placeholder for progressive loading
 */
export function createBlurPlaceholder(width: number, height: number): string {
  // Generate a small base64 SVG for blur placeholder
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <filter id="blur">
        <feGaussianBlur stdDeviation="10" />
      </filter>
      <rect width="100%" height="100%" fill="#e5e7eb" filter="url(#blur)" />
    </svg>
  `;

  return `data:image/svg+xml;base64,${btoa(svg)}`;
}
