import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Mail, CheckCircle2, XCircle } from "lucide-react";

export default function Unsubscribe() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState("");
  const [preferences, setPreferences] = useState({
    rebooking: true,
    appointments: true,
    marketing: true,
  });

  useEffect(() => {
    if (!token) {
      toast({
        title: "Invalid Link",
        description: "This unsubscribe link is invalid or expired.",
        variant: "destructive",
      });
    }
  }, [token]);

  const handleUnsubscribe = async (type: string = 'all') => {
    if (!token) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('unsubscribe', {
        body: { token, emailType: type },
      });

      if (error) throw error;

      if (data && data.success) {
        setSuccess(true);
        setEmail(data.email);
        toast({
          title: "Successfully Unsubscribed",
          description: `${data.email} has been unsubscribed from ${type === 'all' ? 'all' : type} emails.`,
        });
      } else {
        throw new Error(data?.message || 'Failed to unsubscribe');
      }
    } catch (error: any) {
      console.error("Unsubscribe error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to unsubscribe. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-accent p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
              <XCircle className="w-6 h-6 text-destructive" />
            </div>
            <CardTitle>Invalid Link</CardTitle>
            <CardDescription>
              This unsubscribe link is invalid or has expired.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-accent p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-success/10 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-6 h-6 text-success" />
            </div>
            <CardTitle>Successfully Unsubscribed</CardTitle>
            <CardDescription>
              {email} will no longer receive the selected emails.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Changed your mind? Contact your stylist to update your preferences.
            </p>
            <Button
              onClick={() => navigate('/')}
              variant="outline"
            >
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-accent p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Mail className="w-6 h-6 text-primary" />
          </div>
          <CardTitle>Email Preferences</CardTitle>
          <CardDescription>
            Choose which emails you'd like to stop receiving
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-accent transition-colors">
              <Checkbox
                id="rebooking"
                checked={!preferences.rebooking}
                onCheckedChange={(checked) => 
                  setPreferences(p => ({ ...p, rebooking: !checked }))
                }
              />
              <label
                htmlFor="rebooking"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1 cursor-pointer"
              >
                Rebooking reminders
                <p className="text-xs text-muted-foreground mt-1">
                  Reminders when it's time for your next appointment
                </p>
              </label>
            </div>

            <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-accent transition-colors">
              <Checkbox
                id="appointments"
                checked={!preferences.appointments}
                onCheckedChange={(checked) => 
                  setPreferences(p => ({ ...p, appointments: !checked }))
                }
              />
              <label
                htmlFor="appointments"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1 cursor-pointer"
              >
                Appointment reminders
                <p className="text-xs text-muted-foreground mt-1">
                  Reminders about upcoming scheduled appointments
                </p>
              </label>
            </div>

            <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-accent transition-colors">
              <Checkbox
                id="marketing"
                checked={!preferences.marketing}
                onCheckedChange={(checked) => 
                  setPreferences(p => ({ ...p, marketing: !checked }))
                }
              />
              <label
                htmlFor="marketing"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1 cursor-pointer"
              >
                Marketing emails
                <p className="text-xs text-muted-foreground mt-1">
                  News, tips, and special offers
                </p>
              </label>
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-4">
            <Button
              onClick={() => {
                const types = [];
                if (!preferences.rebooking) types.push('rebooking');
                if (!preferences.appointments) types.push('appointments');
                if (!preferences.marketing) types.push('marketing');
                
                if (types.length === 0) {
                  toast({
                    title: "No Changes",
                    description: "Please select at least one email type to unsubscribe from.",
                  });
                  return;
                }
                
                handleUnsubscribe(types.length === 3 ? 'all' : types[0]);
              }}
              disabled={loading || (preferences.rebooking && preferences.appointments && preferences.marketing)}
            >
              {loading ? "Processing..." : "Update Preferences"}
            </Button>
            
            <Button
              onClick={() => handleUnsubscribe('all')}
              variant="outline"
              disabled={loading}
            >
              Unsubscribe from All
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground pt-2">
            We respect your privacy. You can always resubscribe by contacting your stylist.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}