import { Rocket, Trophy, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

export const ZeroGravityFeature = () => {
  const navigate = useNavigate();
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.3 });

  return (
    <section 
      ref={ref}
      className={`py-12 xs:py-16 sm:py-20 bg-primary relative overflow-hidden transition-all duration-1000 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
      }`}
      style={{
        backgroundImage: `
          linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.05) 50%, transparent 100%),
          linear-gradient(0deg, transparent 0%, rgba(0,0,0,0.05) 50%, transparent 100%)
        `,
        backgroundSize: '8px 8px'
      }}
    >
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Floating badge */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 bg-accent border-4 border-black px-6 py-3 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] animate-bounce">
              <Trophy className="h-6 w-6 text-white" />
              <span className="font-pixel text-white text-sm xs:text-base uppercase">
                Exclusive Rewards
              </span>
            </div>
          </div>

          <h2 className="font-pixel text-2xl xs:text-3xl sm:text-4xl text-center text-white uppercase mb-4 drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]">
            EARN ACTUAL<br />ZERO-GRAVITY FLIGHTS
          </h2>
          
          <p className="font-sans text-base xs:text-lg text-center text-black max-w-2xl mx-auto mb-8">
            Hit your booking goals, unlock real zero-gravity flight experiences. Because effortless scheduling should feel weightless—literally.
          </p>

          <div className="grid xs:grid-cols-3 gap-4 xs:gap-6 mb-10">
            <div className="bg-secondary border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-center">
              <Star className="h-10 w-10 mx-auto mb-3 text-black" />
              <div className="font-pixel text-xl text-black mb-2">SILVER</div>
              <div className="font-sans text-sm text-black/80">50+ bookings/month</div>
            </div>
            
            <div className="bg-accent border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-center transform xs:scale-105">
              <Star className="h-12 w-12 mx-auto mb-3 text-white fill-white" />
              <div className="font-pixel text-xl text-white mb-2">GOLD</div>
              <div className="font-sans text-sm text-white/90">100+ bookings/month</div>
            </div>
            
            <div className="bg-secondary border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-center">
              <Rocket className="h-10 w-10 mx-auto mb-3 text-black" />
              <div className="font-pixel text-xl text-black mb-2">PLATINUM</div>
              <div className="font-sans text-sm text-black/80">150+ bookings/month</div>
            </div>
          </div>

          <div className="text-center">
            <Button
              onClick={() => navigate("/auth")}
              size="lg"
              className="font-pixel text-base xs:text-lg px-8 xs:px-12 py-6 xs:py-8 bg-secondary text-black hover:bg-secondary/90 brutal-border border-black brutal-shadow-lg hover:brutal-shadow-xl transition-all duration-300 hover:-translate-y-2 uppercase"
            >
              START EARNING FLIGHTS
            </Button>
            <p className="font-sans text-xs text-white/80 mt-4">
              Join 127 stylists already qualified for 2025 flights
            </p>
          </div>
        </div>
      </div>

      {/* Decorative floating elements */}
      <div className="absolute top-10 left-10 w-16 h-16 border-4 border-white/20 animate-bounce" style={{ animationDelay: '0.5s' }} />
      <div className="absolute bottom-20 right-20 w-20 h-20 border-4 border-white/20 animate-bounce" style={{ animationDelay: '1s' }} />
    </section>
  );
};