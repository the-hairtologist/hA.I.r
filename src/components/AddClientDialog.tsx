import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
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
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { UserPlus, Loader2 } from "lucide-react";
import { z } from "zod";
import { validatePhone } from "@/lib/phoneValidation";
import { TextareaWithCounter } from "@/components/ui/textarea-with-counter";
import { MedicalDisclaimer } from "@/components/MedicalDisclaimer";

interface AddClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stylistId: string;
  onClientAdded: (clientId: string) => void;
}

// Validation schema
const clientSchema = z.object({
  full_name: z.string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  email: z.string()
    .trim()
    .email("Invalid email address")
    .max(255, "Email must be less than 255 characters")
    .optional()
    .or(z.literal("")),
  phone: z.string()
    .trim()
    .max(20, "Phone must be less than 20 characters")
    .optional()
    .or(z.literal("")),
  notes: z.string()
    .trim()
    .max(500, "Notes must be less than 500 characters")
    .optional()
    .or(z.literal("")),
});

export const AddClientDialog = ({
  open,
  onOpenChange,
  stylistId,
  onClientAdded,
}: AddClientDialogProps) => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [allergies, setAllergies] = useState("");
  const [medicalConsent, setMedicalConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [phoneError, setPhoneError] = useState<string>();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetForm = () => {
    setFullName("");
    setEmail("");
    setPhone("");
    setNotes("");
    setAllergies("");
    setMedicalConsent(false);
    setErrors({});
  };

  const handleSubmit = async () => {
    try {
      // Validate phone if provided
      if (phone) {
        const phoneValidation = validatePhone(phone);
        if (!phoneValidation.valid) {
          setErrors({ phone: phoneValidation.error || "Invalid phone number" });
          toast.error("Invalid phone number", {
            description: phoneValidation.error,
          });
          return;
        }
      }

      // Validate input
      const validatedData = clientSchema.parse({
        full_name: fullName,
        email: email,
        phone: phone,
        notes: notes,
      });

      setErrors({});
      setLoading(true);

      // Check if email already exists (only if email provided)
      if (validatedData.email) {
        const { data: existingClient, error: checkError } = await supabase
          .from("client_profiles")
          .select("id, user:profiles(full_name)")
          .eq("email", validatedData.email)
          .maybeSingle();

        if (checkError) {
          console.error('Error checking email:', checkError);
        }

        if (existingClient) {
          toast.error("Email already exists", {
            description: `This email is already registered for ${existingClient.user?.full_name || "another client"}`,
          });
          return;
        }
      }

      // Create the client profile
      const { data: newClient, error } = await supabase
        .from("client_profiles")
        .insert({
          full_name: validatedData.full_name,
          email: validatedData.email,
          phone: validatedData.phone || null,
          notes: validatedData.notes || null,
          allergies: allergies || null,
          medical_info_consent: medicalConsent,
          preferred_stylist_id: stylistId,
        })
        .select()
        .maybeSingle();

      if (error) throw error;

      toast.success("Client added successfully! ✨", {
        description: `${validatedData.full_name} has been added to your clients`,
      });

      // Notify parent and close
      onClientAdded(newClient.id);
      resetForm();
      onOpenChange(false);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        // Handle validation errors
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
        toast.error("Please check the form for errors");
      } else {
        console.error("Error adding client:", error);
        toast.error("Failed to add client");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) {
        resetForm();
      }
      onOpenChange(isOpen);
    }}>
      <DialogContent className="max-w-lg brutal-border brutal-shadow-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            Add New Client
          </DialogTitle>
          <DialogDescription>
            Create a new client profile to save formulas for
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="fullName">
              Full Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="fullName"
              placeholder="e.g., Sarah Johnson"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              maxLength={100}
              className={errors.full_name ? "border-destructive" : ""}
            />
            {errors.full_name && (
              <p className="text-xs text-destructive">{errors.full_name}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">
              Email (Optional)
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="e.g., sarah@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              maxLength={255}
              className={errors.email ? "border-destructive" : ""}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email}</p>
            )}
            <p className="text-xs text-muted-foreground">
              You can add email later - useful for walk-ins or phone bookings
            </p>
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone">Phone (Optional)</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="e.g., (555) 123-4567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              maxLength={20}
              className={errors.phone ? "border-destructive" : ""}
            />
            {errors.phone && (
              <p className="text-xs text-destructive">{errors.phone}</p>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <TextareaWithCounter
              id="notes"
              placeholder="Add any special notes about this client..."
              value={notes}
              onValueChange={setNotes}
              maxLength={500}
              className="min-h-[80px]"
            />
            {errors.notes && (
              <p className="text-xs text-destructive">{errors.notes}</p>
            )}
          </div>

          {/* Medical Disclaimer */}
          <MedicalDisclaimer context="allergies" className="mb-4" />

          {/* Allergies */}
          <div className="space-y-2">
            <Label htmlFor="allergies">Allergies (Optional)</Label>
            <TextareaWithCounter
              id="allergies"
              placeholder="Any hair product allergies or sensitivities..."
              value={allergies}
              onValueChange={setAllergies}
              maxLength={500}
              className="min-h-[60px]"
            />
          </div>

          {/* Medical Consent */}
          {allergies.trim() && (
            <div className="flex items-start space-x-2 p-3 border rounded-lg bg-muted/50">
              <Checkbox
                id="medical-consent"
                checked={medicalConsent}
                onCheckedChange={(checked) => setMedicalConsent(checked as boolean)}
              />
              <div className="space-y-1">
                <Label 
                  htmlFor="medical-consent" 
                  className="text-sm font-normal cursor-pointer leading-none"
                >
                  I consent to sharing allergy information with my stylist
                </Label>
                <p className="text-xs text-muted-foreground">
                  This information will only be visible to your assigned stylist for safety purposes
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => {
                resetForm();
                onOpenChange(false);
              }}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading || !fullName.trim()}
              className="flex-1 gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  Add Client
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
