import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  HelpCircle, 
  Loader2, 
  Search, 
  MessageCircle, 
  FileQuestion,
  Navigation,
  Settings,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertCircle,
  Info
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const Resources = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { roles, loading: roleLoading } = useUserRole(user?.id);
  
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !roleLoading && user && roles.length > 0) {
      const primaryRole = roles.includes('stylist') ? 'stylist' : roles[0];
      setUserRole(primaryRole);
      setLoading(false);
    } else if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [authLoading, roleLoading, user, roles]);

  const checkUserRole = async () => {
    // This function is now handled by the useEffect above with useUserRole hook
  };

  const faqCategories = [
    {
      id: "getting-started",
      title: "Getting Started",
      icon: Info,
      faqs: [
        {
          question: "How do I navigate the app?",
          answer: "Use the sidebar on desktop or the bottom navigation bar on mobile to access different sections. The main sections include Dashboard, Appointments, Messages, and Settings."
        },
        {
          question: "How do I change my account settings?",
          answer: "Click on 'Settings' in the sidebar or bottom navigation. From there, you can update your profile, preferences, and account information."
        },
        {
          question: "How do I switch between client and stylist views?",
          answer: "Your account is set up with a specific role. To change roles, contact support or create a new account with the desired role during sign-up."
        }
      ]
    },
    {
      id: "appointments",
      title: "Appointments",
      icon: CheckCircle2,
      faqs: [
        {
          question: "How do I book an appointment?",
          answer: userRole === "client" 
            ? "Navigate to 'Find Stylists', browse available stylists, select your preferred stylist, choose a date and time, then confirm your booking."
            : "Clients can book appointments through your profile. You'll receive a notification when new appointments are booked. You can manage them in the Appointments section."
        },
        {
          question: "How do I reschedule an appointment?",
          answer: "Go to the Appointments page, find your appointment, click the three dots menu, and select 'Reschedule'. Choose a new date and time, then confirm."
        },
        {
          question: "How do I cancel an appointment?",
          answer: "Navigate to Appointments, find the appointment you want to cancel, click the three dots menu, select 'Cancel', and confirm your cancellation."
        },
        {
          question: "Can I see my appointment history?",
          answer: "Yes! Go to the Appointments page and use the tabs to switch between Upcoming, Past, and Cancelled appointments."
        }
      ]
    },
    {
      id: "messages",
      title: "Messages & Communication",
      icon: MessageCircle,
      faqs: [
        {
          question: "How do I send a message?",
          answer: "Navigate to the Messages section, select a conversation or start a new one by clicking the compose button, type your message, and hit send."
        },
        {
          question: "Will I get notifications for new messages?",
          answer: "Yes, you'll receive in-app notifications for new messages. Make sure notifications are enabled in your browser settings."
        },
        {
          question: "Can I send images in messages?",
          answer: "Image sharing is coming soon! For now, you can share information about images through text descriptions."
        }
      ]
    },
    {
      id: "account",
      title: "Account & Profile",
      icon: Settings,
      faqs: [
        {
          question: "How do I update my profile information?",
          answer: "Go to Settings, select the Profile tab, make your changes, and click 'Update Profile' to save."
        },
        {
          question: "How do I change my password?",
          answer: "Navigate to Settings > Security tab, enter your current password, then your new password twice, and click 'Update Password'."
        },
        {
          question: "How do I delete my account?",
          answer: "Go to Settings > Danger Zone tab. Note: Account deletion is permanent and cannot be undone. All your data will be permanently removed."
        }
      ]
    },
    {
      id: "troubleshooting",
      title: "Troubleshooting",
      icon: AlertCircle,
      faqs: [
        {
          question: "The app is loading slowly. What should I do?",
          answer: "Try refreshing the page, clearing your browser cache, or checking your internet connection. If the problem persists, try using a different browser."
        },
        {
          question: "I can't sign in. What's wrong?",
          answer: "Double-check your email and password. If you've forgotten your password, click 'Forgot Password' on the login page. Make sure your account is verified via the email sent during registration."
        },
        {
          question: "I'm not receiving notifications.",
          answer: "Check that browser notifications are enabled for this app. In your browser settings, allow notifications for hair.app."
        },
        {
          question: "The page is showing an error.",
          answer: "Try refreshing the page. If the error persists, sign out and sign back in. If you continue experiencing issues, contact support with details about the error message."
        }
      ]
    }
  ];

  // Add stylist-specific FAQs
  if (userRole === "stylist") {
    faqCategories.push({
      id: "business",
      title: "Business Tools",
      icon: Navigation,
      faqs: [
        {
          question: "How do I manage my services and pricing?",
          answer: "Navigate to Services in the sidebar. Here you can add new services, set prices, specify duration, and manage service categories."
        },
        {
          question: "How do I track my finances?",
          answer: "Go to the Finance section to view earnings, payments, and financial reports. You can filter by date range and export reports."
        },
        {
          question: "How do I manage client information?",
          answer: "Use the Clients section to view client profiles, appointment history, formulas used, and add notes about preferences and allergies."
        },
        {
          question: "How do I save color formulas?",
          answer: "In the Formulas section, click 'New Formula', enter the details including products, ratios, and processing time, then save. You can link formulas to specific clients."
        }
      ]
    });
  }

  const filteredFAQs = faqCategories.map(category => ({
    ...category,
    faqs: category.faqs.filter(faq =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.faqs.length > 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <PageHeader
        title="Help & Support"
        icon={<HelpCircle className="h-6 w-6" />}
        backTo="/dashboard"
      />

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Search Bar */}
        <Card className="mb-8 border-[3px] border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))]">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search for help, solutions, or questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-base border-[2px] border-foreground"
              />
            </div>
          </CardContent>
        </Card>

        {/* Quick Access Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card className="border-[2px] border-foreground shadow-[2px_2px_0px_0px_hsl(var(--foreground))] hover:shadow-[4px_4px_0px_0px_hsl(var(--foreground))] hover:-translate-y-1 transition-all cursor-pointer"
                onClick={() => navigate("/knowledge")}>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center gap-3">
                <div className="p-3 rounded-lg bg-blue-500/10">
                  <FileQuestion className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold">Knowledge Base</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Articles & guides
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[2px] border-foreground shadow-[2px_2px_0px_0px_hsl(var(--foreground))] hover:shadow-[4px_4px_0px_0px_hsl(var(--foreground))] hover:-translate-y-1 transition-all cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center gap-3">
                <div className="p-3 rounded-lg bg-purple-500/10">
                  <Navigation className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="font-semibold">Navigation Guide</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Learn the app
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[2px] border-foreground shadow-[2px_2px_0px_0px_hsl(var(--foreground))] hover:shadow-[4px_4px_0px_0px_hsl(var(--foreground))] hover:-translate-y-1 transition-all cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center gap-3">
                <div className="p-3 rounded-lg bg-green-500/10">
                  <MessageCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold">Contact Support</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Get personal help
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Sections */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-pixel">Frequently Asked Questions</h2>
            {searchQuery && (
              <Badge variant="secondary">
                {filteredFAQs.reduce((acc, cat) => acc + cat.faqs.length, 0)} results
              </Badge>
            )}
          </div>

          {filteredFAQs.length === 0 ? (
            <Card className="border-[2px] border-foreground shadow-[2px_2px_0px_0px_hsl(var(--foreground))]">
              <CardContent className="pt-8 pb-8 text-center">
                <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium mb-2">No results found</p>
                <p className="text-sm text-muted-foreground">
                  Try different keywords or browse all categories
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredFAQs.map((category) => (
              <Card 
                key={category.id}
                className="border-[3px] border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))]"
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <category.icon className="h-5 w-5" />
                    {category.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {category.faqs.map((faq, index) => (
                      <AccordionItem key={faq.question} value={`item-${index}`}>
                        <AccordionTrigger className="text-left hover:no-underline">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Contact Support Card */}
        <Card className="mt-8 border-[3px] border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))] bg-gradient-to-br from-primary/5 to-secondary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Still need help?
            </CardTitle>
            <CardDescription>
              Can't find what you're looking for? Our support team is here to help.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button className="flex-1">
                <MessageCircle className="h-4 w-4 mr-2" />
                Contact Support
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => navigate("/knowledge")}>
                Browse Knowledge Base
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Resources;
