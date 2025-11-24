import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Scissors } from 'lucide-react';
import { useEffect } from 'react';
import { logger } from '@/lib/logging/productionLogger';
import { useScrollDepthTracking } from '@/hooks/useScrollDepthTracking';
import { analytics } from '@/lib/analytics';
import { useABTest } from '@/hooks/useABTest';
import { LandingVariantA } from '@/components/landing/LandingVariantA';
import { LandingVariantB } from '@/components/landing/LandingVariantB';
import { LandingVariantC } from '@/components/landing/LandingVariantC';

const Index = () => {
  const navigate = useNavigate();
  const { variant, isLoading, trackConversion } = useABTest();

  // Track scroll depth milestones
  useScrollDepthTracking({ enabled: true });

  useEffect(() => {
    logger.info('[Index] Component mounted', {
      context: 'Landing Page',
      variant,
    });

    // Track page load time
    const startTime = Date.now();
    return () => {
      const timeOnPage = Math.floor((Date.now() - startTime) / 1000);
      analytics.track('time_on_page', { seconds: timeOnPage, variant });
    };
  }, [variant]);

  const handleCTAClick = () => {
    trackConversion('cta_click');
    logger.info('[Index] CTA button clicked', {
      context: 'Landing Page',
      variant,
    });
    navigate('/auth');
  };

  // Show loading state briefly to avoid flash
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-center">
          <Scissors className="h-12 w-12 mx-auto mb-4 text-primary" />
          <p className="font-pixel text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background scroll-smooth">
      {/* Skip to main content for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:m-2"
      >
        Skip to main content
      </a>

      <header
        className="fixed top-0 left-0 right-0 z-50 bg-black brutal-border border-black"
        role="banner"
        style={{
          backgroundImage: `
          linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.05) 50%, transparent 100%),
          linear-gradient(0deg, transparent 0%, rgba(255,255,255,0.05) 50%, transparent 100%)
        `,
          backgroundSize: '8px 8px',
        }}
      >
        <div className="container mx-auto px-3 xs:px-4 sm:px-6 py-2.5 xs:py-3 sm:py-4 flex items-center justify-between max-w-full overflow-hidden">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1 xs:gap-1.5 sm:gap-2 hover:opacity-80 transition-opacity min-w-0 min-h-[44px] focus-visible:ring-4 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:outline-none rounded-sm"
          >
            <div className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 brutal-border border-white bg-primary flex items-center justify-center flex-shrink-0">
              <Scissors className="h-3 w-3 xs:h-3.5 xs:w-3.5 sm:h-4 sm:w-4 text-primary-foreground" />
            </div>
            <span className="text-xs xs:text-sm sm:text-base font-pixel text-white uppercase truncate">
              hA.I.r
            </span>
          </button>
          <Button
            onClick={handleCTAClick}
            size="sm"
            className="font-pixel text-xs sm:text-sm uppercase bg-accent text-accent-foreground hover:bg-accent/90 brutal-border border-white brutal-shadow-sm hover:brutal-shadow-md transition-all duration-300 hover:-translate-y-0.5 rounded-none px-4 xs:px-6 py-2.5 xs:py-3 min-h-[44px] flex-shrink-0"
          >
            <span className="hidden xxs:inline">Get Started</span>
            <span className="xxs:hidden">Start</span>
          </Button>
        </div>
      </header>

      {/* Render the appropriate variant */}
      {variant === 'A' && <LandingVariantA onCTAClick={handleCTAClick} />}
      {variant === 'B' && <LandingVariantB onCTAClick={handleCTAClick} />}
      {variant === 'C' && <LandingVariantC onCTAClick={handleCTAClick} />}
    </div>
  );
};

export default Index;
