import {
  Clock,
  DollarSign,
  Users,
  TrendingUp,
  Scissors,
  Calendar,
  Palette,
  Smartphone,
  Sparkles,
} from 'lucide-react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';

const benefits = [
  {
    icon: Clock,
    stat: '10+',
    label: 'Hours Saved',
    description: 'Every single week reclaimed from admin chaos',
  },
  {
    icon: DollarSign,
    stat: '$12K+',
    label: 'Extra Revenue',
    description: 'Average annual increase from fewer no-shows',
  },
  {
    icon: Users,
    stat: '90%',
    label: 'Show Rate',
    description: 'Clients actually show up with auto-reminders',
  },
  {
    icon: TrendingUp,
    stat: '3X',
    label: 'Repeat Bookings',
    description: 'Formula tracking = consistent results = loyalty',
  },
];

export const FinalValueProp = () => {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 });

  return (
    <section
      className="py-10 xs:py-12 sm:py-14 bg-primary relative overflow-hidden"
      style={{
        backgroundImage: `
        linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.05) 50%, transparent 100%),
        linear-gradient(0deg, transparent 0%, rgba(0,0,0,0.05) 50%, transparent 100%)
      `,
        backgroundSize: '8px 8px',
      }}
    >
      <div className="container mx-auto px-4" ref={ref}>
        {/* Unified Header */}
        <div
          className={`text-center mb-8 xs:mb-10 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <h2 className="font-pixel text-lg xs:text-xl sm:text-2xl md:text-3xl text-primary-foreground mb-5 xs:mb-6 uppercase tracking-wider leading-tight">
            STYLISTS USING hA.I.r CUT ADMIN TIME BY 40%
          </h2>

          <div className="inline-block brutal-border-subtle border-black/50 bg-accent/80 backdrop-blur-sm px-2.5 py-1 shadow-brutal-xs animate-[glow-pop_2s_ease-in-out_infinite]">
            <span className="font-pixel text-[9px] xs:text-[10px] text-secondary uppercase">
              BY THE NUMBERS
            </span>
          </div>
        </div>

        <style>{`
          @keyframes glow-pop {
            0%, 100% { 
              transform: scale(1);
              box-shadow: 2px 2px 0px 0px rgba(0,0,0,0.4);
            }
            50% { 
              transform: scale(1.05);
              box-shadow: 4px 4px 12px 0px rgba(251, 191, 36, 0.5), 2px 2px 0px 0px rgba(0,0,0,0.4);
            }
          }
        `}</style>

        {/* Animated Counters with rotating colors */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 xxs:gap-4 xs:gap-5 sm:gap-6 max-w-5xl mx-auto mb-10 xs:mb-12">
          <div
            className={`transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            style={{ transitionDelay: '0ms' }}
          >
            <AnimatedCounter
              end={5000}
              suffix="+"
              icon={Scissors}
              label="STYLISTS"
              bgColor="bg-secondary"
              borderColor="border-black"
              textColor="text-black"
            />
          </div>
          <div
            className={`transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            style={{ transitionDelay: '100ms' }}
          >
            <AnimatedCounter
              end={50000}
              suffix="+"
              icon={Calendar}
              label="BOOKINGS"
              bgColor="bg-secondary"
              borderColor="border-black"
              textColor="text-black"
            />
          </div>
          <div
            className={`transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            style={{ transitionDelay: '200ms' }}
          >
            <AnimatedCounter
              end={10000}
              suffix="+"
              icon={Palette}
              label="FORMULAS"
              bgColor="bg-secondary"
              borderColor="border-black"
              textColor="text-black"
            />
          </div>
          <div
            className={`transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            style={{ transitionDelay: '300ms' }}
          >
            <AnimatedCounter
              end={4.9}
              suffix="/5"
              icon={Smartphone}
              label="RATING"
              duration={1200}
              bgColor="bg-secondary"
              borderColor="border-black"
              textColor="text-black"
            />
          </div>
        </div>

        {/* Benefit Cards with rotating colored borders */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 xs:gap-6 max-w-6xl mx-auto">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            // Rotate through brand colors for borders and icon backgrounds
            const borderColors = [
              'border-secondary',
              'border-accent',
              'border-white',
              'border-secondary',
            ];
            const iconBgColors = [
              'bg-primary',
              'bg-accent',
              'bg-secondary',
              'bg-primary',
            ];
            const iconTextColors = [
              'text-on-surface-primary',
              'text-on-surface-primary',
              'text-foreground',
              'text-on-surface-primary',
            ];
            const statColors = [
              'text-secondary',
              'text-accent',
              'text-primary',
              'text-secondary',
            ];

            return (
              <div
                key={index}
                className={`brutal-border ${borderColors[index]} bg-white shadow-brutal-xl hover:shadow-brutal-2xl transition-all duration-300 hover:-translate-y-1 p-6 text-center min-h-[180px] ${
                  isVisible
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-8'
                }`}
                style={{
                  transitionDelay: `${(index + 4) * 100}ms`,
                }}
              >
                <div
                  className={`w-14 h-14 brutal-border ${iconBgColors[index]} flex items-center justify-center mx-auto mb-4`}
                >
                  <Icon
                    className={`h-7 w-7 ${iconTextColors[index]}`}
                    strokeWidth={2.5}
                  />
                </div>

                <div
                  className={`font-pixel text-3xl xs:text-4xl ${statColors[index]} mb-2`}
                >
                  {benefit.stat}
                </div>

                <div className="font-pixel text-xs xs:text-sm text-foreground uppercase mb-3 tracking-wide">
                  {benefit.label}
                </div>

                <p className="font-sans text-xs xs:text-sm text-muted-foreground leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
