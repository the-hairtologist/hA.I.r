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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { UserPlus, Loader2 } from "lucide-react";
import { z } from "zod";

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
    .max(255, "Email must be less than 255 characters"),
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
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetForm = () => {
    setFullName("");
    setEmail("");
    setPhone("");
    setNotes("");
    setErrors({});
  };

  const handleSubmit = async () => {
    try {
      // Validate input
      const validatedData = clientSchema.parse({
        full_name: fullName,
        email: email,
        phone: phone,
        notes: notes,
      });

      setErrors({});
      setLoading(true);

      // Check if email already exists
      const { data: existingClient } = await supabase
        .from("client_profiles")
        .select("id, user:profiles(full_name)")
        .eq("email", validatedData.email)
        .single();

      if (existingClient) {
        toast.error("Email already exists", {
          description: `This email is already registered for ${existingClient.user?.full_name || "another client"}`,
        });
        return;
      }

      // Create the client profile
      const { data: newClient, error } = await supabase
        .from("client_profiles")
        .insert({
          full_name: validatedData.full_name,
          email: validatedData.email,
          phone: validatedData.phone || null,
          notes: validatedData.notes || null,
          preferred_stylist_id: stylistId,
        })
        .select()
        .single();

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
      <DialogContent className="max-w-lg">
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
              Email <span className="text-destructive">*</span>
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
            <Textarea
              id="notes"
              placeholder="Add any special notes about this client..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              maxLength={500}
              className={errors.notes ? "border-destructive" : ""}
            />
            {errors.notes && (
              <p className="text-xs text-destructive">{errors.notes}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {notes.length}/500
            </p>
          </div>

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
              disabled={loading || !fullName.trim() || !email.trim()}
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
