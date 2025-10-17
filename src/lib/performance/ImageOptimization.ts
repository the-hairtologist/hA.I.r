/**
 * Phase 2: Image Optimization System
 * Responsive images, lazy loading, WebP conversion
 */

import { useEffect, useState, useRef } from 'react';

interface ImageOptimizationOptions {
  src: string;
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'original';
  lazy?: boolean;
}

/**
 * Generate srcset for responsive images
 */
export function generateSrcSet(baseSrc: string, widths: number[] = [320, 640, 960, 1280, 1920]): string {
  return widths
    .map(width => `${baseSrc}?w=${width}&q=75 ${width}w`)
    .join(', ');
}

/**
 * Get optimal image size based on viewport
 */
export function getOptimalImageSize(): { width: number; dpr: number } {
  const dpr = window.devicePixelRatio || 1;
  const width = Math.min(window.innerWidth * dpr, 1920);
  
  // Round to nearest standard size
  const standardSizes = [320, 640, 960, 1280, 1920];
  const optimalWidth = standardSizes.find(size => size >= width) || 1920;
  
  return { width: optimalWidth, dpr };
}

/**
 * Intersection Observer hook for lazy loading images
 */
export function useLazyImage(src: string, threshold = 0.01) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!imgRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setImageSrc(src);
          observer.disconnect();
        }
      },
      { threshold, rootMargin: '50px' }
    );

    observer.observe(imgRef.current);

    return () => observer.disconnect();
  }, [src, threshold]);

  return { imgRef, imageSrc, isLoaded, setIsLoaded };
}

/**
 * Blur hash placeholder generator
 */
export function generateBlurDataURL(width: number, height: number): string {
  // Simple gradient placeholder
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}'%3E%3Cdefs%3E%3ClinearGradient id='g'%3E%3Cstop offset='0%25' stop-color='%23f3f4f6'/%3E%3Cstop offset='100%25' stop-color='%23e5e7eb'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23g)'/%3E%3C/svg%3E`;
}

/**
 * Optimize image loading strategy
 */
export const imageLoadingStrategy = {
  // Critical images: Load immediately, no lazy loading
  critical: {
    loading: 'eager' as const,
    fetchPriority: 'high' as const,
    decoding: 'async' as const,
  },
  
  // Above-the-fold images: Load with slight delay
  aboveTheFold: {
    loading: 'eager' as const,
    fetchPriority: 'auto' as const,
    decoding: 'async' as const,
  },
  
  // Below-the-fold images: Lazy load
  belowTheFold: {
    loading: 'lazy' as const,
    fetchPriority: 'low' as const,
    decoding: 'async' as const,
  },
  
  // Thumbnail images: Lazy load with low priority
  thumbnail: {
    loading: 'lazy' as const,
    fetchPriority: 'low' as const,
    decoding: 'async' as const,
  },
};

/**
 * Compress image before upload
 */
export async function compressImage(
  file: File,
  maxWidth: number = 1920,
  maxHeight: number = 1920,
  quality: number = 0.8
): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        
        // Calculate new dimensions maintaining aspect ratio
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Canvas to blob conversion failed'));
              return;
            }
            
            const compressedFile = new File([blob], file.name, {
              type: 'image/webp',
              lastModified: Date.now(),
            });
            
            resolve(compressedFile);
          },
          'image/webp',
          quality
        );
      };
      
      img.onerror = () => reject(new Error('Image load failed'));
      img.src = e.target?.result as string;
    };
    
    reader.onerror = () => reject(new Error('File read failed'));
    reader.readAsDataURL(file);
  });
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
 * Batch preload multiple images
 */
export async function preloadImages(sources: string[]): Promise<void> {
  await Promise.all(sources.map(preloadImage));
}
