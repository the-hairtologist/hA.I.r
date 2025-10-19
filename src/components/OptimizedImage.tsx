import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}

export function OptimizedImage({ 
  src, 
  alt, 
  className, 
  sizes = '100vw',
  priority = false 
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (priority) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '50px' }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority]);

  // Generate WebP URL if possible
  const webpSrc = src.includes('.supabase.co') 
    ? src.replace(/\.(jpg|jpeg|png)/, '.webp')
    : src;

  return (
    <div className={cn('relative overflow-hidden bg-muted', className)}>
      {!isLoaded && (
        <div className="absolute inset-0 animate-pulse bg-muted" />
      )}
      {isInView && (
        <picture>
          <source srcSet={webpSrc} type="image/webp" />
          <img
            ref={imgRef}
            src={src}
            alt={alt}
            sizes={sizes}
            loading={priority ? 'eager' : 'lazy'}
            onLoad={() => setIsLoaded(true)}
            className={cn(
              'w-full h-full object-cover transition-opacity duration-300',
              isLoaded ? 'opacity-100' : 'opacity-0',
              className
            )}
          />
        </picture>
      )}
    </div>
  );
}
