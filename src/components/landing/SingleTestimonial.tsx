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
        <div className={`text-center mb-6 transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <h2 className="font-pixel text-lg xs:text-xl sm:text-2xl mb-2 text-foreground uppercase tracking-wider">
            STYLISTS ARE RAVING
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-4 xs:gap-5">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className={`border-[3px] border-black bg-white p-5 xs:p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 hover:-translate-y-1 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{
                transitionDelay: `${(index + 2) * 100}ms`,
              }}
            >
              {/* Compact star rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <div 
                    key={i} 
                    className={`w-5 h-5 border-2 border-black bg-secondary flex items-center justify-center transition-all duration-300 ${
                      isVisible ? 'scale-100' : 'scale-0'
                    }`}
                    style={{
                      transitionDelay: `${(index * 200) + (i * 50)}ms`,
                    }}
                  >
                    <span className="font-pixel text-secondary-foreground text-[10px]">★</span>
                  </div>
                ))}
              </div>
              
              {/* Quote */}
              <p className="text-sm font-sans text-foreground leading-relaxed mb-4">
                "{testimonial.quote}"
              </p>
              
              {/* Author - more compact */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 border-3 border-black bg-accent flex items-center justify-center">
                  <span className="font-pixel text-accent-foreground text-xs">{testimonial.initials}</span>
                </div>
                <div>
                  <div className="font-pixel text-xs text-foreground">{testimonial.author}</div>
                  <div className="font-sans text-[10px] text-muted-foreground">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
