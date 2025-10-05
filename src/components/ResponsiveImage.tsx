/**
 * Responsive Image Component
 * Automatically optimizes images for different devices and pixel densities
 */

import { useState, useEffect } from 'react';
import { getOptimizedImageUrl, getDeviceCapabilities } from '@/lib/performanceOptimizer';
import { cn } from '@/lib/utils';

interface ResponsiveImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
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
  onLoad,
  onError,
}: ResponsiveImageProps) => {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const { deviceType, pixelRatio, isSlowConnection } = getDeviceCapabilities();
    
    // For priority images, load immediately
    if (priority) {
      setImageSrc(src);
      return;
    }

    // For non-priority images, use IntersectionObserver
    const img = new Image();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Optimize image URL based on device
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

    const element = document.getElementById(`img-${src}`);
    if (element) {
      observer.observe(element);
    }

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

  return (
    <div
      id={`img-${src}`}
      className={cn(
        'relative overflow-hidden bg-muted',
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
          style={{
            width: '100%',
            height: '100%',
          }}
        />
      )}
      
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground text-sm">
          Failed to load image
        </div>
      )}
    </div>
  );
};
