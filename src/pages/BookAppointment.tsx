import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Calendar as CalendarIcon, ArrowLeft, Clock, Loader2, CheckCircle } from "lucide-react";
import { format, addHours, setHours, setMinutes, isAfter, isBefore, startOfDay } from "date-fns";
import { cn } from "@/lib/utils";

const BookAppointment = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stylists, setStylists] = useState<any[]>([]);
  const [clientProfile, setClientProfile] = useState<any>(null);
  const [selectedStylist, setSelectedStylist] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedService, setSelectedService] = useState<any>(null);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [stylistServices, setStylistServices] = useState<any[]>([]);
  const [blockedDates, setBlockedDates] = useState<Date[]>([]);

  // Generate time slots based on stylist availability
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
      
      // Increment by 30 minutes
      currentMin += 30;
      if (currentMin >= 60) {
        currentMin = 0;
        currentHour += 1;
      }
    }
    
    return slots;
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    updateAvailableTimeSlots();
  }, [selectedStylist, selectedDate, stylists]);

  useEffect(() => {
    if (selectedStylist) {
      loadStylistServices();
      loadBlockedDates();
    }
  }, [selectedStylist]);

  const loadData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      // Get client profile
      const { data: client } = await supabase
        .from("client_profiles")
        .select("*")
        .eq("user_id", session.user.id)
        .single();

      if (!client) {
        toast.error("Client profile not found");
        navigate("/dashboard");
        return;
      }

      setClientProfile(client);

      // Get available stylists with their schedules
      const { data: stylistsData } = await supabase
        .from("stylist_profiles")
        .select(`
          *,
          user:profiles(full_name, email)
        `)
        .eq("is_available", true);

      setStylists(stylistsData || []);

      // Pre-select preferred stylist
      if (client.preferred_stylist_id) {
        setSelectedStylist(client.preferred_stylist_id);
      }
    } catch (error: any) {
      console.error("Error loading data:", error);
      toast.error("Error loading stylists");
    } finally {
      setLoading(false);
    }
  };

  const loadStylistServices = async () => {
    try {
      const { data, error } = await supabase
        .from("stylist_services")
        .select("*")
        .eq("stylist_id", selectedStylist)
        .eq("is_active", true)
        .order("price");

      if (error) throw error;
      setStylistServices(data || []);
      
      // Reset selected service if stylist changes
      setSelectedService(null);
    } catch (error) {
      console.error("Error loading services:", error);
      toast.error("Failed to load services");
    }
  };

  const loadBlockedDates = async () => {
    try {
      const { data, error } = await supabase
        .from("stylist_blocked_dates")
        .select("blocked_date")
        .eq("stylist_id", selectedStylist);

      if (error) throw error;
      
      const dates = (data || []).map(d => new Date(d.blocked_date));
      setBlockedDates(dates);
    } catch (error) {
      console.error("Error loading blocked dates:", error);
    }
  };

  const updateAvailableTimeSlots = () => {
    if (!selectedStylist || !selectedDate) {
      setAvailableTimeSlots([]);
      return;
    }

    const stylist = stylists.find(s => s.id === selectedStylist);
    if (!stylist || !stylist.weekly_schedule) {
      setAvailableTimeSlots([]);
      return;
    }

    // Get day of week (lowercase)
    const dayOfWeek = format(selectedDate, 'EEEE').toLowerCase();
    const schedule = stylist.weekly_schedule as any;
    const daySchedule = schedule[dayOfWeek];

    if (!daySchedule || !daySchedule.enabled) {
      setAvailableTimeSlots([]);
      setSelectedTime("");
      return;
    }

    const slots = generateTimeSlots(daySchedule.startTime, daySchedule.endTime);
    setAvailableTimeSlots(slots);
    
    // Clear selected time if it's not in available slots
    if (selectedTime && !slots.includes(selectedTime)) {
      setSelectedTime("");
    }
  };

  const handleBookAppointment = async () => {
    // Comprehensive validation with specific error messages
    if (!selectedStylist) {
      toast.error("Please select a stylist");
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

    // Validate notes length
    if (notes.length > 500) {
      toast.error("Notes must be 500 characters or less");
      return;
    }

    setSubmitting(true);
    try {
      // Check if date is blocked
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const { data: blocked } = await supabase
        .from("stylist_blocked_dates")
        .select("id")
        .eq("stylist_id", selectedStylist)
        .eq("blocked_date", dateStr)
        .maybeSingle();

      if (blocked) {
        toast.error("This date is not available. Please choose another date.");
        setSubmitting(false);
        return;
      }

      // Convert selected time to date
      const [time, period] = selectedTime.split(" ");
      const [hours, minutes] = time.split(":").map(Number);
      const adjustedHours = period === "PM" && hours !== 12 ? hours + 12 : hours === 12 && period === "AM" ? 0 : hours;
      
      const appointmentDate = setMinutes(setHours(selectedDate, adjustedHours), minutes);
      const appointmentEndDate = addHours(appointmentDate, selectedService.duration_minutes / 60);

      // Check if appointment is in the past
      if (isBefore(appointmentDate, new Date())) {
        toast.error("Cannot book appointments in the past. Please select a future date and time.");
        setSubmitting(false);
        return;
      }

      // Check for scheduling conflicts
      const { data: conflicts, error: conflictError } = await supabase
        .from("appointments")
        .select("id, appointment_date, duration_minutes")
        .eq("stylist_id", selectedStylist)
        .neq("status", "cancelled")
        .gte("appointment_date", appointmentDate.toISOString())
        .lte("appointment_date", appointmentEndDate.toISOString());

      if (conflictError) throw conflictError;

      if (conflicts && conflicts.length > 0) {
        toast.error("This time slot is already booked. Please choose a different time.");
        setSubmitting(false);
        return;
      }

      const { data: newAppointment, error } = await supabase
        .from("appointments")
        .insert({
          stylist_id: selectedStylist,
          client_id: clientProfile.id,
          appointment_date: appointmentDate.toISOString(),
          service_type: selectedService.service_name,
          service_id: selectedService.id,
          duration_minutes: selectedService.duration_minutes,
          notes,
          status: "scheduled",
        })
        .select()
        .single();

      if (error) throw error;

      // Send confirmation email
      try {
        await supabase.functions.invoke("send-appointment-email", {
          body: {
            appointmentId: newAppointment.id,
            type: "confirmation",
          },
        });
      } catch (emailError) {
        console.error("Failed to send confirmation email:", emailError);
      }

      toast.success("Appointment booked successfully! Your stylist will confirm soon.");
      navigate("/my-appointments");
    } catch (error: any) {
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
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">Book Appointment</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Left Column - Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Select Your Stylist
                  <Badge variant="secondary" className="text-xs">Step 1</Badge>
                </CardTitle>
                <CardDescription>Choose from available stylists</CardDescription>
              </CardHeader>
              <CardContent>
                {stylists.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground mb-2">No stylists available at the moment</p>
                    <Button variant="outline" size="sm" onClick={() => navigate("/stylists")}>
                      Discover Stylists
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Select value={selectedStylist} onValueChange={setSelectedStylist}>
                      <SelectTrigger className={cn(
                        "bg-background",
                        !selectedStylist && "border-primary/50"
                      )}>
                        <SelectValue placeholder="Choose a stylist" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover z-50 max-h-[300px]">
                        {stylists.map((stylist) => (
                          <SelectItem key={stylist.id} value={stylist.id}>
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {stylist.user?.full_name || stylist.business_name || "Stylist"}
                              </span>
                              {stylist.specialty && (
                                <span className="text-xs text-muted-foreground">{stylist.specialty}</span>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      {selectedStylist ? (
                        <>
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          Stylist selected
                        </>
                      ) : (
                        <>All stylists are currently accepting bookings</>
                      )}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Service Details
                  <Badge variant="secondary" className="text-xs">Step 2</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    Service <span className="text-destructive">*</span>
                  </Label>
                  {!selectedStylist ? (
                    <div className="py-3 px-4 bg-muted/50 rounded-md text-sm text-muted-foreground">
                      ⬆️ Select a stylist first
                    </div>
                  ) : stylistServices.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-2">No services available for this stylist</p>
                  ) : (
                    <Select 
                      value={selectedService?.id} 
                      onValueChange={(value) => {
                        const service = stylistServices.find(s => s.id === value);
                        setSelectedService(service);
                      }}
                    >
                      <SelectTrigger className={cn(
                        "bg-background",
                        selectedStylist && !selectedService && "border-primary/50"
                      )}>
                        <SelectValue placeholder="Select service" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover z-50 max-h-[300px]">
                        {stylistServices.map((service) => (
                          <SelectItem key={service.id} value={service.id}>
                            <div className="flex flex-col">
                              <span className="font-medium">{service.service_name}</span>
                              <span className="text-xs text-muted-foreground">
                                ${service.price} • {service.duration_minutes} min
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  {selectedService && (
                    <div className="bg-primary/5 rounded-lg p-3 space-y-1 border border-primary/20">
                      <div className="flex items-center gap-1 text-sm">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        <span className="font-medium">{selectedService.service_name}</span>
                      </div>
                      <div className="text-sm text-muted-foreground grid grid-cols-2 gap-2">
                        <div>💵 ${selectedService.price}</div>
                        <div>⏱️ {selectedService.duration_minutes} min</div>
                      </div>
                      {selectedService.description && (
                        <p className="text-xs text-muted-foreground mt-2 pt-2 border-t">
                          {selectedService.description}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>
                    Additional Notes <span className="text-muted-foreground text-xs">(Optional)</span>
                  </Label>
                  <Textarea
                    placeholder="Example: I'd like to discuss color options during the appointment. I have a sensitive scalp."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                    maxLength={500}
                    className="resize-none"
                  />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Share any special requests or concerns</span>
                    <span className={notes.length > 450 ? "text-warning font-medium" : ""}>
                      {notes.length}/500
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Date & Time */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Select Date
                  <Badge variant="secondary" className="text-xs">Step 3</Badge>
                </CardTitle>
                <CardDescription>Choose your preferred appointment date</CardDescription>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => {
                    // Disable past dates
                    if (isBefore(date, startOfDay(new Date()))) return true;
                    
                    // Disable blocked dates
                    const isBlocked = blockedDates.some(
                      blockedDate => format(blockedDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
                    );
                    return isBlocked;
                  }}
                  className={cn("rounded-md border pointer-events-auto w-full")}
                />
                <div className="mt-3 space-y-2">
                  {blockedDates.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      ⚠️ Grayed out dates are unavailable
                    </p>
                  )}
                  {selectedDate && (
                    <div className="bg-primary/5 rounded-lg p-3 border border-primary/20">
                      <p className="text-sm font-medium flex items-center gap-1">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        Selected Date
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {format(selectedDate, "EEEE, MMMM d, yyyy")}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Select Time
                  <Badge variant="secondary" className="text-xs">Step 4</Badge>
                </CardTitle>
                <CardDescription>Pick your preferred time slot</CardDescription>
              </CardHeader>
              <CardContent>
                {!selectedStylist || !selectedDate ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Select a stylist and date first
                  </p>
                ) : availableTimeSlots.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No available time slots for this day
                  </p>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {availableTimeSlots.map((time) => (
                    <Button
                      key={time}
                      variant={selectedTime === time ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedTime(time)}
                      className="justify-start transition-all hover:scale-105"
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      {time}
                    </Button>
                  ))}
                  </div>
                )}
                {selectedTime && (
                  <p className="text-sm text-primary mt-3 font-medium flex items-center gap-1">
                    <CheckCircle className="h-4 w-4" />
                    Selected: {selectedTime}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Summary & Submit */}
        <Card className="mt-6 border-primary/20 shadow-lg">
          <CardHeader>
            <CardTitle>Booking Summary</CardTitle>
            <CardDescription>Review your appointment details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!selectedStylist || !selectedDate || !selectedTime || !selectedService ? (
              <div className="text-center py-6 text-muted-foreground">
                <p className="text-sm">Complete all required fields to see your booking summary</p>
              </div>
            ) : (
              <>
                {selectedStylist && (
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-muted-foreground">Stylist:</span>
                    <span className="font-medium">
                      {stylists.find(s => s.id === selectedStylist)?.user?.full_name}
                    </span>
                  </div>
                )}
                {selectedService && (
                  <>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-muted-foreground">Service:</span>
                      <span className="font-medium">{selectedService.service_name}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-muted-foreground">Price:</span>
                      <span className="font-medium">${selectedService.price}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-muted-foreground">Duration:</span>
                      <span className="font-medium">{selectedService.duration_minutes} minutes</span>
                    </div>
                  </>
                )}
                {selectedDate && (
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-muted-foreground">Date:</span>
                    <span className="font-medium">{format(selectedDate, "EEEE, MMMM d, yyyy")}</span>
                  </div>
                )}
                {selectedTime && (
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-muted-foreground">Time:</span>
                    <span className="font-medium">{selectedTime}</span>
                  </div>
                )}

                <div className="bg-primary/5 p-4 rounded-lg mt-4">
                  <p className="text-sm text-muted-foreground mb-2">📋 What happens next:</p>
                  <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                    <li>Your stylist will receive your booking request</li>
                    <li>They'll confirm your appointment</li>
                    <li>You'll receive updates on your booking status</li>
                  </ol>
                </div>
              </>
            )}

            <Button
              onClick={handleBookAppointment}
              disabled={submitting || !selectedStylist || !selectedDate || !selectedTime || !selectedService}
              className="w-full mt-4 transition-all hover:scale-105"
              size="lg"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Booking Your Appointment...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
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

export default BookAppointment;
