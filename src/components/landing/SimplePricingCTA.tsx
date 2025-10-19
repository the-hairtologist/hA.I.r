import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, Zap, Heart } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

export const SimplePricingCTA = () => {
  const navigate = useNavigate();
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.3 });

  return (
    <div className="container mx-auto px-4" ref={ref}>
      <div className={`max-w-4xl mx-auto text-center transition-all duration-500 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        <div className="mb-10">
          <div className="flex justify-center gap-6 mb-8">
            <div className="w-16 h-16 border-4 border-foreground bg-accent flex items-center justify-center animate-bounce">
              <Sparkles className="h-8 w-8 text-accent-foreground" />
            </div>
            <div className="w-16 h-16 border-4 border-foreground bg-secondary flex items-center justify-center animate-bounce" style={{ animationDelay: '0.1s' }}>
              <Zap className="h-8 w-8 text-secondary-foreground" />
            </div>
            <div className="w-16 h-16 border-4 border-foreground bg-primary flex items-center justify-center animate-bounce" style={{ animationDelay: '0.2s' }}>
              <Heart className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>

          <h2 className="font-pixel text-2xl xs:text-3xl sm:text-4xl mb-8 text-secondary-foreground uppercase tracking-wider leading-relaxed">
            START YOUR FREE TRIAL
          </h2>

          <p className="text-sm xs:text-base sm:text-lg font-sans font-bold text-secondary-foreground/90 max-w-2xl mx-auto mb-10 leading-relaxed tracking-wide uppercase">
            Join 2,000+ stylists who love hA.I.r. Try it risk-free for 14 days.
          </p>
        </div>

        <Button
          size="lg"
          onClick={() => navigate("/auth")}
          className="text-sm xs:text-base sm:text-lg px-8 xs:px-12 py-6 xs:py-8 font-pixel uppercase bg-primary text-primary-foreground hover:bg-primary/90 border-4 border-foreground shadow-[6px_6px_0px_0px_hsl(var(--foreground))] hover:shadow-[8px_8px_0px_0px_hsl(var(--foreground))] transition-all duration-300 hover:-translate-y-1 rounded-none"
        >
          GET STARTED FREE
        </Button>

        <p className="text-xs xs:text-sm font-pixel text-secondary-foreground/80 uppercase mt-6">
          No Credit Card • Start In Seconds
        </p>
      </div>
    </div>
  );
};
