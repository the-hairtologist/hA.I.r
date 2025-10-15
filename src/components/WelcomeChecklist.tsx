import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Circle, Sparkles, CheckCircle2, X, Calendar, Users, MessageSquare, Image } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";

interface WelcomeChecklistProps {
  userRole: "stylist" | "client";
  profileComplete: boolean;
  hasClients?: boolean;
  hasAppointments?: boolean;
  hasPortfolio?: boolean;
}

interface ChecklistStep {
  label: string;
  completed: boolean;
  action?: () => void;
  cta: string;
  disabled?: boolean;
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
  ];

  const steps = userRole === "stylist" ? stylistSteps : clientSteps;
  const completedCount = steps.filter(s => s.completed).length;
  const progress = (completedCount / steps.length) * 100;

  const handleDismiss = () => {
    localStorage.setItem('welcome_checklist_dismissed', 'true');
    setDismissed(true);
  };

  if (dismissed) {
    return null;
  }

  // Show "What's Next" when checklist is complete
  if (progress === 100) {
    return (
      <Card className="border-[3px] border-success shadow-[5px_5px_0px_0px_hsl(var(--success))] bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-success" />
              <CardTitle className="text-success">You're All Set! 🎉</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>Your daily workflow as a stylist</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-card/50">
              <Calendar className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold">Check your schedule</p>
                <p className="text-sm text-muted-foreground">Review today's appointments and prepare for clients</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-card/50">
              <Users className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold">Document client visits</p>
                <p className="text-sm text-muted-foreground">Save formulas after each service for future reference</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-card/50">
              <MessageSquare className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold">Stay connected</p>
                <p className="text-sm text-muted-foreground">Respond to client messages and appointment requests</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-card/50">
              <Image className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold">Build your portfolio</p>
                <p className="text-sm text-muted-foreground">Upload photos of your best work to attract new clients</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="brutal-border border-primary brutal-shadow-md bg-gradient-to-br from-primary/5 to-secondary/5 animate-fade-in">
      <CardHeader className="brutal-border-b border-primary/20">
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
              className="flex items-center justify-between p-3 rounded-lg brutal-border hover:border-primary/30 transition-colors"
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
              {!step.completed && step.action && (
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
          <div className="mt-4 p-4 rounded-lg bg-primary/10 brutal-border border-primary text-center">
            <p className="font-medium text-primary">🎉 You're all set! Start using hA.I.r to grow your business.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};