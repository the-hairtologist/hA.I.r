/**
 * Optimized Image Component
 * Automatic lazy loading, blur placeholder, WebP support
 */

import { cn } from '@/lib/utils';
import { useLazyImage, generateBlurDataURL, generateSrcSet, getOptimalImageSize } from '@/lib/performance/ImageOptimization';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  quality?: number;
  blur?: boolean;
  width?: number;
  height?: number;
}

export const OptimizedImage = ({
  src,
  alt,
  className,
  priority = false,
  blur = true,
  width,
  height,
  ...props
}: OptimizedImageProps) => {
  const { imgRef, imageSrc, isLoaded, setIsLoaded } = useLazyImage(src);
  const { width: optimalWidth } = getOptimalImageSize();

  // Use src immediately if priority, otherwise wait for lazy load
  const currentSrc = priority ? src : imageSrc;

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Blur placeholder */}
      {blur && !isLoaded && width && height && (
        <img
          src={generateBlurDataURL(width, height)}
          alt=""
          className="absolute inset-0 blur-sm scale-105"
          aria-hidden="true"
        />
      )}
      
      {/* Actual image */}
      <img
        ref={imgRef}
        src={currentSrc || undefined}
        srcSet={currentSrc ? generateSrcSet(currentSrc) : undefined}
        sizes={`(max-width: 640px) 100vw, (max-width: 1024px) 50vw, ${optimalWidth}px`}
        alt={alt}
        className={cn(
          'transition-opacity duration-300',
          isLoaded ? 'opacity-100' : 'opacity-0'
        )}
        loading={priority ? 'eager' : 'lazy'}
        onLoad={() => setIsLoaded(true)}
        {...props}
      />
    </div>
  );
};
