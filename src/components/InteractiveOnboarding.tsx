import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { Sparkles, User, Briefcase, Check } from "lucide-react";
import { useCelebration } from "@/hooks/useCelebration";

interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}

export const InteractiveOnboarding = () => {
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { celebrate } = useCelebration();

  // Form state
  const [profileData, setProfileData] = useState({
    fullName: "",
    phone: "",
    businessName: "",
    bio: "",
    specialty: "",
    location: "",
  });

  // Only stylist onboarding for now (client features coming soon)
  const steps: OnboardingStep[] = [
    {
      id: 0,
      title: "Welcome to hA.I.r! 🎉",
      description: "Let's get your profile set up in just 3 quick steps.",
      icon: <Sparkles className="h-8 w-8 text-primary" />,
    },
    {
      id: 1,
      title: "Your Basic Info",
      description: "Tell us a bit about yourself",
      icon: <User className="h-8 w-8 text-primary" />,
    },
    {
      id: 2,
      title: "Business Details",
      description: "Set up your professional profile",
      icon: <Briefcase className="h-8 w-8 text-primary" />,
    },
    {
      id: 3,
      title: "You're All Set! 🎊",
      description: "Ready to start managing your clients",
      icon: <Check className="h-8 w-8 text-primary" />,
    },
  ];

  // Check if user needs onboarding
  useEffect(() => {
    checkOnboardingStatus();
  }, [user]);

  const checkOnboardingStatus = async () => {
    if (!user) return;

    const { data: progress } = await supabase
      .from("onboarding_progress")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (!progress || !progress.is_completed) {
      setOpen(true);
    }
  };

  const handleNext = async () => {
    if (currentStep === steps.length - 1) {
      await completeOnboarding();
      return;
    }

    if (currentStep === 1) {
      await saveBasicInfo();
    } else if (currentStep === 2) {
      await saveStylistInfo();
    }

    setCurrentStep(currentStep + 1);
  };

  const saveBasicInfo = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: profileData.fullName,
          phone: profileData.phone,
        })
        .eq("id", user?.id);

      if (error) throw error;

      // Update onboarding progress
      await supabase
        .from("onboarding_progress")
        .upsert({
          user_id: user?.id,
          current_step: 1,
          completed_steps: [1],
        });
    } catch (error) {
      console.error("Error saving basic info:", error);
      toast({
        title: "Error",
        description: "Failed to save your information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveStylistInfo = async () => {
    setLoading(true);
    try {
      // Get stylist profile
      const { data: stylistProfile } = await supabase
        .from("stylist_profiles")
        .select("id")
        .eq("user_id", user?.id)
        .single();

      if (stylistProfile) {
        const { error } = await supabase
          .from("stylist_profiles")
          .update({
            business_name: profileData.businessName,
            bio: profileData.bio,
            specialty: profileData.specialty,
            location: profileData.location,
          })
          .eq("user_id", user?.id);

        if (error) throw error;
      }

      // Update onboarding progress
      await supabase
        .from("onboarding_progress")
        .upsert({
          user_id: user?.id,
          current_step: 2,
          completed_steps: [1, 2],
        });
    } catch (error) {
      console.error("Error saving stylist info:", error);
      toast({
        title: "Error",
        description: "Failed to save your business information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const completeOnboarding = async () => {
    setLoading(true);
    try {
      await supabase
        .from("onboarding_progress")
        .upsert({
          user_id: user?.id,
          current_step: steps.length - 1,
          completed_steps: steps.map((s) => s.id),
          is_completed: true,
          completed_at: new Date().toISOString(),
        });

      celebrate("milestone", "Welcome aboard! Let's get started! 🚀");
      setOpen(false);
      
      // Always navigate to dashboard (client features coming soon)
      navigate("/dashboard");
    } catch (error) {
      console.error("Error completing onboarding:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    const step = steps[currentStep];

    if (currentStep === 0 || currentStep === steps.length - 1) {
      return (
        <div className="text-center space-y-6 py-8">
          <div className="flex justify-center">{step.icon}</div>
          <div>
            <h3 className="text-2xl font-display font-bold mb-2">{step.title}</h3>
            <p className="text-muted-foreground">{step.description}</p>
          </div>
          {currentStep === steps.length - 1 && (
            <div className="bg-primary/10 border-2 border-primary rounded-lg p-6 space-y-3">
              <p className="font-medium">🎯 Quick Tips to Get Started:</p>
              <ul className="text-sm text-left space-y-2">
                <li>✓ Add your first client from the Clients page</li>
                <li>✓ Create your service menu</li>
                <li>✓ Schedule your first appointment</li>
              </ul>
            </div>
          )}
        </div>
      );
    }

    if (currentStep === 1) {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name *</Label>
            <Input
              id="fullName"
              value={profileData.fullName}
              onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
              placeholder="Enter your full name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={profileData.phone}
              onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
              placeholder="(555) 555-5555"
            />
          </div>
        </div>
      );
    }

    if (currentStep === 2) {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="businessName">Business Name *</Label>
            <Input
              id="businessName"
              value={profileData.businessName}
              onChange={(e) => setProfileData({ ...profileData, businessName: e.target.value })}
              placeholder="Your salon or business name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="specialty">Specialty</Label>
            <Input
              id="specialty"
              value={profileData.specialty}
              onChange={(e) => setProfileData({ ...profileData, specialty: e.target.value })}
              placeholder="e.g., Color specialist, Extensions, Cuts"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={profileData.location}
              onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
              placeholder="City, State"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={profileData.bio}
              onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
              placeholder="Tell clients about your experience and style..."
              rows={4}
            />
          </div>
        </div>
      );
    }

    return null;
  };

  const canProceed = () => {
    if (currentStep === 0 || currentStep === steps.length - 1) return true;
    if (currentStep === 1) return profileData.fullName.trim() !== "";
    if (currentStep === 2) return profileData.businessName.trim() !== "";
    return true;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-center">
            <div className="mb-4">
              <div className="flex justify-center gap-2 mb-4">
                {steps.map((step, index) => (
                  <div
                    key={step.id}
                    className={`h-2 flex-1 rounded-full transition-all ${
                      index <= currentStep ? "bg-primary" : "bg-muted"
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                Step {currentStep + 1} of {steps.length}
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        {renderStepContent()}

        <div className="flex gap-3 mt-6">
          {currentStep > 0 && currentStep < steps.length - 1 && (
            <Button
              variant="outline"
              onClick={() => setCurrentStep(currentStep - 1)}
              className="flex-1"
            >
              Back
            </Button>
          )}
          <Button
            onClick={handleNext}
            disabled={!canProceed() || loading}
            className="flex-1 bg-primary hover:bg-primary/90"
          >
            {loading ? "Saving..." : currentStep === steps.length - 1 ? "Get Started" : "Continue"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
