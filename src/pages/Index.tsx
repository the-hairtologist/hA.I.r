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
      
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border" role="banner">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={() => navigate("/")} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Scissors className="h-5 w-5 text-primary" />
            <span className="text-lg font-display font-bold text-foreground">hA.I.r</span>
          </button>
          <Button onClick={() => navigate("/auth")} size="sm" variant="default">
            Get Started
          </Button>
        </div>
      </header>

      <main id="main-content" className="pt-16">
        {/* Hero Section - Above the fold */}
        <section className="relative bg-primary py-24 sm:py-32">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-3xl mx-auto space-y-6">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-black text-primary-foreground leading-tight">
                Your salon assistant.<br />Powered by AI.
              </h1>
              
              <p className="text-xl text-primary-foreground/90 max-w-xl mx-auto">
                Bookings, color formulas, and payments—handled automatically.
              </p>
              
              <div className="pt-6">
                <Button 
                  size="lg" 
                  onClick={() => navigate("/auth")} 
                  className="text-lg px-10 py-6 font-bold"
                >
                  Start Free Trial
                </Button>
              </div>
              
              <p className="text-sm text-primary-foreground/70">
                No credit card • 14 days free
              </p>
            </div>
          </div>
        </section>

        {/* How It Works - Icons only */}
        <section className="py-16 bg-background">
          <MinimalFeatures />
        </section>

        {/* Single Testimonial */}
        <section className="py-16 bg-muted/30">
          <SingleTestimonial />
        </section>

        {/* Simple Pricing CTA */}
        <section className="py-16 bg-background">
          <SimplePricingCTA />
        </section>

        {/* Minimal FAQ */}
        <section className="py-16 bg-muted/30">
          <MinimalFAQ />
        </section>
      </main>

      {/* Social Proof / Trust Indicators */}
      <section className="py-8 bg-background border-t-2 border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center items-center gap-8 text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 rounded-xl border-[3px] border-foreground bg-primary/10 flex items-center justify-center">
                <Scissors className="h-6 w-6 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-bold text-foreground">2,000+</p>
                <p className="text-xs">Active Stylists</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 rounded-xl border-[3px] border-foreground bg-primary/10 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-bold text-foreground">50,000+</p>
                <p className="text-xs">Appointments</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 rounded-xl border-[3px] border-foreground bg-primary/10 flex items-center justify-center">
                <Palette className="h-6 w-6 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-bold text-foreground">10,000+</p>
                <p className="text-xs">Formulas Created</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 rounded-xl border-[3px] border-foreground bg-primary/10 flex items-center justify-center">
                <Smartphone className="h-6 w-6 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-bold text-foreground">4.9/5</p>
                <p className="text-xs">User Rating</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <EnhancedFooter />
    </div>
  );
};

export default Index;
