import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const testimonials = [
  {
    name: "Sarah Martinez",
    role: "Independent Stylist",
    location: "Miami, FL",
    rating: 5,
    text: "hA.I.r saved me 15+ hours a week. I went from drowning in DMs to fully booked with zero stress. The color formulas alone are worth it.",
    initials: "SM"
  },
  {
    name: "Jessica Chen",
    role: "Salon Owner",
    location: "Los Angeles, CA",
    rating: 5,
    text: "My team productivity jumped 40% in the first month. Clients love the 24/7 booking, and I love the automated reminders. No more no-shows.",
    initials: "JC"
  },
  {
    name: "Maya Thompson",
    role: "Color Specialist",
    location: "Austin, TX",
    rating: 5,
    text: "The AI formula generator is scary good. I upload a photo, get the perfect formula, and my clients leave looking exactly how they wanted. Game changer.",
    initials: "MT"
  },
  {
    name: "Rachel Kim",
    role: "Bridal Stylist",
    location: "New York, NY",
    rating: 5,
    text: "Managing consultations used to eat up my weekends. Now everything's tracked, organized, and I can focus on the creative work I actually love.",
    initials: "RK"
  }
];

export const TestimonialCarousel = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const next = () => setCurrent((prev) => (prev + 1) % testimonials.length);
  const prev = () => setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  const testimonial = testimonials[current];

  return (
    <div className="relative">
      <Card className="brutal-border brutal-shadow-lg bg-card p-8 animate-fade-in">
        <div className="flex items-start gap-4 mb-6">
          <Avatar className="h-16 w-16 border-2 border-foreground">
            <AvatarFallback className="bg-primary text-primary-foreground font-bold text-lg">
              {testimonial.initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="font-display font-bold text-lg">{testimonial.name}</h3>
            <p className="text-sm text-muted-foreground">{testimonial.role}</p>
            <p className="text-xs text-muted-foreground">{testimonial.location}</p>
            <div className="flex gap-1 mt-2">
              {[...Array(testimonial.rating)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-warning text-warning" />
              ))}
            </div>
          </div>
        </div>
        <blockquote className="text-foreground/90 text-base font-medium leading-relaxed">
          "{testimonial.text}"
        </blockquote>
      </Card>

      <div className="flex items-center justify-center gap-4 mt-6">
        <Button
          variant="outline"
          size="icon"
          onClick={prev}
          className="h-10 w-10 border-2 border-foreground hover-scale"
          aria-label="Previous testimonial"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        
        <div className="flex gap-2">
          {testimonials.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              className={`h-2 rounded-full transition-all ${
                idx === current ? "w-8 bg-primary" : "w-2 bg-muted-foreground/30"
              }`}
              aria-label={`Go to testimonial ${idx + 1}`}
            />
          ))}
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={next}
          className="h-10 w-10 border-2 border-foreground hover-scale"
          aria-label="Next testimonial"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};
