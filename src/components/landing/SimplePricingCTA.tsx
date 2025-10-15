import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
        <h2 className="font-display font-black text-3xl sm:text-4xl mb-3 text-foreground">
          Simple pricing
        </h2>
        <p className="text-muted-foreground mb-8">
          Everything you need, one price
        </p>

        <Card className="p-8 bg-card border-border">
          <div className="mb-6">
            <div className="text-5xl font-display font-black text-foreground mb-2">
              $49
              <span className="text-xl text-muted-foreground font-normal">/month</span>
            </div>
            <p className="text-muted-foreground">14-day free trial</p>
          </div>

          <ul className="space-y-3 mb-8 text-left">
            {features.map((feature) => (
              <li key={feature} className="flex items-center gap-3">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-success/10 flex items-center justify-center">
                  <Check className="h-3 w-3 text-success" />
                </div>
                <span className="text-card-foreground">{feature}</span>
              </li>
            ))}
          </ul>

          <Button
            size="lg"
            onClick={() => navigate("/auth")}
            className="w-full text-lg font-bold"
          >
            Start Free Trial
          </Button>
        </Card>
      </div>
    </div>
  );
};
