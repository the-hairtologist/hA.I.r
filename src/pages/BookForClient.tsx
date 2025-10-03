import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { ArrowLeft, Calendar as CalendarIcon, Clock, Loader2, UserPlus, User } from "lucide-react";
import { format, setHours, setMinutes, addHours } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const BookForClient = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [stylistProfile, setStylistProfile] = useState<any>(null);
  const [blockedDates, setBlockedDates] = useState<Date[]>([]);
  const [scheduleOverrides, setScheduleOverrides] = useState<any[]>([]);

  // Form state
  const [clientMode, setClientMode] = useState<"existing" | "new">("existing");
  const [selectedClient, setSelectedClient] = useState("");
  const [newClientName, setNewClientName] = useState("");
  const [newClientEmail, setNewClientEmail] = useState("");
  const [newClientPhone, setNewClientPhone] = useState("");
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState("");
  const [notes, setNotes] = useState("");
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    updateAvailableTimeSlots();
  }, [selectedDate, stylistProfile]);

  const loadData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      // Get stylist profile
      const { data: stylist } = await supabase
        .from("stylist_profiles")
        .select("*")
        .eq("user_id", session.user.id)
        .single();

      if (!stylist) {
        toast.error("Stylist profile not found");
        navigate("/dashboard");
        return;
      }

      setStylistProfile(stylist);

      // Load clients
      const { data: clientsData } = await supabase
        .from("client_profiles")
        .select(`
          *,
          user:profiles(full_name, email)
        `)
        .eq("preferred_stylist_id", stylist.id);

      setClients(clientsData || []);

      // Load services
      const { data: servicesData } = await supabase
        .from("stylist_services")
        .select("*")
        .eq("stylist_id", stylist.id)
        .eq("is_active", true)
        .order("price");

      setServices(servicesData || []);

      // Load blocked dates
      const { data: blockedData } = await supabase
        .from("stylist_blocked_dates")
        .select("blocked_date")
        .eq("stylist_id", stylist.id);

      const dates = (blockedData || []).map(d => new Date(d.blocked_date));
      setBlockedDates(dates);

      // Load schedule overrides
      const { data: overridesData } = await supabase
        .from("stylist_schedule_overrides")
        .select("*")
        .eq("stylist_id", stylist.id);

      setScheduleOverrides(overridesData || []);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Error loading data");
    } finally {
      setLoading(false);
    }
  };

  const getEffectiveSchedule = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    
    // Check for override
    const override = scheduleOverrides.find(o => 
      dateStr >= o.start_date && dateStr <= o.end_date
    );
    
    if (override) {
      return override.weekly_schedule;
    }
    
    // Return default schedule
    return stylistProfile?.weekly_schedule;
  };

  const generateTimeSlots = (startTime: string, endTime: string): string[] => {
    const slots: string[] = [];
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    
    let currentHour = startHour;
    let currentMin = startMin;
    
    while (currentHour < endHour || (currentHour === endHour && currentMin < endMin)) {
      const period = currentHour >= 12 ? 'PM' : 'AM';
      const displayHour = currentHour === 0 ? 12 : currentHour > 12 ? currentHour - 12 : currentHour;
      const displayMin = currentMin === 0 ? '00' : currentMin;
      slots.push(`${displayHour}:${displayMin} ${period}`);
      
      currentMin += 30;
      if (currentMin >= 60) {
        currentMin = 0;
        currentHour += 1;
      }
    }
    
    return slots;
  };

  const updateAvailableTimeSlots = () => {
    if (!selectedDate) {
      setAvailableTimeSlots([]);
      return;
    }

    const effectiveSchedule = getEffectiveSchedule(selectedDate);
    if (!effectiveSchedule) {
      setAvailableTimeSlots([]);
      return;
    }

    const dayOfWeek = format(selectedDate, 'EEEE').toLowerCase();
    const daySchedule = effectiveSchedule[dayOfWeek];

    if (!daySchedule || !daySchedule.enabled) {
      setAvailableTimeSlots([]);
      setSelectedTime("");
      return;
    }

    const slots = generateTimeSlots(daySchedule.startTime, daySchedule.endTime);
    setAvailableTimeSlots(slots);
    
    if (selectedTime && !slots.includes(selectedTime)) {
      setSelectedTime("");
    }
  };

  const handleSubmit = async () => {
    let clientId = selectedClient;

    // If creating new client, validate and create
    if (clientMode === "new") {
      if (!newClientName.trim()) {
        toast.error("Please enter client name");
        return;
      }

      try {
        // Create new client profile
        const { data: newClient, error: clientError } = await supabase
          .from("client_profiles")
          .insert({
            preferred_stylist_id: stylistProfile.id,
            full_name: newClientName,
            email: newClientEmail || null,
            phone: newClientPhone || null,
          })
          .select()
          .single();

        if (clientError) throw clientError;
        clientId = newClient.id;
      } catch (error) {
        console.error("Error creating client:", error);
        toast.error("Error creating client profile");
        setSubmitting(false);
        return;
      }
    } else if (!selectedClient) {
      toast.error("Please select a client");
      return;
    }

    if (!selectedService) {
      toast.error("Please select a service");
      return;
    }

    if (!selectedDate) {
      toast.error("Please select a date");
      return;
    }

    if (!selectedTime) {
      toast.error("Please select a time");
      return;
    }

    setSubmitting(true);
    try {
      // Check if date is blocked
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const { data: blocked } = await supabase
        .from("stylist_blocked_dates")
        .select("id")
        .eq("stylist_id", stylistProfile.id)
        .eq("blocked_date", dateStr)
        .maybeSingle();

      if (blocked) {
        toast.error("This date is blocked");
        setSubmitting(false);
        return;
      }

      // Convert time to date
      const [time, period] = selectedTime.split(" ");
      const [hours, minutes] = time.split(":").map(Number);
      const adjustedHours = period === "PM" && hours !== 12 ? hours + 12 : hours === 12 && period === "AM" ? 0 : hours;
      
      const appointmentDate = setMinutes(setHours(selectedDate, adjustedHours), minutes);
      const appointmentEndDate = addHours(appointmentDate, selectedService.duration_minutes / 60);

      // Check for conflicts
      const { data: conflicts } = await supabase
        .from("appointments")
        .select("id")
        .eq("stylist_id", stylistProfile.id)
        .neq("status", "cancelled")
        .gte("appointment_date", appointmentDate.toISOString())
        .lte("appointment_date", appointmentEndDate.toISOString());

      if (conflicts && conflicts.length > 0) {
        toast.error("Time slot already booked");
        setSubmitting(false);
        return;
      }

      // Create appointment
      const { error } = await supabase
        .from("appointments")
        .insert({
          stylist_id: stylistProfile.id,
          client_id: clientId,
          appointment_date: appointmentDate.toISOString(),
          service_type: selectedService.service_name,
          service_id: selectedService.id,
          duration_minutes: selectedService.duration_minutes,
          notes,
          status: "confirmed", // Auto-confirm since stylist is booking
        });

      if (error) throw error;

      toast.success("Appointment booked successfully!");
      navigate("/appointments");
    } catch (error) {
      console.error("Error booking appointment:", error);
      toast.error("Error booking appointment");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-red-400">
      <header className="border-b-4 border-foreground bg-white/90 backdrop-blur-sm sticky top-0 z-10 shadow-[0_4px_0px_0px_hsl(var(--foreground))]">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="border-2 border-foreground">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2">
              <UserPlus className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold font-display">Book for Client</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="border-[3px] border-foreground shadow-[5px_5px_0px_0px_hsl(var(--foreground))] bg-white">
          <CardHeader>
            <CardTitle>Manual Booking</CardTitle>
            <CardDescription>Create an appointment for walk-ins or phone bookings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Client Selection */}
            <div className="space-y-2">
              <Label>Client *</Label>
              <Tabs value={clientMode} onValueChange={(v) => setClientMode(v as "existing" | "new")}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="existing">Existing Client</TabsTrigger>
                  <TabsTrigger value="new">New Client</TabsTrigger>
                </TabsList>
                
                <TabsContent value="existing" className="space-y-2 mt-4">
                  {clients.length === 0 ? (
                    <div className="p-4 text-center bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground mb-2">No clients found</p>
                      <Button size="sm" onClick={() => navigate("/clients")}>
                        Add Client First
                      </Button>
                    </div>
                  ) : (
                    <Select value={selectedClient} onValueChange={setSelectedClient}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a client" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover z-50">
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.full_name || client.user?.full_name || client.email || "Unnamed Client"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </TabsContent>

                <TabsContent value="new" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="newClientName">Full Name *</Label>
                    <Input
                      id="newClientName"
                      placeholder="Client's full name"
                      value={newClientName}
                      onChange={(e) => setNewClientName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newClientEmail">Email (Optional)</Label>
                    <Input
                      id="newClientEmail"
                      type="email"
                      placeholder="client@example.com"
                      value={newClientEmail}
                      onChange={(e) => setNewClientEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newClientPhone">Phone (Optional)</Label>
                    <Input
                      id="newClientPhone"
                      type="tel"
                      placeholder="(555) 123-4567"
                      value={newClientPhone}
                      onChange={(e) => setNewClientPhone(e.target.value)}
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Service Selection */}
            <div className="space-y-2">
              <Label>Select Service *</Label>
              {services.length === 0 ? (
                <div className="p-4 text-center bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">No services available</p>
                  <Button size="sm" onClick={() => navigate("/services")}>
                    Add Service First
                  </Button>
                </div>
              ) : (
                <Select 
                  value={selectedService?.id} 
                  onValueChange={(value) => {
                    const service = services.find(s => s.id === value);
                    setSelectedService(service);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a service" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    {services.map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        <div className="flex flex-col">
                          <span>{service.service_name}</span>
                          <span className="text-xs text-muted-foreground">
                            ${service.price} • {service.duration_minutes} min
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Date Selection */}
            <div className="space-y-2">
              <Label>Select Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-popover z-50" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => {
                      const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
                      const isBlocked = blockedDates.some(
                        blocked => format(blocked, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
                      );
                      return isPast || isBlocked;
                    }}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Time Selection */}
            <div className="space-y-2">
              <Label>Select Time *</Label>
              {!selectedDate ? (
                <div className="p-4 bg-muted/50 rounded-md text-sm text-muted-foreground">
                  ⬆️ Select a date first
                </div>
              ) : availableTimeSlots.length === 0 ? (
                <div className="p-4 bg-muted/50 rounded-md text-sm text-muted-foreground">
                  No available times on this day
                </div>
              ) : (
                <Select value={selectedTime} onValueChange={setSelectedTime}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a time" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover z-50 max-h-[300px]">
                    {availableTimeSlots.map((slot) => (
                      <SelectItem key={slot} value={slot}>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {slot}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label>Notes (Optional)</Label>
              <Textarea
                placeholder="Add any notes about the appointment..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            {/* Submit Button */}
            <Button 
              onClick={handleSubmit} 
              disabled={
                submitting || 
                (clientMode === "existing" && !selectedClient) ||
                (clientMode === "new" && !newClientName.trim()) ||
                !selectedService || 
                !selectedDate || 
                !selectedTime
              }
              className="w-full"
              size="lg"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Booking...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Confirm Booking
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default BookForClient;
