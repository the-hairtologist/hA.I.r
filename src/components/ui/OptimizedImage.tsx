/**
 * Optimized Image Component
 * Implements lazy loading, responsive sizing, and progressive loading
 */

import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { createBlurPlaceholder } from '@/lib/performance/imageOptimization';

interface OptimizedImageProps
  extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  aspectRatio?: '1/1' | '16/9' | '4/3' | '3/2';
  className?: string;
}

export const OptimizedImage = ({
  src,
  alt,
  width = 800,
  height = 600,
  priority = false,
  aspectRatio,
  className,
  ...props
}: OptimizedImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (priority) return; // Skip intersection observer for priority images

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before image is visible
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [priority]);

  const placeholderSrc = createBlurPlaceholder(width, height);

  const aspectRatioClass = aspectRatio
    ? {
        '1/1': 'aspect-square',
        '16/9': 'aspect-video',
        '4/3': 'aspect-[4/3]',
        '3/2': 'aspect-[3/2]',
      }[aspectRatio]
    : '';

  return (
    <div
      className={cn(
        'relative overflow-hidden bg-muted',
        aspectRatioClass,
        className
      )}
    >
      {/* Blur placeholder */}
      <img
        src={placeholderSrc}
        alt=""
        className={cn(
          'absolute inset-0 w-full h-full object-cover transition-opacity duration-300',
          isLoaded ? 'opacity-0' : 'opacity-100'
        )}
        aria-hidden="true"
      />

      {/* Actual image */}
      <img
        ref={imgRef}
        src={isInView ? src : placeholderSrc}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        onLoad={() => setIsLoaded(true)}
        className={cn(
          'w-full h-full object-cover transition-opacity duration-300',
          isLoaded ? 'opacity-100' : 'opacity-0'
        )}
        {...props}
      />
    </div>
  );
};
