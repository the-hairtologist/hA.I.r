/**
 * Quick Add Client - Floating Action Button
 * For stylists to quickly add new clients
 */

import { useState } from "react";
import { Plus } from "lucide-react";
import { logger } from "@/lib/logging/productionLogger";
import { userJourney } from "@/lib/logging/userJourneyTracker";
import { trackInsert } from "@/lib/logging/supabaseTracker";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { FormFieldError } from "@/components/FormFieldError";

export function QuickAddClientFAB() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    notes: "",
  });
  const [errors, setErrors] = useState<{
    fullName?: string;
    email?: string;
  }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: { fullName?: string; email?: string } = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Name is required";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email address";
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setErrors({});

    setLoading(true);

    try {
      // Get stylist profile
      const { data: stylistProfile } = await supabase
        .from("stylist_profiles")
        .select("id")
        .eq("user_id", user?.id)
        .maybeSingle();

      if (!stylistProfile) {
        throw new Error("Stylist profile not found");
      }

      // Create client profile
      const result = await trackInsert(
        async () => {
          return await supabase
            .from("client_profiles")
            .insert({
              full_name: formData.fullName,
              email: formData.email,
              phone: formData.phone || null,
              notes: formData.notes || null,
              preferred_stylist_id: stylistProfile.id,
            })
            .select()
            .maybeSingle();
        },
        'client_profiles',
        'QuickAddClientFAB'
      );

      const { data: newClient, error } = result;

      if (error) throw error;

      toast.success("Client added successfully! 🎉");
      userJourney.trackAction('Quick added new client', { clientName: formData.fullName });
      setOpen(false);
      setFormData({ fullName: "", email: "", phone: "", notes: "" });
      setErrors({});
      
      // Optional: Navigate to client profile
      // navigate(`/clients/${newClient.id}`);
    } catch (error: any) {
      logger.error("Error adding client", error, { context: 'QuickAddClientFAB' });
      userJourney.trackError(error);
      toast.error(error.message || "Failed to add client");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <Button
        onClick={() => setOpen(true)}
        size="lg"
        className={cn(
          "fixed bottom-20 right-6 z-[45] h-14 w-14 rounded-full shadow-lg",
          "lg:bottom-6 lg:right-6",
          "bg-gradient-to-br from-emerald-500 to-green-600",
          "hover:from-emerald-600 hover:to-green-700",
          "transition-all duration-200 hover:scale-110 active:scale-95",
          "group touch-manipulation"
        )}
        aria-label="Quick add client"
      >
        <Plus className="h-7 w-7 transition-transform group-hover:rotate-90" />
      </Button>

      {/* Quick Add Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Quick Add Client</DialogTitle>
            <DialogDescription>
              Add a new client to your roster. You can add more details later from their profile.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => {
                  setFormData({ ...formData, fullName: e.target.value });
                  setErrors(prev => ({ ...prev, fullName: undefined }));
                }}
                placeholder="Jane Smith"
                required
                aria-invalid={!!errors.fullName}
              />
              {errors.fullName && <FormFieldError message={errors.fullName} />}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  setErrors(prev => ({ ...prev, email: undefined }));
                }}
                placeholder="jane@example.com"
                required
                aria-invalid={!!errors.email}
              />
              {errors.email && <FormFieldError message={errors.email} />}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone (Optional)</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(555) 123-4567"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Quick Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Allergies, preferences, or important info..."
                rows={3}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-br from-emerald-500 to-green-600"
                disabled={loading}
              >
                {loading ? "Adding..." : "Add Client"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
