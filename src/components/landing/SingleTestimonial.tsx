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
      <div className="max-w-4xl mx-auto">
        {/* Prominent 5-Star Rating */}
        <div className={`flex justify-center gap-2 xs:gap-3 mb-6 transition-all duration-700 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
          {[...Array(5)].map((_, i) => (
            <div 
              key={i} 
              className="w-10 h-10 xs:w-12 xs:h-12 sm:w-14 sm:h-14 border-[3px] border-black bg-secondary flex items-center justify-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all duration-300"
              style={{
                transitionDelay: `${i * 80}ms`,
              }}
            >
              <span className="font-pixel text-secondary-foreground text-lg xs:text-xl sm:text-2xl">★</span>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className={`group relative border-[3px] border-black bg-white p-4 xs:p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 hover:-translate-y-1 hover:-translate-x-0.5 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
              }`}
              style={{
                transitionDelay: `${(index + 3) * 120}ms`,
              }}
            >
              {/* Star rating with animation */}
              <div className="flex gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <div 
                    key={i} 
                    className={`w-5 h-5 border-2 border-black bg-secondary flex items-center justify-center shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] group-hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 ${
                      isVisible ? 'scale-100 rotate-0' : 'scale-0 rotate-45'
                    }`}
                    style={{
                      transitionDelay: `${(index * 150) + (i * 60)}ms`,
                    }}
                  >
                    <span className="font-pixel text-secondary-foreground text-[10px]">★</span>
                  </div>
                ))}
              </div>
              
              {/* Quote with better typography */}
              <p className="text-sm font-sans text-foreground leading-relaxed mb-4 min-h-[60px]">
                "{testimonial.quote}"
              </p>
              
              {/* Author section with improved design */}
              <div className="flex items-center gap-3 pt-3 border-t-2 border-black/10">
                <div className="w-10 h-10 border-[3px] border-black bg-accent flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] group-hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all duration-300">
                  <span className="font-pixel text-accent-foreground text-xs">{testimonial.initials}</span>
                </div>
                <div className="flex-1">
                  <div className="font-pixel text-xs text-foreground uppercase tracking-wide">{testimonial.author}</div>
                  <div className="font-sans text-[11px] text-muted-foreground mt-0.5">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
