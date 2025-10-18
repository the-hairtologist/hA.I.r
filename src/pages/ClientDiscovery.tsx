import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Search, TrendingUp, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";

const ClientDiscovery = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { roles } = useUserRole(user?.id);
  const isClient = roles.includes('client');
  const isStylist = roles.includes('stylist');

  // Determine role-specific content
  const pageTitle = isClient ? "Find Stylists" : "Find New Clients";
  const comingSoonTitle = isClient 
    ? "Stylist Discovery Coming Soon!" 
    : "Client Discovery Coming Soon!";
  const comingSoonDescription = isClient
    ? "We're building a powerful directory to help you find the perfect stylist for your hair needs"
    : "We're building a powerful marketplace to connect you with clients looking for your expertise";

  return (
    <div className="min-h-screen-safe bg-gradient-to-br from-primary/10 via-background to-accent/10">
      <PageHeader
        title={pageTitle}
        icon={<Search className="h-6 w-6" />}
        backTo="/dashboard"
      />

      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <Card className="border-[3px] border-primary shadow-[8px_8px_0px_0px_hsl(var(--primary))] bg-gradient-to-br from-purple-400 to-pink-400">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-20 h-20 rounded-full bg-background border-[3px] border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))] flex items-center justify-center mb-4">
              <Sparkles className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-3xl font-pixel text-foreground">
              {comingSoonTitle}
            </CardTitle>
            <CardDescription className="font-sans text-foreground/80 text-lg font-medium pt-2">
              {comingSoonDescription}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="bg-background/90 rounded-xl p-6 border-[3px] border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))]">
              <h3 className="text-xl font-pixel mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                What's Coming
              </h3>
              {isClient ? (
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-primary">1</span>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Stylist Directory</p>
                      <p className="text-sm text-muted-foreground">Browse stylists' portfolios, specialties, and availability</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-primary">2</span>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Smart Matching</p>
                      <p className="text-sm text-muted-foreground">AI recommends stylists based on your hair type, goals, and location</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-primary">3</span>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Direct Booking</p>
                      <p className="text-sm text-muted-foreground">Book appointments directly with your chosen stylist</p>
                    </div>
                  </li>
                </ul>
              ) : (
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-primary">1</span>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Client Discovery Feed</p>
                      <p className="text-sm text-muted-foreground">Browse clients posting their hair goals, photos, and budget</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-primary">2</span>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Smart Matching</p>
                      <p className="text-sm text-muted-foreground">AI recommends clients based on your specialty and location</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-primary">3</span>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Direct Booking</p>
                      <p className="text-sm text-muted-foreground">Connect with interested clients and book appointments instantly</p>
                    </div>
                  </li>
                </ul>
              )}
            </div>

            <div className="text-center space-y-4 pt-2">
              <p className="text-sm text-foreground/70 font-medium">
                {isClient 
                  ? "In the meantime, explore our knowledge base and prepare for your perfect hair transformation!"
                  : "In the meantime, focus on your existing clients and build your portfolio!"}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {isStylist && (
                  <Button 
                    onClick={() => navigate("/clients")}
                    className="gap-2"
                  >
                    <Calendar className="h-4 w-4" />
                    Manage Clients
                  </Button>
                )}
                <Button 
                  onClick={() => navigate("/dashboard")}
                  variant="outline"
                  className="gap-2"
                >
                  Back to Dashboard
                </Button>
                <Button 
                  onClick={() => navigate("/portfolio")}
                  variant="outline"
                  className="gap-2 border-[3px] border-foreground"
                >
                  Build Portfolio
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ClientDiscovery;
