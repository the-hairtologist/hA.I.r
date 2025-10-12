import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  HelpCircle, 
  MessageSquare, 
  Book, 
  Mail, 
  Phone,
  ExternalLink,
  Search,
  ChevronRight,
} from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";

const Help = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();
  const { isStylist, isClient, isAdmin } = useUserRole(user?.id);

  const stylistFaqs = [
    {
      question: "How do I add a new client?",
      answer: "Go to 'Client Management' in the sidebar, then click the '+ Add Client' button. Fill in their information and save.",
    },
    {
      question: "How do I create a formula?",
      answer: "Navigate to a client's profile, click 'New Formula', and either use AI assistance or manually create your formula with detailed notes and products.",
    },
    {
      question: "How do I manage my appointments?",
      answer: "Click 'Calendar' in the sidebar to view all appointments. You can click any appointment to view details, reschedule, or cancel. You can also filter by date and status.",
    },
    {
      question: "How do I set my working hours?",
      answer: "Go to 'Availability' in the sidebar to set your working hours, breaks, time off, and vacation days. This helps clients know when you're available for bookings.",
    },
    {
      question: "How do I share my booking page?",
      answer: "Go to 'My Booking Page' to get your unique booking link. You can customize it with your branding and share it on social media, your website, or via text/email.",
    },
    {
      question: "How do I track my earnings?",
      answer: "Visit the 'Finance' page to see your earnings, payments, pending amounts, and commission tracking all in one place. You can also export reports.",
    },
    {
      question: "How do I manage notifications?",
      answer: "Click 'Notifications' in the sidebar to view all your notifications. You can also adjust notification preferences in Settings.",
    },
    {
      question: "How do I use the AI Assistant?",
      answer: "The AI Assistant can help you with formula recommendations, client consultations, and hair care advice. Just describe what you need and it will provide personalized suggestions.",
    },
    {
      question: "How do I build my portfolio?",
      answer: "Go to 'Portfolio' to upload before/after photos, add descriptions, and showcase your best work. This helps attract new clients and build your brand.",
    },
    {
      question: "How do I invite clients?",
      answer: "In 'Client Management', click on a client and select 'Invite to Portal'. They'll receive an email to create their account and access their appointments and formulas.",
    },
    {
      question: "How do I integrate with my calendar?",
      answer: "Visit 'Integrations' to connect with Google Calendar, Outlook, or other calendar apps to sync your appointments automatically.",
    },
    {
      question: "How do I handle cancellations and reschedules?",
      answer: "Click on any appointment in your Calendar, then select 'Reschedule' or 'Cancel'. Clients will be notified automatically of any changes.",
    },
    {
      question: "What if I forgot my password?",
      answer: "Click 'Forgot Password' on the login screen. You'll receive an email with instructions to reset your password securely.",
    },
    {
      question: "How do I update my profile information?",
      answer: "Go to 'My Profile' to update your photo, bio, contact information, specialties, and social media links.",
    },
    {
      question: "How do I refer friends and earn rewards?",
      answer: "Visit 'Referrals' to get your unique referral link. Share it with other stylists and earn rewards when they sign up!",
    },
  ];

  const clientFaqs = [
    {
      question: "How do I book an appointment with a stylist?",
      answer: "Go to 'Find a Stylist', browse available stylists, select one you like, and click 'Book Appointment'. You can choose your preferred date, time, and service.",
    },
    {
      question: "How can I view my upcoming appointments?",
      answer: "Click on 'My Appointments' in the sidebar to see all your scheduled appointments, past visits, and available rebooking options.",
    },
    {
      question: "How do I see my hair formulas?",
      answer: "Your stylist will share formulas with you after each appointment. You can view them in your profile under 'My Formulas' to see the exact colors and products used.",
    },
    {
      question: "How do I message my stylist?",
      answer: "Go to 'Messages' in the sidebar, select your stylist from your conversations, and send them a message. You'll get notified when they respond.",
    },
    {
      question: "How do I leave a review?",
      answer: "After your appointment is completed, you'll receive a notification to leave a review. You can also go to your appointment history and click 'Leave Review'.",
    },
    {
      question: "How do I reschedule or cancel an appointment?",
      answer: "Go to 'My Appointments', click on the appointment you want to change, then select 'Reschedule' or 'Cancel'. Your stylist will be notified automatically.",
    },
    {
      question: "Can I save my favorite stylists?",
      answer: "Yes! Click the heart icon on any stylist's profile to add them to your favorites. You'll see them on your dashboard for quick booking.",
    },
    {
      question: "What if I forgot my password?",
      answer: "Click 'Forgot Password' on the login screen. You'll receive an email with instructions to reset your password securely.",
    },
    {
      question: "How do I update my profile?",
      answer: "Go to 'My Profile' to update your photo, contact information, hair preferences, and notification settings.",
    },
    {
      question: "How do I track my milestones and rewards?",
      answer: "Check your dashboard for 'Rewards & Milestones'. You'll earn discounts after completing 5, 10, and 25 appointments with the same stylist!",
    },
  ];

  // Choose FAQs based on role
  const faqs = isStylist ? stylistFaqs : isClient ? clientFaqs : [...stylistFaqs, ...clientFaqs];

  const filteredFaqs = searchQuery
    ? faqs.filter(faq => 
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : faqs;

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Message sent! We'll get back to you soon.");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-3xl font-display font-bold">Help & Support</h1>
          <p className="text-muted-foreground">
            {isStylist 
              ? "Get help managing your salon business"
              : isClient
              ? "Get help booking appointments and managing your hair care"
              : "Get help and find answers to your questions"}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <Book className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-semibold mb-1">Documentation</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Browse our complete guides
              </p>
              <Button variant="ghost" size="sm" className="p-0">
                View Docs <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <MessageSquare className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-semibold mb-1">Live Chat</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Chat with our support team
              </p>
              <Button variant="ghost" size="sm" className="p-0">
                Start Chat <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <HelpCircle className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-semibold mb-1">Video Tutorials</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Watch step-by-step guides
              </p>
              <Button variant="ghost" size="sm" className="p-0">
                Watch Now <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Search FAQs */}
        <Card>
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search for help..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <Accordion type="single" collapsible className="w-full">
              {filteredFaqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger>{faq.question}</AccordionTrigger>
                  <AccordionContent>{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            {filteredFaqs.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No results found. Try a different search term.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Contact Form */}
        <Card>
          <CardHeader>
            <CardTitle>Still Need Help?</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" placeholder="What do you need help with?" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Describe your issue in detail..."
                  rows={5}
                  required
                />
              </div>

              <Button type="submit">Send Message</Button>
            </form>

            <div className="mt-6 pt-6 border-t space-y-3">
              <p className="text-sm font-semibold">Other ways to reach us:</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>support@hair-ai.com</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>1-800-HAIR-AI</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Help;
