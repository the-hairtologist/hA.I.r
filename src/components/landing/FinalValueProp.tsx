import { Clock, DollarSign, Users, TrendingUp } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

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
    <section className="py-16 xs:py-20 sm:py-24 bg-primary relative overflow-hidden" style={{
      backgroundImage: `
        linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.05) 50%, transparent 100%),
        linear-gradient(0deg, transparent 0%, rgba(0,0,0,0.05) 50%, transparent 100%)
      `,
      backgroundSize: '8px 8px'
    }}>
      <div className="container mx-auto px-4" ref={ref}>
        <div className={`text-center mb-12 xs:mb-16 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="inline-block border-[3px] border-black bg-accent px-4 xs:px-6 py-2 xs:py-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-4 xs:mb-6">
            <span className="font-pixel text-xs xs:text-sm text-accent-foreground uppercase">THE NUMBERS DON'T LIE</span>
          </div>
          
          <h2 className="font-pixel text-xl xs:text-2xl sm:text-3xl md:text-4xl text-primary-foreground mb-4 uppercase tracking-wider leading-tight">
            WHAT YOU'LL ACTUALLY GET
          </h2>
          
          <p className="font-sans text-sm xs:text-base sm:text-lg text-primary-foreground/90 max-w-2xl mx-auto">
            Real metrics from real stylists who switched to hA.I.r
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 xs:gap-8 max-w-6xl mx-auto">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div
                key={index}
                className={`border-[3px] border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 hover:-translate-y-1 p-6 text-center ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{
                  transitionDelay: `${index * 100}ms`,
                }}
              >
                <div className="w-14 h-14 border-[3px] border-black bg-secondary flex items-center justify-center mx-auto mb-4">
                  <Icon className="h-7 w-7 text-secondary-foreground" />
                </div>

                <div className="font-pixel text-3xl xs:text-4xl text-accent mb-2">
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

        <div className={`mt-12 xs:mt-16 text-center transition-all duration-700 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`} style={{ transitionDelay: '400ms' }}>
          <div className="inline-block border-[3px] border-black bg-secondary/20 backdrop-blur-sm px-6 xs:px-8 py-4 xs:py-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <p className="font-sans text-sm xs:text-base text-primary-foreground leading-relaxed">
              <span className="font-bold text-accent">That's the difference</span> between managing chaos and running a thriving salon.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};