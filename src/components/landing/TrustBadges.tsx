import { Shield, Star, Smartphone, Lock } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const badges = [
  { icon: Star, label: "5-Star Rated", color: "bg-secondary" },
  { icon: Shield, label: "Secure Payment", color: "bg-accent" },
  { icon: Lock, label: "GDPR Compliant", color: "bg-primary" },
  { icon: Smartphone, label: "iOS & Android", color: "bg-secondary" },
];

export const TrustBadges = () => {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.3 });

  return (
    <div ref={ref} className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
        {badges.map((badge, index) => {
          const Icon = badge.icon;
          return (
            <div
              key={badge.label}
              className={`border-[3px] border-black ${badge.color} p-4 xs:p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center justify-center text-center transition-all duration-300 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
              style={{
                transitionDelay: `${index * 100}ms`,
              }}
            >
              <Icon className="h-6 w-6 xs:h-8 xs:w-8 text-foreground mb-2" strokeWidth={2.5} />
              <span className="font-pixel text-[9px] xs:text-[10px] text-foreground uppercase leading-tight">
                {badge.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
