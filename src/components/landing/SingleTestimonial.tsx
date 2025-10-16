import { Quote } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const testimonials = [
  {
    quote: "Finally, a salon app that understands my hair!",
    author: "Sarah M.",
    role: "Client",
    initials: "SM",
  },
  {
    quote: "Booking and payments are effortless - love it!",
    author: "Jessica P.",
    role: "Stylist",
    initials: "JP",
  },
];

export const SingleTestimonial = () => {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 });

  return (
    <div className="container mx-auto px-4" ref={ref}>
      <div className="max-w-5xl mx-auto">
        <div className={`text-center mb-16 transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <h2 className="font-pixel text-2xl sm:text-3xl mb-4 text-white uppercase tracking-wider">
            STYLISTS AND CLIENTS ARE RAVING
          </h2>
          <p className="font-pixel text-sm text-white/90 uppercase">
            About hA.I.r!
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-10">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className={`border-4 border-black bg-white p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 hover:-translate-y-1 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{
                transitionDelay: `${(index + 2) * 100}ms`,
              }}
            >
              <div className="flex gap-2 mb-6">
                {[...Array(5)].map((_, i) => (
                  <div 
                    key={i} 
                    className={`w-6 h-6 border-2 border-black bg-secondary flex items-center justify-center transition-all duration-300 ${
                      isVisible ? 'scale-100' : 'scale-0'
                    }`}
                    style={{
                      transitionDelay: `${(index * 200) + (i * 50)}ms`,
                    }}
                  >
                    <span className="font-pixel text-secondary-foreground text-xs">★</span>
                  </div>
                ))}
              </div>
              
              <div className="mb-6">
                <div className="w-8 h-8 border-2 border-black bg-accent flex items-center justify-center mb-4">
                  <Quote className="h-4 w-4 text-accent-foreground" />
                </div>
                <p className="text-base font-sans text-foreground leading-relaxed">
                  {testimonial.quote}
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 border-4 border-black bg-accent flex items-center justify-center">
                  <span className="font-pixel text-accent-foreground text-xs">{testimonial.initials}</span>
                </div>
                <div>
                  <div className="font-pixel text-sm text-foreground">{testimonial.author}</div>
                  <div className="font-sans text-xs text-muted-foreground">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
