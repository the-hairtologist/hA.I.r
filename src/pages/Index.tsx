import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Scissors, Sparkles, Calendar, MessageSquare } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="container mx-auto px-4 py-6 border-b-4 border-foreground">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scissors className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-display font-bold">hA.I.r</h1>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate("/auth")}>
              Sign In
            </Button>
            <Button onClick={() => navigate("/auth")}>
              Get Started
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Sparkles className="h-12 w-12 text-primary animate-pulse" />
          </div>
          <h2 className="text-5xl md:text-6xl font-display font-bold mb-6 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
            Transform Every Color Service with AI-Powered Precision
          </h2>
          <p className="text-xl text-foreground/70 mb-12 max-w-2xl mx-auto font-medium">
            Say goodbye to guesswork. Generate professional color formulas in seconds, manage your entire salon workflow, and deliver flawless results—every single time.
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="p-6 border-[3px] border-foreground rounded-xl bg-blue-400 shadow-[5px_5px_0px_0px_hsl(var(--foreground))] hover:shadow-[7px_7px_0px_0px_hsl(var(--primary))] hover:-translate-y-1 transition-all">
              <div className="bg-white border-2 border-foreground w-14 h-14 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-[2px_2px_0px_0px_hsl(var(--foreground))]">
                <Scissors className="h-7 w-7 text-blue-600" />
              </div>
              <h3 className="font-display font-bold text-xl mb-2 text-foreground">Instant AI Formulas</h3>
              <p className="text-foreground/80 text-sm font-medium">
                Upload a photo, describe the look—and get 2-3 expert formulas with step-by-step instructions. No guesswork, just results.
              </p>
            </div>

            <div className="p-6 border-[3px] border-foreground rounded-xl bg-green-400 shadow-[5px_5px_0px_0px_hsl(var(--foreground))] hover:shadow-[7px_7px_0px_0px_hsl(var(--accent))] hover:-translate-y-1 transition-all">
              <div className="bg-white border-2 border-foreground w-14 h-14 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-[2px_2px_0px_0px_hsl(var(--foreground))]">
                <Calendar className="h-7 w-7 text-green-600" />
              </div>
              <h3 className="font-display font-bold text-xl mb-2 text-foreground">Effortless Booking</h3>
              <p className="text-foreground/80 text-sm font-medium">
                Smart calendar that prevents double-bookings automatically. Clients book instantly, you stay organized—zero stress.
              </p>
            </div>

            <div className="p-6 border-[3px] border-foreground rounded-xl bg-yellow-300 shadow-[5px_5px_0px_0px_hsl(var(--foreground))] hover:shadow-[7px_7px_0px_0px_hsl(var(--secondary))] hover:-translate-y-1 transition-all">
              <div className="bg-white border-2 border-foreground w-14 h-14 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-[2px_2px_0px_0px_hsl(var(--foreground))]">
                <MessageSquare className="h-7 w-7 text-yellow-600" />
              </div>
              <h3 className="font-display font-bold text-xl mb-2 text-foreground">Client Connection Hub</h3>
              <p className="text-foreground/80 text-sm font-medium">
                Send video consultations, share formulas instantly, and keep every conversation in one place. Build trust, boost loyalty.
              </p>
            </div>
          </div>

          <Button size="lg" onClick={() => navigate("/auth")} className="text-lg px-8 py-6 font-display">
            Start Creating Perfect Color—Free
          </Button>
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
