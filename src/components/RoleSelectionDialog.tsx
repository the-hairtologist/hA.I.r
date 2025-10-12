import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Scissors, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface RoleSelectionDialogProps {
  open: boolean;
  onComplete: () => void;
}

export const RoleSelectionDialog = ({ open, onComplete }: RoleSelectionDialogProps) => {
  const [selectedRole, setSelectedRole] = useState<"stylist" | "client" | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!selectedRole) return;

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // Assign role
      const { error: roleError } = await supabase.rpc("assign_user_role", {
        _user_id: user.id,
        _role: selectedRole,
      });

      if (roleError) throw roleError;

      // Create appropriate profile
      if (selectedRole === "stylist") {
        const { error: profileError } = await supabase
          .from("stylist_profiles")
          .insert({
            user_id: user.id,
            business_name: "",
            is_available: true,
          });

        if (profileError && profileError.code !== "23505") {
          throw profileError;
        }
      } else {
        const { error: profileError } = await supabase
          .from("client_profiles")
          .insert({
            user_id: user.id,
            full_name: user.email?.split("@")[0] || "",
          });

        if (profileError && profileError.code !== "23505") {
          throw profileError;
        }
      }

      toast({
        title: "Welcome! 🎉",
        description: `Your ${selectedRole} account is ready!`,
      });

      onComplete();
    } catch (error: any) {
      console.error("Error assigning role:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to set up your account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-md" hideClose>
        <DialogHeader>
          <DialogTitle className="text-2xl font-display text-center">
            Welcome to hA.I.r! 👋
          </DialogTitle>
          <DialogDescription className="text-center">
            Let's get you set up. Are you a stylist or a client?
          </DialogDescription>
        </DialogHeader>

        <RadioGroup
          value={selectedRole || ""}
          onValueChange={(value) => setSelectedRole(value as "stylist" | "client")}
          className="space-y-4 py-6"
        >
          <Label
            htmlFor="stylist"
            className={`flex items-start gap-4 p-6 rounded-lg border-2 cursor-pointer transition-all hover:border-primary ${
              selectedRole === "stylist" ? "border-primary bg-primary/5" : "border-border"
            }`}
          >
            <RadioGroupItem value="stylist" id="stylist" className="mt-1" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Scissors className="h-5 w-5 text-primary" />
                <span className="font-semibold text-lg">I'm a Stylist</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Manage clients, track formulas, build your portfolio, and grow your business.
              </p>
            </div>
          </Label>

          <Label
            htmlFor="client"
            className={`flex items-start gap-4 p-6 rounded-lg border-2 cursor-pointer transition-all hover:border-primary ${
              selectedRole === "client" ? "border-primary bg-primary/5" : "border-border"
            }`}
          >
            <RadioGroupItem value="client" id="client" className="mt-1" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <User className="h-5 w-5 text-primary" />
                <span className="font-semibold text-lg">I'm a Client</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Find stylists, book appointments, and track your hair journey.
              </p>
            </div>
          </Label>
        </RadioGroup>

        <Button
          onClick={handleSubmit}
          disabled={!selectedRole || loading}
          className="w-full bg-primary hover:bg-primary/90"
          size="lg"
        >
          {loading ? "Setting up..." : "Continue"}
        </Button>
      </DialogContent>
    </Dialog>
  );
};
