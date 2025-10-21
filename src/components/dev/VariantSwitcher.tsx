/**
 * Development-only A/B Testing Variant Switcher
 * Shows which variant is active and provides quick links to test others
 */

import { useState, useEffect } from 'react';
import { Variant } from '@/lib/abTestingSupabase';

export function VariantSwitcher() {
  const [currentVariant, setCurrentVariant] = useState<Variant | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show in development or when ?showVariants=true
    const urlParams = new URLSearchParams(window.location.search);
    const showVariants = urlParams.get('showVariants') === 'true' || 
                         import.meta.env.DEV;
    
    if (showVariants) {
      setIsVisible(true);
      // Detect current variant from URL or sessionStorage
      const variantParam = urlParams.get('variant')?.toUpperCase() as Variant;
      const sessionVariant = sessionStorage.getItem('ab_assigned_variant') as Variant;
      setCurrentVariant(variantParam || sessionVariant || 'A');
    }
  }, []);

  if (!isVisible) return null;

  const variants: Variant[] = ['A', 'B', 'C'];
  
  const switchVariant = (variant: Variant) => {
    // Update URL with new variant parameter
    const url = new URL(window.location.href);
    url.searchParams.set('variant', variant);
    window.location.href = url.toString();
  };

  return (
    <div className="fixed bottom-4 right-4 z-[9999] bg-black/90 backdrop-blur-md brutal-border border-white p-4 rounded-none shadow-[4px_4px_0px_0px_rgba(255,255,255,0.3)] animate-fade-in">
      <div className="flex flex-col gap-2 min-w-[200px]">
        <div className="flex items-center justify-between mb-2 pb-2 border-b border-white/20">
          <span className="font-pixel text-[10px] text-white uppercase">A/B Tester</span>
          <span className="font-pixel text-[10px] text-accent">
            {currentVariant || '?'}
          </span>
        </div>
        
        <div className="space-y-1">
          {variants.map((variant) => (
            <button
              key={variant}
              onClick={() => switchVariant(variant)}
              className={`
                w-full px-3 py-2 font-pixel text-[10px] uppercase
                brutal-border border-white transition-all duration-200
                ${currentVariant === variant 
                  ? 'bg-primary text-primary-foreground brutal-shadow-sm' 
                  : 'bg-white/10 text-white hover:bg-white/20 hover:brutal-shadow-xs'
                }
              `}
            >
              <div className="flex items-center justify-between">
                <span>Variant {variant}</span>
                {currentVariant === variant && (
                  <span className="text-[8px]">●</span>
                )}
              </div>
              <div className="text-[8px] opacity-70 mt-0.5 normal-case font-sans text-left">
                {variant === 'A' && 'Pain-focused'}
                {variant === 'B' && 'Dream-building'}
                {variant === 'C' && 'Visual + Icons'}
              </div>
            </button>
          ))}
        </div>
        
        <div className="mt-2 pt-2 border-t border-white/20">
          <a
            href="/"
            className="block w-full px-3 py-2 text-center font-pixel text-[9px] uppercase
                     bg-destructive text-destructive-foreground brutal-border border-white
                     hover:brutal-shadow-xs transition-all duration-200"
          >
            Clear Cache
          </a>
        </div>
        
        <div className="text-[8px] text-white/50 font-sans text-center mt-1">
          Dev mode only
        </div>
      </div>
    </div>
  );
}
