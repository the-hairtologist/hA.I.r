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
      
      <header className="fixed top-0 left-0 right-0 z-50 bg-black border-b-4 border-black" role="banner" style={{
        backgroundImage: `
          linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.05) 50%, transparent 100%),
          linear-gradient(0deg, transparent 0%, rgba(255,255,255,0.05) 50%, transparent 100%)
        `,
        backgroundSize: '8px 8px'
      }}>
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={() => navigate("/")} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 border-2 border-white bg-primary flex items-center justify-center">
              <Scissors className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-base font-pixel text-white uppercase">hA.I.r</span>
          </button>
          <Button 
            onClick={() => navigate("/auth")} 
            size="sm" 
            className="font-pixel text-xs uppercase bg-accent text-accent-foreground hover:bg-accent/90 border-3 border-white shadow-[3px_3px_0px_0px_rgba(255,255,255,1)] hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] transition-all duration-300 hover:-translate-y-0.5 rounded-none px-6 py-2.5"
          >
            Get Started
          </Button>
        </div>
      </header>

      <main id="main-content" className="pt-16">
        {/* Hero Section - Pixelated LEGO vibes */}
        <section className="relative bg-primary py-24 sm:py-32 overflow-hidden min-h-[90vh] flex items-center" style={{
          backgroundImage: `
            linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.05) 50%, transparent 100%),
            linear-gradient(0deg, transparent 0%, rgba(0,0,0,0.05) 50%, transparent 100%)
          `,
          backgroundSize: '8px 8px'
        }}>
          <div className="container mx-auto px-4 text-center relative z-10 w-full">
            <div className="max-w-4xl mx-auto space-y-8">
              <h1 className="text-3xl xs:text-4xl sm:text-5xl lg:text-6xl font-pixel uppercase text-secondary leading-relaxed tracking-wider drop-shadow-[4px_4px_0px_rgba(0,0,0,0.3)] animate-fade-in" style={{ lineHeight: '1.6' }}>
                YOUR HAIR, SMARTER.<br />YOUR SALON, EFFORTLESS.
              </h1>
              
              <p className="text-sm xs:text-base sm:text-lg font-pixel text-primary-foreground/90 max-w-2xl mx-auto leading-loose animate-fade-in" style={{ animationDelay: '100ms' }}>
                BOOK SMARTER. STYLE BETTER. GET PAID FASTER.
              </p>
              
              <div className="pt-6 animate-fade-in" style={{ animationDelay: '200ms' }}>
                <Button 
                  size="lg" 
                  onClick={() => navigate("/auth")} 
                  className="text-sm xs:text-base sm:text-lg px-6 xs:px-8 sm:px-12 py-5 xs:py-6 sm:py-8 font-pixel uppercase bg-accent text-accent-foreground hover:bg-accent/90 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 hover:-translate-y-1 rounded-none animate-pulse-subtle"
                >
                  GET STARTED FREE
                </Button>
              </div>
              
              <p className="text-xs sm:text-sm font-pixel text-primary-foreground/80 uppercase animate-fade-in" style={{ animationDelay: '300ms' }}>
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
      <section className="py-16 bg-secondary border-t-4 border-black" style={{
        backgroundImage: `
          linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.05) 50%, transparent 100%),
          linear-gradient(0deg, transparent 0%, rgba(0,0,0,0.05) 50%, transparent 100%)
        `,
        backgroundSize: '8px 8px'
      }}>
        <div className="container mx-auto px-4">
          <h2 className="text-center font-pixel text-lg xs:text-xl sm:text-2xl text-secondary-foreground mb-12 uppercase tracking-wider">
            STYLISTS USING hA.I.r<br/>CUT ADMIN TIME BY 40%
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-12 max-w-5xl mx-auto">
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
