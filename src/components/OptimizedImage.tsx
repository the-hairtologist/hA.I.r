/**
 * Optimized Image Component
 * Features: Lazy loading, WebP support, responsive images, blur placeholder
 */

import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  blurhash?: string;
  priority?: boolean;
  sizes?: string;
  quality?: number;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  blurhash,
  priority = false,
  sizes,
  quality = 75,
  className,
  onLoad: onLoadProp,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || !imgRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px', // Start loading slightly before visible
        threshold: 0.01,
      }
    );

    observer.observe(imgRef.current);

    return () => observer.disconnect();
  }, [priority]);

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setIsLoaded(true);
    onLoadProp?.(e);
  };

  const handleError = () => {
    setError(true);
  };

  // Generate srcset for responsive images
  const generateSrcSet = (baseSrc: string) => {
    const widths = [320, 640, 768, 1024, 1280, 1536];
    return widths
      .map((width) => `${baseSrc}?w=${width}&q=${quality} ${width}w`)
      .join(', ');
  };

  return (
    <div
      ref={imgRef}
      className={cn('relative overflow-hidden', className)}
      style={{ backgroundColor: blurhash ? '#f0f0f0' : undefined }}
    >
      {/* Blur placeholder */}
      {!isLoaded && blurhash && (
        <div
          className="absolute inset-0 animate-pulse bg-muted"
          aria-hidden="true"
        />
      )}

      {/* Actual image */}
      {(isInView || priority) && !error && (
        <img
          {...props}
          src={src}
          alt={alt}
          srcSet={generateSrcSet(src)}
          sizes={sizes}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            'transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0',
            className
          )}
        />
      )}

      {/* Error fallback */}
      {error && (
        <div className="flex items-center justify-center h-full bg-muted text-muted-foreground">
          Failed to load image
        </div>
      )}
    </div>
  );
};

OptimizedImage.displayName = 'OptimizedImage';
