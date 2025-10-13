import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  HelpCircle, 
  MessageSquare, 
  Book, 
  Mail, 
  Phone,
  ExternalLink,
  Search,
  ChevronRight,
  BookOpen,
  Video,
  Sparkles,
  Play,
} from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { haptic } from "@/platform/haptics";
import { useNavigate } from "react-router-dom";

const Help = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();
  const { isStylist, isClient, isAdmin } = useUserRole(user?.id);
  const navigate = useNavigate();

  // Help articles from the help button
  const helpArticles = [
    {
      id: "add-client",
      title: "How to Add Your First Client",
      description: "Step-by-step guide to adding clients and building their hair history",
      category: "Getting Started",
    },
    {
      id: "formulas",
      title: "Saving Color Formulas",
      description: "Learn how to document and save perfect color formulas",
      category: "Features",
    },
    {
      id: "milestones",
      title: "Understanding Client Milestones",
      description: "How milestone celebrations work and reward your loyal clients",
      category: "Features",
    },
    {
      id: "referrals",
      title: "Referral Program Guide",
      description: "Earn free months by inviting other stylists to join",
      category: "Growth",
    },
    {
      id: "timeline",
      title: "Hair Memory Timeline",
      description: "Track every client's hair journey and share their story",
      category: "Features",
    },
    {
      id: "booking",
      title: "Managing Appointments",
      description: "How to create, update, and track client appointments",
      category: "Getting Started",
    },
  ];

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

  const filteredArticles = searchQuery
    ? helpArticles.filter(article =>
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : helpArticles;

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

        {/* Interactive Demo Link */}
        <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shrink-0">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold mb-1">Interactive Feature Demo</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  See key features in action with an interactive walkthrough
                </p>
                <Button onClick={() => navigate("/showcase")} className="gap-2">
                  <Play className="h-4 w-4" />
                  Launch Demo
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabbed Interface */}
        <Tabs defaultValue="articles" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="articles" className="gap-2">
              <BookOpen className="h-4 w-4" />
              Articles & FAQs
            </TabsTrigger>
            <TabsTrigger value="videos" className="gap-2">
              <Video className="h-4 w-4" />
              Videos
            </TabsTrigger>
            <TabsTrigger value="contact" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              Contact Us
            </TabsTrigger>
          </TabsList>

          {/* Articles & FAQs Tab */}
          <TabsContent value="articles" className="space-y-6 mt-6">
            {/* Search */}
            <Card>
              <CardContent className="pt-6">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search help articles and FAQs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Help Articles */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Help Articles</h2>
              <div className="grid gap-3">
                {filteredArticles.length === 0 && searchQuery ? (
                  <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                      No articles found. Try a different search term.
                    </CardContent>
                  </Card>
                ) : (
                  filteredArticles.map((article) => (
                    <Card
                      key={article.id}
                      className="brutal-border hover:border-primary/40 transition-colors cursor-pointer"
                      onClick={() => {
                        haptic.tap();
                        // Article detail view could be added here
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="flex items-start justify-between">
                            <h4 className="font-semibold text-sm">{article.title}</h4>
                            <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0 ml-2" />
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {article.description}
                          </p>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-primary font-medium">
                              {article.category}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>

            {/* FAQs */}
            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {filteredFaqs.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger>{faq.question}</AccordionTrigger>
                      <AccordionContent>{faq.answer}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>

                {filteredFaqs.length === 0 && searchQuery && (
                  <p className="text-center text-muted-foreground py-8">
                    No FAQs found. Try a different search term.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Videos Tab */}
          <TabsContent value="videos" className="space-y-6 mt-6">
            <Card>
              <CardContent className="py-12">
                <div className="text-center space-y-4">
                  <Video className="h-16 w-16 mx-auto text-muted-foreground" />
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Video Tutorials Coming Soon</h3>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                      Step-by-step video guides will be available in a future update. In the meantime, explore the articles and FAQs sections!
                    </p>
                  </div>
                  <Button variant="outline" onClick={() => haptic.tap()}>
                    Browse Articles Instead
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions while waiting */}
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
                  <h3 className="font-semibold mb-1">Need More Help?</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Contact us directly
                  </p>
                  <Button variant="ghost" size="sm" className="p-0">
                    Get in Touch <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Contact Tab */}
          <TabsContent value="contact" className="space-y-6 mt-6">
            {/* Live Chat Option */}
            <Card className="border-[2px] border-primary/30">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <MessageSquare className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">Live Chat Support</h4>
                    <p className="text-sm text-muted-foreground">
                      Chat with our team Monday-Friday, 9am-6pm EST
                    </p>
                  </div>
                  <Button
                    onClick={() => {
                      haptic.tap();
                      toast.info("Chat widget opening soon!");
                    }}
                    className="border-[2px] border-foreground"
                  >
                    Start Chat
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Contact Form */}
            <Card>
              <CardHeader>
                <CardTitle>Send Us a Message</CardTitle>
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
                    <a href="mailto:support@hair-ai.com" className="hover:text-primary">
                      support@hair-ai.com
                    </a>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>1-800-HAIR-AI</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Email Support Card */}
            <Card className="border-[2px] border-border">
              <CardContent className="p-6">
                <h4 className="font-semibold mb-2">Email Support</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Send us an email and we'll respond within 24 hours
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    window.location.href = "mailto:support@hair-ai.com";
                  }}
                  className="border-[2px] border-foreground"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  support@hair-ai.com
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Help;
