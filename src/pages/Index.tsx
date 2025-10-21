import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Scissors, Sparkles, Zap, Heart, Calendar, Palette, Smartphone } from "lucide-react";
import { MinimalFeatures } from "@/components/landing/MinimalFeatures";
import { SingleTestimonial } from "@/components/landing/SingleTestimonial";

import { MinimalFAQ } from "@/components/landing/MinimalFAQ";
import { MinimalFooter } from "@/components/landing/MinimalFooter";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { ScrollIndicator } from "@/components/ui/ScrollIndicator";
import { lazy, Suspense, useEffect, useState } from "react";
import { logger } from "@/lib/productionLogger";
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

  // Track scroll depth milestones
  useScrollDepthTracking({ enabled: true });

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
            className="font-pixel text-[10px] xs:text-xs uppercase bg-accent text-accent-foreground hover:bg-accent/90 brutal-border border-white brutal-shadow-sm hover:brutal-shadow-md transition-all duration-300 hover:-translate-y-0.5 rounded-none px-4 xs:px-6 py-2.5 xs:py-3 min-h-[44px] flex-shrink-0"
          >
            <span className="hidden xxs:inline">Get Started</span>
            <span className="xxs:hidden">Start</span>
          </Button>
        </div>
      </header>

      <main id="main-content" className="pt-16">
        {/* Hero Section - Pixelated LEGO vibes */}
        <section className="relative bg-primary py-1.5 xxs:py-2 xs:py-3 sm:py-4 overflow-hidden flex items-center" style={{
          backgroundImage: `
            linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.05) 50%, transparent 100%),
            linear-gradient(0deg, transparent 0%, rgba(0,0,0,0.05) 50%, transparent 100%)
          `,
          backgroundSize: '8px 8px'
        }}>
          <div className="container mx-auto px-4 xs:px-5 sm:px-6 text-center relative z-10 w-full max-w-full">
            <div className="max-w-4xl mx-auto space-y-1.5 xxs:space-y-2 xs:space-y-3 sm:space-y-4">
              {/* Icons */}
              <div className="flex justify-center gap-4 sm:gap-5 mb-3 sm:mb-4 animate-fade-in">
                <div 
                  className="w-11 h-11 xs:w-12 xs:h-12 sm:w-14 sm:h-14 brutal-border-4 border-white bg-primary flex items-center justify-center animate-bounce brutal-shadow-md"
                  style={{ animationDelay: '0s' }}
                >
                  <Sparkles className="h-5 w-5 xs:h-6 xs:w-6 sm:h-7 sm:w-7 text-white" strokeWidth={2.5} />
                </div>
                <div 
                  className="w-11 h-11 xs:w-12 xs:h-12 sm:w-14 sm:h-14 brutal-border-4 border-black bg-secondary flex items-center justify-center animate-bounce brutal-shadow-md"
                  style={{ animationDelay: '0.1s' }}
                >
                  <Zap className="h-5 w-5 xs:h-6 xs:w-6 sm:h-7 sm:w-7 text-black" strokeWidth={2.5} fill="black" />
                </div>
                <div 
                  className="w-11 h-11 xs:w-12 xs:h-12 sm:w-14 sm:h-14 brutal-border-4 border-white bg-accent flex items-center justify-center animate-bounce brutal-shadow-md"
                  style={{ animationDelay: '0.2s' }}
                >
                  <Heart className="h-5 w-5 xs:h-6 xs:w-6 sm:h-7 sm:w-7 text-white" strokeWidth={2.5} fill="white" />
                </div>
              </div>
              
              <h1
                className="text-lg xxs:text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-pixel uppercase text-white opacity-100 leading-[1.3] xxs:leading-[1.4] xs:leading-relaxed tracking-wide xs:tracking-wider drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] xs:drop-shadow-[3px_3px_0px_rgba(0,0,0,1)] md:drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] animate-fade-in px-2 xs:px-4 break-words"
                data-debug-element="hero-headline"
              >
                STOP LOSING CLIENTS<br className="hidden xxs:block" /><span className="xxs:hidden"> </span>TO MISSED TEXTS
              </h1>
              
              <p 
                className="text-xs xs:text-sm sm:text-base md:text-lg font-sans text-black max-w-3xl mx-auto leading-relaxed animate-fade-in px-3 xs:px-4 break-words" 
                style={{ animationDelay: '100ms' }}
                data-debug-element="hero-subheadline"
              >
                Automated reminders, instant booking, zero chaos—stylists save 10+ hours/week
              </p>
              
              <div className="pt-1 xs:pt-1.5 sm:pt-2 animate-fade-in px-3 xs:px-4" style={{ animationDelay: '200ms' }}>
                <Button 
                  size="lg" 
                  onClick={() => {
                    logger.info('[Index] CTA button clicked', { context: 'Landing Page' });
                    navigate("/auth");
                  }} 
                  className="text-xs xxs:text-sm xs:text-base sm:text-lg md:text-xl px-6 xxs:px-7 xs:px-8 sm:px-10 md:px-14 py-3.5 xxs:py-4 xs:py-5 sm:py-6 md:py-8 font-pixel uppercase bg-secondary text-success hover:bg-secondary/90 brutal-border border-black brutal-shadow-md hover:brutal-shadow-lg transition-all duration-300 hover:-translate-y-1 xs:hover:-translate-y-2 rounded-none animate-pulse-subtle min-h-[52px] xxs:min-h-[56px] xs:min-h-[60px] w-full max-w-[90vw] xs:w-auto"
                  data-debug-element="hero-cta-button"
                >
                  START FREE TRIAL
                </Button>
              </div>
              
              <p className="text-[8px] xxs:text-[9px] xs:text-[10px] font-sans text-primary-foreground/80 animate-fade-in px-3 break-words" style={{ animationDelay: '300ms' }}>
                ✓ No Credit Card Required • ✓ 14-Day Free Trial • ✓ Cancel Anytime
              </p>

              {/* Product Demo Mockup - Lazy loaded for performance */}
              <div className="mt-1.5 xs:mt-2 sm:mt-3 animate-fade-in" style={{ animationDelay: '400ms' }}>
                <Suspense fallback={
                  <div className="relative w-full max-w-[180px] xs:max-w-[220px] sm:max-w-[280px] md:max-w-[320px] mx-auto h-[400px] xs:h-[450px] sm:h-[500px] border-[4px] border-black bg-white/10 backdrop-blur-sm shadow-[12px_12px_0px_0px_rgba(0,0,0,0.3)] rounded-[32px] animate-pulse" data-debug-element="phone-mockup-loading" />
                }>
                  <div data-debug-element="phone-mockup-loaded">
                    <HeroPhoneMockup />
                  </div>
                </Suspense>
              </div>
              
              {/* Animated Counters - Social Proof */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 xs:gap-4 sm:gap-6 max-w-3xl mx-auto pt-4 xs:pt-5 sm:pt-6 animate-fade-in" style={{ animationDelay: '500ms' }}>
                <AnimatedCounter end={5000} suffix="+" icon={Scissors} label="STYLISTS" bgColor="bg-secondary" borderColor="border-black" textColor="text-black" />
                <AnimatedCounter end={50000} suffix="+" icon={Calendar} label="BOOKINGS" bgColor="bg-secondary" borderColor="border-black" textColor="text-black" />
                <AnimatedCounter end={10000} suffix="+" icon={Palette} label="FORMULAS" bgColor="bg-secondary" borderColor="border-black" textColor="text-black" />
                <AnimatedCounter end={4.9} suffix="/5" icon={Smartphone} label="RATING" duration={1200} bgColor="bg-secondary" borderColor="border-black" textColor="text-black" />
              </div>
            </div>
          </div>
          <ScrollIndicator />
        </section>

        {/* How It Works - Featured prominently */}
        <section className="bg-background" style={{
          backgroundImage: `
            linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.01) 50%, transparent 100%),
            linear-gradient(0deg, transparent 0%, rgba(0,0,0,0.01) 50%, transparent 100%)
          `,
          backgroundSize: '8px 8px'
        }}>
          <MinimalFeatures />
        </section>

        {/* Testimonials + FAQ Section - Combined */}
        <section className="bg-secondary" style={{
          backgroundImage: `
            linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.02) 50%, transparent 100%),
            linear-gradient(0deg, transparent 0%, rgba(0,0,0,0.02) 50%, transparent 100%)
          `,
          backgroundSize: '8px 8px'
        }}>
          <MinimalFAQ />
        </section>
      </main>

      <MinimalFooter />
    </div>
  );
};

export default Index;
