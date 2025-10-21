import { Timer, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";

export const UrgencyBanner = () => {
  const [spotsLeft, setSpotsLeft] = useState(23);
  
  useEffect(() => {
    // Simulate live counter decreasing
    const interval = setInterval(() => {
      setSpotsLeft(prev => Math.max(12, prev - Math.floor(Math.random() * 2)));
    }, 45000); // Every 45 seconds
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-accent text-white py-3 px-4 brutal-border border-black animate-pulse-subtle">
      <div className="container mx-auto flex flex-col xs:flex-row items-center justify-center gap-2 xs:gap-6 text-center xs:text-left">
        <div className="flex items-center gap-2">
          <Timer className="h-4 w-4 xs:h-5 xs:w-5 animate-pulse" />
          <span className="font-pixel text-xs xs:text-sm uppercase">
            ONLY {spotsLeft} SPOTS LEFT
          </span>
        </div>
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 xs:h-5 xs:w-5" />
          <span className="font-sans text-xs xs:text-sm">
            147 stylists signed up in the last 24 hours
          </span>
        </div>
      </div>
    </div>
  );
};