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
      
      <header className="container mx-auto px-4 py-6 border-b-4 border-foreground" role="banner">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scissors className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-display font-bold">hA.I.r</h1>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => navigate("/privacy")} className="text-sm">
              Privacy
            </Button>
            <Button variant="ghost" onClick={() => navigate("/terms")} className="text-sm">
              Terms
            </Button>
            <Button variant="outline" onClick={() => navigate("/auth")}>
              Sign In
            </Button>
            <Button onClick={() => navigate("/auth")}>
              Get Started
            </Button>
          </div>
        </div>
      </header>

      <main id="main-content" className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto mb-16">
          <div className="window-frame bg-gradient-to-br from-blue-400 via-cyan-300 to-green-300 mb-16 relative">
            <div className="window-titlebar">
              <span className="text-background font-mono text-sm font-bold">hA.I.r / welcome</span>
              <div className="window-controls">
                <div className="window-control bg-background"></div>
                <div className="window-control bg-background"></div>
                <div className="window-control bg-background"></div>
              </div>
            </div>
            
            <div className="bg-blue-600 p-8 md:p-16 relative min-h-[500px] text-center">
              <div className="window-scrollbar"></div>
              
              <div className="max-w-4xl mx-auto relative z-10">
                <div className="flex items-center justify-center gap-4 mb-8">
                  <Scissors className="h-12 w-12 text-pink-400" />
                  <div className="text-5xl">✨</div>
                  <div className="w-12 h-12 border-4 border-pink-400 rotate-45"></div>
                  <div className="text-5xl">🎨</div>
                </div>
                
                <h1 className="text-5xl md:text-7xl font-display font-black mb-8 text-pink-400 uppercase leading-tight">
                  Transform Every Color Service
                </h1>
                
                <p className="text-xl md:text-2xl font-bold text-pink-300 mb-4">
                  AI-Powered Precision
                </p>
                
                <p className="text-base md:text-lg font-medium text-pink-200 mb-12 max-w-2xl mx-auto">
                  Stop wasting time on guesswork and inconsistent results. Generate flawless color formulas in seconds, automate your bookings, and deliver the transformations your clients crave—every single time.
                </p>
                
                <Button 
                  size="lg" 
                  onClick={() => navigate("/auth")} 
                  className="text-xl px-12 py-6 font-display font-black bg-pink-500 text-white hover:bg-pink-600 border-4 border-pink-400 hover:translate-x-1 hover:translate-y-1 transition-all hover:scale-105 uppercase group"
                  aria-label="Start your free trial"
                >
                  Start Free
                  <span className="inline-block transition-transform group-hover:translate-x-1" aria-hidden="true">→</span>
                </Button>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <article className="p-6 border-[3px] border-foreground rounded-xl bg-blue-400 shadow-[5px_5px_0px_0px_hsl(var(--foreground))] hover:shadow-[7px_7px_0px_0px_hsl(var(--primary))] hover:-translate-y-1 hover:scale-105 transition-all duration-300 animate-fade-in">
              <div className="bg-white border-2 border-foreground w-14 h-14 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-[2px_2px_0px_0px_hsl(var(--foreground))]">
                <Scissors className="h-7 w-7 text-blue-600" aria-hidden="true" />
              </div>
              <h2 className="font-display font-bold text-xl mb-2 text-foreground">AI Formulas in Seconds</h2>
              <p className="text-foreground/80 text-sm font-medium">
                Upload a photo, describe your vision—get 2-3 professional formulas with precise measurements and step-by-step instructions. Perfect results, zero guesswork.
              </p>
            </article>

            <article className="p-6 border-[3px] border-foreground rounded-xl bg-green-400 shadow-[5px_5px_0px_0px_hsl(var(--foreground))] hover:shadow-[7px_7px_0px_0px_hsl(var(--accent))] hover:-translate-y-1 hover:scale-105 transition-all duration-300 animate-fade-in" style={{animationDelay: '100ms'}}>
              <div className="bg-white border-2 border-foreground w-14 h-14 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-[2px_2px_0px_0px_hsl(var(--foreground))]">
                <Calendar className="h-7 w-7 text-green-600" aria-hidden="true" />
              </div>
              <h2 className="font-display font-bold text-xl mb-2 text-foreground">Never Miss a Booking</h2>
              <p className="text-foreground/80 text-sm font-medium">
                Smart scheduling that prevents double-bookings and sends automatic reminders. Clients book 24/7, your calendar stays organized—zero stress.
              </p>
            </article>

            <article className="p-6 border-[3px] border-foreground rounded-xl bg-yellow-300 shadow-[5px_5px_0px_0px_hsl(var(--foreground))] hover:shadow-[7px_7px_0px_0px_hsl(var(--secondary))] hover:-translate-y-1 hover:scale-105 transition-all duration-300 animate-fade-in" style={{animationDelay: '200ms'}}>
              <div className="bg-white border-2 border-foreground w-14 h-14 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-[2px_2px_0px_0px_hsl(var(--foreground))]">
                <MessageSquare className="h-7 w-7 text-yellow-600" aria-hidden="true" />
              </div>
              <h2 className="font-display font-bold text-xl mb-2 text-foreground">Build Loyalty on Autopilot</h2>
              <p className="text-foreground/80 text-sm font-medium">
                Send video consultations, share formulas instantly, and keep every client conversation organized. Stronger relationships = more repeat bookings.
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
