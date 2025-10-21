import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Scissors, Sparkles, Zap, Heart } from "lucide-react";
import { MinimalFeatures } from "@/components/landing/MinimalFeatures";
import { SingleTestimonial } from "@/components/landing/SingleTestimonial";

import { MinimalFAQ } from "@/components/landing/MinimalFAQ";
import { EnhancedFooter } from "@/components/landing/EnhancedFooter";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { ScrollIndicator } from "@/components/ui/ScrollIndicator";
import { FinalValueProp } from "@/components/landing/FinalValueProp";
import { lazy, Suspense, useEffect, useState } from "react";
import { logger } from "@/lib/productionLogger";
import { StickyCTA } from "@/components/landing/StickyCTA";
import { ExitIntentModal } from "@/components/landing/ExitIntentModal";
import { useExitIntent } from "@/hooks/useExitIntent";
import { useScrollDepthTracking } from "@/hooks/useScrollDepthTracking";
import { analytics } from "@/lib/analytics";

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
  const [showExitIntent, setShowExitIntent] = useState(false);

  // Track scroll depth milestones
  useScrollDepthTracking({ enabled: true });

  // Exit-intent detection
  useExitIntent({
    onExitIntent: () => {
      setShowExitIntent(true);
      analytics.track('exit_intent_shown');
    },
    enabled: true,
  });

  useEffect(() => {
    logger.info('[Index] Component mounted', { context: 'Landing Page' });

    // Track page load time
    const startTime = Date.now();
    return () => {
      const timeOnPage = Math.floor((Date.now() - startTime) / 1000);
      analytics.track('time_on_page', { seconds: timeOnPage });
    };
  }, []);

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
              {/* Icons */}
              <div className="flex justify-center gap-4 xs:gap-6 mb-6 xs:mb-8 animate-fade-in">
                <div 
                  className="w-12 h-12 xs:w-16 xs:h-16 brutal-border-4 border-white bg-primary flex items-center justify-center animate-bounce brutal-shadow-md"
                  style={{ animationDelay: '0s' }}
                >
                  <Sparkles className="h-6 w-6 xs:h-8 xs:w-8 text-white" strokeWidth={2.5} />
                </div>
                <div 
                  className="w-12 h-12 xs:w-16 xs:h-16 brutal-border-4 border-black bg-secondary flex items-center justify-center animate-bounce brutal-shadow-md"
                  style={{ animationDelay: '0.1s' }}
                >
                  <Zap className="h-6 w-6 xs:h-8 xs:w-8 text-black" strokeWidth={2.5} fill="black" />
                </div>
                <div 
                  className="w-12 h-12 xs:w-16 xs:h-16 brutal-border-4 border-white bg-accent flex items-center justify-center animate-bounce brutal-shadow-md"
                  style={{ animationDelay: '0.2s' }}
                >
                  <Heart className="h-6 w-6 xs:h-8 xs:w-8 text-white" strokeWidth={2.5} fill="white" />
                </div>
              </div>
              
              <h1
                className="text-xl xxs:text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-pixel uppercase text-white opacity-100 leading-[1.3] xxs:leading-[1.4] xs:leading-relaxed tracking-wide xs:tracking-wider drop-shadow-[3px_3px_0px_rgba(0,0,0,1)] xs:drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] md:drop-shadow-[5px_5px_0px_rgba(0,0,0,1)] animate-fade-in px-2 xs:px-4 break-words"
                data-debug-element="hero-headline"
              >
                STOP LOSING CLIENTS<br className="hidden xxs:block" /><span className="xxs:hidden"> </span>TO MISSED TEXTS
              </h1>
              
              <p 
                className="text-sm xxs:text-base xs:text-lg sm:text-xl md:text-2xl font-sans text-primary-foreground max-w-3xl mx-auto leading-relaxed xs:leading-loose animate-fade-in px-3 xs:px-4 break-words" 
                style={{ animationDelay: '100ms' }}
                data-debug-element="hero-subheadline"
              >
                Automated reminders, instant booking, zero chaos—stylists save 10+ hours/week
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
                  START FREE TRIAL
                </Button>
              </div>
              
              <p className="text-[10px] xxs:text-xs xs:text-sm sm:text-base font-sans text-primary-foreground/90 animate-fade-in px-3 break-words" style={{ animationDelay: '300ms' }}>
                ✓ No Credit Card Required • ✓ 14-Day Free Trial • ✓ Cancel Anytime
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
        <section className="py-14 xs:py-16 sm:py-18 bg-background" style={{
          backgroundImage: `
            linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.01) 50%, transparent 100%),
            linear-gradient(0deg, transparent 0%, rgba(0,0,0,0.01) 50%, transparent 100%)
          `,
          backgroundSize: '8px 8px'
        }}>
          <MinimalFeatures />
        </section>

        {/* Testimonial Section - Blue background */}
        <section className="py-14 xs:py-16 sm:py-18 bg-accent">
          <SingleTestimonial />
        </section>

        {/* FAQ Section - White background for contrast */}
        <section className="py-14 xs:py-16 sm:py-18 bg-background" style={{
          backgroundImage: `
            linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.01) 50%, transparent 100%),
            linear-gradient(0deg, transparent 0%, rgba(0,0,0,0.01) 50%, transparent 100%)
          `,
          backgroundSize: '8px 8px'
        }}>
          <MinimalFAQ />
        </section>

        {/* Unified Stats + Benefits Section */}
        <FinalValueProp />
      </main>

      <EnhancedFooter />
      
      {/* Sticky CTA (mobile only) */}
      <StickyCTA ctaText="START FREE TRIAL" />

      {/* Exit-intent modal */}
      <ExitIntentModal 
        open={showExitIntent} 
        onOpenChange={setShowExitIntent} 
      />
    </div>
  );
};

export default Index;
