import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format, setHours, setMinutes, addMinutes, parseISO } from "date-fns";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface QuickAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: Date;
  selectedHour: number;
  selectedMinute: number;
  stylistId: string;
  onSuccess?: () => void;
}

export const QuickAppointmentDialog = ({
  open,
  onOpenChange,
  selectedDate,
  selectedHour,
  selectedMinute,
  stylistId,
  onSuccess
}: QuickAppointmentDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [notes, setNotes] = useState("");
  const [hasConflict, setHasConflict] = useState(false);
  const [conflictMessage, setConflictMessage] = useState("");

  useEffect(() => {
    if (open) {
      loadClientsAndServices();
      // Reset form when opening
      setSelectedClient("");
      setSelectedService("");
      setNotes("");
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
      toast.error("Failed to load clients and services");
    }
  };

  // Check for appointment conflicts when service is selected
  useEffect(() => {
    if (selectedService && open) {
      checkForConflicts();
    }
  }, [selectedService, open]);

  const checkForConflicts = async () => {
    if (!selectedService) return;

    try {
      const selectedServiceData = services.find(s => s.id === selectedService);
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
    if (!selectedClient) {
      toast.error("Please select a client");
      return;
    }

    if (!selectedService) {
      toast.error("Please select a service");
      return;
    }

    if (hasConflict) {
      toast.error("Cannot book - time slot conflicts with existing appointment");
      return;
    }

    setLoading(true);
    try {
      const selectedServiceData = services.find(s => s.id === selectedService);
      if (!selectedServiceData) {
        throw new Error("Service not found");
      }

      const appointmentDate = setMinutes(setHours(selectedDate, selectedHour), selectedMinute);

      const { error } = await supabase
        .from("appointments")
        .insert({
          client_id: selectedClient,
          stylist_id: stylistId,
          service_id: selectedService,
          service_type: selectedServiceData.service_name,
          appointment_date: appointmentDate.toISOString(),
          duration_minutes: selectedServiceData.duration_minutes || 90,
          status: "scheduled",
          notes: notes.trim() || null,
        });

      if (error) throw error;

      toast.success("Appointment created successfully!");
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      console.error("Error creating appointment:", error);
      toast.error(error.message || "Failed to create appointment");
    } finally {
      setLoading(false);
    }
  };

  const appointmentDateTime = setMinutes(setHours(selectedDate, selectedHour), selectedMinute);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
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
            <Select value={selectedClient} onValueChange={setSelectedClient} disabled={clients.length === 0}>
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="service">Service *</Label>
            <Select value={selectedService} onValueChange={setSelectedService} disabled={services.length === 0}>
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any special notes or requests..."
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground">{notes.length}/500 characters</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading || hasConflict || clients.length === 0 || services.length === 0}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Appointment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
