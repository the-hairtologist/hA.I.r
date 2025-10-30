import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Scissors,
  Clock,
  Zap,
  DollarSign,
  Calendar,
  Palette,
  Smartphone,
} from 'lucide-react';
import { MinimalFeatures } from '@/components/landing/MinimalFeatures';
import { MinimalFAQ } from '@/components/landing/MinimalFAQ';
import { MinimalFooter } from '@/components/landing/MinimalFooter';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';
import { ScrollIndicator } from '@/components/ui/ScrollIndicator';
import { lazy, Suspense, useEffect } from 'react';
import { logger } from '@/lib/logging/productionLogger';

const HeroPhoneMockup = lazy(() =>
  import('@/components/landing/HeroPhoneMockup').then(m => ({
    default: m.HeroPhoneMockup,
  }))
);

interface LandingVariantCProps {
  onCTAClick: () => void;
}

/**
 * Variant C: Benefit/outcome focused
 * Headline: "Save 10+ Hours Every Week"
 */
export const LandingVariantC = ({ onCTAClick }: LandingVariantCProps) => {
  const navigate = useNavigate();

  useEffect(() => {
    logger.info('[Landing Variant C] Rendered', { variant: 'C' });
  }, []);

  return (
    <>
      <main id="main-content" className="pt-16">
        {/* Hero Section - Benefit focused */}
        <section
          className="relative bg-secondary py-4 xs:py-6 sm:py-8 md:py-12 lg:py-16 overflow-hidden flex items-center"
          style={{
            backgroundImage: `
            linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.05) 50%, transparent 100%),
            linear-gradient(0deg, transparent 0%, rgba(0,0,0,0.05) 50%, transparent 100%)
          `,
            backgroundSize: '8px 8px',
          }}
        >
          <div className="container mx-auto px-3 xs:px-4 sm:px-6 text-center relative z-10 w-full max-w-full">
            <div className="max-w-4xl mx-auto space-y-1.5 xxs:space-y-2 xs:space-y-3 sm:space-y-4">
              {/* Benefit Icons */}
              <div className="flex justify-center gap-4 sm:gap-5 mb-3 sm:mb-4 animate-fade-in">
                <div className="w-11 h-11 xs:w-12 xs:h-12 sm:w-14 sm:h-14 brutal-border-4 border-black bg-secondary flex items-center justify-center animate-bounce brutal-shadow-md">
                  <Clock
                    className="h-5 w-5 xs:h-6 xs:w-6 sm:h-7 sm:w-7 text-black"
                    strokeWidth={2.5}
                  />
                </div>
                <div
                  className="w-11 h-11 xs:w-12 xs:h-12 sm:w-14 sm:h-14 brutal-border-4 border-black bg-success flex items-center justify-center animate-bounce brutal-shadow-md"
                  style={{ animationDelay: '0.1s' }}
                >
                  <Zap
                    className="h-5 w-5 xs:h-6 xs:w-6 sm:h-7 sm:w-7 text-success-foreground"
                    strokeWidth={2.5}
                    fill="currentColor"
                  />
                </div>
                <div
                  className="w-11 h-11 xs:w-12 xs:h-12 sm:w-14 sm:h-14 brutal-border-4 border-black bg-secondary flex items-center justify-center animate-bounce brutal-shadow-md"
                  style={{ animationDelay: '0.2s' }}
                >
                  <DollarSign
                    className="h-5 w-5 xs:h-6 xs:w-6 sm:h-7 sm:w-7 text-black"
                    strokeWidth={2.5}
                  />
                </div>
              </div>

              <h1 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-pixel uppercase text-black leading-[1.3] xxs:leading-[1.4] xs:leading-relaxed tracking-wide xs:tracking-wider drop-shadow-[2px_3px_0px_rgba(255,255,255,0.8)] animate-fade-in px-2 xs:px-4 break-words">
                SAVE 10+ HOURS
                <br className="hidden xxs:block" />
                <span className="xxs:hidden"> </span>EVERY WEEK
              </h1>

              <p
                className="text-xs xs:text-sm sm:text-base md:text-lg font-sans text-black max-w-3xl mx-auto leading-relaxed animate-fade-in px-3 xs:px-4 break-words"
                style={{ animationDelay: '100ms' }}
              >
                Stop wasting time on scheduling chaos. Automate bookings,
                reminders, and follow-ups instantly
              </p>

              <div
                className="pt-1 xs:pt-1.5 sm:pt-2 animate-fade-in px-3 xs:px-4"
                style={{ animationDelay: '200ms' }}
              >
                <Button
                  size="lg"
                  onClick={onCTAClick}
                  className="text-xs xxs:text-sm xs:text-base sm:text-lg md:text-xl px-6 xxs:px-7 xs:px-8 sm:px-10 md:px-14 py-3.5 xxs:py-4 xs:py-5 sm:py-6 md:py-8 font-pixel uppercase bg-success text-success-foreground hover:bg-success/90 brutal-border border-black animate-pulse-subtle min-h-[52px] xxs:min-h-[56px] xs:min-h-[60px] w-full max-w-[90vw] xs:w-auto"
                  style={{
                    boxShadow:
                      '6px 6px 0px rgba(0,0,0,0.8), 10px 10px 0px rgba(0,0,0,0.4)',
                  }}
                >
                  START FREE TRIAL
                </Button>
              </div>

              <p
                className="text-[8px] xxs:text-[9px] xs:text-[10px] font-sans text-black/80 animate-fade-in px-3 break-words"
                style={{ animationDelay: '300ms' }}
              >
                ✓ No Credit Card Required • ✓ 14-Day Free Trial • ✓ Cancel
                Anytime
              </p>

              <div
                className="mt-1.5 xs:mt-2 sm:mt-3 animate-fade-in"
                style={{ animationDelay: '400ms' }}
              >
                <Suspense
                  fallback={
                    <div className="relative w-full max-w-[180px] xs:max-w-[220px] sm:max-w-[280px] md:max-w-[320px] mx-auto h-[400px] xs:h-[450px] sm:h-[500px] border-[4px] border-black bg-white/10 backdrop-blur-sm rounded-[32px] animate-pulse" />
                  }
                >
                  <HeroPhoneMockup />
                </Suspense>
              </div>

              <div
                className="grid grid-cols-2 sm:grid-cols-4 gap-3 xs:gap-4 sm:gap-6 max-w-3xl mx-auto pt-4 xs:pt-5 sm:pt-6 animate-fade-in"
                style={{ animationDelay: '500ms' }}
              >
                <AnimatedCounter
                  end={5000}
                  suffix="+"
                  icon={Scissors}
                  label="STYLISTS"
                  bgColor="bg-secondary"
                  borderColor="border-black"
                  textColor="text-black"
                />
                <AnimatedCounter
                  end={50000}
                  suffix="+"
                  icon={Calendar}
                  label="BOOKINGS"
                  bgColor="bg-secondary"
                  borderColor="border-black"
                  textColor="text-black"
                />
                <AnimatedCounter
                  end={10000}
                  suffix="+"
                  icon={Palette}
                  label="FORMULAS"
                  bgColor="bg-secondary"
                  borderColor="border-black"
                  textColor="text-black"
                />
                <AnimatedCounter
                  end={4.9}
                  suffix="/5"
                  icon={Smartphone}
                  label="RATING"
                  duration={1200}
                  bgColor="bg-secondary"
                  borderColor="border-black"
                  textColor="text-black"
                />
              </div>
            </div>
          </div>
          <ScrollIndicator />
        </section>

        <section
          className="bg-background"
          style={{
            backgroundImage: `linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.01) 50%, transparent 100%)`,
            backgroundSize: '8px 8px',
          }}
        >
          <MinimalFeatures />
        </section>

        <section
          className="bg-secondary"
          style={{
            backgroundImage: `linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.02) 50%, transparent 100%)`,
            backgroundSize: '8px 8px',
          }}
        >
          <MinimalFAQ />
        </section>
      </main>

      <MinimalFooter />
    </>
  );
};
