/**
 * Responsive Image Component
 * - Enhanced lazy loading with Intersection Observer
 * - Device-specific optimization
 * - Progressive loading with blur placeholder
 * - Automatic error handling
 */

import { useState, useEffect, useRef } from 'react';
import {
  getOptimizedImageUrl,
  getDeviceCapabilities,
} from '@/lib/performanceOptimizer';
import { cn } from '@/lib/utils';

interface ResponsiveImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  aspectRatio?: '1/1' | '16/9' | '4/3' | '3/2' | '21/9';
  onLoad?: () => void;
  onError?: () => void;
}

export const ResponsiveImage = ({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  objectFit = 'cover',
  aspectRatio,
  onLoad,
  onError,
}: ResponsiveImageProps) => {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const { pixelRatio } = getDeviceCapabilities();

    // For priority images, load immediately
    if (priority) {
      const optimizedSrc = width
        ? getOptimizedImageUrl(src, width, height)
        : src;
      setImageSrc(optimizedSrc);
      return;
    }

    // For non-priority images, use IntersectionObserver
    if (!imgRef.current) return;

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const optimizedSrc = width
              ? getOptimizedImageUrl(src, width, height)
              : src;
            setImageSrc(optimizedSrc);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before entering viewport
      }
    );

    observer.observe(imgRef.current);

    return () => observer.disconnect();
  }, [src, width, height, priority]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  const aspectRatioClasses = {
    '1/1': 'aspect-square',
    '16/9': 'aspect-video',
    '4/3': 'aspect-[4/3]',
    '3/2': 'aspect-[3/2]',
    '21/9': 'aspect-[21/9]',
  };

  return (
    <div
      ref={imgRef}
      className={cn(
        'relative overflow-hidden bg-muted',
        aspectRatio && aspectRatioClasses[aspectRatio],
        className
      )}
      style={{ width, height }}
    >
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 animate-pulse bg-muted" />
      )}

      {imageSrc && !hasError && (
        <img
          src={imageSrc}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            'transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0',
            objectFit === 'cover' && 'object-cover',
            objectFit === 'contain' && 'object-contain',
            objectFit === 'fill' && 'object-fill',
            objectFit === 'none' && 'object-none',
            objectFit === 'scale-down' && 'object-scale-down',
            'w-full h-full'
          )}
        />
      )}

      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground text-xs sm:text-sm">
          Failed to load image
        </div>
      )}
    </div>
  );
};
