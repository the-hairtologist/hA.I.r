import { Upload, Zap, CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/card";

const steps = [
  {
    number: "01",
    title: "Sign Up in 60 Seconds",
    description: "Create your account, set your services, add your booking link. You're live.",
    icon: Upload,
    color: "bg-primary/10"
  },
  {
    number: "02",
    title: "Let AI Assist You",
    description: "Get AI-powered formula suggestions. Bookings available 24/7. Set up automated reminders.",
    icon: Zap,
    color: "bg-accent/10"
  },
  {
    number: "03",
    title: "Focus on Hair",
    description: "No more admin chaos. Just you doing what you do best.",
    icon: CheckCircle,
    color: "bg-secondary/10"
  }
];

export const HowItWorks = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="text-center space-y-3">
        <h2 className="font-display font-black text-3xl sm:text-5xl">
          Three steps to freedom
        </h2>
        <p className="text-muted-foreground">
          Setup takes 60 seconds. No tech skills needed.
        </p>
      </div>

      <div className="space-y-6">
        {steps.map((step, idx) => (
          <Card key={idx} className="brutal-border brutal-shadow-lg p-6 hover-scale transition-all bg-card">
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 border-foreground flex-shrink-0 ${step.color}`}>
                <step.icon className="h-6 w-6" />
              </div>
              <div className="flex-1 pt-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs font-bold px-2 py-1 rounded border border-foreground bg-muted">
                    {step.number}
                  </span>
                  <h3 className="font-display font-bold text-lg">
                    {step.title}
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
