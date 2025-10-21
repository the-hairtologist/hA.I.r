import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Platform } from '@/platform';
import { analytics } from '@/lib/analytics';
import { Variant } from '@/lib/abTestingSupabase';

interface StickyCTAProps {
  ctaText: string;
  variant: Variant;
}

const STORAGE_KEY = 'hair_sticky_cta_dismissed';

export const StickyCTA = ({ ctaText, variant }: StickyCTAProps) => {
  const navigate = useNavigate();
  const [isDismissed, setIsDismissed] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Check if dismissed on mount
  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (dismissed === 'true') {
      setIsDismissed(true);
    }
  }, []);

  // Track scroll position to show after 20%
  useEffect(() => {
    const handleScroll = () => {
      const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
      setIsVisible(scrollPercent > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleDismiss = async () => {
    // Haptic feedback
    if (!Platform.isWeb) {
      await Haptics.impact({ style: ImpactStyle.Light });
    }

    setIsDismissed(true);
    localStorage.setItem(STORAGE_KEY, 'true');
    analytics.track('sticky_cta_dismissed', { variant });
  };

  const handleClick = async () => {
    // Haptic feedback
    if (!Platform.isWeb) {
      await Haptics.impact({ style: ImpactStyle.Medium });
    }

    analytics.track('sticky_cta_clicked', { variant });
    navigate('/auth');
  };

  // Hide on desktop or if dismissed
  if (isDismissed || typeof window === 'undefined') return null;

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 lg:hidden transition-transform duration-300 ${
        isVisible ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <div className="bg-secondary brutal-border border-t-4 border-black p-3 xs:p-4 shadow-[0_-8px_16px_rgba(0,0,0,0.2)]">
        <div className="container mx-auto flex items-center gap-3 xs:gap-4">
          <Button
            onClick={handleClick}
            className="flex-1 font-pixel text-xs xs:text-sm uppercase bg-primary text-primary-foreground hover:bg-primary/90 brutal-border border-black brutal-shadow hover:brutal-shadow-md transition-all duration-300 rounded-none min-h-[56px] py-3 xs:py-4"
          >
            {ctaText}
          </Button>
          <button
            onClick={handleDismiss}
            className="w-12 h-12 xs:w-14 xs:h-14 brutal-border border-black bg-background flex items-center justify-center hover:bg-background/90 transition-colors flex-shrink-0"
            aria-label="Dismiss sticky CTA"
          >
            <X className="h-5 w-5 xs:h-6 xs:w-6" />
          </button>
        </div>
      </div>
    </div>
  );
};
