import { Calendar, Palette, CreditCard, Smartphone } from "lucide-react";

const features = [
  {
    icon: Calendar,
    title: "Smart Booking",
    description: "AI handles scheduling",
  },
  {
    icon: Palette,
    title: "Color Formulas",
    description: "Find the perfect mix",
  },
  {
    icon: CreditCard,
    title: "Auto Payments",
    description: "Get paid instantly",
  },
  {
    icon: Smartphone,
    title: "Mobile First",
    description: "Works on any device",
  },
];

export const MinimalFeatures = () => {
  return (
    <div className="container mx-auto px-4">
      <div className="text-center mb-12">
        <h2 className="font-display font-black text-3xl sm:text-4xl mb-2 text-foreground">
          Four tools. One app.
        </h2>
        <p className="text-muted-foreground text-lg">Everything you need to run your salon</p>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <div key={index} className="text-center space-y-3">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-lg border-2 border-primary">
                <Icon className="h-8 w-8 text-primary-foreground" strokeWidth={2.5} />
              </div>
              <h3 className="font-display font-bold text-base sm:text-lg text-foreground">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
