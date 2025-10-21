import { Sparkles, Calendar, CreditCard, Heart, Smartphone } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { analytics } from "@/lib/analytics";

// Variant A: Pain-focused messaging (PROBLEMS WE FIX)
const featuresA = [
  {
    icon: Calendar,
    title: "Smart Appointment Booking",
    headline: "STOP DOUBLE-BOOKINGS",
    description: "AI cross-checks your calendar, blocks conflicts, sends alerts before disasters happen. Never lose a client to scheduling chaos again.",
    number: "①",
  },
  {
    icon: Smartphone,
    title: "Automated Reminders",
    headline: "END NO-SHOWS",
    description: "Automatic text & email reminders mean 90% fewer no-shows. Stop losing money to empty chairs. Keep your schedule full.",
    number: "②",
  },
  {
    icon: Heart,
    title: "Personalized Client Management",
    headline: "STOP FORGETTING DETAILS",
    description: "Hair history, preferences, formulas—instantly accessible. No more awkward \"what did we do last time?\" moments. Every client feels special.",
    number: "③",
  },
  {
    icon: Sparkles,
    title: "Formula Tracking & Hair History",
    headline: "END THE GUESSWORK",
    description: "Every color formula, treatment, product—saved forever. Stop recreating formulas from memory. Consistency = loyalty.",
    number: "④",
  },
  {
    icon: CreditCard,
    title: "Instant Payments",
    headline: "STOP PAYMENT HASSLES",
    description: "Secure in-app payments. No awkward cash exchanges. No spreadsheet nightmares. Just instant deposits to your account.",
    number: "⑤",
  },
];

// Variant B: Aspiration-focused messaging (WHAT YOU CAN BUILD)
const featuresB = [
  {
    icon: Calendar,
    title: "Smart Appointment Booking",
    headline: "SCALE YOUR SCHEDULE",
    description: "AI-powered calendar management lets you see more clients without the stress. Build the fully-booked salon you've always dreamed of.",
    number: "①",
  },
  {
    icon: Smartphone,
    title: "Automated Reminders",
    headline: "BUILD CLIENT LOYALTY",
    description: "Automated reminders keep clients coming back. 90% retention means predictable income. Build your dream clientele.",
    number: "②",
  },
  {
    icon: Heart,
    title: "Personalized Client Management",
    headline: "CREATE RAVING FANS",
    description: "Remember every detail effortlessly. Build relationships that turn one-time clients into lifelong fans who refer their friends.",
    number: "③",
  },
  {
    icon: Sparkles,
    title: "Formula Tracking & Hair History",
    headline: "BECOME THE GO-TO EXPERT",
    description: "Access complete client history instantly. Deliver consistent, perfect results every time. Build your reputation as the best in town.",
    number: "④",
  },
  {
    icon: CreditCard,
    title: "Instant Payments",
    headline: "GROW YOUR INCOME",
    description: "Track earnings automatically. See your business growth in real-time. Build the profitable salon you deserve.",
    number: "⑤",
  },
];

// Variant C: Simplicity-focused messaging (HOW EASY IT IS)
const featuresC = [
  {
    icon: Calendar,
    title: "Smart Appointment Booking",
    headline: "SCHEDULING, SIMPLIFIED",
    description: "One tap to book. One tap to reschedule. AI handles conflicts automatically. It just works.",
    number: "①",
  },
  {
    icon: Smartphone,
    title: "Automated Reminders",
    headline: "SET IT, FORGET IT",
    description: "Reminders send automatically. Clients show up on time. You focus on hair, not phone calls.",
    number: "②",
  },
  {
    icon: Heart,
    title: "Personalized Client Management",
    headline: "EVERYTHING IN ONE TAP",
    description: "Client walks in. You tap their name. Their entire history appears. Simple as that.",
    number: "③",
  },
  {
    icon: Sparkles,
    title: "Formula Tracking & Hair History",
    headline: "FORMULAS, REMEMBERED",
    description: "Snap a photo. Save the formula. Access it anytime. No notebooks. No guessing. Just results.",
    number: "④",
  },
  {
    icon: CreditCard,
    title: "Instant Payments",
    headline: "TAP TO GET PAID",
    description: "Client pays in-app. Money hits your account. No cash counting. No spreadsheets. Done.",
    number: "⑤",
  },
];

type Feature = typeof featuresA[0];

const FeatureCard = ({ feature, index }: { feature: Feature; index: number }) => {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 });
  const Icon = feature.icon;

  const handleHover = () => {
    analytics.featureHovered('A', feature.title);
  };

  return (
    <div
      ref={ref}
      onMouseEnter={handleHover}
      onTouchStart={handleHover}
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
  const features = featuresA;
  
  const header = {
    title: "THE PROBLEMS WE SOLVE",
    subtitle: "Stop the chaos. Reclaim your time.",
  };
  
  return (
    <div className="container mx-auto px-4">
      <div className="text-center mb-6 xs:mb-8">
        <h2 className="font-pixel text-lg xs:text-xl sm:text-2xl mb-3 text-foreground uppercase tracking-wider">
          {header.title}
        </h2>
        <p className="font-sans text-xs xs:text-sm text-muted-foreground max-w-2xl mx-auto">
          {header.subtitle}
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 xs:gap-8 max-w-7xl mx-auto">
        {features.map((feature, index) => (
          <FeatureCard key={feature.title} feature={feature} index={index} />
        ))}
      </div>
    </div>
  );
};
