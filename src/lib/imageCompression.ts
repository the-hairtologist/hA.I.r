/**
 * Image Compression Utility
 * Automatically compresses images before upload to reduce bandwidth and storage
 */

import imageCompression from 'browser-image-compression';

export interface CompressionOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  useWebWorker?: boolean;
  fileType?: string;
}

const DEFAULT_OPTIONS: CompressionOptions = {
  maxSizeMB: 1, // 1MB max
  maxWidthOrHeight: 1920, // Max dimension
  useWebWorker: true,
  fileType: 'image/webp', // Modern format, better compression
};

/**
 * Compress an image file with optimized settings
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

  try {
    // Check if already small enough
    if (file.size <= (mergedOptions.maxSizeMB! * 1024 * 1024)) {
      console.log('Image already optimized, skipping compression');
      return file;
    }

    console.log('Original file size:', (file.size / 1024 / 1024).toFixed(2), 'MB');
    
    const compressedFile = await imageCompression(file, mergedOptions);
    
    console.log('Compressed file size:', (compressedFile.size / 1024 / 1024).toFixed(2), 'MB');
    console.log('Compression ratio:', ((1 - compressedFile.size / file.size) * 100).toFixed(1), '%');
    
    return compressedFile;
  } catch (error) {
    console.error('Image compression failed, using original:', error);
    return file; // Fallback to original if compression fails
  }
}

/**
 * Compress multiple images in parallel
 */
export async function compressImages(
  files: File[],
  options: CompressionOptions = {}
): Promise<File[]> {
  const compressionPromises = files.map(file => compressImage(file, options));
  return Promise.all(compressionPromises);
}

/**
 * Generate thumbnail from image
 */
export async function generateThumbnail(file: File): Promise<File> {
  return compressImage(file, {
    maxSizeMB: 0.1, // 100KB max for thumbnails
    maxWidthOrHeight: 400,
    useWebWorker: true,
    fileType: 'image/webp',
  });
}

/**
 * Validate and compress image for avatar upload
 */
export async function compressAvatar(file: File): Promise<File> {
  return compressImage(file, {
    maxSizeMB: 0.5, // 500KB max for avatars
    maxWidthOrHeight: 512,
    useWebWorker: true,
    fileType: 'image/webp',
  });
}

/**
 * Validate and compress image for portfolio upload
 */
export async function compressPortfolio(file: File): Promise<File> {
  return compressImage(file, {
    maxSizeMB: 1.5, // 1.5MB max for portfolio (higher quality)
    maxWidthOrHeight: 2048,
    useWebWorker: true,
    fileType: 'image/webp',
  });
}
