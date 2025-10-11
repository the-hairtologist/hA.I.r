import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Sparkles, Clock } from "lucide-react";

interface ComingSoonProps {
  feature?: string;
}

const ComingSoon = ({ feature = "This feature" }: ComingSoonProps) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full border-primary/20 shadow-xl">
        <CardContent className="pt-12 pb-10 px-8">
          <div className="text-center space-y-6">
            {/* Icon */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center animate-pulse">
                  <Sparkles className="h-12 w-12 text-on-surface-primary" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                  <Clock className="h-5 w-5 text-on-surface-primary" />
                </div>
              </div>
            </div>

            {/* Heading */}
            <div className="space-y-2">
              <h1 className="text-4xl md:text-5xl font-display font-bold gradient-text">
                Coming Soon
              </h1>
              <p className="text-xl text-muted-foreground">
                {feature} is on its way!
              </p>
            </div>

            {/* Description */}
            <div className="space-y-4 max-w-lg mx-auto">
              <p className="text-muted-foreground">
                We're working hard to bring you amazing client-facing features. This includes:
              </p>
              <ul className="text-left space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Sparkles className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Easy online booking for your clients</span>
                </li>
                <li className="flex items-start gap-2">
                  <Sparkles className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Client request board to find new customers</span>
                </li>
                <li className="flex items-start gap-2">
                  <Sparkles className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Seamless payment processing</span>
                </li>
                <li className="flex items-start gap-2">
                  <Sparkles className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Automated appointment reminders</span>
                </li>
              </ul>
              <p className="text-sm text-muted-foreground pt-2">
                Stay tuned for updates! In the meantime, explore all the powerful tools available for managing your salon business.
              </p>
            </div>

            {/* CTA */}
            <div className="pt-4">
              <Button 
                onClick={() => navigate("/dashboard")} 
                size="lg"
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComingSoon;
