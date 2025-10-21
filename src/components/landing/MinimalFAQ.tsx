import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { analytics } from "@/lib/analytics";
import { SingleTestimonial } from "./SingleTestimonial";
import { Sparkles } from "lucide-react";

const faqs = [
  {
    question: "Will this actually save me time, or is it just another app?",
    answer: "Real talk: Most stylists save 5-7 hours per week on scheduling, payments, and client notes. That's time back for clients (or yourself). Plus, no more double-bookings or missed appointments.",
  },
  {
    question: "What happens to my client data if I cancel?",
    answer: "You own your data, period. Export everything (client history, formulas, photos) anytime. Even after you cancel, you get 30 days to download your records.",
  },
  {
    question: "Does the AI replace my expertise as a stylist?",
    answer: "Never. The AI is like a smart assistant—it suggests formulas based on hair history and type, but YOU make the final call. Think of it as a second opinion, not a replacement.",
  },
  {
    question: "How quickly can I get up and running?",
    answer: "Most stylists are booking their first client within 10 minutes. Import existing clients via CSV, or start fresh. No training videos required—it just works.",
  },
  {
    question: "What if my clients aren't tech-savvy?",
    answer: "Good news: Clients don't need an account to book. They get a simple link, pick a time, and they're done. Works on any phone or computer—no app download needed.",
  },
];

export const MinimalFAQ = () => {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 });

  const handleFAQClick = (question: string) => {
    analytics.faqExpanded('A', question);
  };

  return (
    <div className="py-4 xs:py-6 sm:py-8">
      <div className="container mx-auto px-3 xs:px-4 sm:px-6" ref={ref}>
        <div className="max-w-2xl mx-auto">
          {/* Header with black text on yellow background */}
          <div className={`text-center mb-3 xs:mb-4 sm:mb-6 transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="inline-block border-[3px] border-black px-2 xs:px-2.5 sm:px-3 py-1.5 xs:py-2 mb-3 xs:mb-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-success hover:shadow-[7px_7px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 hover:-translate-y-1 hover:scale-110 hover:rotate-1">
              <div className="flex items-center justify-center gap-1 xs:gap-1.5">
                <Sparkles className="w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12 text-secondary animate-pulse flex-shrink-0" style={{ animationDelay: '0.5s' }} />
                <h2 className="font-pixel text-xl xs:text-2xl sm:text-3xl text-secondary uppercase tracking-tight animate-pulse">
                  THE REAL QUESTIONS
                </h2>
                <Sparkles className="w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12 text-secondary animate-pulse flex-shrink-0" style={{ animationDelay: '0.5s' }} />
              </div>
            </div>
            <p className="font-sans text-xs xs:text-sm text-foreground max-w-2xl mx-auto">
              No fluff. Just honest answers.
            </p>
          </div>

        <div className="space-y-2 xs:space-y-2.5 sm:space-y-3">
          {faqs.map((faq, index) => {
            // Rotate through brand colors for borders
            const colors = ['border-primary', 'border-accent', 'border-secondary'];
            const accentColors = ['text-primary', 'text-accent', 'text-secondary'];
            const colorIndex = index % 3;
            
            return (
              <div 
                key={faq.question} 
                className={`brutal-border ${colors[colorIndex]} bg-white hover:brutal-shadow transition-all duration-300 hover:translate-x-1 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
                style={{
                  transitionDelay: `${index * 100}ms`,
                }}
              >
              <details className="group" onClick={() => handleFAQClick(faq.question)}>
                <summary className="cursor-pointer list-none p-2 xs:p-2.5 sm:p-3 font-bold text-foreground hover:bg-muted/20 transition-colors duration-200 flex justify-between items-center gap-3">
                  <span className="font-sans text-xs xs:text-sm text-left">{faq.question}</span>
                  <span className={`font-pixel text-lg ${accentColors[colorIndex]} group-open:rotate-90 transition-transform duration-300 flex-shrink-0`}>▶</span>
                </summary>
                <div className={`px-2 xs:px-2.5 sm:px-3 pb-2 xs:pb-2.5 sm:pb-3 border-t-2 ${colors[colorIndex]} pt-2.5`}>
                  <p className="font-sans text-xs xs:text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
                </div>
              </details>
              </div>
            );
          })}
        </div>

        {/* Contact CTA */}
        <div className="text-center mt-4 xs:mt-5">
          <p className="text-foreground mb-3 font-sans text-xs xs:text-sm">Still have questions?</p>
          <a
            href="mailto:support@hair-ai.com"
            className="font-pixel text-[10px] xs:text-xs text-secondary hover:text-secondary/90 transition-colors uppercase brutal-border px-4 xs:px-5 py-2 inline-block brutal-shadow hover:brutal-shadow-md hover:-translate-y-0.5 transition-all duration-300 bg-success"
          >
            Contact Support
          </a>
        </div>

        {/* Testimonials */}
        <div className="mt-4 xs:mt-6 sm:mt-8">
          <SingleTestimonial />
        </div>
      </div>
      </div>
    </div>
  );
};
