/**
 * Feature Showcase Component
 * Interactive demo highlighting key selling points
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  Clock,
  DollarSign,
  Smartphone,
  Zap,
  Heart,
  TrendingUp,
  CalendarCheck,
  MessageCircle,
  Palette,
  Star,
  X,
  Play,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Feature {
  id: string;
  icon: any;
  title: string;
  benefit: string;
  description: string;
  demoAction: string;
  gradient: string;
  stat?: string;
  forRole: 'stylist' | 'client' | 'both';
}

const features: Feature[] = [
  {
    id: 'ai-formulas',
    icon: Sparkles,
    title: 'AI Formula Generator',
    benefit: 'Zero Guesswork, Perfect Results',
    description:
      'Generate professional color formulas in seconds. AI analyzes hair type, color history, and desired results to create perfect formulas every time.',
    demoAction: 'See AI in Action',
    gradient: 'from-purple-500 to-pink-500',
    stat: '2 min → 10 sec',
    forRole: 'stylist',
  },
  {
    id: 'save-time',
    icon: Clock,
    title: 'Save 2+ Hours Daily',
    benefit: 'Automate Busy Work',
    description:
      'Stop playing phone tag. Clients book themselves 24/7, get automatic reminders, and you track everything from your phone.',
    demoAction: 'See Time Savings',
    gradient: 'from-cyan-500 to-blue-500',
    stat: '2-3 hrs saved/day',
    forRole: 'stylist',
  },
  {
    id: 'revenue',
    icon: DollarSign,
    title: 'Increase Revenue',
    benefit: 'Fill Every Slot',
    description:
      'Smart scheduling fills empty slots. Track earnings in real-time. Get referral bonuses. Never miss another booking opportunity.',
    demoAction: 'View Analytics',
    gradient: 'from-green-500 to-emerald-500',
    stat: '+30% bookings',
    forRole: 'stylist',
  },
  {
    id: 'mobile-first',
    icon: Smartphone,
    title: 'Works on Your Phone',
    benefit: 'Manage Salon Anywhere',
    description:
      "You're never at a desk. We get it. Everything works perfectly on your phone - check schedule, message clients, generate formulas.",
    demoAction: 'Try Mobile View',
    gradient: 'from-orange-500 to-red-500',
    stat: '100% Mobile',
    forRole: 'stylist',
  },
  {
    id: 'instant-booking',
    icon: Zap,
    title: 'Book in 30 Seconds',
    benefit: 'No Phone Calls Needed',
    description:
      "Pick your stylist, choose a time, confirm. That's it. No waiting on hold, no voicemails, instant confirmation.",
    demoAction: 'Book Appointment',
    gradient: 'from-blue-500 to-cyan-500',
    stat: '30 sec booking',
    forRole: 'client',
  },
  {
    id: 'direct-access',
    icon: MessageCircle,
    title: 'Message Your Stylist',
    benefit: 'Direct Line to Your Pro',
    description:
      'Questions about your hair? Message your stylist anytime. Skip the salon receptionist and get answers from who knows you best.',
    demoAction: 'Send Message',
    gradient: 'from-pink-500 to-rose-500',
    stat: 'Direct access',
    forRole: 'client',
  },
  {
    id: 'professional',
    icon: Palette,
    title: 'Look Ultra-Professional',
    benefit: 'Stand Out from Competition',
    description:
      'Branded booking page, stunning portfolio, automated reviews. Clients see you as the premium choice before they even book.',
    demoAction: 'View Portfolio',
    gradient: 'from-violet-500 to-purple-500',
    stat: 'Premium image',
    forRole: 'stylist',
  },
  {
    id: 'retention',
    icon: Heart,
    title: 'Keep Clients Coming Back',
    benefit: 'Automated Loyalty',
    description:
      'Smart reminders for rebooking. Track client preferences. Never forget their formula. Turn one-time visits into lifelong clients.',
    demoAction: 'See Retention Tools',
    gradient: 'from-red-500 to-pink-500',
    stat: '+40% retention',
    forRole: 'stylist',
  },
];

interface FeatureShowcaseProps {
  role?: 'stylist' | 'client';
  onClose?: () => void;
  compact?: boolean;
}

export function FeatureShowcase({
  role = 'stylist',
  onClose,
  compact = false,
}: FeatureShowcaseProps) {
  const navigate = useNavigate();
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);
  const [playingDemo, setPlayingDemo] = useState(false);

  const filteredFeatures = features.filter(
    f => f.forRole === 'both' || f.forRole === role
  );

  const handleDemoAction = (featureId: string) => {
    setSelectedFeature(featureId);
    setPlayingDemo(true);
    // Simulate demo playing
    setTimeout(() => setPlayingDemo(false), 3000);
  };

  if (compact) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredFeatures.slice(0, 4).map(feature => {
          const Icon = feature.icon;
          return (
            <Card
              key={feature.id}
              className="group relative overflow-hidden hover:shadow-lg transition-all cursor-pointer"
              onClick={() => handleDemoAction(feature.id)}
            >
              <div
                className={cn(
                  'absolute inset-0 bg-gradient-to-br opacity-5 group-hover:opacity-10 transition-opacity',
                  feature.gradient
                )}
              />
              <CardHeader className="pb-3">
                <div
                  className={cn(
                    'w-12 h-12 rounded-lg bg-gradient-to-br flex items-center justify-center mb-3',
                    feature.gradient
                  )}
                >
                  <Icon className="h-6 w-6 text-on-surface-primary" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
                <CardDescription className="text-sm font-semibold text-primary">
                  {feature.benefit}
                </CardDescription>
              </CardHeader>
              {feature.stat && (
                <CardContent>
                  <Badge variant="secondary" className="font-mono">
                    {feature.stat}
                  </Badge>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl sm:text-4xl font-bold mb-3">
          {role === 'stylist'
            ? 'Built for Busy Stylists'
            : 'Book Smarter, Not Harder'}
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {role === 'stylist'
            ? 'Save time, make more money, and look professional - all from your phone'
            : 'Find amazing stylists, book instantly, and never repeat your hair story'}
        </p>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFeatures.map(feature => {
          const Icon = feature.icon;
          const isSelected = selectedFeature === feature.id;

          return (
            <Card
              key={feature.id}
              className={cn(
                'relative overflow-hidden transition-all cursor-pointer',
                'hover:border-primary/40',
                isSelected && 'border-primary'
              )}
              onClick={() => setSelectedFeature(feature.id)}
            >
              <CardHeader className="relative">
                {/* Icon */}
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Icon className="h-6 w-6 text-primary" />
                </div>

                {/* Stats Badge */}
                {feature.stat && (
                  <Badge
                    variant="secondary"
                    className="absolute top-4 right-4 font-mono font-bold"
                  >
                    {feature.stat}
                  </Badge>
                )}

                <CardTitle className="text-xl">{feature.title}</CardTitle>

                <CardDescription className="text-base font-medium">
                  {feature.benefit}
                </CardDescription>
              </CardHeader>

              <CardContent className="relative">
                <p className="text-sm text-muted-foreground mb-4">
                  {feature.description}
                </p>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="font-medium">Available in app</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Bottom CTA */}
      <div className="mt-12 text-center">
        <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-primary/20">
          <CardContent className="py-8">
            <TrendingUp className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">
              {role === 'stylist'
                ? 'Ready to Save Time & Grow?'
                : 'Ready to Book Smarter?'}
            </h3>
            <p className="text-muted-foreground mb-6">
              {role === 'stylist'
                ? 'Join 1,000+ stylists saving 2+ hours daily'
                : 'Join 50,000+ clients booking in seconds'}
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button
                size="lg"
                className="gap-2"
                onClick={onClose || (() => navigate('/auth'))}
              >
                <CalendarCheck className="h-5 w-5" />
                {role === 'stylist' ? 'Start Free Trial' : 'Find Your Stylist'}
              </Button>
              {onClose && (
                <Button size="lg" variant="outline" onClick={onClose}>
                  Return to App
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
