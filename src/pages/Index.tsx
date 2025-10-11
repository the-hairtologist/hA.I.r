import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Scissors, Sparkles, Calendar, MessageSquare } from "lucide-react";

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
            <Button variant="outline" onClick={() => navigate("/auth")} size="sm">
              Sign In
            </Button>
            <Button onClick={() => navigate("/auth")} size="sm" className="hidden sm:inline-flex">
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
            
            <div className="bg-primary p-6 sm:p-8 md:p-16 relative min-h-[400px] sm:min-h-[500px] text-center">
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
                  className="text-base sm:text-xl px-8 sm:px-12 py-4 sm:py-6 font-display font-black bg-secondary text-secondary-foreground hover:bg-secondary/90 border-2 sm:border-4 border-secondary hover:translate-x-1 hover:translate-y-1 transition-all hover:scale-105 uppercase group"
                  aria-label="Try it on your next client"
                >
                  Try It On Your Next Client
                  <span className="inline-block transition-transform group-hover:translate-x-1" aria-hidden="true">→</span>
                </Button>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <article className="p-6 border-[3px] border-foreground rounded-xl bg-blue-400 shadow-[5px_5px_0px_0px_hsl(var(--foreground))] hover:shadow-[7px_7px_0px_0px_hsl(var(--primary))] hover:-translate-y-1 hover:scale-105 transition-all duration-300 animate-fade-in flex flex-col">
              <div className="bg-card border-2 border-foreground w-14 h-14 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-[2px_2px_0px_0px_hsl(var(--foreground))] flex-shrink-0">
                <Scissors className="h-7 w-7 text-info" aria-hidden="true" />
              </div>
              <h2 className="font-display font-bold text-xl mb-2 text-foreground text-center">Color Genius. Zero Guesswork.</h2>
              <p className="text-foreground/80 text-sm font-medium text-center">
                Upload a photo. Get the formula. Perfect results every time. Your brain for other things.
              </p>
            </article>

            <article className="p-6 border-[3px] border-foreground rounded-xl bg-green-400 shadow-[5px_5px_0px_0px_hsl(var(--foreground))] hover:shadow-[7px_7px_0px_0px_hsl(var(--accent))] hover:-translate-y-1 hover:scale-105 transition-all duration-300 animate-fade-in flex flex-col" style={{animationDelay: '100ms'}}>
              <div className="bg-card border-2 border-foreground w-14 h-14 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-[2px_2px_0px_0px_hsl(var(--foreground))] flex-shrink-0">
                <Calendar className="h-7 w-7 text-success" aria-hidden="true" />
              </div>
              <h2 className="font-display font-bold text-xl mb-2 text-foreground text-center">One Link. Done.</h2>
              <p className="text-foreground/80 text-sm font-medium text-center">
                Drop your booking link. Clients book 24/7. No more DM tennis. No double-bookings. Just shows.
              </p>
            </article>

            <article className="p-6 border-[3px] border-foreground rounded-xl bg-yellow-300 shadow-[5px_5px_0px_0px_hsl(var(--foreground))] hover:shadow-[7px_7px_0px_0px_hsl(var(--secondary))] hover:-translate-y-1 hover:scale-105 transition-all duration-300 animate-fade-in flex flex-col" style={{animationDelay: '200ms'}}>
              <div className="bg-card border-2 border-foreground w-14 h-14 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-[2px_2px_0px_0px_hsl(var(--foreground))] flex-shrink-0">
                <MessageSquare className="h-7 w-7 text-warning" aria-hidden="true" />
              </div>
              <h2 className="font-display font-bold text-xl mb-2 text-foreground text-center">They'll Think You Hired Help.</h2>
              <p className="text-foreground/80 text-sm font-medium text-center">
                Video consults. Instant formula shares. Every conversation tracked. Loyalty that lasts. All you.
              </p>
            </article>
          </div>
        </div>
      </main>

      <footer className="border-t-4 border-foreground mt-20 py-8 bg-muted">
        <div className="container mx-auto px-4 text-center text-foreground/70 font-medium">
          <p>© 2025 hA.I.r - AI-Powered Salon Assistant</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
