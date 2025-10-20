import { Sparkles, Calendar, CreditCard, Heart, Smartphone } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const features = [
  {
    icon: Calendar,
    title: "Smart Appointment Booking",
    headline: "ZERO DOUBLE-BOOKINGS",
    description: "AI cross-checks your calendar, blocks conflicts, sends you alerts before they happen. Never lose a client to scheduling chaos again.",
    number: "①",
  },
  {
    icon: Smartphone,
    title: "Automated Reminders",
    headline: "CLIENTS NEVER MISS",
    description: "Automatic text & email reminders mean 90% fewer no-shows. Your clients remember. Your chair stays full. Your time stays valuable.",
    number: "②",
  },
  {
    icon: Heart,
    title: "Personalized Client Management",
    headline: "EVERY DETAIL REMEMBERED",
    description: "Hair history, preferences, formulas—instantly accessible. Spend less time taking notes, more time creating magic.",
    number: "③",
  },
  {
    icon: Sparkles,
    title: "Formula Tracking & Hair History",
    headline: "NEVER GUESS AGAIN",
    description: "Every color formula, treatment, product—saved forever. Access complete client history in one tap. Consistency = loyalty.",
    number: "④",
  },
  {
    icon: CreditCard,
    title: "Instant Payments",
    headline: "GET PAID IMMEDIATELY",
    description: "Secure in-app payments. Track earnings automatically. No awkward cash exchanges. No spreadsheets. Just instant deposits.",
    number: "⑤",
  },
];

const FeatureCard = ({ feature, index }: { feature: typeof features[0]; index: number }) => {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 });
  const Icon = feature.icon;

  return (
    <div
      ref={ref}
      className={`space-y-4 brutal-border bg-card p-6 brutal-shadow hover:brutal-shadow-lg transition-all duration-300 hover:-translate-y-1 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
      style={{
        transitionDelay: `${index * 100}ms`,
      }}
    >
      <div className="relative w-16 h-16 brutal-border bg-accent flex items-center justify-center group">
...
        <div className="absolute -top-3 -right-3 w-8 h-8 brutal-border bg-primary flex items-center justify-center">
          <span className="font-pixel text-primary-foreground text-sm">
            {feature.number}
          </span>
        </div>
      </div>
      <h3 className="font-pixel text-sm xs:text-base text-accent uppercase tracking-wide">
        {feature.headline}
      </h3>
      <p className="text-sm xs:text-base font-sans text-foreground leading-relaxed">
        {feature.description}
      </p>
    </div>
  );
};

export const MinimalFeatures = () => {
  return (
    <div className="container mx-auto px-4">
      <div className="text-center mb-16">
        <h2 className="font-pixel text-xl xs:text-2xl sm:text-3xl mb-4 text-foreground uppercase tracking-wider">
          THE PROBLEMS WE SOLVE
        </h2>
        <p className="font-sans text-sm xs:text-base text-muted-foreground max-w-2xl mx-auto">
          No more chaos. Just clients, color, and calm.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-7xl mx-auto">
        {features.map((feature, index) => (
          <FeatureCard key={feature.title} feature={feature} index={index} />
        ))}
      </div>
    </div>
  );
};
