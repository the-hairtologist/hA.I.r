import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Scissors, Sparkles, Calendar } from "lucide-react";
import { TestimonialCarousel } from "@/components/landing/TestimonialCarousel";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { PricingPreview } from "@/components/landing/PricingPreview";
import { FAQSection } from "@/components/landing/FAQSection";
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
      
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b-2 border-foreground" role="banner">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => navigate("/")} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Scissors className="h-6 w-6 text-primary" />
            <span className="text-xl font-display font-bold">hA.I.r</span>
          </button>
          <Button onClick={() => navigate("/auth")} size="sm" className="font-bold">
            Get Started Free
          </Button>
        </div>
      </header>

      <main id="main-content" className="pt-16">
        {/* Hero Section */}
        <section className="relative bg-primary py-20 sm:py-32 overflow-hidden">
          <div className="container mx-auto px-4 text-center relative z-10">
            <div className="max-w-4xl mx-auto space-y-6">
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-display font-black text-primary-foreground leading-tight">
                Your salon assistant.<br />Powered by AI.
              </h1>
              
              <p className="text-lg sm:text-xl text-primary-foreground/90 max-w-2xl mx-auto">
                Handle bookings, color formulas, and payments automatically. Get back to doing hair.
              </p>
              
              <div className="pt-4">
                <Button 
                  size="lg" 
                  onClick={() => navigate("/auth")} 
                  className="text-lg px-10 py-6 font-bold bg-secondary text-secondary-foreground hover:bg-secondary/90 border-2 border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))] hover:shadow-[2px_2px_0px_0px_hsl(var(--foreground))] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                >
                  Start Free Trial
                </Button>
              </div>
              
              <p className="text-sm text-primary-foreground/70 pt-2">
                No credit card required • 14 days free
              </p>
            </div>
          </div>
        </section>

        {/* Trust Bar */}
        <section className="py-8 border-y-2 border-foreground bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                <span>1,000+ stylists</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>15,000+ formulas generated</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold">4.9/5</span>
                <span>rating</span>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 container mx-auto px-4">
          <HowItWorks />
        </section>

        {/* Testimonials Section */}
        <section className="py-20 bg-muted/50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="font-display font-black text-3xl sm:text-5xl mb-3">
                Loved by stylists
              </h2>
              <p className="text-muted-foreground">
                Join 1,000+ professionals who've reclaimed their time
              </p>
            </div>
            <TestimonialCarousel />
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-20 container mx-auto px-4">
          <PricingPreview />
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-muted/30 container mx-auto px-4">
          <FAQSection />
        </section>

        {/* Final CTA */}
        <section className="py-20 container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6 p-12 border-2 border-foreground rounded-2xl bg-primary text-primary-foreground">
            <h2 className="font-display font-black text-3xl sm:text-5xl">
              Ready to focus on hair?
            </h2>
            <p className="text-lg text-primary-foreground/90">
              Start free. No credit card required.
            </p>
            <Button
              size="lg"
              onClick={() => navigate("/auth")}
              className="text-lg px-10 py-6 font-bold bg-secondary text-secondary-foreground hover:bg-secondary/90 border-2 border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))] hover:shadow-[2px_2px_0px_0px_hsl(var(--foreground))] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
            >
              Get Started Free
            </Button>
          </div>
        </section>
      </main>

      <EnhancedFooter />
    </div>
  );
};

export default Index;
