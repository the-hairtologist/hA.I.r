import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const faqs = [
  {
    question: "Do I need a credit card to start?",
    answer: "No. Start your 14-day free trial without entering any payment information.",
  },
  {
    question: "Can I cancel anytime?",
    answer: "Yes. Cancel with one click, no questions asked. You'll have access until the end of your billing period.",
  },
  {
    question: "How does the AI work?",
    answer: "Our AI assists with formula suggestions based on hair type, previous colors, and desired results. You review and approve all recommendations before use.",
  },
  {
    question: "What if I need help?",
    answer: "We offer support via email and chat. Response times typically within 24 hours, with faster responses during business hours.",
  },
];

export const MinimalFAQ = () => {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 });

  return (
    <div className="container mx-auto px-4" ref={ref}>
      <div className="max-w-2xl mx-auto">
        <div className={`text-center mb-10 transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <h2 className="font-pixel text-2xl sm:text-3xl mb-4 text-accent-foreground uppercase tracking-wider">
            Questions?
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={faq.question} 
              className={`border-4 border-black bg-white hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 hover:translate-x-1 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
              style={{
                transitionDelay: `${index * 100}ms`,
              }}
            >
              <details className="group">
                <summary className="cursor-pointer list-none p-4 font-bold text-foreground hover:bg-secondary/10 transition-colors duration-200 flex justify-between items-center">
                  <span className="font-sans text-sm sm:text-base">{faq.question}</span>
                  <span className="font-pixel text-xl group-open:rotate-90 transition-transform duration-300">▶</span>
                </summary>
                <div className="px-4 pb-4 border-t-2 border-black pt-4 bg-muted/30">
                  <p className="font-sans text-sm text-muted-foreground">{faq.answer}</p>
                </div>
              </details>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <p className="text-muted-foreground mb-2 font-sans text-sm">Still have questions?</p>
          <a
            href="mailto:support@hair-ai.com"
            className="font-pixel text-xs text-primary hover:text-primary/80 transition-colors uppercase border-2 border-black bg-white px-4 py-2 inline-block shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-all"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
};
