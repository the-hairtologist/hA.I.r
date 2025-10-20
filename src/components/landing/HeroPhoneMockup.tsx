import { Calendar, MessageSquare, Clock, CheckCircle2 } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

export const HeroPhoneMockup = () => {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 });

  return (
    <div ref={ref} className={`relative w-full max-w-[280px] xs:max-w-[320px] sm:max-w-[360px] mx-auto mt-8 xs:mt-12 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
      {/* Phone Frame - Brutal Style */}
      <div className="relative border-[4px] border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-[32px] overflow-hidden">
        {/* Phone Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl z-10"></div>
        
        {/* Phone Screen */}
        <div className="relative bg-gradient-to-b from-primary to-primary/90 px-6 pt-8 pb-6" style={{
          backgroundImage: `
            linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.05) 50%, transparent 100%),
            linear-gradient(0deg, transparent 0%, rgba(0,0,0,0.05) 50%, transparent 100%)
          `,
          backgroundSize: '4px 4px'
        }}>
          {/* App Header */}
          <div className="mb-4">
            <h3 className="font-pixel text-white text-xs uppercase mb-1">TODAY</h3>
            <p className="font-sans text-white/80 text-[10px]">Thursday, Oct 20</p>
          </div>

          {/* Notification Cards - Animated */}
          <div className="space-y-3">
            {/* Appointment Reminder */}
            <div className="border-[3px] border-black bg-secondary shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-3 animate-fade-in" style={{ animationDelay: '400ms' }}>
              <div className="flex items-start gap-2">
                <div className="w-8 h-8 border-[2px] border-black bg-accent flex items-center justify-center flex-shrink-0">
                  <Calendar className="h-4 w-4 text-accent-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-pixel text-[9px] text-secondary-foreground uppercase mb-1">NEW BOOKING</p>
                  <p className="font-sans text-[10px] text-secondary-foreground/90">Sarah Chen - Color & Cut</p>
                  <p className="font-sans text-[9px] text-secondary-foreground/70">Tomorrow at 2:00 PM</p>
                </div>
                <CheckCircle2 className="h-4 w-4 text-accent flex-shrink-0" />
              </div>
            </div>

            {/* Client Message */}
            <div className="border-[3px] border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-3 animate-fade-in" style={{ animationDelay: '600ms' }}>
              <div className="flex items-start gap-2">
                <div className="w-8 h-8 border-[2px] border-black bg-primary flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="h-4 w-4 text-primary-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-pixel text-[9px] text-foreground uppercase mb-1">MESSAGE</p>
                  <p className="font-sans text-[10px] text-foreground/90">"Can't wait for my appt! 💇"</p>
                  <p className="font-sans text-[9px] text-muted-foreground">2 min ago</p>
                </div>
              </div>
            </div>

            {/* Reminder Sent */}
            <div className="border-[3px] border-black bg-accent shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-3 animate-fade-in" style={{ animationDelay: '800ms' }}>
              <div className="flex items-start gap-2">
                <div className="w-8 h-8 border-[2px] border-black bg-secondary flex items-center justify-center flex-shrink-0">
                  <Clock className="h-4 w-4 text-secondary-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-pixel text-[9px] text-accent-foreground uppercase mb-1">AUTO-REMINDER</p>
                  <p className="font-sans text-[10px] text-accent-foreground/90">Sent to 3 clients for tomorrow</p>
                  <p className="font-sans text-[9px] text-accent-foreground/70">All confirmed ✓</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-2 mt-4" style={{ animationDelay: '1000ms' }}>
            <div className="border-[2px] border-black bg-white/10 backdrop-blur-sm p-2 text-center">
              <p className="font-pixel text-white text-xs">12</p>
              <p className="font-sans text-white/70 text-[8px]">TODAY</p>
            </div>
            <div className="border-[2px] border-black bg-white/10 backdrop-blur-sm p-2 text-center">
              <p className="font-pixel text-white text-xs">98%</p>
              <p className="font-sans text-white/70 text-[8px]">SHOWED</p>
            </div>
            <div className="border-[2px] border-black bg-white/10 backdrop-blur-sm p-2 text-center">
              <p className="font-pixel text-white text-xs">$2.4K</p>
              <p className="font-sans text-white/70 text-[8px]">EARNED</p>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Elements - Brutalist Style */}
      <div className="absolute -right-4 top-12 animate-bounce" style={{ animationDuration: '3s', animationDelay: '500ms' }}>
        <div className="w-12 h-12 border-[3px] border-black bg-accent shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center rotate-12">
          <span className="font-pixel text-accent-foreground text-lg">✓</span>
        </div>
      </div>

      <div className="absolute -left-4 top-32 animate-bounce" style={{ animationDuration: '2.5s', animationDelay: '700ms' }}>
        <div className="w-10 h-10 border-[3px] border-black bg-secondary shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center -rotate-12">
          <span className="font-pixel text-secondary-foreground text-sm">💬</span>
        </div>
      </div>
    </div>
  );
};