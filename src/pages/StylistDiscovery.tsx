import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Scissors } from "lucide-react";

export default function StylistDiscovery() {
  const navigate = useNavigate();

  // Feature coming soon - redirect stylists, show message for clients
  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="Find Your Stylist"
        icon={<Scissors className="h-6 w-6" />}
        backTo="/dashboard"
      />

      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <Card className="border-2 border-foreground shadow-brutal text-center">
          <CardHeader>
            <CardTitle className="text-3xl font-display flex items-center justify-center gap-2">
              <Scissors className="h-8 w-8 text-primary" />
              Coming Soon!
            </CardTitle>
            <CardDescription className="text-lg mt-4">
              We're building an amazing client experience
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-primary/10 border-2 border-primary rounded-lg p-6 space-y-4">
              <p className="text-base font-medium">
                🚀 Client Features in Development:
              </p>
              <ul className="text-sm text-left space-y-3">
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">✓</span>
                  <span>Browse and search stylists in your area</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">✓</span>
                  <span>Book appointments directly online</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">✓</span>
                  <span>View your complete hair history timeline</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">✓</span>
                  <span>Post hair requests and get matched with stylists</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">✓</span>
                  <span>Track your hair care journey and formulas</span>
                </li>
              </ul>
            </div>

            <div className="text-sm text-muted-foreground space-y-2">
              <p className="font-medium">Currently Available:</p>
              <p>
                hA.I.r is currently available for professional hair stylists only. 
                Client features are being carefully crafted and will be launching soon!
              </p>
            </div>

            <Button
              onClick={() => navigate("/dashboard")}
              className="w-full"
              size="lg"
            >
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
