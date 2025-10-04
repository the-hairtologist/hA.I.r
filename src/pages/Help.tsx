import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { HelpCircle, MessageSquare, Mail, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Help = () => {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserRole();
  }, []);

  const loadUserRole = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .single();

      if (roleData) {
        setUserRole(roleData.role);
      }
    } catch (error) {
      console.error("Error loading user role:", error);
    } finally {
      setLoading(false);
    }
  };

  const stylistFaqs = [
    {
      category: "Getting Started",
      questions: [
        {
          q: "How do I set up my profile?",
          a: "Go to Profile from the sidebar, fill in your business information, specialty, location, years of experience, and preferred color lines. Add a bio to help clients get to know you better!"
        },
        {
          q: "How do I accept appointments?",
          a: "First, set your availability in Schedule Management. Clients can then book appointments through your profile. You'll receive notifications for new bookings and can manage them in the Appointments section."
        },
        {
          q: "What is the subscription model?",
          a: "hA.I.r offers a professional subscription for stylists with a free trial period. The subscription unlocks features like appointment scheduling, client management, portfolio, and AI-powered tools."
        }
      ]
    },
    {
      category: "Client Management",
      questions: [
        {
          q: "How do I add new clients?",
          a: "You can add clients in two ways: 1) Invite them via email from the Clients page, or 2) They can sign up and book directly with you. You can also book appointments for existing clients using 'Book for Client'."
        },
        {
          q: "How do I track client preferences and allergies?",
          a: "Each client profile includes sections for allergies, preferences, and notes. Access these through the Clients page. This information is visible when booking appointments."
        },
        {
          q: "Can I see my client's hair history?",
          a: "Yes! Each client profile shows their complete appointment history, including formulas used, services provided, and any notes from previous sessions."
        }
      ]
    },
    {
      category: "Appointments & Scheduling",
      questions: [
        {
          q: "How do I manage my availability?",
          a: "Go to Schedule Management to set your working hours, breaks, and time off. You can set different hours for each day of the week and block out time for vacations or appointments."
        },
        {
          q: "Can I reschedule or cancel appointments?",
          a: "Yes! Go to Appointments, find the appointment, and use the reschedule or cancel options. Clients will be notified automatically of any changes."
        },
        {
          q: "How do I quickly add an appointment?",
          a: "On your Dashboard, click any empty time slot in the weekly schedule view. This opens a quick appointment dialog where you can select a client and service."
        }
      ]
    },
    {
      category: "Services & Pricing",
      questions: [
        {
          q: "How do I add my services?",
          a: "Go to Services from the sidebar. Add your services with names, descriptions, durations, and prices. You can also categorize them (Cut, Color, Style, Treatment) and customize the category colors."
        },
        {
          q: "Can I customize service type colors?",
          a: "Yes! In Schedule Management, go to the Colors tab. You can customize the colors for each service type and add new custom service categories."
        }
      ]
    },
    {
      category: "Formulas & AI Tools",
      questions: [
        {
          q: "What are formulas?",
          a: "Formulas are detailed records of color mixtures and treatments you've used. You can create, save, and reuse formulas, making it easy to replicate results for returning clients."
        },
        {
          q: "How does the AI Assistant work?",
          a: "The AI Assistant can help you with color formulation advice, product recommendations, troubleshooting, and general hair care questions. It's trained on professional hair styling knowledge."
        },
        {
          q: "Can I generate formulas with AI?",
          a: "Yes! In the Formulas section, you can use the AI-powered formula generator. Describe what you want to achieve, and the AI will suggest a formula based on professional color theory."
        }
      ]
    },
    {
      category: "Payments & Commissions",
      questions: [
        {
          q: "How do payments work?",
          a: "You can track payments for each appointment in the Payments section. Mark appointments as paid or unpaid, and see your total revenue over time."
        },
        {
          q: "What are commissions?",
          a: "The Commissions feature helps you track your earnings if you're an independent contractor or booth renter. Set your commission percentage and see detailed breakdowns."
        }
      ]
    }
  ];

  const clientFaqs = [
    {
      category: "Getting Started",
      questions: [
        {
          q: "How do I find a stylist?",
          a: "Go to 'Find Stylists' from the sidebar. You can search by name, location, or specialty. Browse stylist profiles, view their portfolios, and read reviews from other clients."
        },
        {
          q: "How do I book an appointment?",
          a: "Once you find a stylist you like, click on their profile and select 'Book Appointment'. Choose a service, pick an available date and time, and confirm your booking."
        },
        {
          q: "Do I need to create an account?",
          a: "Yes, you'll need to create a free client account to book appointments, message stylists, and track your hair history."
        }
      ]
    },
    {
      category: "Appointments",
      questions: [
        {
          q: "Can I reschedule my appointment?",
          a: "Yes! Go to 'My Appointments', find your booking, and click the reschedule option. Please be respectful of your stylist's time and reschedule as early as possible."
        },
        {
          q: "How do I cancel an appointment?",
          a: "In 'My Appointments', click on the appointment you want to cancel. Note that some stylists may have cancellation policies - check their profile for details."
        },
        {
          q: "Will I receive appointment reminders?",
          a: "Yes! You'll receive email reminders before your appointment to help you remember."
        },
        {
          q: "What happens after I book?",
          a: "You'll receive a booking confirmation via email immediately. You can also see all your appointments in the 'My Appointments' section."
        }
      ]
    },
    {
      category: "Stylists & Reviews",
      questions: [
        {
          q: "How do I choose the right stylist?",
          a: "Look at their specialty, years of experience, portfolio photos, and client reviews. You can also message them before booking to discuss your hair goals."
        },
        {
          q: "Can I leave a review?",
          a: "Yes! After your appointment is complete, you'll be able to leave a rating and review for your stylist. This helps other clients and supports great stylists."
        },
        {
          q: "What are trust badges?",
          a: "Trust badges like 'Verified', 'Top Rated', and 'Experienced' help you identify high-quality stylists. They're awarded based on reviews, experience, and verification."
        }
      ]
    },
    {
      category: "Hair History & Formulas",
      questions: [
        {
          q: "Can I see my hair history?",
          a: "Yes! Go to 'My Formulas' to see all the formulas and treatments your stylist has used on your hair. This is super helpful if you want to replicate a look or avoid certain products."
        },
        {
          q: "What are formulas?",
          a: "Formulas are detailed records of color mixtures and treatments your stylist used. Your stylist can save these so they can recreate the exact same results next time."
        },
        {
          q: "Can I share my formulas with a new stylist?",
          a: "Yes! You can view all your formulas in 'My Formulas'. If you switch stylists, you can show them your formula history to help them understand what works for your hair."
        }
      ]
    },
    {
      category: "Messaging & Communication",
      questions: [
        {
          q: "How do I contact my stylist?",
          a: "Use the Messages section to chat with your stylist. You can ask questions about services, share inspiration photos, or discuss your hair goals before booking."
        },
        {
          q: "Can I send photos to my stylist?",
          a: "Yes! In the Messages section, you can send photos to show your stylist what you're hoping to achieve or any hair concerns you have."
        }
      ]
    },
    {
      category: "Payments & Pricing",
      questions: [
        {
          q: "How much do services cost?",
          a: "Each stylist sets their own prices. You can see service prices on their profile before booking. Prices vary based on the stylist's experience and location."
        },
        {
          q: "How do I pay for my appointment?",
          a: "Payment policies vary by stylist. Some may accept payment through the app, while others may prefer payment in person. Check your stylist's profile for their payment preferences."
        }
      ]
    }
  ];

  const faqs = userRole === "stylist" ? stylistFaqs : clientFaqs;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 max-w-4xl animate-fade-in">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 rounded-xl bg-primary/10 border-2 border-primary">
              <HelpCircle className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold font-display">Help & Support</h1>
              <p className="text-muted-foreground mt-1">
                Find answers to common questions
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="text-sm">
            {userRole === "stylist" ? "✂️ Stylist Guide" : "👤 Client Guide"}
          </Badge>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="border-[3px] border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))] bg-blue-400 hover:shadow-[6px_6px_0px_0px_hsl(var(--foreground))] hover:-translate-y-1 transition-all">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-display flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Restart Tutorial
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full border-2 border-foreground"
                onClick={() => {
                  localStorage.removeItem('onboarding_complete');
                  window.location.href = '/dashboard';
                }}
              >
                Launch Tour
              </Button>
            </CardContent>
          </Card>

          <Card className="border-[3px] border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))] bg-green-400 hover:shadow-[6px_6px_0px_0px_hsl(var(--foreground))] hover:-translate-y-1 transition-all">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-display flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Messages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full border-2 border-foreground"
                onClick={() => window.location.href = '/messages'}
              >
                Go to Messages
              </Button>
            </CardContent>
          </Card>

          <Card className="border-[3px] border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))] bg-yellow-300 hover:shadow-[6px_6px_0px_0px_hsl(var(--foreground))] hover:-translate-y-1 transition-all">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-display flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Contact Support
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full border-2 border-foreground"
                onClick={() => window.location.href = 'mailto:support@hair-app.com'}
              >
                Email Us
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* FAQs by Category */}
        <div className="space-y-6">
          {faqs.map((category) => (
            <Card 
              key={category.category}
              className="border-[3px] border-foreground shadow-[5px_5px_0px_0px_hsl(var(--foreground))]"
            >
              <CardHeader>
                <CardTitle className="text-2xl font-display">{category.category}</CardTitle>
                <CardDescription>
                  {category.questions.length} frequently asked questions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {category.questions.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger className="text-left font-medium hover:no-underline">
                        {faq.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground leading-relaxed">
                        {faq.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Still Need Help */}
        <Card className="mt-8 border-[3px] border-foreground shadow-[5px_5px_0px_0px_hsl(var(--foreground))] bg-purple-400">
          <CardHeader>
            <CardTitle className="text-2xl font-display">Still need help?</CardTitle>
            <CardDescription className="text-foreground/80">
              We're here to support you
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-foreground/90 font-medium">
              Can't find what you're looking for? Our support team is ready to assist you.
            </p>
            <div className="flex gap-3">
              <Button
                className="flex-1 border-2 border-foreground"
                onClick={() => window.location.href = 'mailto:support@hair-app.com'}
              >
                <Mail className="h-4 w-4 mr-2" />
                Email Support
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-2 border-foreground"
                onClick={() => window.location.href = '/messages'}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Message Us
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Help;
