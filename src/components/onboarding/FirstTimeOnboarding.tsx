/**
 * First-Time User Onboarding
 * Guides new stylists through essential setup steps
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Calendar, Scissors, Users, CheckCircle2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  route: string;
  completed?: boolean;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: "schedule",
    title: "Set Your Working Hours",
    description: "Let clients know when you're available for appointments",
    icon: Calendar,
    route: "/schedule",
  },
  {
    id: "services",
    title: "Add Your Services",
    description: "Define what services you offer and your pricing",
    icon: Scissors,
    route: "/services",
  },
  {
    id: "clients",
    title: "Invite Your First Client",
    description: "Start building your clientele and managing appointments",
    icon: Users,
    route: "/clients",
  },
];

export function FirstTimeOnboarding() {
  // Disabled: Onboarding now opt-in only to prevent blocking dashboard access
  useEffect(() => {
    // Mark as completed immediately to prevent any future auto-starts
    localStorage.setItem("onboarding_completed", "true");
  }, []);

  // Return null - component is now a no-op
  return null;
}
