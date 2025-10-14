import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "How accurate is the AI color formula generator?",
    answer: "Our AI analyzes thousands of professional color formulas and hair types to provide highly accurate recommendations. Stylists report 95%+ satisfaction with formula accuracy. The AI considers hair history, current color, and desired outcome to generate custom formulas."
  },
  {
    question: "Do I need technical skills to use hA.I.r?",
    answer: "Not at all! hA.I.r is designed for stylists, not tech experts. Setup takes less than 60 seconds, and everything works intuitively. If you can send a text message, you can use hA.I.r."
  },
  {
    question: "How does the 24/7 booking work?",
    answer: "You get a custom booking link that you can share anywhere—Instagram, Facebook, your website. Clients click it, see your real-time availability, and book instantly. You control your schedule, and they book when it's convenient for them. No more back-and-forth DMs."
  },
  {
    question: "Can I cancel anytime?",
    answer: "Yes! There are no long-term contracts or cancellation fees. You can cancel your subscription at any time from your account settings. Your data remains accessible even after cancellation."
  },
  {
    question: "What happens to my client data?",
    answer: "Your data is 100% yours and is encrypted end-to-end. We never sell or share client information. You can export all your data at any time, and if you cancel, you retain access to your historical records."
  },
  {
    question: "Do my clients need to create an account?",
    answer: "No! Clients can book appointments without creating an account. They just need to provide basic contact info (name, phone, email) to receive confirmations and reminders. It's designed to be as frictionless as possible."
  },
  {
    question: "Can I use this with my existing calendar?",
    answer: "Yes! hA.I.r syncs with Google Calendar, Apple Calendar, and Outlook. Your bookings automatically appear in your existing calendar, and blocks from other calendars prevent double-bookings."
  },
  {
    question: "What if I need help?",
    answer: "We offer email support for all users, priority support for Professional plan users, and dedicated account management for Salon plans. Plus, our help center has video tutorials, guides, and answers to common questions."
  }
];

export const FAQSection = () => {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="font-display font-black text-3xl sm:text-5xl mb-4">
          Questions? We've Got Answers.
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Everything you need to know about hA.I.r
        </p>
      </div>

      <div className="max-w-3xl mx-auto">
        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, idx) => (
            <AccordionItem
              key={idx}
              value={`item-${idx}`}
              className="brutal-border brutal-shadow-lg bg-card px-6 rounded-lg data-[state=open]:brutal-shadow-xl transition-all"
            >
              <AccordionTrigger className="font-display font-bold text-left hover:no-underline py-4">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed pb-4">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      <div className="text-center">
        <p className="text-muted-foreground mb-4">Still have questions?</p>
        <a
          href="mailto:support@hair-ai.com"
          className="text-primary hover:underline font-medium"
        >
          Contact our team →
        </a>
      </div>
    </div>
  );
};
