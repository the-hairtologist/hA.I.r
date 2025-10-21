import { Clock, DollarSign, Users, TrendingUp, Scissors, Calendar, Palette, Smartphone } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";

const benefits = [
  {
    icon: Clock,
    stat: "10+",
    label: "Hours Saved",
    description: "Every single week reclaimed from admin chaos",
  },
  {
    icon: DollarSign,
    stat: "$12K+",
    label: "Extra Revenue",
    description: "Average annual increase from fewer no-shows",
  },
  {
    icon: Users,
    stat: "90%",
    label: "Show Rate",
    description: "Clients actually show up with auto-reminders",
  },
  {
    icon: TrendingUp,
    stat: "3X",
    label: "Repeat Bookings",
    description: "Formula tracking = consistent results = loyalty",
  },
];

export const FinalValueProp = () => {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 });

  return (
    <section className="py-12 xs:py-14 sm:py-16 bg-primary relative overflow-hidden" style={{
      backgroundImage: `
        linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.05) 50%, transparent 100%),
        linear-gradient(0deg, transparent 0%, rgba(0,0,0,0.05) 50%, transparent 100%)
      `,
      backgroundSize: '8px 8px'
    }}>
      <div className="container mx-auto px-4" ref={ref}>
        {/* Unified Header */}
        <div className={`text-center mb-10 xs:mb-12 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="inline-block border-[3px] border-black bg-accent px-4 xs:px-6 py-2 xs:py-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-4 xs:mb-6">
            <span className="font-pixel text-xs xs:text-sm text-accent-foreground uppercase">REAL RESULTS</span>
          </div>
          
          <h2 className="font-pixel text-lg xs:text-xl sm:text-2xl md:text-3xl text-primary-foreground mb-3 uppercase tracking-wider leading-tight">
            STYLISTS USING hA.I.r CUT ADMIN TIME BY 40%
          </h2>
          
          <p className="font-sans text-sm xs:text-base sm:text-lg text-white max-w-2xl mx-auto">
            Real metrics from real stylists who switched to hA.I.r
          </p>
        </div>

        {/* Animated Counters with rotating colors */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 xxs:gap-5 xs:gap-6 sm:gap-8 max-w-5xl mx-auto mb-10 xs:mb-12">
          <div className={`transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '0ms' }}>
            <AnimatedCounter end={5000} suffix="+" icon={Scissors} label="STYLISTS" bgColor="bg-secondary" borderColor="border-black" textColor="text-black" />
          </div>
          <div className={`transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '100ms' }}>
            <AnimatedCounter end={50000} suffix="+" icon={Calendar} label="BOOKINGS" bgColor="bg-secondary" borderColor="border-black" textColor="text-black" />
          </div>
          <div className={`transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '200ms' }}>
            <AnimatedCounter end={10000} suffix="+" icon={Palette} label="FORMULAS" bgColor="bg-secondary" borderColor="border-black" textColor="text-black" />
          </div>
          <div className={`transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '300ms' }}>
            <AnimatedCounter end={4.9} suffix="/5" icon={Smartphone} label="RATING" duration={1200} bgColor="bg-secondary" borderColor="border-black" textColor="text-black" />
          </div>
        </div>

        {/* Benefit Cards with rotating colored borders */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 xs:gap-8 max-w-6xl mx-auto">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            // Rotate through brand colors for borders and icon backgrounds
            const borderColors = ['border-secondary', 'border-accent', 'border-white', 'border-secondary'];
            const iconBgColors = ['bg-primary', 'bg-accent', 'bg-secondary', 'bg-primary'];
            const iconTextColors = ['text-white', 'text-white', 'text-black', 'text-white'];
            const statColors = ['text-secondary', 'text-accent', 'text-primary', 'text-secondary'];
            
            return (
              <div
                key={index}
                className={`border-[3px] ${borderColors[index]} bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 hover:-translate-y-1 p-6 text-center min-h-[180px] ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{
                  transitionDelay: `${(index + 4) * 100}ms`,
                }}
              >
                <div className={`w-14 h-14 border-[3px] border-black ${iconBgColors[index]} flex items-center justify-center mx-auto mb-4`}>
                  <Icon className={`h-7 w-7 ${iconTextColors[index]}`} strokeWidth={2.5} />
                </div>

                <div className={`font-pixel text-3xl xs:text-4xl ${statColors[index]} mb-2`}>
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

        <div className={`mt-10 xs:mt-12 text-center transition-all duration-700 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`} style={{ transitionDelay: '800ms' }}>
          <div className="inline-block border-[4px] border-black bg-accent px-6 xs:px-8 py-4 xs:py-5 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
            {/* Decorative pattern overlay */}
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: `
                linear-gradient(45deg, transparent 48%, rgba(0,0,0,0.1) 49%, rgba(0,0,0,0.1) 51%, transparent 52%),
                linear-gradient(-45deg, transparent 48%, rgba(0,0,0,0.1) 49%, rgba(0,0,0,0.1) 51%, transparent 52%)
              `,
              backgroundSize: '12px 12px'
            }}></div>
            
            {/* Sparkle animations */}
            <div className="absolute -top-1 -left-1 w-2 h-2 bg-secondary animate-ping" style={{ animationDuration: '2s' }}></div>
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-secondary animate-ping" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}></div>
            <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-secondary animate-ping" style={{ animationDuration: '2.2s', animationDelay: '1s' }}></div>
            <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-secondary animate-ping" style={{ animationDuration: '2.8s', animationDelay: '1.5s' }}></div>
            
            <p className="font-sans text-sm xs:text-base text-white leading-relaxed relative z-10">
              <span className="font-bold text-secondary">That's the difference</span> between managing chaos and running a thriving salon.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};