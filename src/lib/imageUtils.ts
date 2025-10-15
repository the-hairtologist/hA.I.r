/**
 * Unified Image Utilities
 * Consolidates image optimization, compression, and validation
 */

import imageCompression from 'browser-image-compression';
import { logger } from './logger';

export interface ImageProcessOptions {
  maxSizeMB?: number;
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'image/jpeg' | 'image/png' | 'image/webp';
  useWebWorker?: boolean;
}

const DEFAULT_OPTIONS: ImageProcessOptions = {
  maxSizeMB: 1,
  maxWidth: 1920,
  maxHeight: 1920,
  quality: 0.85,
  format: 'image/webp',
  useWebWorker: true,
};

/**
 * Process and optimize an image file
 */
export const processImage = async (
  file: File,
  options: ImageProcessOptions = {}
): Promise<File> => {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  try {
    // Check if already small enough
    if (file.size <= (opts.maxSizeMB! * 1024 * 1024)) {
      logger.debug('Image already optimized, skipping compression', 'imageUtils');
      return file;
    }

    logger.debug('Original file size', 'imageUtils', {
      size: (file.size / 1024 / 1024).toFixed(2) + 'MB'
    });
    
    const compressedFile = await imageCompression(file, {
      maxSizeMB: opts.maxSizeMB,
      maxWidthOrHeight: Math.max(opts.maxWidth!, opts.maxHeight!),
      useWebWorker: opts.useWebWorker,
      fileType: opts.format,
    });
    
    logger.debug('Image compressed', 'imageUtils', {
      originalSize: (file.size / 1024 / 1024).toFixed(2) + 'MB',
      compressedSize: (compressedFile.size / 1024 / 1024).toFixed(2) + 'MB',
      ratio: ((1 - compressedFile.size / file.size) * 100).toFixed(1) + '%'
    });
    
    return compressedFile;
  } catch (error) {
    logger.error('Image processing failed, using original', 'imageUtils', error);
    return file;
  }
};

/**
 * Process multiple images in parallel
 */
export const processImages = async (
  files: File[],
  options: ImageProcessOptions = {}
): Promise<File[]> => {
  return Promise.all(files.map(file => processImage(file, options)));
};

/**
 * Validate image file before upload
 */
export const validateImageFile = (
  file: File,
  maxSizeMB: number = 5
): { isValid: boolean; error?: string } => {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!validTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Please upload a valid image file (JPG, PNG, WebP, or GIF)'
    };
  }

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
 * Preset configurations for common use cases
 */
export const ImagePresets = {
  thumbnail: (file: File) => processImage(file, {
    maxSizeMB: 0.1,
    maxWidth: 400,
    maxHeight: 400,
  }),
  
  avatar: (file: File) => processImage(file, {
    maxSizeMB: 0.5,
    maxWidth: 512,
    maxHeight: 512,
  }),
  
  portfolio: (file: File) => processImage(file, {
    maxSizeMB: 1.5,
    maxWidth: 2048,
    maxHeight: 2048,
    quality: 0.9,
  }),
  
  standard: (file: File) => processImage(file, {
    maxSizeMB: 1,
    maxWidth: 1920,
    maxHeight: 1920,
  }),
};

/**
 * Generate responsive srcset string for an image
 */
export const generateSrcSet = (
  baseUrl: string, 
  widths: number[] = [320, 640, 960, 1280, 1920]
): string => {
  return widths.map(w => `${baseUrl}?w=${w} ${w}w`).join(', ');
};

/**
 * Get optimal sizes attribute for responsive images
 */
export const getOptimalSizes = (): string => {
  return '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';
};
