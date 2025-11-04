import {
  Calendar,
  MessageSquare,
  Clock,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { useEffect, useState } from 'react';

export const HeroPhoneMockup = () => {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 });
  const [animationsEnabled, setAnimationsEnabled] = useState(false);

  // Defer animations until after component mounts to improve FCP
  useEffect(() => {
    const timer = setTimeout(() => setAnimationsEnabled(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      ref={ref}
      className={`relative w-full max-w-[220px] xs:max-w-[280px] sm:max-w-[360px] mx-auto mt-6 xs:mt-10 sm:mt-12 transition-all duration-700 ${animationsEnabled && isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      style={{ perspective: '1500px' }}
    >
      {/* Phone Frame - Enhanced Brutal Style */}
      <div
        className="relative brutal-border bg-white rounded-[32px] overflow-hidden transition-all duration-500"
        style={{
          transform: 'rotateY(-5deg) rotateX(8deg)',
          transformStyle: 'preserve-3d',
          boxShadow:
            '12px 12px 0px rgba(0,0,0,0.8), 18px 18px 0px rgba(0,0,0,0.4), 24px 24px 0px rgba(0,0,0,0.2)',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform =
            'rotateY(-2deg) rotateX(5deg) translateY(-8px) scale(1.02)';
          e.currentTarget.style.boxShadow =
            '16px 16px 0px rgba(0,0,0,0.8), 24px 24px 0px rgba(0,0,0,0.4), 32px 32px 0px rgba(0,0,0,0.2)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'rotateY(-5deg) rotateX(8deg)';
          e.currentTarget.style.boxShadow =
            '12px 12px 0px rgba(0,0,0,0.8), 18px 18px 0px rgba(0,0,0,0.4), 24px 24px 0px rgba(0,0,0,0.2)';
        }}
      >
        {/* Phone Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl z-10"></div>

        {/* Phone Screen */}
        <div
          className="relative bg-gradient-to-br from-primary via-primary to-primary/80 px-6 pt-8 pb-6"
          style={{
            backgroundImage: `
            linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.05) 50%, transparent 100%),
            linear-gradient(0deg, transparent 0%, rgba(0,0,0,0.05) 50%, transparent 100%)
          `,
            backgroundSize: '4px 4px',
          }}
        >
          {/* App Header with Live Badge */}
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-pixel text-on-surface-primary text-xs uppercase mb-1">
                TODAY'S SCHEDULE
              </h3>
              <p className="font-sans text-on-surface-primary/80 text-[10px]">
                Thursday, Oct 20
              </p>
            </div>
            <div className="px-2 py-1 bg-accent border-[2px] border-black animate-pulse">
              <span className="font-pixel text-accent-foreground text-[8px]">
                LIVE
              </span>
            </div>
          </div>

          {/* Notification Cards - Enhanced with Animations */}
          <div className="space-y-3">
            {/* New Booking with Success Icon */}
            <div
              className="brutal-border bg-gradient-to-br from-secondary to-secondary/90 brutal-shadow-sm p-3 animate-fade-in"
              style={{ animationDelay: '200ms' }}
              role="article"
              aria-label="New booking notification: Sarah Chen - Color & Cut"
            >
              <div className="flex items-start gap-2">
                <div className="w-8 h-8 border-[2px] border-black bg-accent flex items-center justify-center flex-shrink-0 relative">
                  <Calendar className="h-4 w-4 text-accent-foreground" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent border-[2px] border-black rounded-full animate-ping"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-pixel text-[9px] text-secondary-foreground uppercase mb-1 flex items-center gap-1">
                    NEW BOOKING <Sparkles className="h-3 w-3" />
                  </p>
                  <p className="font-sans text-[10px] text-secondary-foreground/90 font-bold">
                    Sarah Chen - Color & Cut
                  </p>
                  <p className="font-sans text-[9px] text-secondary-foreground/70">
                    Tomorrow at 2:00 PM • $180
                  </p>
                </div>
                <CheckCircle2
                  className="h-5 w-5 text-accent flex-shrink-0 animate-bounce"
                  style={{ animationDuration: '2s' }}
                />
              </div>
            </div>

            {/* Client Message with Typing Indicator */}
            <div
              className="brutal-border bg-white brutal-shadow-sm p-3 animate-fade-in"
              style={{ animationDelay: '400ms' }}
              role="article"
              aria-label="Client message from recent contact"
            >
              <div className="flex items-start gap-2">
                <div className="w-8 h-8 border-[2px] border-black bg-primary flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="h-4 w-4 text-primary-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-pixel text-[9px] text-foreground uppercase mb-1">
                    CLIENT MESSAGE
                  </p>
                  <p className="font-sans text-[10px] text-foreground/90 italic">
                    "Can't wait for my appointment!"
                  </p>
                  <p className="font-sans text-[9px] text-muted-foreground">
                    Just now
                  </p>
                </div>
                <div className="flex gap-1 items-center">
                  <span
                    className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"
                    style={{ animationDelay: '0ms' }}
                  ></span>
                  <span
                    className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"
                    style={{ animationDelay: '150ms' }}
                  ></span>
                  <span
                    className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"
                    style={{ animationDelay: '300ms' }}
                  ></span>
                </div>
              </div>
            </div>

            {/* Auto Reminder Success */}
            <div
              className="brutal-border bg-gradient-to-br from-accent to-accent/90 brutal-shadow-sm p-3 animate-fade-in"
              style={{ animationDelay: '600ms' }}
            >
              <div className="flex items-start gap-2">
                <div className="w-8 h-8 border-[2px] border-black bg-secondary flex items-center justify-center flex-shrink-0">
                  <Clock className="h-4 w-4 text-secondary-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-pixel text-[9px] text-accent-foreground uppercase mb-1 flex items-center gap-1">
                    AUTO-REMINDERS <CheckCircle2 className="h-3 w-3" />
                  </p>
                  <p className="font-sans text-[10px] text-accent-foreground/90">
                    3 clients reminded for tomorrow
                  </p>
                  <p className="font-sans text-[9px] text-accent-foreground/70">
                    All confirmed • 0 no-shows
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats with Progress Bars */}
          <div
            className="grid grid-cols-3 gap-2 mt-4 animate-fade-in"
            style={{ animationDelay: '1000ms' }}
          >
            <div className="border-[2px] border-black bg-white/10 backdrop-blur-sm p-2 text-center group hover:bg-white/20 transition-colors duration-200">
              <p
                className="font-pixel text-on-surface-primary text-xs mb-1"
                role="status"
                aria-live="polite"
                aria-atomic="true"
              >
                12
              </p>
              <div className="w-full h-1 bg-black/20 rounded-full mb-1">
                <div
                  className="h-full bg-accent rounded-full animate-[pulse_2s_ease-in-out_infinite]"
                  style={{ width: '90%', animationDelay: '0ms' }}
                ></div>
              </div>
              <p className="font-sans text-on-surface-primary/70 text-[8px]">BOOKED</p>
            </div>
            <div className="border-[2px] border-black bg-white/10 backdrop-blur-sm p-2 text-center group hover:bg-white/20 transition-colors duration-200">
              <p
                className="font-pixel text-on-surface-primary text-xs mb-1"
                role="status"
                aria-live="polite"
                aria-atomic="true"
              >
                98%
              </p>
              <div className="w-full h-1 bg-black/20 rounded-full mb-1">
                <div
                  className="h-full bg-secondary rounded-full animate-[pulse_2s_ease-in-out_infinite]"
                  style={{ width: '98%', animationDelay: '400ms' }}
                ></div>
              </div>
              <p className="font-sans text-on-surface-primary/70 text-[8px]">SHOWED</p>
            </div>
            <div className="border-[2px] border-black bg-white/10 backdrop-blur-sm p-2 text-center group hover:bg-white/20 transition-colors duration-200">
              <p
                className="font-pixel text-on-surface-primary text-xs mb-1"
                role="status"
                aria-live="polite"
                aria-atomic="true"
              >
                $2.4K
              </p>
              <div className="w-full h-1 bg-black/20 rounded-full mb-1">
                <div
                  className="h-full bg-accent rounded-full animate-[pulse_2s_ease-in-out_infinite]"
                  style={{ width: '80%', animationDelay: '800ms' }}
                ></div>
              </div>
              <p className="font-sans text-on-surface-primary/70 text-[8px]">TODAY</p>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Success Elements */}
      <div
        className="absolute -right-4 top-12 animate-bounce"
        style={{ animationDuration: '3s', animationDelay: '500ms' }}
      >
        <div className="w-12 h-12 border-[3px] border-black bg-accent shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center rotate-12">
          <CheckCircle2 className="h-6 w-6 text-accent-foreground" />
        </div>
      </div>

      <div
        className="absolute -left-4 top-32 animate-bounce"
        style={{ animationDuration: '2.5s', animationDelay: '700ms' }}
      >
        <div className="w-10 h-10 border-[3px] border-black bg-secondary shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center -rotate-12">
          <MessageSquare className="h-5 w-5 text-secondary-foreground" />
        </div>
      </div>

      <div
        className="absolute -right-6 bottom-12 animate-bounce"
        style={{ animationDuration: '3.5s', animationDelay: '900ms' }}
      >
        <div className="w-11 h-11 border-[3px] border-black bg-primary shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center rotate-6">
          <span className="font-pixel text-primary-foreground text-base">
            $
          </span>
        </div>
      </div>
    </div>
  );
};
