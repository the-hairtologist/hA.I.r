import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Scissors, Calendar, Palette, Smartphone } from "lucide-react";
import { useABTest } from "@/hooks/useABTest";
import { MinimalFeatures } from "@/components/landing/MinimalFeatures";
import { SingleTestimonial } from "@/components/landing/SingleTestimonial";
import { SimplePricingCTA } from "@/components/landing/SimplePricingCTA";
import { MinimalFAQ } from "@/components/landing/MinimalFAQ";
import { EnhancedFooter } from "@/components/landing/EnhancedFooter";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { ScrollIndicator } from "@/components/ui/ScrollIndicator";
import { FinalValueProp } from "@/components/landing/FinalValueProp";
import { lazy, Suspense, useEffect } from "react";
import { logger } from "@/lib/productionLogger";

// Lazy load phone mockup to improve initial load time
const HeroPhoneMockup = lazy(() => {
  logger.info('[Index] Lazy loading HeroPhoneMockup...', { context: 'Landing Page' });
  return import("@/components/landing/HeroPhoneMockup").then(m => {
    logger.info('[Index] HeroPhoneMockup loaded successfully', { context: 'Landing Page' });
    return { default: m.HeroPhoneMockup };
  }).catch(error => {
    logger.error('[Index] HeroPhoneMockup lazy load FAILED', error, { context: 'Landing Page' });
    throw error;
  });
});

const Index = () => {
  const navigate = useNavigate();
  const { config } = useABTest();

  useEffect(() => {
    logger.info('[Index] Component mounted', { context: 'Landing Page' });
    logger.info('[Index] Config received from useABTest', {
      context: 'Landing Page',
      data: {
        headline: config.hero.headline,
        subheadline: config.hero.subheadline,
        ctaPrimary: config.cta.primary
      }
    });
  }, [config]);

  return (
    <div className="min-h-screen bg-background scroll-smooth">
      {/* Skip to main content for accessibility */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:m-2"
      >
        Skip to main content
      </a>
      
      <header className="fixed top-0 left-0 right-0 z-50 bg-black brutal-border border-black" role="banner" style={{
        backgroundImage: `
          linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.05) 50%, transparent 100%),
          linear-gradient(0deg, transparent 0%, rgba(255,255,255,0.05) 50%, transparent 100%)
        `,
        backgroundSize: '8px 8px'
      }}>
        <div className="container mx-auto px-3 xs:px-4 sm:px-6 py-2.5 xs:py-3 sm:py-4 flex items-center justify-between max-w-full overflow-hidden">
          <button onClick={() => navigate("/")} className="flex items-center gap-1 xs:gap-1.5 sm:gap-2 hover:opacity-80 transition-opacity min-w-0">
            <div className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 brutal-border border-white bg-primary flex items-center justify-center flex-shrink-0">
              <Scissors className="h-3 w-3 xs:h-3.5 xs:w-3.5 sm:h-4 sm:w-4 text-primary-foreground" />
            </div>
            <span className="text-xs xs:text-sm sm:text-base font-pixel text-white uppercase truncate">hA.I.r</span>
          </button>
          <Button 
            onClick={() => navigate("/auth")} 
            size="sm" 
            className="font-pixel text-[9px] xxs:text-[10px] xs:text-xs uppercase bg-accent text-accent-foreground hover:bg-accent/90 brutal-border border-white brutal-shadow-sm hover:brutal-shadow-md transition-all duration-300 hover:-translate-y-0.5 rounded-none px-3 xxs:px-4 xs:px-6 py-2 xs:py-2.5 min-h-[44px] flex-shrink-0"
          >
            <span className="hidden xxs:inline">Get Started</span>
            <span className="xxs:hidden">Start</span>
          </Button>
        </div>
      </header>

      <main id="main-content" className="pt-16">
        {/* Hero Section - Pixelated LEGO vibes */}
        <section className="relative bg-primary py-12 xxs:py-16 xs:py-20 sm:py-24 md:py-32 overflow-hidden min-h-screen flex items-center" style={{
          backgroundImage: `
            linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.05) 50%, transparent 100%),
            linear-gradient(0deg, transparent 0%, rgba(0,0,0,0.05) 50%, transparent 100%)
          `,
          backgroundSize: '8px 8px'
        }}>
          <div className="container mx-auto px-4 xs:px-5 sm:px-6 text-center relative z-10 w-full max-w-full">
            <div className="max-w-4xl mx-auto space-y-4 xxs:space-y-6 xs:space-y-8">
              <h1 
                className="text-xl xxs:text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-pixel uppercase text-primary-foreground leading-[1.3] xxs:leading-[1.4] xs:leading-relaxed tracking-wide xs:tracking-wider drop-shadow-[2px_2px_0px_rgba(0,0,0,0.3)] xs:drop-shadow-[3px_3px_0px_rgba(0,0,0,0.3)] md:drop-shadow-[4px_4px_0px_rgba(0,0,0,0.3)] animate-fade-in px-2 xs:px-4 break-words"
                data-debug-element="hero-headline"
              >
                {config.hero.headline.split(' ').map((word, i, arr) => (
                  i < arr.length / 2 ? word + ' ' : (i === Math.floor(arr.length / 2) ? <><br className="hidden xxs:block" /><span className="xxs:hidden"> </span>{word} </> : word + ' ')
                ))}
              </h1>
              
              <p 
                className="text-sm xxs:text-base xs:text-lg sm:text-xl md:text-2xl font-sans text-primary-foreground max-w-3xl mx-auto leading-relaxed xs:leading-loose animate-fade-in px-3 xs:px-4 break-words" 
                style={{ animationDelay: '100ms' }}
                data-debug-element="hero-subheadline"
              >
                {config.hero.subheadline}
              </p>
              
              <div className="pt-3 xxs:pt-4 xs:pt-6 animate-fade-in px-3 xs:px-4" style={{ animationDelay: '200ms' }}>
                <Button 
                  size="lg" 
                  onClick={() => {
                    logger.info('[Index] CTA button clicked', { context: 'Landing Page' });
                    navigate("/auth");
                  }} 
                  className="text-xs xxs:text-sm xs:text-base sm:text-lg md:text-xl px-6 xxs:px-7 xs:px-8 sm:px-10 md:px-14 py-4 xxs:py-5 xs:py-6 sm:py-7 md:py-9 font-pixel uppercase bg-secondary text-secondary-foreground hover:bg-secondary/90 brutal-border border-black brutal-shadow-md hover:brutal-shadow-lg transition-all duration-300 hover:-translate-y-1 xs:hover:-translate-y-2 rounded-none animate-pulse-subtle min-h-[52px] xxs:min-h-[56px] xs:min-h-[60px] w-full max-w-[90vw] xs:w-auto"
                  data-debug-element="hero-cta-button"
                >
                  {config.cta.primary}
                </Button>
              </div>
              
              <p className="text-[10px] xxs:text-xs xs:text-sm sm:text-base font-sans text-primary-foreground/90 animate-fade-in px-3 break-words" style={{ animationDelay: '300ms' }}>
                {config.cta.secondary}
              </p>

              {/* Product Demo Mockup - Lazy loaded for performance */}
              <div className="mt-8 xs:mt-12 sm:mt-16 animate-fade-in" style={{ animationDelay: '400ms' }}>
                <Suspense fallback={
                  <div className="relative w-full max-w-[280px] xs:max-w-[320px] sm:max-w-[360px] mx-auto h-[500px] border-[4px] border-black bg-white/10 backdrop-blur-sm shadow-[12px_12px_0px_0px_rgba(0,0,0,0.3)] rounded-[32px] animate-pulse" data-debug-element="phone-mockup-loading" />
                }>
                  <div data-debug-element="phone-mockup-loaded">
                    <HeroPhoneMockup />
                  </div>
                </Suspense>
              </div>
            </div>
          </div>
          <ScrollIndicator />
        </section>

        {/* How It Works - Clean white background */}
        <section className="py-20 bg-background" style={{
          backgroundImage: `
            linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.01) 50%, transparent 100%),
            linear-gradient(0deg, transparent 0%, rgba(0,0,0,0.01) 50%, transparent 100%)
          `,
          backgroundSize: '8px 8px'
        }}>
          <MinimalFeatures />
        </section>

        {/* Testimonial Section - Blue background */}
        <section className="py-20 bg-accent">
          <SingleTestimonial />
        </section>

        {/* FOMO/CTA Section - Bold yellow */}
        <section className="py-20 bg-secondary" style={{
          backgroundImage: `
            linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.05) 50%, transparent 100%),
            linear-gradient(0deg, transparent 0%, rgba(0,0,0,0.05) 50%, transparent 100%)
          `,
          backgroundSize: '8px 8px'
        }}>
          <SimplePricingCTA />
        </section>

        {/* FAQ Section - Blue background */}
        <section className="py-20 bg-accent">
          <MinimalFAQ />
        </section>

        {/* Stats Section - Yellow background for excitement */}
        <section className="py-10 xs:py-12 sm:py-14 md:py-16 bg-accent brutal-border border-black" style={{
        backgroundImage: `
          linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.05) 50%, transparent 100%),
          linear-gradient(0deg, transparent 0%, rgba(0,0,0,0.05) 50%, transparent 100%)
        `,
        backgroundSize: '8px 8px'
      }}>
        <div className="container mx-auto px-4 xs:px-5 sm:px-6">
          <div className="text-center mb-8 xs:mb-10 sm:mb-12">
            <div className="inline-block brutal-border border-black bg-secondary px-4 xs:px-6 py-2 xs:py-3 brutal-shadow-sm mb-4 xs:mb-6">
              <span className="font-pixel text-xs xs:text-sm text-secondary-foreground uppercase">REAL RESULTS</span>
            </div>
            <h2 className="font-pixel text-sm xxs:text-base xs:text-lg sm:text-xl md:text-2xl text-accent-foreground uppercase tracking-wide xs:tracking-wider px-2 xs:px-4 leading-tight break-words">
              STYLISTS USING hA.I.r<br className="xs:hidden" /><span className="hidden xs:inline"> </span>CUT ADMIN TIME BY 40%
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 xxs:gap-5 xs:gap-6 sm:gap-8 md:gap-10 lg:gap-12 max-w-5xl mx-auto">
            <AnimatedCounter end={5000} suffix="+" icon={Scissors} label="STYLISTS" />
            <AnimatedCounter end={50000} suffix="+" icon={Calendar} label="BOOKINGS" />
            <AnimatedCounter end={10000} suffix="+" icon={Palette} label="FORMULAS" />
            <AnimatedCounter end={4.9} suffix="/5" icon={Smartphone} label="RATING" duration={1200} />
          </div>
        </div>
        </section>

        {/* Final Value Proposition */}
        <FinalValueProp />
      </main>

      <EnhancedFooter />
    </div>
  );
};

export default Index;
