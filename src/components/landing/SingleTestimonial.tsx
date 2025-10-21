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
    <div className="container mx-auto px-4" ref={ref}>
      <div className="max-w-5xl mx-auto">
        {/* 5-Star Rating Display */}
        <div className={`flex justify-center mb-4 transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
          <div className="border-[3px] border-black bg-secondary shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] px-4 py-2 xs:px-6 xs:py-3 flex gap-2 xs:gap-3">
            {[...Array(5)].map((_, i) => (
              <span key={i} className="font-pixel text-secondary-foreground text-xl xs:text-2xl">★</span>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-3 xs:gap-4">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className={`border-[3px] border-black bg-white p-3 xs:p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 hover:-translate-y-0.5 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{
                transitionDelay: `${(index + 2) * 100}ms`,
              }}
            >
              {/* Compact star rating */}
              <div className="flex gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <div 
                    key={i} 
                    className={`w-4 h-4 border-2 border-black bg-secondary flex items-center justify-center transition-all duration-300 ${
                      isVisible ? 'scale-100' : 'scale-0'
                    }`}
                    style={{
                      transitionDelay: `${(index * 200) + (i * 50)}ms`,
                    }}
                  >
                    <span className="font-pixel text-secondary-foreground text-[8px]">★</span>
                  </div>
                ))}
              </div>
              
              {/* Quote - more compact */}
              <p className="text-xs font-sans text-foreground leading-snug mb-3">
                "{testimonial.quote}"
              </p>
              
              {/* Author - ultra compact */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 border-2 border-black bg-accent flex items-center justify-center">
                  <span className="font-pixel text-accent-foreground text-[10px]">{testimonial.initials}</span>
                </div>
                <div>
                  <div className="font-pixel text-[10px] text-foreground">{testimonial.author}</div>
                  <div className="font-sans text-[9px] text-muted-foreground">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
