import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const features = [
  "Unlimited bookings",
  "AI color formulas",
  "Payment processing",
  "Client management",
];

export const SimplePricingCTA = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4">
      <div className="max-w-lg mx-auto text-center">
        <h2 className="font-pixel text-2xl sm:text-3xl mb-8 text-secondary-foreground uppercase tracking-wider">
          Simple Pricing
        </h2>

        <div className="border-4 border-black bg-white p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="mb-8">
            <div className="flex items-start justify-center gap-2 mb-4">
              <span className="font-pixel text-5xl sm:text-6xl text-foreground">$49</span>
              <span className="font-pixel text-base text-muted-foreground mt-2">/mo</span>
            </div>
            <p className="font-pixel text-xs text-muted-foreground uppercase">14-Day Free Trial</p>
          </div>

          <ul className="space-y-4 mb-8 text-left">
            {features.map((feature) => (
              <li key={feature} className="flex items-center gap-3">
                <div className="flex-shrink-0 w-6 h-6 border-2 border-black bg-success flex items-center justify-center">
                  <Check className="h-4 w-4 text-success-foreground" strokeWidth={3} />
                </div>
                <span className="font-sans text-sm text-foreground">{feature}</span>
              </li>
            ))}
          </ul>

          <Button
            size="lg"
            onClick={() => navigate("/auth")}
            className="w-full text-base sm:text-lg py-6 font-pixel uppercase bg-primary text-primary-foreground hover:bg-primary/90 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-y-1 rounded-none"
          >
            Start Free Trial
          </Button>
        </div>
      </div>
    </div>
  );
};
