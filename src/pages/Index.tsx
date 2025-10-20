import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Scissors, Calendar, Palette, Smartphone } from "lucide-react";
import { MinimalFeatures } from "@/components/landing/MinimalFeatures";
import { SingleTestimonial } from "@/components/landing/SingleTestimonial";
import { SimplePricingCTA } from "@/components/landing/SimplePricingCTA";
import { MinimalFAQ } from "@/components/landing/MinimalFAQ";
import { EnhancedFooter } from "@/components/landing/EnhancedFooter";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { ScrollIndicator } from "@/components/ui/ScrollIndicator";
import { HeroPhoneMockup } from "@/components/landing/HeroPhoneMockup";
import { FinalValueProp } from "@/components/landing/FinalValueProp";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background scroll-smooth">
      {/* Skip to main content for accessibility */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:m-2"
      >
        Skip to main content
      </a>
      
      <header className="fixed top-0 left-0 right-0 z-50 bg-black border-b-[2px] xs:border-b-[3px] sm:border-b-[4px] border-black" role="banner" style={{
        backgroundImage: `
          linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.05) 50%, transparent 100%),
          linear-gradient(0deg, transparent 0%, rgba(255,255,255,0.05) 50%, transparent 100%)
        `,
        backgroundSize: '8px 8px'
      }}>
        <div className="container mx-auto px-3 xs:px-4 sm:px-6 py-2.5 xs:py-3 sm:py-4 flex items-center justify-between max-w-full overflow-hidden">
          <button onClick={() => navigate("/")} className="flex items-center gap-1 xs:gap-1.5 sm:gap-2 hover:opacity-80 transition-opacity min-w-0">
            <div className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 border-2 border-white bg-primary flex items-center justify-center flex-shrink-0">
              <Scissors className="h-3 w-3 xs:h-3.5 xs:w-3.5 sm:h-4 sm:w-4 text-primary-foreground" />
            </div>
            <span className="text-xs xs:text-sm sm:text-base font-pixel text-white uppercase truncate">hA.I.r</span>
          </button>
          <Button 
            onClick={() => navigate("/auth")} 
            size="sm" 
            className="font-pixel text-[9px] xxs:text-[10px] xs:text-xs uppercase bg-accent text-accent-foreground hover:bg-accent/90 border-[2px] xs:border-[3px] border-white shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] xs:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)] hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] xs:hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] transition-all duration-300 hover:-translate-y-0.5 rounded-none px-3 xxs:px-4 xs:px-6 py-2 xs:py-2.5 min-h-[44px] flex-shrink-0"
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
              <h1 className="text-xl xxs:text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-pixel uppercase text-accent leading-[1.3] xxs:leading-[1.4] xs:leading-relaxed tracking-wide xs:tracking-wider drop-shadow-[2px_2px_0px_rgba(0,0,0,0.3)] xs:drop-shadow-[3px_3px_0px_rgba(0,0,0,0.3)] md:drop-shadow-[4px_4px_0px_rgba(0,0,0,0.3)] animate-fade-in px-2 xs:px-4 break-words">
                STOP LOSING CLIENTS<br className="hidden xxs:block" /><span className="xxs:hidden"> </span>TO MISSED TEXTS
              </h1>
              
              <p className="text-sm xxs:text-base xs:text-lg sm:text-xl md:text-2xl font-sans text-primary-foreground max-w-3xl mx-auto leading-relaxed xs:leading-loose animate-fade-in px-3 xs:px-4 break-words" style={{ animationDelay: '100ms' }}>
                Automated reminders, instant booking, zero chaos—stylists save 10+ hours/week
              </p>
              
              <div className="pt-3 xxs:pt-4 xs:pt-6 animate-fade-in px-3 xs:px-4" style={{ animationDelay: '200ms' }}>
                <Button 
                  size="lg" 
                  onClick={() => navigate("/auth")} 
                  className="text-xs xxs:text-sm xs:text-base sm:text-lg md:text-xl px-6 xxs:px-7 xs:px-8 sm:px-10 md:px-14 py-4 xxs:py-5 xs:py-6 sm:py-7 md:py-9 font-pixel uppercase bg-secondary text-secondary-foreground hover:bg-secondary/90 border-[3px] xxs:border-[4px] xs:border-[4px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] xxs:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] xs:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] xxs:hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] xs:hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 hover:-translate-y-1 xs:hover:-translate-y-2 rounded-none animate-pulse-subtle min-h-[52px] xxs:min-h-[56px] xs:min-h-[60px] w-full max-w-[90vw] xs:w-auto"
                >
                  START FREE TRIAL
                </Button>
              </div>
              
              <p className="text-[10px] xxs:text-xs xs:text-sm sm:text-base font-sans text-primary-foreground/90 animate-fade-in px-3 break-words" style={{ animationDelay: '300ms' }}>
                No Credit Card • Start In Seconds
              </p>

              {/* Product Demo Mockup */}
              <div className="mt-8 xs:mt-12 sm:mt-16 animate-fade-in" style={{ animationDelay: '400ms' }}>
                <HeroPhoneMockup />
              </div>
            </div>
          </div>
          <ScrollIndicator />
        </section>

        {/* Trust Section - Social Proof */}
        <section className="py-8 xs:py-10 sm:py-12 bg-background border-y-[3px] border-black">
          <div className="container mx-auto px-4">
            <div className="text-center mb-6 xs:mb-8">
              <p className="font-pixel text-xs xs:text-sm text-foreground/70 uppercase tracking-wider animate-fade-in">
                🏆 TRUSTED BY 5,000+ STYLISTS
              </p>
            </div>
            <div className="flex flex-wrap justify-center items-center gap-4 xs:gap-6 sm:gap-8 animate-fade-in" style={{ animationDelay: '100ms' }}>
              {/* Placeholder trust badges - brutal style */}
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="border-[3px] border-foreground p-3 xs:p-4 bg-muted hover:bg-accent/10 transition-colors duration-300 min-w-[80px] xs:min-w-[100px] h-14 xs:h-16 flex items-center justify-center">
                  <span className="font-pixel text-[10px] xs:text-xs text-foreground/50">SALON {i}</span>
                </div>
              ))}
            </div>
          </div>
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

        {/* Final Value Proposition */}
        <FinalValueProp />
      </main>

      {/* Stats Section - Yellow background for excitement */}
      <section className="py-10 xs:py-12 sm:py-14 md:py-16 bg-accent border-t-[3px] xs:border-t-[4px] border-black" style={{
        backgroundImage: `
          linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.05) 50%, transparent 100%),
          linear-gradient(0deg, transparent 0%, rgba(0,0,0,0.05) 50%, transparent 100%)
        `,
        backgroundSize: '8px 8px'
      }}>
        <div className="container mx-auto px-4 xs:px-5 sm:px-6">
          <div className="text-center mb-8 xs:mb-10 sm:mb-12">
            <div className="inline-block border-[3px] border-black bg-secondary px-4 xs:px-6 py-2 xs:py-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-4 xs:mb-6">
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

      <EnhancedFooter />
    </div>
  );
};

export default Index;
