import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { MessageSquare, Send, Loader2, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";

const TestSMS = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [appointmentId, setAppointmentId] = useState("");
  const [notificationType, setNotificationType] = useState<"confirmation" | "reminder" | "cancellation" | "reschedule">("confirmation");
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleTest = async () => {
    if (!appointmentId) {
      toast.error("Please enter an appointment ID");
      return;
    }

    setLoading(true);
    setTestResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('send-sms-notification', {
        body: {
          appointmentId,
          notificationType,
        },
      });

      if (error) throw error;

      setTestResult({
        success: true,
        message: `SMS sent successfully! Message SID: ${data?.messageSid || 'N/A'}`,
      });
      toast.success("SMS notification sent!");
    } catch (error: any) {
      console.error("Error sending SMS:", error);
      setTestResult({
        success: false,
        message: error.message || "Failed to send SMS",
      });
      toast.error("Failed to send SMS notification");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <header className="border-b-[3px] border-foreground bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate("/dashboard")}
              className="border-2 border-foreground bg-background hover:bg-primary hover:text-primary-foreground shadow-brutal"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <h1 className="text-2xl font-display font-bold">Test SMS</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-6 w-6" />
              Test SMS Notifications
            </CardTitle>
            <CardDescription>
              Test the Twilio SMS notification system for appointments
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Note:</strong> Make sure the appointment has a client with a valid phone number in their profile.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="appointmentId">Appointment ID</Label>
                <Input
                  id="appointmentId"
                  value={appointmentId}
                  onChange={(e) => setAppointmentId(e.target.value)}
                  placeholder="Enter appointment UUID"
                />
                <p className="text-xs text-muted-foreground">
                  You can find this in the appointments table
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notificationType">Notification Type</Label>
                <Select value={notificationType} onValueChange={(value: any) => setNotificationType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="confirmation">Confirmation</SelectItem>
                    <SelectItem value="reminder">Reminder</SelectItem>
                    <SelectItem value="cancellation">Cancellation</SelectItem>
                    <SelectItem value="reschedule">Reschedule</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleTest}
                disabled={loading || !appointmentId}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Test SMS
                  </>
                )}
              </Button>

              {testResult && (
                <Alert variant={testResult.success ? "default" : "destructive"}>
                  {testResult.success ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <AlertDescription>
                    <strong>{testResult.success ? "Success" : "Error"}:</strong> {testResult.message}
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2">Test Checklist:</h3>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>✓ Twilio credentials configured in secrets</li>
                <li>✓ TWILIO_PHONE_NUMBER set in secrets</li>
                <li>✓ Appointment exists in database</li>
                <li>✓ Client has valid phone number in profile</li>
                <li>✓ Edge function deployed and accessible</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default TestSMS;
