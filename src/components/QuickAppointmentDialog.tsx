import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format, setHours, setMinutes, addMinutes, parseISO } from "date-fns";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { triggerAppointmentBooked } from "@/lib/zapierTriggers";
import { FormFieldError } from "@/components/FormFieldError";
import { networkErrors } from "@/lib/errorMessages";
import { useFormSubmit } from "@/hooks/useFormSubmit";
import { StandardFormField } from "@/components/forms/StandardFormField";
import { z } from "zod";

interface QuickAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: Date;
  selectedHour: number;
  selectedMinute: number;
  stylistId: string;
  onSuccess?: () => void;
}

// Quick appointment schema (inline since it's specific to this dialog)
const quickAppointmentSchema = z.object({
  client_id: z.string().min(1, "Please select a client"),
  service_id: z.string().min(1, "Please select a service"),
  notes: z.string().max(500).optional(),
});

type QuickAppointmentInput = z.infer<typeof quickAppointmentSchema>;

export const QuickAppointmentDialog = ({
  open,
  onOpenChange,
  selectedDate,
  selectedHour,
  selectedMinute,
  stylistId,
  onSuccess
}: QuickAppointmentDialogProps) => {
  const [clients, setClients] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [hasConflict, setHasConflict] = useState(false);
  const [conflictMessage, setConflictMessage] = useState("");

  const {
    values,
    errors,
    touched,
    setFieldValue,
    setFieldTouched,
    handleSubmit: submitForm,
    isSubmitting,
    reset,
  } = useFormSubmit<QuickAppointmentInput>(
    async (data) => {
      const selectedServiceData = services.find(s => s.id === data.service_id);
      const selectedClientData = clients.find(c => c.id === data.client_id);
      
      if (!selectedServiceData) throw new Error("Service not found");

      const appointmentDate = setMinutes(setHours(selectedDate, selectedHour), selectedMinute);

      const { data: newAppointment, error } = await supabase
        .from("appointments")
        .insert({
          client_id: data.client_id,
          stylist_id: stylistId,
          service_id: data.service_id,
          service_type: selectedServiceData.service_name,
          appointment_date: appointmentDate.toISOString(),
          duration_minutes: selectedServiceData.duration_minutes || 90,
          status: "scheduled",
          notes: data.notes?.trim() || null,
        })
        .select()
        .maybeSingle();

      if (error) throw error;

      // Trigger Zapier webhook
      if (newAppointment) {
        try {
          await triggerAppointmentBooked(stylistId, {
            appointment_id: newAppointment.id,
            client_name: selectedClientData?.user?.full_name || selectedClientData?.full_name,
            service_type: selectedServiceData.service_name,
            appointment_date: appointmentDate.toISOString(),
            duration_minutes: selectedServiceData.duration_minutes,
            price: selectedServiceData.price,
          });
        } catch (zapierError) {
          console.error("Zapier webhook failed:", zapierError);
        }
      }

      // Send notifications (non-blocking)
      try {
        await supabase.functions.invoke('send-sms-notification', {
          body: { appointmentId: newAppointment.id, notificationType: 'confirmation' },
        });
      } catch { /* Ignore notification errors */ }

      try {
        await supabase.functions.invoke('send-appointment-confirmation', {
          body: { appointmentId: newAppointment.id },
        });
      } catch { /* Ignore notification errors */ }

      try {
        await supabase.functions.invoke('sync-calendar-event', {
          body: { appointment_id: newAppointment.id, action: 'create' },
        });
      } catch { /* Ignore notification errors */ }
    },
    {
      schema: quickAppointmentSchema,
      initialValues: {
        client_id: "",
        service_id: "",
        notes: "",
      },
      successMessage: "Appointment created successfully!",
      onSuccess: () => {
        reset();
        onOpenChange(false);
        onSuccess?.();
      },
    }
  );

  useEffect(() => {
    if (open) {
      loadClientsAndServices();
      reset();
      setHasConflict(false);
      setConflictMessage("");
    }
  }, [open]);

  const loadClientsAndServices = async () => {
    try {
      // Load clients
      const { data: clientsData, error: clientsError } = await supabase
        .from("client_profiles")
        .select("id, full_name, user:profiles(full_name)")
        .eq("preferred_stylist_id", stylistId)
        .order("full_name");

      if (clientsError) throw clientsError;
      setClients(clientsData || []);

      // Load services
      const { data: servicesData, error: servicesError } = await supabase
        .from("stylist_services")
        .select("*")
        .eq("stylist_id", stylistId)
        .eq("is_active", true)
        .order("service_name");

      if (servicesError) throw servicesError;
      setServices(servicesData || []);
    } catch (error) {
      console.error("Error loading data:", error);
      const errorConfig = networkErrors.loadFailed("clients and services");
      toast.error(errorConfig.title, {
        description: errorConfig.description,
      });
    }
  };

  // Check for appointment conflicts when service is selected
  useEffect(() => {
    if (values.service_id && open) {
      checkForConflicts();
    }
  }, [values.service_id, open]);

  const checkForConflicts = async () => {
    if (!values.service_id) return;

    try {
      const selectedServiceData = services.find(s => s.id === values.service_id);
      if (!selectedServiceData) return;

      const appointmentStart = setMinutes(setHours(selectedDate, selectedHour), selectedMinute);
      const appointmentEnd = addMinutes(appointmentStart, selectedServiceData.duration_minutes);

      // Check for overlapping appointments
      const { data: existingAppointments, error } = await supabase
        .from("appointments")
        .select("*")
        .eq("stylist_id", stylistId)
        .neq("status", "cancelled")
        .gte("appointment_date", appointmentStart.toISOString())
        .lt("appointment_date", appointmentEnd.toISOString());

      if (error) throw error;

      if (existingAppointments && existingAppointments.length > 0) {
        setHasConflict(true);
        setConflictMessage(
          `This time slot conflicts with an existing appointment at ${format(
            parseISO(existingAppointments[0].appointment_date),
            "h:mm a"
          )}`
        );
      } else {
        setHasConflict(false);
        setConflictMessage("");
      }
    } catch (error) {
      console.error("Error checking conflicts:", error);
    }
  };

  const handleSubmit = async () => {
    if (hasConflict) {
      return; // Prevent submission if conflict detected
    }
    await submitForm();
  };

  const appointmentDateTime = setMinutes(setHours(selectedDate, selectedHour), selectedMinute);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] brutal-border brutal-shadow-md">
        <DialogHeader>
          <DialogTitle>Add Appointment</DialogTitle>
          <DialogDescription>
            {format(appointmentDateTime, "EEEE, MMMM d 'at' h:mm a")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {clients.length === 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No clients found. Please add clients to your list first.
              </AlertDescription>
            </Alert>
          )}

          {services.length === 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No services found. Please add services to your list first.
              </AlertDescription>
            </Alert>
          )}

          {hasConflict && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{conflictMessage}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="client">Client *</Label>
            <Select 
              value={values.client_id} 
              onValueChange={(value) => {
                setFieldValue('client_id', value);
                setFieldTouched('client_id');
              }} 
              disabled={clients.length === 0}
            >
              <SelectTrigger id="client">
                <SelectValue placeholder={clients.length === 0 ? "No clients available" : "Select a client"} />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.user?.full_name || client.full_name || "Unnamed Client"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {touched.client_id && errors.client_id && (
              <FormFieldError message={errors.client_id} />
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="service">Service *</Label>
            <Select 
              value={values.service_id} 
              onValueChange={(value) => {
                setFieldValue('service_id', value);
                setFieldTouched('service_id');
              }} 
              disabled={services.length === 0}
            >
              <SelectTrigger id="service">
                <SelectValue placeholder={services.length === 0 ? "No services available" : "Select a service"} />
              </SelectTrigger>
              <SelectContent>
                {services.map((service) => (
                  <SelectItem key={service.id} value={service.id}>
                    {service.service_name} ({service.duration_minutes} min - ${service.price})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {touched.service_id && errors.service_id && (
              <FormFieldError message={errors.service_id} />
            )}
          </div>

          <StandardFormField
            name="notes"
            label="Notes (Optional)"
            type="textarea"
            value={values.notes || ""}
            onChange={(val) => setFieldValue('notes', val)}
            onBlur={() => setFieldTouched('notes')}
            error={errors.notes}
            touched={touched.notes}
            placeholder="Add any special notes or requests..."
            rows={3}
            maxLength={500}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || hasConflict || clients.length === 0 || services.length === 0}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Appointment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};


