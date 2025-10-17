/**
 * Image Optimization Utilities
 * Ensures all images are loaded efficiently with modern best practices
 */

/**
 * Automatically add loading attributes to all images on the page
 * Called by performance optimizer
 */
export const optimizePageImages = () => {
  // Add lazy loading to images without it
  const images = document.querySelectorAll<HTMLImageElement>('img:not([loading])');
  images.forEach((img) => {
    // Skip images that are above the fold (first 800px)
    const rect = img.getBoundingClientRect();
    const isAboveFold = rect.top < 800;
    
    if (!isAboveFold) {
      img.setAttribute('loading', 'lazy');
    }
    
    // Always add async decoding
    img.setAttribute('decoding', 'async');
    
    // Add error handling
    if (!img.onerror) {
      img.onerror = () => {
        console.warn('Image failed to load:', img.src);
        // Set a fallback or placeholder if needed
        img.style.backgroundColor = '#f0f0f0';
      };
    }
  });

  console.log(`✅ Optimized ${images.length} images for lazy loading`);
};

/**
 * Preload critical images (above the fold)
 */
export const preloadCriticalImages = (urls: string[]) => {
  urls.forEach((url) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = url;
    document.head.appendChild(link);
  });
};

/**
 * Check if image format is optimal
 */
export const isModernImageFormat = (url: string): boolean => {
  const modernFormats = ['.webp', '.avif'];
  return modernFormats.some(format => url.toLowerCase().endsWith(format));
};

/**
 * Get recommended image format based on browser support
 */
export const getRecommendedFormat = (): 'avif' | 'webp' | 'jpeg' => {
  // Check AVIF support
  const avifSupport = document.createElement('canvas')
    .toDataURL('image/avif')
    .indexOf('data:image/avif') === 0;
  
  if (avifSupport) return 'avif';

  // Check WebP support
  const webpSupport = document.createElement('canvas')
    .toDataURL('image/webp')
    .indexOf('data:image/webp') === 0;
  
  if (webpSupport) return 'webp';

  return 'jpeg';
};

/**
 * Generate responsive image srcset
 */
export const generateSrcSet = (baseUrl: string, sizes: number[]): string => {
  return sizes.map(size => `${baseUrl}?w=${size} ${size}w`).join(', ');
};

/**
 * Image optimization configuration
 */
export const IMAGE_CONFIG = {
  // Quality settings
  quality: {
    thumbnail: 60,
    medium: 75,
    high: 85,
  },
  
  // Size breakpoints
  breakpoints: {
    mobile: 640,
    tablet: 768,
    desktop: 1024,
    wide: 1920,
  },
  
  // Lazy loading intersection observer options
  lazyLoadOptions: {
    root: null,
    rootMargin: '50px',
    threshold: 0.01,
  },
};

/**
 * Create intersection observer for lazy loading
 */
export const createLazyLoadObserver = (
  callback: (img: HTMLImageElement) => void
): IntersectionObserver => {
  return new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        callback(img);
      }
    });
  }, IMAGE_CONFIG.lazyLoadOptions);
};
