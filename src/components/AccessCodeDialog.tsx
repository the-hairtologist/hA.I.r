import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Key } from "lucide-react";
import { sanitizeInput, detectSQLInjection } from "@/lib/security/inputSanitization";

interface AccessCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const AccessCodeDialog = ({ open, onOpenChange, onSuccess }: AccessCodeDialogProps) => {
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const retryRequest = async <T,>(
    requestFn: () => Promise<T>,
    maxRetries = 3
  ): Promise<T> => {
    for (let i = 0; i < maxRetries; i++) {
      try {
        const result = await requestFn();
        return result;
      } catch (error: any) {
        if (i === maxRetries - 1 || !error?.message?.includes('Load failed')) {
          throw error;
        }
        
        // Exponential backoff
        const delay = Math.min(1000 * Math.pow(2, i), 5000);
        console.warn(`Network error, retrying... (attempt ${i + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    throw new Error('Max retries exceeded');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code.trim()) {
      toast.error("Please enter an access code");
      return;
    }

    // Enhanced input validation for defense-in-depth
    const sanitizedCode = sanitizeInput(code, 'text');
    
    if (!sanitizedCode) {
      toast.error("Invalid access code format");
      return;
    }

    if (detectSQLInjection(sanitizedCode)) {
      console.warn("Potential SQL injection attempt detected in access code");
      toast.error("Invalid access code format");
      return;
    }

    // Validate code format (alphanumeric, hyphens, max 50 chars)
    if (!/^[A-Za-z0-9\-_]{4,50}$/.test(sanitizedCode)) {
      toast.error("Access code must be 4-50 characters (letters, numbers, hyphens)");
      return;
    }

    setIsSubmitting(true);

    try {
      const session = await retryRequest(async () => {
        const { data: { session } } = await supabase.auth.getSession();
        return session;
      });

      if (!session) {
        toast.error("Please sign in to redeem an access code");
        return;
      }

      const result = await retryRequest(async () => {
        const { data, error } = await supabase.rpc('redeem_access_code', {
          _code: sanitizedCode,
          _user_id: session.user.id
        });
        if (error) throw error;
        return data;
      });

      toast.success("Access code redeemed! You now have full access to all features.");
      setCode("");
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      console.error("Error redeeming access code:", error);
      toast.error(error.message || "Invalid or already used access code");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md brutal-border brutal-shadow-md">
        <DialogHeader>
          <div className="mx-auto mb-4 p-4 rounded-xl bg-primary/10 border-2 border-primary w-fit">
            <Key className="h-8 w-8 text-primary" />
          </div>
          <DialogTitle className="text-center">Enter Access Code</DialogTitle>
          <DialogDescription className="text-center">
            Have an access code? Enter it below to unlock full access to all stylist features.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="access-code">Access Code</Label>
            <Input
              id="access-code"
              placeholder="Enter your code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              disabled={isSubmitting}
              className="font-mono"
            />
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 sm:h-6 sm:w-6 animate-spin" />
                  Redeeming...
                </>
              ) : (
                "Redeem Code"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
