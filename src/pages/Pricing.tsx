import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Zap } from 'lucide-react';
import { MetaTags } from '@/components/MetaTags';
import { useToast } from '@/hooks/use-toast';

const tiers = [
  {
    name: 'Free',
    price: '$0',
    description: 'Perfect for getting started',
    features: [
      '10 clients',
      'Basic appointment scheduling',
      'Client profiles',
      'Email support'
    ],
    cta: 'Current Plan',
    current: true
  },
  {
    name: 'Pro',
    price: '$29',
    period: '/month',
    description: 'Everything you need to grow',
    features: [
      'Unlimited clients',
      'AI formula generation',
      'Client retention insights',
      'Photo analysis',
      'Priority support',
      'Calendar integrations'
    ],
    cta: 'Upgrade to Pro',
    popular: true
  },
  {
    name: 'Team',
    price: '$99',
    period: '/month',
    description: 'For salons and teams',
    features: [
      'Everything in Pro',
      'Multi-stylist support',
      'Team collaboration',
      'Advanced analytics',
      'White-label booking pages',
      'Dedicated account manager'
    ],
    cta: 'Upgrade to Team'
  }
];

export default function Pricing() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleUpgrade = async (tierName: string) => {
    setLoading(true);
    toast({
      title: "Redirecting to checkout...",
      description: `Upgrading to ${tierName} plan`
    });
    // Stripe checkout logic would go here
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <>
      <MetaTags 
        title="Pricing - Choose Your Plan"
        description="Simple, transparent pricing for hair salons of all sizes"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold">Simple, Transparent Pricing</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose the plan that's right for your business. Upgrade, downgrade, or cancel anytime.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {tiers.map((tier) => (
              <Card 
                key={tier.name}
                className={tier.popular ? 'border-primary shadow-lg scale-105' : ''}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">
                      <Zap className="w-3 h-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pt-8">
                  <CardTitle className="text-2xl">{tier.name}</CardTitle>
                  <CardDescription>{tier.description}</CardDescription>
                  <div className="pt-4">
                    <span className="text-4xl font-bold">{tier.price}</span>
                    {tier.period && (
                      <span className="text-muted-foreground">{tier.period}</span>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter>
                  <Button
                    className="w-full"
                    variant={tier.current ? 'outline' : tier.popular ? 'default' : 'outline'}
                    disabled={tier.current || loading}
                    onClick={() => handleUpgrade(tier.name)}
                  >
                    {tier.cta}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          <div className="text-center text-sm text-muted-foreground pt-8">
            <p>All plans include 14-day money-back guarantee</p>
          </div>
        </div>
      </div>
    </>
  );
}
