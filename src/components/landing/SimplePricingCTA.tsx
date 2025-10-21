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
          <div className="flex justify-center gap-6 mb-5">
            <div className="w-16 h-16 border-4 border-black bg-accent flex items-center justify-center animate-bounce">
              <Sparkles className="h-8 w-8 text-accent-foreground" />
            </div>
            <div className="w-16 h-16 border-4 border-black bg-secondary flex items-center justify-center animate-bounce" style={{ animationDelay: '0.1s' }}>
              <Zap className="h-8 w-8 text-secondary-foreground" />
            </div>
            <div className="w-16 h-16 border-4 border-black bg-primary flex items-center justify-center animate-bounce" style={{ animationDelay: '0.2s' }}>
              <Heart className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>

          <h2 className="font-pixel text-2xl xs:text-3xl sm:text-4xl mb-4 text-secondary-foreground uppercase tracking-wider leading-tight">
            STOP THE CHAOS
          </h2>

          <p className="text-sm xs:text-base sm:text-lg font-sans text-secondary-foreground/90 mb-2 max-w-2xl mx-auto leading-relaxed">
            Join 5,000+ stylists who reclaimed their time
          </p>
          
          <p className="text-xs xs:text-sm font-pixel text-secondary-foreground/80 uppercase mb-10">
            10+ Hours/Week Saved • 90% Fewer No-Shows
          </p>
        </div>

        <Button
          size="lg"
          onClick={() => navigate("/auth")}
          className="text-sm xs:text-base sm:text-lg px-8 xs:px-12 py-6 xs:py-8 font-pixel uppercase bg-secondary text-success hover:bg-secondary/90 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 hover:-translate-y-1 rounded-none group"
        >
          <span className="group-hover:scale-110 transition-transform duration-300 inline-block">START FREE TRIAL →</span>
        </Button>

        <p className="text-xs xs:text-sm font-sans text-secondary-foreground/80 mt-6">
          ✓ No Credit Card Required • ✓ 14-Day Free Trial • ✓ Cancel Anytime
        </p>
      </div>
    </div>
  );
};
