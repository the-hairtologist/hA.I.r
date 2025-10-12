import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Search, TrendingUp, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

const StylistDiscovery = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10">
      <PageHeader
        title="Find Stylists"
        icon={<Search className="h-6 w-6" />}
        backTo="/dashboard"
      />

      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <Card className="border-[3px] border-primary shadow-[8px_8px_0px_0px_hsl(var(--primary))] bg-gradient-to-br from-blue-400 to-cyan-400">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-20 h-20 rounded-full bg-background border-[3px] border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))] flex items-center justify-center mb-4">
              <Sparkles className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-3xl font-display text-foreground">
              Stylist Discovery Coming Soon!
            </CardTitle>
            <CardDescription className="text-foreground/80 text-lg font-medium pt-2">
              We're building a powerful directory to help you find the perfect stylist
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
                    <p className="font-semibold text-foreground">Browse Stylists by Specialty</p>
                    <p className="text-sm text-muted-foreground">Find experts in balayage, color correction, curly hair, and more</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">2</span>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">View Portfolios & Reviews</p>
                    <p className="text-sm text-muted-foreground">See real work, read reviews, and find stylists near you</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">3</span>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Book Instantly</p>
                    <p className="text-sm text-muted-foreground">Message stylists and book appointments with a few clicks</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="text-center space-y-4 pt-2">
              <p className="text-sm text-foreground/70 font-medium">
                In the meantime, ask your stylist to send you an invite!
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                  onClick={() => navigate("/appointments")}
                  className="gap-2"
                >
                  <Calendar className="h-4 w-4" />
                  View Appointments
                </Button>
                <Button 
                  onClick={() => navigate("/dashboard")}
                  variant="outline"
                  className="gap-2 border-[3px] border-foreground"
                >
                  Back to Dashboard
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default StylistDiscovery;
