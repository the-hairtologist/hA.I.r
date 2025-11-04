import { Check, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

const plans = [
  {
    name: 'Starter',
    price: 'Free',
    description: 'Perfect for getting started',
    features: [
      'AI Color Formula Generator',
      'Basic booking calendar',
      'Up to 20 clients',
      'Email support',
    ],
    cta: 'Start Free',
    popular: false,
  },
  {
    name: 'Professional',
    price: '$29',
    period: '/month',
    description: 'For busy stylists',
    features: [
      'Everything in Starter',
      'Unlimited clients',
      'Automated reminders',
      'Client messaging',
      'Payment processing',
      'Priority support',
    ],
    cta: 'Start 14-Day Trial',
    popular: true,
  },
  {
    name: 'Salon',
    price: '$79',
    period: '/month',
    description: 'For teams & salon owners',
    features: [
      'Everything in Professional',
      'Multi-stylist management',
      'Advanced analytics',
      'Team collaboration tools',
      'White-label booking page',
      'Dedicated account manager',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
];

export const PricingPreview = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="text-center">
        <h2 className="font-pixel font-black text-3xl sm:text-5xl mb-3">
          Simple pricing
        </h2>
        <p className="font-sans text-muted-foreground">
          Start free. Scale when ready. Cancel anytime.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {plans.map((plan, idx) => (
          <Card
            key={idx}
            className={`brutal-border p-6 hover-scale transition-all duration-300 flex flex-col relative ${
              plan.popular
                ? 'brutal-shadow-xl bg-primary text-primary-foreground scale-105'
                : 'brutal-shadow-lg bg-card'
            }`}
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            {plan.popular && (
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-secondary text-secondary-foreground border-2 border-foreground px-4 py-1">
                <Sparkles className="h-3 w-3 mr-1" />
                Most Popular
              </Badge>
            )}

            <div className="mb-6">
              <h3 className="font-pixel font-bold text-2xl mb-2">
                {plan.name}
              </h3>
              <p
                className={`text-sm font-sans mb-4 ${plan.popular ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}
              >
                {plan.description}
              </p>
              <div className="flex items-baseline gap-1">
                <span className="font-display font-black text-5xl">
                  {plan.price}
                </span>
                {plan.period && (
                  <span
                    className={
                      plan.popular
                        ? 'text-primary-foreground/80'
                        : 'text-muted-foreground'
                    }
                  >
                    {plan.period}
                  </span>
                )}
              </div>
            </div>

            <ul className="space-y-3 mb-8 flex-1">
              {plan.features.map((feature, featureIdx) => (
                <li key={featureIdx} className="flex items-start gap-2">
                  <Check
                    className={`h-5 w-5 flex-shrink-0 mt-0.5 ${plan.popular ? 'text-primary-foreground' : 'text-primary'}`}
                  />
                  <span
                    className={`text-sm ${plan.popular ? 'text-primary-foreground/90' : 'text-foreground/80'}`}
                  >
                    {feature}
                  </span>
                </li>
              ))}
            </ul>

            <Button
              onClick={() => navigate('/auth')}
              className={`w-full font-bold ${
                plan.popular
                  ? 'bg-secondary text-secondary-foreground hover:bg-secondary/90 border-2 border-foreground'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90'
              }`}
            >
              {plan.cta}
            </Button>
          </Card>
        ))}
      </div>

      <p className="text-center text-sm text-muted-foreground">
        All plans include 14-day free trial • No credit card required • Cancel
        anytime
      </p>
    </div>
  );
};
