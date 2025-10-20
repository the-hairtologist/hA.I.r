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
        <section className="relative bg-primary py-12 xxs:py-16 xs:py-20 sm:py-24 md:py-32 overflow-hidden min-h-[80vh] xxs:min-h-[85vh] xs:min-h-[90vh] flex items-center" style={{
          backgroundImage: `
            linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.05) 50%, transparent 100%),
            linear-gradient(0deg, transparent 0%, rgba(0,0,0,0.05) 50%, transparent 100%)
          `,
          backgroundSize: '8px 8px'
        }}>
          <div className="container mx-auto px-4 xs:px-5 sm:px-6 text-center relative z-10 w-full max-w-full">
            <div className="max-w-4xl mx-auto space-y-4 xxs:space-y-6 xs:space-y-8">
              <h1 className="text-xl xxs:text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-pixel uppercase text-secondary leading-[1.3] xxs:leading-[1.4] xs:leading-relaxed tracking-wide xs:tracking-wider drop-shadow-[2px_2px_0px_rgba(0,0,0,0.3)] xs:drop-shadow-[3px_3px_0px_rgba(0,0,0,0.3)] md:drop-shadow-[4px_4px_0px_rgba(0,0,0,0.3)] animate-fade-in px-2 xs:px-4 break-words">
                YOUR HAIR, SMARTER.<br className="hidden xxs:block" /><span className="xxs:hidden"> </span>YOUR SALON, EFFORTLESS.
              </h1>
              
              <p className="text-[10px] xxs:text-xs xs:text-sm sm:text-base md:text-lg font-pixel text-primary-foreground/90 max-w-2xl mx-auto leading-relaxed xs:leading-loose animate-fade-in px-3 xs:px-4 break-words" style={{ animationDelay: '100ms' }}>
                BOOK SMARTER. STYLE BETTER. GET PAID FASTER.
              </p>
              
              <div className="pt-3 xxs:pt-4 xs:pt-6 animate-fade-in px-3 xs:px-4" style={{ animationDelay: '200ms' }}>
                <Button 
                  size="lg" 
                  onClick={() => navigate("/auth")} 
                  className="text-[10px] xxs:text-xs xs:text-sm sm:text-base md:text-lg px-4 xxs:px-5 xs:px-6 sm:px-8 md:px-12 py-3 xxs:py-4 xs:py-5 sm:py-6 md:py-8 font-pixel uppercase bg-accent text-accent-foreground hover:bg-accent/90 border-[2px] xxs:border-[3px] xs:border-[4px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] xxs:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] xs:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] xxs:hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] xs:hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 hover:-translate-y-0.5 xs:hover:-translate-y-1 rounded-none animate-pulse-subtle min-h-[48px] xxs:min-h-[52px] xs:min-h-[56px] w-full max-w-[90vw] xs:w-auto"
                >
                  GET STARTED FREE
                </Button>
              </div>
              
              <p className="text-[9px] xxs:text-[10px] xs:text-xs sm:text-sm font-pixel text-primary-foreground/80 uppercase animate-fade-in px-3 break-words" style={{ animationDelay: '300ms' }}>
                Free Trial • No Credit Card Required
              </p>
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
      </main>

      {/* Stats Section - Yellow background for excitement */}
      <section className="py-10 xs:py-12 sm:py-14 md:py-16 bg-secondary border-t-[2px] xs:border-t-[3px] sm:border-t-[4px] border-black" style={{
        backgroundImage: `
          linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.05) 50%, transparent 100%),
          linear-gradient(0deg, transparent 0%, rgba(0,0,0,0.05) 50%, transparent 100%)
        `,
        backgroundSize: '8px 8px'
      }}>
        <div className="container mx-auto px-4 xs:px-5 sm:px-6">
          <h2 className="text-center font-pixel text-sm xxs:text-base xs:text-lg sm:text-xl md:text-2xl text-secondary-foreground mb-6 xs:mb-8 sm:mb-10 md:mb-12 uppercase tracking-wide xs:tracking-wider px-2 xs:px-4 leading-tight break-words">
            STYLISTS USING hA.I.r<br className="xs:hidden" /><span className="hidden xs:inline"> </span>CUT ADMIN TIME BY 40%
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 xxs:gap-5 xs:gap-6 sm:gap-8 md:gap-10 lg:gap-12 max-w-5xl mx-auto">
            <AnimatedCounter end={2000} suffix="+" icon={Scissors} label="STYLISTS" />
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
