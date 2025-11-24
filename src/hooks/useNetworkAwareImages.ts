/**
 * Network-Aware Image Loading Hook
 * Adjusts image quality based on network conditions
 */

import { useMemo } from 'react';
import { useNetworkStatus } from './useNetworkStatus';

export interface ImageOptimizationSettings {
  quality: number;
  maxWidth: number;
  format: 'webp' | 'jpeg' | 'png';
  lazy: boolean;
}

/**
 * Hook that returns optimal image settings based on network quality
 */
export function useNetworkAwareImages(): ImageOptimizationSettings {
  const networkStatus = useNetworkStatus();

  return useMemo(() => {
    const { quality, isOnline } = networkStatus;

    // Offline: don't load images
    if (!isOnline) {
      return {
        quality: 10,
        maxWidth: 100,
        format: 'jpeg',
        lazy: true,
      };
    }

    // Slow network (2G/3G): ultra-low quality
    if (quality === 'slow') {
      return {
        quality: 50,
        maxWidth: 400,
        format: 'webp',
        lazy: true,
      };
    }

    // Moderate network: reduced quality
    if (quality === 'moderate') {
      return {
        quality: 70,
        maxWidth: 800,
        format: 'webp',
        lazy: true,
      };
    }

    // Good/Excellent: full quality
    return {
      quality: 85,
      maxWidth: 1600,
      format: 'webp',
      lazy: false,
    };
  }, [networkStatus]);
}

/**
 * Get optimized Supabase storage URL with transformations
 */
export function getOptimizedImageUrl(
  baseUrl: string,
  settings: ImageOptimizationSettings
): string {
  if (!baseUrl || !baseUrl.includes('supabase.co/storage')) {
    return baseUrl;
  }

  try {
    const url = new URL(baseUrl);
    url.searchParams.set('quality', settings.quality.toString());
    url.searchParams.set('width', settings.maxWidth.toString());
    url.searchParams.set('format', settings.format);
    return url.toString();
  } catch {
    return baseUrl;
  }
}
