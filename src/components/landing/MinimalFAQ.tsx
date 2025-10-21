import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { analytics } from "@/lib/analytics";

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
    <div className="container mx-auto px-4" ref={ref}>
      <div className="max-w-2xl mx-auto">
        <div className={`text-center mb-12 transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <h2 className="font-pixel text-xl xs:text-2xl sm:text-3xl mb-4 text-foreground uppercase tracking-wider">
            THE REAL QUESTIONS YOU'RE ASKING
          </h2>
          <p className="font-sans text-sm xs:text-base text-foreground/70 max-w-2xl mx-auto">
            No fluff. Just honest answers.
          </p>
        </div>

        <div className="space-y-6">
          {faqs.map((faq, index) => {
            // Rotate through brand colors for visual variety
            const colors = ['border-primary', 'border-accent', 'border-secondary'];
            const bgColors = ['bg-primary/5', 'bg-accent/5', 'bg-secondary/5'];
            const accentColors = ['text-primary', 'text-accent', 'text-secondary'];
            const colorIndex = index % 3;
            
            return (
              <div 
                key={faq.question} 
                className={`brutal-border-4 ${colors[colorIndex]} ${bgColors[colorIndex]} hover:brutal-shadow transition-all duration-300 hover:translate-x-1 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
                style={{
                  transitionDelay: `${index * 100}ms`,
                }}
              >
                <details className="group" onClick={() => handleFAQClick(faq.question)}>
                  <summary className="cursor-pointer list-none p-4 xs:p-5 font-bold text-foreground hover:bg-white/50 transition-colors duration-200 flex justify-between items-center gap-4">
                    <span className="font-sans text-sm sm:text-base">{faq.question}</span>
                    <span className={`font-pixel text-xl ${accentColors[colorIndex]} group-open:rotate-90 transition-transform duration-300 flex-shrink-0`}>▶</span>
                  </summary>
                  <div className={`px-4 xs:px-5 pb-4 xs:pb-5 border-t-4 ${colors[colorIndex]} pt-4`}>
                    <p className="font-sans text-sm sm:text-base text-foreground/80 leading-relaxed">{faq.answer}</p>
                  </div>
                </details>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <p className="text-foreground/70 mb-4 font-sans text-sm xs:text-base font-bold">Still have questions?</p>
          <a
            href="mailto:support@hair-ai.com"
            className="font-pixel text-xs xs:text-sm text-white hover:text-white uppercase brutal-border-4 border-black bg-primary px-6 xs:px-8 py-3 xs:py-4 inline-block brutal-shadow-md hover:brutal-shadow-lg hover:-translate-y-1 transition-all duration-300"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
};
