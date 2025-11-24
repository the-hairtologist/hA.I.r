import { Card, CardContent } from '@/components/ui/card';
import { Star, TrendingUp } from 'lucide-react';
import { LiveActivityFeed } from '@/components/social/LiveActivityFeed';
import { cn } from '@/lib/utils';

const testimonials = [
  {
    name: 'Sarah M.',
    role: 'Salon Owner',
    text: 'hA.I.r cut my admin time by 40%. Now I focus on what I love - styling hair!',
    rating: 5,
  },
  {
    name: 'Alex K.',
    role: 'Independent Stylist',
    text: 'The AI formulas are game-changing. My color consistency has never been better.',
    rating: 5,
  },
  {
    name: 'Jamie L.',
    role: 'Barber',
    text: 'Booking management is effortless. Clients love the automated reminders.',
    rating: 5,
  },
];

export const SocialProof = () => {
  return (
    <section className="py-12 sm:py-16 md:py-20">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Live Activity Feed */}
        <div className="mb-8 sm:mb-12">
          <LiveActivityFeed />
        </div>

        {/* Testimonials */}
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h3 className="text-xl sm:text-2xl md:text-3xl font-pixel uppercase">
              Stylists Love Us
            </h3>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Star className="h-5 w-5 fill-primary text-primary" />
              <span className="font-bold">4.9/5</span>
              <span>from 2,000+ reviews</span>
            </div>
          </div>

          <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
            {testimonials.map((testimonial, idx) => (
              <Card
                key={idx}
                className={cn(
                  'brutal-border brutal-shadow-sm animate-fade-in hover:brutal-shadow-md transition-all'
                )}
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <CardContent className="p-4 sm:p-6 space-y-3">
                  <div className="flex gap-1">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 fill-primary text-primary"
                      />
                    ))}
                  </div>
                  <p className="text-sm text-foreground">{testimonial.text}</p>
                  <div className="pt-2 border-t">
                    <p className="font-semibold text-sm">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {testimonial.role}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8">
            {[
              { value: '2,000+', label: 'Active Stylists' },
              { value: '50k+', label: 'Bookings' },
              { value: '10k+', label: 'Formulas Saved' },
              { value: '40%', label: 'Time Saved' },
            ].map((stat, idx) => (
              <div
                key={idx}
                className={cn(
                  'text-center p-4 brutal-border bg-primary/5 animate-scale-in'
                )}
                style={{ animationDelay: `${idx * 75}ms` }}
              >
                <div className="flex items-center justify-center gap-1 mb-1">
                  <TrendingUp className="h-4 w-4 text-success" />
                  <p className="text-xl sm:text-2xl font-pixel text-primary">
                    {stat.value}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground uppercase">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
