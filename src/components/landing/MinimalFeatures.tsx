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

  // Rotate through vibrant background colors
  const bgColors = ['bg-secondary', 'bg-accent', 'bg-primary', 'bg-secondary', 'bg-accent'];
  const iconBgColors = ['bg-accent', 'bg-primary', 'bg-secondary', 'bg-accent', 'bg-primary'];
  const iconTextColors = ['text-white', 'text-white', 'text-black', 'text-white', 'text-white'];

  return (
    <div
      ref={ref}
      onMouseEnter={handleHover}
      onTouchStart={handleHover}
      className={`relative overflow-hidden border-[3px] border-black ${bgColors[index]} shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-500 hover:-translate-y-1 p-4 xs:p-5 ${
        isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-95'
      }`}
      style={{
        transitionDelay: `${index * 150}ms`,
      }}
    >
      {/* Compact animated icon */}
      <div className={`relative w-12 h-12 xs:w-14 xs:h-14 border-[3px] border-black ${iconBgColors[index]} flex items-center justify-center mb-3 xs:mb-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-transform duration-500`}>
        <Icon className={`h-6 w-6 xs:h-7 xs:w-7 ${iconTextColors[index]}`} strokeWidth={2.5} />
        
        {/* Floating number badge */}
        <div className="absolute -top-3 -right-3 w-8 h-8 xs:w-9 xs:h-9 border-[2px] border-black bg-white flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          <span className="font-pixel text-foreground text-sm xs:text-base">
            {feature.number}
          </span>
        </div>
      </div>

      {/* Headline */}
      <h3 className="font-pixel text-sm xs:text-base text-foreground uppercase tracking-wide mb-2 xs:mb-3 leading-tight">
        {feature.headline}
      </h3>
      
      {/* Description */}
      <p className="text-xs xs:text-sm font-sans text-foreground/90 leading-snug">
        {feature.description}
      </p>

      {/* Decorative corner accent */}
      <div className="absolute bottom-0 right-0 w-12 h-12 opacity-20">
        <div className="absolute bottom-0 right-0 w-6 h-6 border-l-[2px] border-t-[2px] border-black"></div>
        <div className="absolute bottom-1 right-1 w-6 h-6 border-l-[2px] border-t-[2px] border-black"></div>
      </div>
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
      {/* Section Header with dramatic styling */}
      <div className="text-center mb-6 xs:mb-8">
        <div className="inline-block border-[3px] border-black px-4 py-2 mb-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-pulse-subtle" style={{ backgroundColor: 'hsl(140 50% 35%)' }}>
          <h2 className="font-pixel text-lg xs:text-xl sm:text-2xl text-secondary uppercase tracking-wider">
            {header.title}
          </h2>
        </div>
        <p className="font-sans text-sm xs:text-base text-foreground max-w-2xl mx-auto font-medium">
          {header.subtitle}
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 lg:gap-6 max-w-7xl mx-auto">
        {features.map((feature, index) => (
          <FeatureCard key={feature.title} feature={feature} index={index} />
        ))}
      </div>
    </div>
  );
};
