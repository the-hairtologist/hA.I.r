import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { HelpCircle, MessageSquare, Mail, BookOpen, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

const Help = () => {
  const navigate = useNavigate();
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
          a: "Go to Profile from the sidebar, fill in your business information, specialty, location, years of experience, and preferred color lines. Add a bio and profile photo to help clients get to know you better!"
        },
        {
          q: "What should I do first after signing up?",
          a: "Follow the onboarding tutorial when you first log in. Then: 1) Complete your profile, 2) Set up your services, 3) Configure your schedule, 4) Upload portfolio photos, and 5) Start inviting clients!"
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
          q: "Can I require deposits for services?",
          a: "Yes! When creating or editing a service, enable 'Require Deposit' and set either a fixed amount or percentage. Clients will need to pay the deposit when booking."
        },
        {
          q: "Can I customize service type colors?",
          a: "Yes! In Schedule Management, go to the Colors tab. You can customize the colors for each service type and add new custom service categories. This helps you visually organize your calendar."
        },
        {
          q: "How do I temporarily disable a service?",
          a: "In Services, find the service you want to pause and toggle it to inactive. It will be hidden from your booking page but you can reactivate it anytime."
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
          q: "Can I track deposits separately?",
          a: "Yes! When recording a payment, mark it as a deposit and enter the deposit amount. The system will track the remaining balance automatically."
        },
        {
          q: "What are commissions?",
          a: "The Commissions feature helps you track your earnings if you're an independent contractor or booth renter. Add commission records with product details, purchase dates, and amounts."
        },
        {
          q: "How do I add affiliate codes?",
          a: "In Commissions, you can add affiliate codes for hair brands you work with. Track which products generate commissions and manage custom commission rates per brand."
        }
      ]
    },
    {
      category: "Portfolio & Marketing",
      questions: [
        {
          q: "How do I build my portfolio?",
          a: "Go to Portfolio and upload your best work. You can add captions, organize photos by display order, and create before/after comparisons to showcase transformations."
        },
        {
          q: "What makes a good portfolio photo?",
          a: "Use clear, well-lit photos that showcase your work. Before/after photos are especially effective. Add captions describing the techniques or products used."
        },
        {
          q: "Can clients see my portfolio before booking?",
          a: "Yes! Your portfolio is visible on your public stylist profile. This helps clients see your style and expertise before booking with you."
        },
        {
          q: "How do I get more reviews?",
          a: "Provide excellent service! Clients can leave reviews after their appointments. Reviews help build trust and appear on your profile for potential clients to see."
        }
      ]
    },
    {
      category: "Dashboard Features",
      questions: [
        {
          q: "Can I customize my dashboard?",
          a: "Yes! You can drag and drop sections to reorder them. Your layout preferences are saved automatically so your dashboard stays organized the way you like it."
        },
        {
          q: "What are the quick actions?",
          a: "Quick actions on the dashboard give you one-click access to common tasks like adding clients, booking appointments, creating formulas, and more."
        },
        {
          q: "How do I use the weekly schedule view?",
          a: "The weekly schedule on your dashboard shows upcoming appointments. Click any empty time slot to quickly create a new appointment for a client."
        },
        {
          q: "What are todos for?",
          a: "Use todos to track tasks like ordering products, following up with clients, or preparing for special appointments. Check them off as you complete them!"
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
        },
        {
          q: "What should I look for when choosing a stylist?",
          a: "Check their specialty to match your needs, browse their portfolio for style inspiration, read client reviews for quality assurance, and look for trust badges like 'Top Rated' or 'Experienced'."
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
          q: "Do I need to pay a deposit?",
          a: "Some services require a deposit when booking. You'll see this clearly when selecting a service. Deposits help secure your appointment time."
        },
        {
          q: "How do I pay for my appointment?",
          a: "Payment policies vary by stylist. Some may accept payment through the app, while others may prefer payment in person. Check your stylist's profile for their payment preferences."
        },
        {
          q: "What if I need to cancel?",
          a: "Check your stylist's cancellation policy on their profile. Please cancel as early as possible to be respectful of their time. Some stylists may have deposit refund policies for cancellations."
        }
      ]
    },
    {
      category: "Profile & Account",
      questions: [
        {
          q: "How do I update my profile?",
          a: "Go to Profile from the sidebar to update your personal information, contact details, and preferences. This helps stylists provide better service tailored to your needs."
        },
        {
          q: "Can I switch to a stylist account?",
          a: "Yes! If you're a professional stylist, go to Settings and switch to a stylist account. You can switch back to client view anytime to book appointments as a client."
        },
        {
          q: "How do I change my avatar?",
          a: "In Settings, you can choose from different avatar styles. Select the one that best represents you - your choice will appear throughout the app."
        }
      ]
    }
  ];

  const troubleshootingFaqs = [
    {
      category: "Login & Access Issues",
      questions: [
        {
          q: "I can't log in to my account",
          a: "SOLUTION: 1) Check your email and password are correct. 2) Try resetting your password using 'Forgot Password'. 3) Clear your browser cache and cookies. 4) Make sure you're using a supported browser (Chrome, Firefox, Safari, Edge)."
        },
        {
          q: "I'm not receiving confirmation emails",
          a: "SOLUTION: 1) Check your spam/junk folder. 2) Add support@hair-app.com to your contacts. 3) Verify your email address is correct in your profile. 4) Try resending the confirmation email from your account settings."
        },
        {
          q: "The page keeps loading and nothing appears",
          a: "SOLUTION: 1) Refresh the page (F5 or Cmd+R). 2) Clear your browser cache. 3) Check your internet connection. 4) Try accessing the app in an incognito/private window. 5) Disable browser extensions that might interfere."
        }
      ]
    },
    {
      category: "Appointments & Booking",
      questions: [
        {
          q: "I can't see my appointments",
          a: "SOLUTION: 1) Make sure you're logged into the correct account. 2) Check the date range - you might be viewing past dates. 3) Refresh the page. 4) If the issue persists, log out and log back in. Your appointments are saved and won't be lost."
        },
        {
          q: "Available time slots aren't showing",
          a: "SOLUTION: 1) The stylist may not have set their availability yet. 2) All slots for your selected date might be booked. 3) Try selecting a different date. 4) Contact the stylist directly through Messages to check availability."
        },
        {
          q: "My appointment confirmation didn't arrive",
          a: "SOLUTION: 1) Check your spam folder. 2) Verify the email in your profile is correct. 3) Your appointment is still saved - view it in 'My Appointments' or 'Appointments' section. 4) Contact your stylist through Messages to confirm."
        },
        {
          q: "I accidentally booked the wrong time",
          a: "SOLUTION: Go to your appointments and use the 'Reschedule' option to change the time. If that doesn't work, you can cancel and rebook. For urgent changes, message your stylist directly."
        }
      ]
    },
    {
      category: "Profile & Data Issues",
      questions: [
        {
          q: "My profile changes aren't saving",
          a: "SOLUTION: 1) Make sure to click 'Save' or 'Update' after making changes. 2) Check your internet connection. 3) Try refreshing and re-entering the information. 4) If you see an error message, note what it says and try again."
        },
        {
          q: "I can't upload photos",
          a: "SOLUTION: 1) Check file size (max 5MB) and format (JPG, PNG). 2) Try compressing the image. 3) Ensure you have a stable internet connection. 4) Try using a different browser. 5) Clear browser cache and try again."
        },
        {
          q: "My stylist/client list is empty",
          a: "SOLUTION FOR STYLISTS: You need to invite clients or have clients book with you first. SOLUTION FOR CLIENTS: You need to book an appointment with a stylist to have them appear in your list."
        },
        {
          q: "The tutorial keeps appearing",
          a: "SOLUTION: Complete the tutorial all the way through OR click 'Skip Tour' when it appears. Your preference will be saved. If it still appears, go to Settings > Restart Tutorial and complete it fully."
        }
      ]
    },
    {
      category: "Messages & Notifications",
      questions: [
        {
          q: "I'm not receiving notifications",
          a: "SOLUTION: 1) Check your email spam folder. 2) Verify your email address in your profile. 3) Check browser notification permissions. 4) Make sure notifications aren't blocked in your account settings."
        },
        {
          q: "Messages aren't sending",
          a: "SOLUTION: 1) Check your internet connection. 2) Refresh the page and try again. 3) The message might have sent - check the conversation thread. 4) Try logging out and back in."
        },
        {
          q: "I can't find a conversation",
          a: "SOLUTION: 1) Use the search function in Messages. 2) Check if you're looking in the right timeframe. 3) The other person might not have replied yet - conversations appear after the first exchange."
        }
      ]
    },
    {
      category: "Schedule & Calendar",
      questions: [
        {
          q: "My schedule isn't displaying correctly",
          a: "SOLUTION: 1) Go to Schedule Management and verify your hours are set correctly. 2) Check for any override schedules or blocked dates that might conflict. 3) Make sure buffer time settings aren't causing issues. 4) Refresh the page."
        },
        {
          q: "Clients are booking outside my hours",
          a: "SOLUTION: This shouldn't happen! 1) Check your weekly schedule settings - make sure end times are correct. 2) Look for schedule overrides that might extend hours. 3) Verify there are no system time zone issues. 4) Contact support if it continues."
        },
        {
          q: "Calendar colors are confusing",
          a: "SOLUTION: Go to Schedule Management > Colors tab. You can customize the color for each service type to make your calendar clearer and easier to read at a glance."
        }
      ]
    },
    {
      category: "Performance Issues",
      questions: [
        {
          q: "The app is running slow",
          a: "SOLUTION: 1) Close unused browser tabs. 2) Clear browser cache and cookies. 3) Check your internet speed. 4) Try using a different browser. 5) Restart your browser. 6) If on mobile, close other apps."
        },
        {
          q: "Images are taking forever to load",
          a: "SOLUTION: 1) Check your internet connection. 2) The image might be too large - try compressing before upload. 3) Try refreshing the page. 4) Switch to a better network if possible."
        },
        {
          q: "Features are missing or broken",
          a: "SOLUTION: 1) Ensure you have an active subscription (for stylists). 2) Try hard refresh (Ctrl+Shift+R or Cmd+Shift+R). 3) Clear cache completely. 4) Update your browser to the latest version. 5) Contact support with specific details."
        }
      ]
    }
  ];

  const roleFaqs = userRole === "stylist" ? stylistFaqs : clientFaqs;

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
        {/* Back Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/dashboard")}
          className="mb-4 hover:bg-secondary/20 hover:-translate-x-1 transition-all"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

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

        {/* Role-Specific FAQs */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold font-display mb-4">
            {userRole === "stylist" ? "Stylist Guide" : "Client Guide"}
          </h2>
          <div className="space-y-6">
            {roleFaqs.map((category) => (
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
        </div>

        {/* Troubleshooting Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-destructive/10 border-2 border-destructive">
              <HelpCircle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <h2 className="text-3xl font-bold font-display">Troubleshooting & Solutions</h2>
              <p className="text-muted-foreground">Common issues and how to fix them</p>
            </div>
          </div>
          <div className="space-y-6">
            {troubleshootingFaqs.map((category) => (
              <Card 
                key={category.category}
                className="border-[3px] border-foreground shadow-[5px_5px_0px_0px_hsl(var(--foreground))] bg-red-50"
              >
                <CardHeader>
                  <CardTitle className="text-2xl font-display text-destructive">{category.category}</CardTitle>
                  <CardDescription>
                    {category.questions.length} common {category.questions.length === 1 ? 'issue' : 'issues'} and solutions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {category.questions.map((faq, index) => (
                      <AccordionItem key={index} value={`troubleshoot-${index}`}>
                        <AccordionTrigger className="text-left font-medium hover:no-underline">
                          ⚠️ {faq.q}
                        </AccordionTrigger>
                        <AccordionContent className="text-foreground/90 leading-relaxed font-medium">
                          {faq.a}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            ))}
          </div>
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
