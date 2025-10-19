import { Sparkles, Calendar, CreditCard, Heart, Smartphone } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const features = [
  {
    icon: Sparkles,
    title: "AI-Powered Hair Recommendations",
    headline: "Say goodbye to guesswork.",
    description: "Our AI analyzes your hair type, style history, and goals to recommend treatments, products, and styles that actually work. Every day can be a great hair day - without trial and error.",
    number: "①",
  },
  {
    icon: Calendar,
    title: "Smart Appointment Booking",
    headline: "Never wait. Never miss a slot.",
    description: "Book appointments in seconds, see real-time availability, and get reminders. Stylists stay organized while you enjoy a seamless, stress-free experience.",
    number: "②",
  },
  {
    icon: CreditCard,
    title: "Instant Payments & Transparent Commissions",
    headline: "Pay or get paid effortlessly.",
    description: "Secure in-app payments remove awkward cash exchanges. Stylists can track earnings automatically, keeping the focus on great service - not spreadsheets.",
    number: "③",
  },
  {
    icon: Heart,
    title: "Personalized Client Management",
    headline: "Your hair story, remembered.",
    description: "Stylists access your hair history and preferences instantly, so every appointment is smarter, faster, and tailored just for you.",
    number: "④",
  },
  {
    icon: Smartphone,
    title: "Formula Tracking & Hair History",
    headline: "Never forget a formula again.",
    description: "Save every color formula, treatment, and product used. Access complete client hair history instantly—no more guessing what worked last time.",
    number: "⑤",
  },
];

const FeatureCard = ({ feature, index }: { feature: typeof features[0]; index: number }) => {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 });
  const Icon = feature.icon;

  return (
    <div
      ref={ref}
      className={`space-y-4 border-4 border-foreground bg-card p-6 shadow-[6px_6px_0px_0px_hsl(var(--foreground))] hover:shadow-[8px_8px_0px_0px_hsl(var(--foreground))] transition-all duration-300 hover:-translate-y-1 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
      style={{
        transitionDelay: `${index * 100}ms`,
      }}
    >
      <div className="relative w-20 h-20 sm:w-24 sm:h-24 border-4 border-foreground bg-accent flex items-center justify-center group">
        <Icon className="h-10 w-10 sm:h-12 sm:w-12 text-accent-foreground transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" strokeWidth={2} />
        <div className="absolute -top-3 -right-3 w-10 h-10 border-4 border-foreground bg-primary flex items-center justify-center">
          <span className="font-pixel text-primary-foreground text-base">
            {feature.number}
          </span>
        </div>
      </div>
      <h3 className="font-pixel text-xs xs:text-sm text-foreground uppercase tracking-wide">
        {feature.headline}
      </h3>
      <p className="text-xs xs:text-sm font-sans text-muted-foreground leading-relaxed">
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
          WHY HAIR PROS CHOOSE hA.I.r
        </h2>
        <p className="font-sans text-sm xs:text-base text-muted-foreground max-w-2xl mx-auto">
          Everything you need for smarter bookings, better results, and happier clients
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
