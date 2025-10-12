import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Calendar, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

const BookAppointment = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10">
      <PageHeader
        title="Book Appointment"
        icon={<Calendar className="h-6 w-6" />}
        backTo="/dashboard"
      />

      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <Card className="border-[3px] border-primary shadow-[8px_8px_0px_0px_hsl(var(--primary))] bg-gradient-to-br from-blue-400 to-cyan-400">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-20 h-20 rounded-full bg-background border-[3px] border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))] flex items-center justify-center mb-4">
              <Sparkles className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-3xl font-display text-foreground">
              Booking Coming Soon!
            </CardTitle>
            <CardDescription className="text-foreground/80 text-lg font-medium pt-2">
              We're building a seamless booking experience for you
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="bg-background/90 rounded-xl p-6 border-[3px] border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))]">
              <h3 className="text-xl font-display font-bold mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                What's Coming
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">1</span>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Browse Available Stylists</p>
                    <p className="text-sm text-muted-foreground">See profiles, portfolios, and availability</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">2</span>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Instant Booking</p>
                    <p className="text-sm text-muted-foreground">Book appointments with just a few clicks</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">3</span>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Smart Reminders</p>
                    <p className="text-sm text-muted-foreground">Get notifications for upcoming appointments</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="text-center space-y-4 pt-2">
              <p className="text-sm text-foreground/70 font-medium">
                In the meantime, ask your stylist to send you an appointment invite!
              </p>
              <Button 
                onClick={() => navigate("/dashboard")}
                className="gap-2"
              >
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default BookAppointment;
