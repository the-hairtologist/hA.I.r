import { Calendar, Palette, CreditCard, Smartphone } from "lucide-react";

const features = [
  {
    icon: Calendar,
    title: "Smart Booking",
    description: "AI handles scheduling",
    number: "①",
  },
  {
    icon: Palette,
    title: "Color Formulas",
    description: "Find the perfect mix",
    number: "②",
  },
  {
    icon: CreditCard,
    title: "Secure Payments",
    description: "Get paid via Stripe",
    number: "③",
  },
  {
    icon: Smartphone,
    title: "Mobile First",
    description: "Works on any device",
    number: "④",
  },
];

export const MinimalFeatures = () => {
  return (
    <div className="container mx-auto px-4">
      <div className="text-center mb-12">
        <h2 className="font-pixel text-2xl sm:text-3xl mb-4 text-secondary-foreground uppercase tracking-wider">
          HOW IT WORKS
        </h2>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <div key={feature.title} className="text-center space-y-4">
              <div className="relative mx-auto w-24 h-24 border-4 border-black bg-accent flex items-center justify-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                <Icon className="h-12 w-12 text-accent-foreground" strokeWidth={2} />
                <div className="absolute -top-4 -right-4 w-10 h-10 border-4 border-black bg-primary flex items-center justify-center">
                  <span className="font-pixel text-primary-foreground text-lg">
                    {feature.number}
                  </span>
                </div>
              </div>
              <h3 className="font-pixel text-sm text-secondary-foreground uppercase tracking-wide">
                {feature.title}
              </h3>
              <p className="text-xs font-sans text-secondary-foreground/80">
                {feature.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
