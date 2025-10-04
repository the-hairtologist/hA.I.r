import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format, setHours, setMinutes } from "date-fns";
import { Loader2 } from "lucide-react";

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

  useEffect(() => {
    if (open) {
      loadClientsAndServices();
    }
  }, [open]);

  const loadClientsAndServices = async () => {
    try {
      // Load clients
      const { data: clientsData } = await supabase
        .from("client_profiles")
        .select("id, full_name, user:profiles(full_name)")
        .eq("preferred_stylist_id", stylistId)
        .order("full_name");

      setClients(clientsData || []);

      // Load services
      const { data: servicesData } = await supabase
        .from("stylist_services")
        .select("*")
        .eq("stylist_id", stylistId)
        .eq("is_active", true)
        .order("service_name");

      setServices(servicesData || []);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load clients and services");
    }
  };

  const handleSubmit = async () => {
    if (!selectedClient || !selectedService) {
      toast.error("Please select a client and service");
      return;
    }

    setLoading(true);
    try {
      const selectedServiceData = services.find(s => s.id === selectedService);
      const appointmentDate = setMinutes(setHours(selectedDate, selectedHour), selectedMinute);

      const { error } = await supabase
        .from("appointments")
        .insert({
          client_id: selectedClient,
          stylist_id: stylistId,
          service_id: selectedService,
          service_type: selectedServiceData?.service_name,
          appointment_date: appointmentDate.toISOString(),
          duration_minutes: selectedServiceData?.duration_minutes || 90,
          status: "scheduled",
          notes: notes || null,
        });

      if (error) throw error;

      toast.success("Appointment created successfully!");
      onOpenChange(false);
      onSuccess?.();
      
      // Reset form
      setSelectedClient("");
      setSelectedService("");
      setNotes("");
    } catch (error: any) {
      console.error("Error creating appointment:", error);
      toast.error("Failed to create appointment");
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
          <div className="space-y-2">
            <Label htmlFor="client">Client *</Label>
            <Select value={selectedClient} onValueChange={setSelectedClient}>
              <SelectTrigger id="client">
                <SelectValue placeholder="Select a client" />
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
            <Select value={selectedService} onValueChange={setSelectedService}>
              <SelectTrigger id="service">
                <SelectValue placeholder="Select a service" />
              </SelectTrigger>
              <SelectContent>
                {services.map((service) => (
                  <SelectItem key={service.id} value={service.id}>
                    {service.service_name} ({service.duration_minutes} min)
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
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Appointment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
