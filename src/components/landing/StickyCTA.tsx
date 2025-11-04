import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Platform } from '@/platform';
import { analytics } from '@/lib/analytics';

interface StickyCTAProps {
  ctaText: string;
}

const STORAGE_KEY = 'hair_sticky_cta_dismissed';

export const StickyCTA = ({ ctaText }: StickyCTAProps) => {
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
      const scrollPercent =
        (window.scrollY / (document.body.scrollHeight - window.innerHeight)) *
        100;
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
    analytics.track('sticky_cta_dismissed');
  };

  const handleClick = async () => {
    // Haptic feedback
    if (!Platform.isWeb) {
      await Haptics.impact({ style: ImpactStyle.Medium });
    }

    analytics.track('sticky_cta_clicked');
    navigate('/auth');
  };

  // Hide on desktop or if dismissed
  if (isDismissed || typeof window === 'undefined') return null;

  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-40 lg:hidden transition-transform duration-300 max-w-[90vw] ${
        isVisible ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <div className="bg-secondary brutal-border rounded-full shadow-brutal-lg pl-4 pr-2 py-2">
        <div className="flex items-center gap-2">
          <Button
            onClick={handleClick}
            className="font-pixel text-xs xs:text-sm uppercase bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 rounded-none h-10 px-6 py-2"
          >
            {ctaText}
          </Button>
          <button
            onClick={handleDismiss}
            className="flex items-center justify-center hover:opacity-70 transition-opacity flex-shrink-0"
            aria-label="Dismiss sticky CTA"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
