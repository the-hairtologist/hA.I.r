import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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
    answer: "Our AI analyzes your client's hair type, previous colors, and desired results to generate precise formulas and handle scheduling automatically.",
  },
  {
    question: "What if I need help?",
    answer: "We offer 24/7 support via chat and email. Most questions are answered within minutes.",
  },
];

export const MinimalFAQ = () => {
  return (
    <div className="container mx-auto px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="font-display font-black text-3xl sm:text-4xl mb-2 text-foreground">
            Questions?
          </h2>
          <p className="text-muted-foreground">Everything you need to know</p>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem 
              key={index} 
              value={`item-${index}`}
              className="border border-border rounded-lg px-6 bg-card"
            >
              <AccordionTrigger className="text-left font-bold text-card-foreground hover:no-underline">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="text-center mt-10">
          <p className="text-muted-foreground mb-2">Still have questions?</p>
          <a
            href="mailto:support@hair-ai.com"
            className="text-primary hover:text-primary/80 font-bold transition-colors"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
};
