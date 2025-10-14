import { Card } from "@/components/ui/card";
import { X, Check } from "lucide-react";

const comparisons = [
  {
    before: "DM tennis for every booking",
    after: "One link. Clients book 24/7."
  },
  {
    before: "Guessing color formulas",
    after: "AI-powered precision every time"
  },
  {
    before: "No-shows eating your time",
    after: "Automated reminders = 90% show rate"
  },
  {
    before: "Chasing payments after service",
    after: "Prepayment processed automatically"
  },
  {
    before: "Lost client history in notebooks",
    after: "Every formula & preference tracked"
  },
  {
    before: "Double-booked calendar nightmares",
    after: "Real-time sync across all platforms"
  }
];

export const BeforeAfter = () => {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="font-display font-black text-3xl sm:text-5xl mb-4">
          Before hA.I.r vs After hA.I.r
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          See what changes when you stop fighting admin and start focusing on hair
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
        {/* Before Column */}
        <div className="space-y-4">
          <div className="text-center mb-6">
            <div className="inline-block bg-destructive/10 text-destructive px-4 py-2 rounded-lg border-2 border-destructive font-bold">
              Before: The Chaos
            </div>
          </div>
          {comparisons.map((item, idx) => (
            <Card
              key={idx}
              className="brutal-border p-4 bg-card opacity-75 animate-fade-in"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-destructive/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <X className="h-4 w-4 text-destructive" />
                </div>
                <p className="text-sm text-muted-foreground line-through">
                  {item.before}
                </p>
              </div>
            </Card>
          ))}
        </div>

        {/* After Column */}
        <div className="space-y-4">
          <div className="text-center mb-6">
            <div className="inline-block bg-success/10 text-success px-4 py-2 rounded-lg border-2 border-success font-bold">
              After: The Calm
            </div>
          </div>
          {comparisons.map((item, idx) => (
            <Card
              key={idx}
              className="brutal-border brutal-shadow-lg p-4 bg-card hover-scale transition-all animate-fade-in"
              style={{ animationDelay: `${idx * 50 + 100}ms` }}
            >
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="h-4 w-4 text-success" />
                </div>
                <p className="text-sm font-medium">
                  {item.after}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
