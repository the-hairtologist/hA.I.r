import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Scissors, Sparkles, Calendar, MessageSquare } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10">
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scissors className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">hA.I.r</h1>
          </div>
          <div className="flex gap-2">
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
          <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Your AI-Powered Salon Assistant
          </h2>
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            hA.I.r helps stylists and clients manage formulas, appointments, and communication—powered by advanced AI technology.
          </p>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="p-6 border rounded-lg bg-card hover:shadow-lg transition-shadow">
              <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Scissors className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Smart Formulas</h3>
              <p className="text-muted-foreground text-sm">
                AI-generated color formulas based on hair photos and your preferred color line
              </p>
            </div>

            <div className="p-6 border rounded-lg bg-card hover:shadow-lg transition-shadow">
              <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Easy Scheduling</h3>
              <p className="text-muted-foreground text-sm">
                Visual appointment calendar with conflict prevention
              </p>
            </div>

            <div className="p-6 border rounded-lg bg-card hover:shadow-lg transition-shadow">
              <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Real-Time Communication</h3>
              <p className="text-muted-foreground text-sm">
                Instant messaging, video notes, and formula history all in one place
              </p>
            </div>
          </div>

          <Button size="lg" onClick={() => navigate("/auth")} className="text-lg px-8 py-6">
            Get Started Free
          </Button>
        </div>
      </main>

      <footer className="border-t mt-20 py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2025 hA.I.r - AI-Powered Salon Assistant</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
