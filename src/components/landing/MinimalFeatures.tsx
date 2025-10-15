import { Calendar, Palette, CreditCard } from "lucide-react";

const features = [
  {
    icon: Calendar,
    title: "Smart Booking",
    description: "AI handles scheduling",
  },
  {
    icon: Palette,
    title: "Color Formulas",
    description: "Perfect mix every time",
  },
  {
    icon: CreditCard,
    title: "Auto Payments",
    description: "Get paid instantly",
  },
];

export const MinimalFeatures = () => {
  return (
    <div className="container mx-auto px-4">
      <div className="text-center mb-12">
        <h2 className="font-display font-black text-3xl sm:text-4xl mb-2 text-foreground">
          Three tools. One app.
        </h2>
        <p className="text-muted-foreground text-lg">Everything you need to run your salon</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <div key={index} className="text-center space-y-3">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
                <Icon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-display font-bold text-xl text-foreground">
                {feature.title}
              </h3>
              <p className="text-muted-foreground">
                {feature.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
