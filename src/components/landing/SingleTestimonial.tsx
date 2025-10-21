import { Quote } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const testimonials = [
  {
    quote: "I got back 2 hours a day. My clients love the automated reminders. No more missed appointments.",
    author: "Jessica Martinez",
    role: "Colorist, Miami",
    initials: "JM",
  },
  {
    quote: "First app that actually remembers every formula. My repeat clients are obsessed with their consistency.",
    author: "Sarah Chen",
    role: "Salon Owner, LA",
    initials: "SC",
  },
];

export const SingleTestimonial = () => {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 });

  return (
    <div className="container mx-auto px-3 xs:px-4 sm:px-6" ref={ref}>
      <div className="max-w-5xl mx-auto">
        {/* 5-Star Rating Display */}
        <div className={`hidden xs:flex justify-center gap-2 mb-4 transition-all duration-500 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
          {[...Array(5)].map((_, i) => (
            <div 
              key={i} 
              className="w-9 h-9 sm:w-10 sm:h-10 border-[2px] border-black bg-secondary flex items-center justify-center"
              style={{
                transitionDelay: `${i * 50}ms`,
              }}
            >
              <span className="font-pixel text-secondary-foreground text-lg">★</span>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-2.5 xs:gap-3 sm:gap-4" style={{ perspective: '1000px' }}>
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className={`brutal-border bg-white p-3 xs:p-4 transition-all duration-300 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{
                transitionDelay: `${(index + 2) * 100}ms`,
                transform: index === 0 ? 'rotateY(-3deg) rotateX(2deg)' : 'rotateY(3deg) rotateX(2deg)',
                transformStyle: 'preserve-3d',
                boxShadow: '5px 5px 0px rgba(0,0,0,0.8), 8px 8px 0px rgba(0,0,0,0.4), 11px 11px 0px rgba(0,0,0,0.2)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = index === 0 
                  ? 'rotateY(-1deg) rotateX(1deg) translateY(-6px) scale(1.02)' 
                  : 'rotateY(1deg) rotateX(1deg) translateY(-6px) scale(1.02)';
                e.currentTarget.style.boxShadow = '7px 7px 0px rgba(0,0,0,0.8), 11px 11px 0px rgba(0,0,0,0.4), 15px 15px 0px rgba(0,0,0,0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = index === 0 ? 'rotateY(-3deg) rotateX(2deg)' : 'rotateY(3deg) rotateX(2deg)';
                e.currentTarget.style.boxShadow = '5px 5px 0px rgba(0,0,0,0.8), 8px 8px 0px rgba(0,0,0,0.4), 11px 11px 0px rgba(0,0,0,0.2)';
              }}
            >
              {/* Compact star rating */}
              <div className="flex gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <div 
                    key={i} 
                    className={`w-5 h-5 border border-black bg-secondary flex items-center justify-center transition-all duration-300 ${
                      isVisible ? 'scale-100' : 'scale-0'
                    }`}
                    style={{
                      transitionDelay: `${(index * 200) + (i * 50)}ms`,
                    }}
                  >
                    <span className="font-pixel text-secondary-foreground text-[9px]">★</span>
                  </div>
                ))}
              </div>
              
              {/* Quote - more compact */}
              <p className="text-[11px] xs:text-xs sm:text-sm font-sans text-foreground leading-snug mb-3">
                "{testimonial.quote}"
              </p>
              
              {/* Author - ultra compact */}
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 border-2 border-black bg-accent flex items-center justify-center">
                  <span className="font-pixel text-accent-foreground text-[10px]">{testimonial.initials}</span>
                </div>
                <div>
                  <div className="font-pixel text-[10px] xs:text-[11px] sm:text-xs text-foreground">{testimonial.author}</div>
                  <div className="font-sans text-[10px] xs:text-[11px] text-muted-foreground">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
