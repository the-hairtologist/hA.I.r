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
    title: "Intuitive & Engaging Interface",
    headline: "Simple enough for anyone, powerful enough for pros.",
    description: "Navigate, book, and explore AI recommendations without confusion. Beautiful design meets functionality for a seamless experience.",
    number: "⑤",
  },
];

const FeatureCard = ({ feature, index }: { feature: typeof features[0]; index: number }) => {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 });
  const Icon = feature.icon;

  return (
    <div
      ref={ref}
      className={`space-y-4 border-4 border-black bg-white p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 hover:-translate-y-1 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
      style={{
        transitionDelay: `${index * 100}ms`,
      }}
    >
      <div className="relative w-16 h-16 border-4 border-black bg-accent flex items-center justify-center group">
        <Icon className="h-8 w-8 text-accent-foreground transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" strokeWidth={2} />
        <div className="absolute -top-3 -right-3 w-8 h-8 border-4 border-black bg-primary flex items-center justify-center">
          <span className="font-pixel text-primary-foreground text-sm">
            {feature.number}
          </span>
        </div>
      </div>
      <h3 className="font-pixel text-sm text-foreground uppercase tracking-wide">
        {feature.headline}
      </h3>
      <p className="text-xs font-sans text-muted-foreground leading-relaxed">
        {feature.description}
      </p>
    </div>
  );
};

export const MinimalFeatures = () => {
  return (
    <div className="container mx-auto px-4">
      <div className="text-center mb-16">
        <h2 className="font-pixel text-2xl sm:text-3xl mb-4 text-foreground uppercase tracking-wider">
          WHY HAIR PROS CHOOSE hA.I.r
        </h2>
        <p className="font-sans text-base text-muted-foreground max-w-2xl mx-auto">
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
