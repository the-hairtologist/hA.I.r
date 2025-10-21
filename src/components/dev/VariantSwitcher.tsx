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
    <div className="fixed bottom-4 right-4 z-[9999] bg-secondary backdrop-blur-md brutal-border border-white border-2 p-4 rounded-none brutal-shadow animate-fade-in">
      <div className="flex flex-col gap-2 min-w-[200px]">
        <div className="flex items-center justify-between mb-2 pb-2 border-b border-foreground/20">
          <span className="font-pixel text-[10px] text-foreground uppercase">A/B Tester</span>
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
                brutal-border transition-all duration-200
                ${currentVariant === variant 
                  ? 'bg-primary text-white border-white border-2 brutal-shadow-sm' 
                  : 'bg-white text-foreground border-foreground border-2 hover:bg-secondary/30 hover:brutal-shadow-xs'
                }
              `}
            >
              <div className="flex items-center justify-between">
                <span>Variant {variant}</span>
                {currentVariant === variant && (
                  <span className="text-[8px]">●</span>
                )}
              </div>
              <div className={`text-[8px] opacity-70 mt-0.5 normal-case font-sans text-left ${currentVariant === variant ? 'text-white' : 'text-foreground'}`}>
                {variant === 'A' && 'Pain-focused'}
                {variant === 'B' && 'Dream-building'}
                {variant === 'C' && 'Visual + Icons'}
              </div>
            </button>
          ))}
        </div>
        
        <div className="mt-2 pt-2 border-t border-foreground/20">
          <a
            href="/"
            className="block w-full px-3 py-2 text-center font-pixel text-[9px] uppercase
                     bg-destructive text-destructive-foreground brutal-border border-white border-2
                     hover:brutal-shadow-xs transition-all duration-200"
          >
            Clear Cache
          </a>
        </div>
        
        <div className="text-[8px] text-foreground/50 font-sans text-center mt-1">
          Dev mode only
        </div>
      </div>
    </div>
  );
}
