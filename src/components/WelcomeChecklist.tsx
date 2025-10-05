import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Circle, Sparkles } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";

interface WelcomeChecklistProps {
  userRole: "stylist" | "client";
  profileComplete: boolean;
  hasClients?: boolean;
  hasAppointments?: boolean;
  hasPortfolio?: boolean;
}

export const WelcomeChecklist = ({ 
  userRole, 
  profileComplete,
  hasClients = false,
  hasAppointments = false,
  hasPortfolio = false
}: WelcomeChecklistProps) => {
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const isDismissed = localStorage.getItem('welcome_checklist_dismissed');
    if (isDismissed) setDismissed(true);
  }, []);

  const stylistSteps = [
    { 
      label: "Complete your profile", 
      completed: profileComplete, 
      action: () => navigate("/settings"),
      cta: "Complete Profile"
    },
    { 
      label: "Add your first service", 
      completed: false, // You'd check this from props
      action: () => navigate("/services"),
      cta: "Add Services"
    },
    { 
      label: "Upload portfolio photos", 
      completed: hasPortfolio, 
      action: () => navigate("/portfolio"),
      cta: "Add Photos"
    },
    { 
      label: "Add a client", 
      completed: hasClients, 
      action: () => navigate("/clients"),
      cta: "Add Client"
    },
  ];

  const clientSteps = [
    { 
      label: "Complete your profile", 
      completed: profileComplete, 
      action: () => navigate("/settings"),
      cta: "Complete Profile"
    },
    { 
      label: "Find your stylist", 
      completed: false,
      action: () => navigate("/stylists"),
      cta: "Browse Stylists"
    },
    { 
      label: "Book your first appointment", 
      completed: hasAppointments, 
      action: () => navigate("/stylists"),
      cta: "Book Now"
    },
  ];

  const steps = userRole === "stylist" ? stylistSteps : clientSteps;
  const completedCount = steps.filter(s => s.completed).length;
  const progress = (completedCount / steps.length) * 100;

  if (dismissed || progress === 100) return null;

  const handleDismiss = () => {
    localStorage.setItem('welcome_checklist_dismissed', 'true');
    setDismissed(true);
  };

  return (
    <Card className="border-[3px] border-primary shadow-[6px_6px_0px_0px_hsl(var(--primary))] bg-gradient-to-br from-primary/5 to-secondary/5 animate-fade-in">
      <CardHeader className="border-b-[2px] border-primary/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="font-display">Getting Started</CardTitle>
              <CardDescription>
                {completedCount} of {steps.length} steps complete
              </CardDescription>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleDismiss}
            className="text-muted-foreground hover:text-foreground"
          >
            Dismiss
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <Progress value={progress} className="mb-6" />
        <div className="space-y-3">
          {steps.map((step, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-lg border-2 border-border hover:border-primary/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                {step.completed ? (
                  <CheckCircle className="h-5 w-5 text-primary" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground" />
                )}
                <span className={step.completed ? "line-through text-muted-foreground" : "font-medium"}>
                  {step.label}
                </span>
              </div>
              {!step.completed && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={step.action}
                >
                  {step.cta}
                </Button>
              )}
            </div>
          ))}
        </div>
        {completedCount === steps.length && (
          <div className="mt-4 p-4 rounded-lg bg-primary/10 border-2 border-primary text-center">
            <p className="font-medium text-primary">🎉 You're all set! Start using hA.I.r to grow your business.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};