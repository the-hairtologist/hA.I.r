import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Scissors, Calendar, Palette, Smartphone } from "lucide-react";
import { MinimalFeatures } from "@/components/landing/MinimalFeatures";
import { SingleTestimonial } from "@/components/landing/SingleTestimonial";
import { SimplePricingCTA } from "@/components/landing/SimplePricingCTA";
import { MinimalFAQ } from "@/components/landing/MinimalFAQ";
import { EnhancedFooter } from "@/components/landing/EnhancedFooter";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
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
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => navigate("/")} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 border-2 border-white bg-primary flex items-center justify-center">
              <Scissors className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-base font-pixel text-white uppercase">hA.I.r</span>
          </button>
          <Button 
            onClick={() => navigate("/auth")} 
            size="sm" 
            className="font-pixel text-xs uppercase bg-secondary text-secondary-foreground hover:bg-secondary/90 border-2 border-white shadow-[3px_3px_0px_0px_rgba(255,255,255,1)] hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] transition-all hover:-translate-y-0.5 rounded-none px-4 py-2"
          >
            Get Started
          </Button>
        </div>
      </header>

      <main id="main-content" className="pt-16">
        {/* Hero Section - Pixelated LEGO vibes */}
        <section className="relative bg-primary py-24 sm:py-32 overflow-hidden" style={{
          backgroundImage: `
            linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.05) 50%, transparent 100%),
            linear-gradient(0deg, transparent 0%, rgba(0,0,0,0.05) 50%, transparent 100%)
          `,
          backgroundSize: '8px 8px'
        }}>
          <div className="container mx-auto px-4 text-center relative z-10">
            <div className="max-w-4xl mx-auto space-y-8">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-pixel uppercase text-secondary leading-relaxed tracking-wider drop-shadow-[4px_4px_0px_rgba(0,0,0,0.3)]" style={{ lineHeight: '1.6' }}>
                YOUR HAIR, SMARTER.<br />YOUR SALON, EFFORTLESS.
              </h1>
              
              <p className="text-base sm:text-lg font-pixel text-primary-foreground/90 max-w-2xl mx-auto leading-loose">
                Bookings + Color Formulas + Payments = Handled.
              </p>
              
              <div className="pt-6">
                <Button 
                  size="lg" 
                  onClick={() => navigate("/auth")} 
                  className="text-base sm:text-lg px-8 sm:px-12 py-6 sm:py-8 font-pixel uppercase bg-secondary text-secondary-foreground hover:bg-secondary/90 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-y-1 rounded-none"
                >
                  GET EARLY ACCESS
                </Button>
              </div>
              
              <p className="text-xs sm:text-sm font-pixel text-primary-foreground/80 uppercase">
                No Credit Card • 14 Days Free
              </p>
            </div>
          </div>
        </section>

        {/* How It Works - Pixelated style */}
        <section className="py-16 bg-secondary" style={{
          backgroundImage: `
            linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.03) 50%, transparent 100%),
            linear-gradient(0deg, transparent 0%, rgba(0,0,0,0.03) 50%, transparent 100%)
          `,
          backgroundSize: '8px 8px'
        }}>
          <MinimalFeatures />
        </section>

        {/* Testimonial Section */}
        <section className="py-16 bg-accent" style={{
          backgroundImage: `
            linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.05) 50%, transparent 100%),
            linear-gradient(0deg, transparent 0%, rgba(0,0,0,0.05) 50%, transparent 100%)
          `,
          backgroundSize: '8px 8px'
        }}>
          <SingleTestimonial />
        </section>

        {/* Pricing Section */}
        <section className="py-16 bg-secondary" style={{
          backgroundImage: `
            linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.03) 50%, transparent 100%),
            linear-gradient(0deg, transparent 0%, rgba(0,0,0,0.03) 50%, transparent 100%)
          `,
          backgroundSize: '8px 8px'
        }}>
          <SimplePricingCTA />
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-accent" style={{
          backgroundImage: `
            linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.05) 50%, transparent 100%),
            linear-gradient(0deg, transparent 0%, rgba(0,0,0,0.05) 50%, transparent 100%)
          `,
          backgroundSize: '8px 8px'
        }}>
          <MinimalFAQ />
        </section>
      </main>

      {/* Stats Section - Pixelated Stats */}
      <section className="py-12 bg-accent border-t-4 border-black" style={{
        backgroundImage: `
          linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.05) 50%, transparent 100%),
          linear-gradient(0deg, transparent 0%, rgba(0,0,0,0.05) 50%, transparent 100%)
        `,
        backgroundSize: '8px 8px'
      }}>
        <div className="container mx-auto px-4">
          <h2 className="text-center font-pixel text-xl sm:text-2xl text-accent-foreground mb-8 uppercase tracking-wider">
            STYLISTS USING hA.I.r<br/>CUT ADMIN TIME BY 40%
          </h2>
          <div className="flex flex-wrap justify-center items-center gap-8 sm:gap-12">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 border-4 border-black bg-primary flex items-center justify-center mb-2">
                <Scissors className="h-8 w-8 text-primary-foreground" />
              </div>
              <p className="font-pixel text-lg text-accent-foreground">2,000+</p>
              <p className="text-xs font-pixel text-accent-foreground/80 uppercase">Stylists</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 border-4 border-black bg-primary flex items-center justify-center mb-2">
                <Calendar className="h-8 w-8 text-primary-foreground" />
              </div>
              <p className="font-pixel text-lg text-accent-foreground">50,000+</p>
              <p className="text-xs font-pixel text-accent-foreground/80 uppercase">Bookings</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 border-4 border-black bg-primary flex items-center justify-center mb-2">
                <Palette className="h-8 w-8 text-primary-foreground" />
              </div>
              <p className="font-pixel text-lg text-accent-foreground">10,000+</p>
              <p className="text-xs font-pixel text-accent-foreground/80 uppercase">Formulas</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 border-4 border-black bg-primary flex items-center justify-center mb-2">
                <Smartphone className="h-8 w-8 text-primary-foreground" />
              </div>
              <p className="font-pixel text-lg text-accent-foreground">4.9/5</p>
              <p className="text-xs font-pixel text-accent-foreground/80 uppercase">Rating</p>
            </div>
          </div>
        </div>
      </section>

      <EnhancedFooter />
    </div>
  );
};

export default Index;
