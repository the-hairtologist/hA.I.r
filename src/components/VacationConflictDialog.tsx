import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { AlertCircle, Send, Calendar, Clock, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ConflictingAppointment {
  id: string;
  appointment_date: string;
  service_type: string;
  duration_minutes: number;
  client: {
    full_name: string;
    email: string;
    phone: string;
    user: {
      full_name: string;
      email: string;
    };
  };
}

interface VacationConflictDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conflictingAppointments: ConflictingAppointment[];
  blockedDates: Date[];
  onConfirm: () => void;
}

export function VacationConflictDialog({
  open,
  onOpenChange,
  conflictingAppointments,
  blockedDates,
  onConfirm,
}: VacationConflictDialogProps) {
  const [selectedAppointments, setSelectedAppointments] = useState<Set<string>>(
    new Set(conflictingAppointments.map(apt => apt.id))
  );
  const [customMessage, setCustomMessage] = useState(
    `I need to reschedule your appointment as I'll be unavailable during this time. Please contact me to find a new time that works for you.`
  );
  const [sending, setSending] = useState(false);

  const toggleAppointment = (id: string) => {
    const newSelected = new Set(selectedAppointments);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedAppointments(newSelected);
  };

  const handleNotifyClients = async () => {
    setSending(true);
    try {
      // Send SMS notifications to selected appointments
      const notificationPromises = Array.from(selectedAppointments).map(async (appointmentId) => {
        try {
          await supabase.functions.invoke('send-sms-notification', {
            body: {
              appointmentId,
              notificationType: 'reschedule',
              customMessage,
            },
          });
        } catch (error) {
          console.error(`Failed to send notification for appointment ${appointmentId}:`, error);
        }
      });

      await Promise.all(notificationPromises);

      toast.success(`Notifications sent to ${selectedAppointments.size} client(s)`);
      onConfirm();
      onOpenChange(false);
    } catch (error) {
      console.error("Error sending notifications:", error);
      toast.error("Some notifications failed to send");
    } finally {
      setSending(false);
    }
  };

  const handleBlockWithoutNotify = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] brutal-border brutal-shadow-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-warning" />
            <DialogTitle>Appointment Conflicts Detected</DialogTitle>
          </div>
          <DialogDescription>
            You have {conflictingAppointments.length} appointment(s) scheduled during{" "}
            {blockedDates && blockedDates.length > 0 ? (
              blockedDates.length === 1 
                ? format(blockedDates[0], "MMMM d, yyyy")
                : `${format(blockedDates[0], "MMM d")} - ${format(blockedDates[blockedDates.length - 1], "MMM d, yyyy")}`
            ) : "the selected dates"}. 
            Select which clients to notify about rescheduling.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[40vh] pr-4">
          <div className="space-y-3">
            {conflictingAppointments.map((appointment) => (
              <Card key={appointment.id} className="p-4">
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={selectedAppointments.has(appointment.id)}
                    onCheckedChange={() => toggleAppointment(appointment.id)}
                    className="mt-1"
                  />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {appointment.client.full_name || appointment.client.user?.full_name}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {appointment.client.email || appointment.client.user?.email}
                        </p>
                      </div>
                      <Badge variant="secondary">{appointment.service_type}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {format(new Date(appointment.appointment_date), "MMM d, yyyy 'at' h:mm a")}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {appointment.duration_minutes} min
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>

        <div className="space-y-2">
          <Label htmlFor="message">Custom Message (SMS)</Label>
          <Textarea
            id="message"
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            placeholder="Enter a message for affected clients..."
            rows={4}
            className="resize-none"
          />
          <p className="text-xs text-muted-foreground">
            This message will be sent via SMS to {selectedAppointments.size} selected client(s)
          </p>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleBlockWithoutNotify}
            disabled={sending}
          >
            Block Without Notifying
          </Button>
          <Button
            onClick={handleNotifyClients}
            disabled={selectedAppointments.size === 0 || sending}
            className="gap-2"
          >
            {sending ? (
              <>Sending Notifications...</>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Notify {selectedAppointments.size} Client(s) & Block
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
