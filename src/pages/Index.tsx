import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Scissors, Sparkles, Calendar, MessageSquare, TrendingUp } from "lucide-react";
import { TestimonialCarousel } from "@/components/landing/TestimonialCarousel";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { PricingPreview } from "@/components/landing/PricingPreview";
import { FAQSection } from "@/components/landing/FAQSection";
import { EnhancedFooter } from "@/components/landing/EnhancedFooter";
import { BeforeAfter } from "@/components/landing/BeforeAfter";
import { ScrollIndicator } from "@/components/landing/ScrollIndicator";

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
      
      <header className="container mx-auto px-4 py-4 sm:py-6 border-b-4 border-foreground" role="banner">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Scissors className="h-6 w-6 sm:h-8 sm:w-8 text-primary flex-shrink-0" />
            <h1 className="text-xl sm:text-3xl font-display font-bold">hA.I.r</h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Button variant="ghost" onClick={() => navigate("/privacy")} className="hidden sm:inline-flex text-sm">
              Privacy
            </Button>
            <Button variant="ghost" onClick={() => navigate("/terms")} className="hidden sm:inline-flex text-sm">
              Terms
            </Button>
            <Button onClick={() => navigate("/auth")} size="sm">
              Get Started
            </Button>
          </div>
        </div>
      </header>

      <main id="main-content" className="container mx-auto px-4 py-8 sm:py-12 md:py-20">
        <div className="max-w-6xl mx-auto mb-8 sm:mb-16">
          <div className="window-frame bg-gradient-to-br from-blue-400 via-cyan-300 to-green-300 mb-8 sm:mb-16 relative">
            <div className="window-titlebar">
              <span className="text-background font-mono text-xs sm:text-sm font-bold">hA.I.r / welcome</span>
              <div className="window-controls">
                <div className="window-control bg-background"></div>
                <div className="window-control bg-background"></div>
                <div className="window-control bg-background"></div>
              </div>
            </div>
            
            <div className="bg-primary p-6 sm:p-8 md:p-16 relative min-h-[500px] sm:min-h-[600px] md:min-h-[700px] text-center flex flex-col items-center justify-center">
              <div className="window-scrollbar hidden md:block"></div>
              
              <div className="max-w-4xl mx-auto relative z-10 px-2">
                <div className="flex items-center justify-center gap-2 sm:gap-4 mb-6 sm:mb-8">
                  <Scissors className="h-8 w-8 sm:h-12 sm:w-12 text-primary-foreground" />
                  <div className="text-3xl sm:text-5xl">✨</div>
                  <div className="w-8 h-8 sm:w-12 sm:h-12 border-2 sm:border-4 border-primary-foreground rotate-45"></div>
                  <div className="text-3xl sm:text-5xl">🎨</div>
                </div>
                
                <h1 className="text-3xl sm:text-5xl md:text-7xl font-display font-black mb-6 sm:mb-8 text-primary-foreground uppercase leading-tight px-2">
                  For the stylists who do it all—now you don't have to
                </h1>
                
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-primary-foreground mb-3 sm:mb-4">
                  No more chaos. Just clients, color, and calm.
                </p>
                
                <p className="text-sm sm:text-base md:text-lg font-medium text-primary-foreground/90 mb-8 sm:mb-12 max-w-2xl mx-auto px-2">
                  hA.I.r handles bookings, color formulas, and payments—so you can focus on your craft.
                </p>
                
                <Button 
                  size="lg" 
                  onClick={() => navigate("/auth")} 
                  className="text-base sm:text-xl px-8 sm:px-12 py-6 sm:py-8 font-display font-black bg-secondary text-secondary-foreground hover:bg-secondary/90 border-2 sm:border-4 border-foreground shadow-[8px_8px_0px_0px_hsl(var(--foreground))] hover:shadow-[4px_4px_0px_0px_hsl(var(--foreground))] hover:translate-x-1 hover:translate-y-1 transition-all uppercase group animate-pulse hover:animate-none"
                  aria-label="Try it on your next client"
                >
                  Try It On Your Next Client
                  <span className="inline-block transition-transform group-hover:translate-x-1 ml-2" aria-hidden="true">→</span>
                </Button>
              </div>
              
              <ScrollIndicator />
            </div>
          </div>

          {/* Trust Signals Banner */}
          <div className="text-center mb-12 p-6 bg-gradient-to-r from-primary/5 via-accent/5 to-secondary/5 border-2 border-foreground rounded-xl brutal-shadow-lg">
            <p className="text-base font-display font-bold text-foreground mb-3">Trusted by 1,000+ Professional Stylists</p>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-success" />
                <span className="font-medium">15,000+ Formulas Generated</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-warning" />
                <span className="font-medium">4.9/5 Rating (250+ Reviews)</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-info" />
                <span className="font-medium">95% Client Show Rate</span>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-20">
            <article className="p-6 border-[3px] border-foreground rounded-xl bg-gradient-to-br from-blue-400 to-cyan-300 brutal-shadow-lg hover:brutal-shadow-xl hover:-translate-y-2 transition-all duration-300 animate-fade-in flex flex-col group">
              <div className="bg-card border-2 border-foreground w-14 h-14 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-[2px_2px_0px_0px_hsl(var(--foreground))] flex-shrink-0 group-hover:scale-110 transition-transform">
                <Scissors className="h-7 w-7 text-info" aria-hidden="true" />
              </div>
              <h2 className="font-display font-bold text-xl mb-2 text-foreground text-center">Color Genius. Zero Guesswork.</h2>
              <p className="text-foreground/80 text-sm font-medium text-center">
                Upload a photo. Get the formula. Perfect results every time. Your brain for other things.
              </p>
            </article>

            <article className="p-6 border-[3px] border-foreground rounded-xl bg-gradient-to-br from-green-400 to-emerald-300 brutal-shadow-lg hover:brutal-shadow-xl hover:-translate-y-2 transition-all duration-300 animate-fade-in flex flex-col group" style={{animationDelay: '100ms'}}>
              <div className="bg-card border-2 border-foreground w-14 h-14 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-[2px_2px_0px_0px_hsl(var(--foreground))] flex-shrink-0 group-hover:scale-110 transition-transform">
                <Calendar className="h-7 w-7 text-success" aria-hidden="true" />
              </div>
              <h2 className="font-display font-bold text-xl mb-2 text-foreground text-center">One Link. Done.</h2>
              <p className="text-foreground/80 text-sm font-medium text-center">
                Drop your booking link. Clients book 24/7. No more DM tennis. No double-bookings. Just shows.
              </p>
            </article>

            <article className="p-6 border-[3px] border-foreground rounded-xl bg-gradient-to-br from-yellow-300 to-orange-300 brutal-shadow-lg hover:brutal-shadow-xl hover:-translate-y-2 transition-all duration-300 animate-fade-in flex flex-col group" style={{animationDelay: '200ms'}}>
              <div className="bg-card border-2 border-foreground w-14 h-14 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-[2px_2px_0px_0px_hsl(var(--foreground))] flex-shrink-0 group-hover:scale-110 transition-transform">
                <MessageSquare className="h-7 w-7 text-warning" aria-hidden="true" />
              </div>
              <h2 className="font-display font-bold text-xl mb-2 text-foreground text-center">They'll Think You Hired Help.</h2>
              <p className="text-foreground/80 text-sm font-medium text-center">
                Video consults. Instant formula shares. Every conversation tracked. Loyalty that lasts. All you.
              </p>
            </article>
          </div>

          {/* Before/After Section */}
          <div className="mb-20">
            <BeforeAfter />
          </div>

          {/* How It Works Section */}
          <div className="mb-20">
            <HowItWorks />
          </div>

          {/* Testimonials Section */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h2 className="font-display font-black text-3xl sm:text-5xl mb-4">
                Real Stylists. Real Results.
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Join thousands of stylists who've reclaimed their time
              </p>
            </div>
            <TestimonialCarousel />
          </div>

          {/* Pricing Section */}
          <div className="mb-20">
            <PricingPreview />
          </div>

          {/* FAQ Section */}
          <div className="mb-20">
            <FAQSection />
          </div>

          {/* Final CTA */}
          <div className="text-center py-16 bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 rounded-2xl border-4 border-foreground brutal-shadow-xl">
            <h2 className="font-display font-black text-3xl sm:text-5xl mb-4">
              Ready to Stop Fighting Admin?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join 1,000+ stylists who've already made the switch. Start free, no credit card required.
            </p>
            <Button
              size="lg"
              onClick={() => navigate("/auth")}
              className="text-lg px-10 py-6 font-display font-black bg-primary text-primary-foreground hover:bg-primary/90 border-4 border-foreground shadow-[6px_6px_0px_0px_hsl(var(--foreground))] hover:shadow-[3px_3px_0px_0px_hsl(var(--foreground))] hover:translate-x-1 hover:translate-y-1 transition-all uppercase group"
            >
              Start Your Free Trial
              <span className="inline-block transition-transform group-hover:translate-x-1 ml-2">→</span>
            </Button>
          </div>
        </div>
      </main>

      <EnhancedFooter />
    </div>
  );
};

export default Index;
