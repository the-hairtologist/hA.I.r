import { ArrowRight, Upload, Zap, CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/card";

const steps = [
  {
    number: "01",
    title: "Sign Up in 60 Seconds",
    description: "Create your account, set your services, add your booking link. That's it. You're live.",
    icon: Upload,
    color: "from-blue-400 to-cyan-300"
  },
  {
    number: "02",
    title: "Let AI Handle the Chaos",
    description: "Upload client photos for instant color formulas. Bookings come in 24/7. Reminders go out automatically.",
    icon: Zap,
    color: "from-purple-400 to-pink-300"
  },
  {
    number: "03",
    title: "Focus on Hair, Not Admin",
    description: "No more DM tennis. No double bookings. No missed appointments. Just you doing what you do best.",
    icon: CheckCircle,
    color: "from-green-400 to-emerald-300"
  }
];

export const HowItWorks = () => {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="font-display font-black text-3xl sm:text-5xl mb-4">
          From Setup to Superpower in 3 Steps
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          No complicated onboarding. No learning curve. Just results.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 relative">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div key={idx} className="relative animate-fade-in" style={{ animationDelay: `${idx * 100}ms` }}>
              <Card className="brutal-border brutal-shadow-lg p-6 hover-scale transition-all duration-300 bg-card h-full flex flex-col">
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-4 border-2 border-foreground shadow-[3px_3px_0px_0px_hsl(var(--foreground))]`}>
                  <Icon className="h-8 w-8 text-foreground" />
                </div>
                
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="font-display font-black text-4xl text-muted-foreground/30">{step.number}</span>
                  <h3 className="font-display font-bold text-xl">{step.title}</h3>
                </div>
                
                <p className="text-muted-foreground text-sm leading-relaxed flex-1">
                  {step.description}
                </p>
              </Card>
              
              {idx < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                  <ArrowRight className="h-8 w-8 text-primary" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
