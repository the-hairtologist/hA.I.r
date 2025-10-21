import { UserPlus, Calendar, Zap } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const steps = [
  {
    icon: UserPlus,
    number: "1",
    title: "SIGN UP",
    description: "Create account in 30 seconds",
    color: "bg-secondary",
  },
  {
    icon: Calendar,
    number: "2",
    title: "CONNECT CALENDAR",
    description: "Sync your existing schedule",
    color: "bg-accent",
  },
  {
    icon: Zap,
    number: "3",
    title: "AUTOMATE EVERYTHING",
    description: "Watch bookings flow in",
    color: "bg-primary",
  },
];

export const SimpleTimeline = () => {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.3 });

  return (
    <div ref={ref} className="container mx-auto px-4 py-12 xs:py-16">
      <div className="text-center mb-8 xs:mb-10">
        <h2 className="font-pixel text-xl xs:text-2xl sm:text-3xl text-foreground uppercase tracking-wider mb-3">
          HOW IT WORKS
        </h2>
        <p className="font-sans text-sm xs:text-base text-muted-foreground">
          Three simple steps to transform your salon
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 xs:gap-8 max-w-5xl mx-auto">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const iconTextColor = step.color === 'bg-secondary' ? 'text-black' : 'text-white';
          
          return (
            <div
              key={step.number}
              className={`relative transition-all duration-500 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{
                transitionDelay: `${index * 150}ms`,
              }}
            >
              {/* Arrow connector - desktop only */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/3 -right-4 lg:-right-8 z-10">
                  <div className="w-8 lg:w-16 h-0.5 bg-black relative">
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-l-[8px] border-l-black border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent"></div>
                  </div>
                </div>
              )}

              <div className="border-[4px] border-black bg-background p-6 xs:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-2 transition-all duration-300">
                {/* Large number badge */}
                <div className="absolute -top-5 -left-5 w-12 h-12 xs:w-14 xs:h-14 border-[4px] border-black bg-white flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <span className="font-pixel text-2xl xs:text-3xl text-foreground">
                    {step.number}
                  </span>
                </div>

                {/* Icon */}
                <div className={`w-16 h-16 xs:w-20 xs:h-20 border-[4px] border-black ${step.color} flex items-center justify-center mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mx-auto mt-4`}>
                  <Icon className={`h-8 w-8 xs:h-10 xs:w-10 ${iconTextColor}`} strokeWidth={2.5} />
                </div>

                {/* Title */}
                <h3 className="font-pixel text-base xs:text-lg text-foreground uppercase tracking-wide mb-3 text-center">
                  {step.title}
                </h3>

                {/* Description */}
                <p className="text-sm xs:text-base font-sans text-muted-foreground text-center leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
