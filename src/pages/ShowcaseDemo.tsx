/**
 * Showcase Demo Page
 * Full-page interactive demo for potential users
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FeatureShowcase } from "@/components/showcase/FeatureShowcase";
import { Scissors, ArrowRight, X, Sparkles, Download } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ShowcaseDemo() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<"stylist" | "client">("stylist");

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-gradient-to-br from-background via-background to-primary/5 animate-fade-in">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <button 
            onClick={() => navigate("/")}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <Scissors className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold font-pixel">hA.I.r</h1>
          </button>

          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="hidden sm:flex gap-1">
              <Sparkles className="h-3 w-3" />
              Interactive Demo
            </Badge>
            <Button onClick={() => navigate("/auth")} className="gap-2">
              Get Started Free
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate(-1)}
              className="ml-2"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Role Selector */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center mb-8 animate-scale-in">
          <div className="inline-flex p-1 bg-muted rounded-lg brutal-border brutal-shadow-md">
            <Button
              variant={selectedRole === "stylist" ? "default" : "ghost"}
              onClick={() => setSelectedRole("stylist")}
              className="gap-2 transition-all hover-scale"
            >
              <Scissors className="h-4 w-4" />
              I'm a Stylist
            </Button>
            <Button
              variant={selectedRole === "client" ? "default" : "ghost"}
              onClick={() => setSelectedRole("client")}
              className="gap-2 transition-all hover-scale"
            >
              I'm a Client
            </Button>
          </div>
        </div>

        {/* Feature Showcase */}
        <FeatureShowcase role={selectedRole} />
      </div>

      {/* Social Proof Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 rounded-2xl p-8 md:p-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-3">Trusted by Professionals</h2>
            <p className="text-lg text-muted-foreground">
              Join thousands who've already upgraded their salon experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">1,000+</div>
              <div className="text-sm text-muted-foreground">Active Stylists</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">50K+</div>
              <div className="text-sm text-muted-foreground">Happy Clients</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">247K+</div>
              <div className="text-sm text-muted-foreground">Appointments Booked</div>
            </div>
          </div>

          <div className="text-center mt-8">
            <Button size="lg" onClick={() => navigate("/auth")} className="gap-2">
              <Sparkles className="h-5 w-5" />
              Start Your Free Trial
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <div className="mb-4">
            <Button 
              variant="outline"
              onClick={() => navigate("/install")}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Install App
            </Button>
          </div>
          <p>© 2025 hA.I.r. All rights reserved.</p>
          <p className="mt-2">
            No credit card required • Cancel anytime • 14-day free trial
          </p>
        </div>
      </footer>
    </div>
  );
}
