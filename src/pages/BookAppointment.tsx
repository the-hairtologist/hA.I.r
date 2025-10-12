import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarIcon, Clock, DollarSign, Scissors, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { showCelebration } from "@/components/CelebrationToast";

interface Service {
  id: string;
  service_name: string;
  description: string;
  duration_minutes: number;
  price: number;
}

const BookAppointment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [stylists, setStylists] = useState<any[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [clientProfile, setClientProfile] = useState<any>(null);
  
  // Form state
  const [selectedStylistId, setSelectedStylistId] = useState<string>("");
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [notes, setNotes] = useState("");

  // Pre-populate stylist if coming from discovery
  const preSelectedStylistId = location.state?.stylistId;

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    } else if (user) {
      loadData();
    }
  }, [authLoading, user]);

  useEffect(() => {
    if (preSelectedStylistId && stylists.length > 0) {
      setSelectedStylistId(preSelectedStylistId);
    }
  }, [preSelectedStylistId, stylists]);

  useEffect(() => {
    if (selectedStylistId) {
      loadServices(selectedStylistId);
    } else {
      setServices([]);
    }
  }, [selectedStylistId]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Get client profile
      const { data: profile, error: profileError } = await supabase
        .from("client_profiles")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();

      if (profileError) throw profileError;
      
      if (!profile) {
        // Create client profile if it doesn't exist
        const { data: newProfile, error: createError } = await supabase
          .from("client_profiles")
          .insert({ user_id: user!.id })
          .select()
          .single();
        
        if (createError) throw createError;
        setClientProfile(newProfile);
      } else {
        setClientProfile(profile);
      }

      // Load stylists
      const { data: stylistsData, error: stylistsError } = await supabase
        .from("stylist_profiles")
        .select(`
          id,
          business_name,
          location,
          user:profiles!stylist_profiles_user_id_fkey (
            full_name
          )
        `)
        .order("business_name", { ascending: true });

      if (stylistsError) throw stylistsError;
      setStylists(stylistsData || []);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load booking information");
    } finally {
      setLoading(false);
    }
  };

  const loadServices = async (stylistId: string) => {
    try {
      const { data, error } = await supabase
        .from("stylist_services")
        .select("*")
        .eq("stylist_id", stylistId)
        .eq("is_active", true)
        .order("service_name", { ascending: true });

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error("Error loading services:", error);
      toast.error("Failed to load services");
    }
  };

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour < 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeString);
      }
    }
    return slots;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedStylistId) {
      toast.error("Please select a stylist");
      return;
    }

    if (!selectedServiceId) {
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

    if (!clientProfile) {
      toast.error("Client profile not found");
      return;
    }

    setSubmitting(true);
    try {
      const [hours, minutes] = selectedTime.split(':').map(Number);
      const appointmentDate = new Date(selectedDate);
      appointmentDate.setHours(hours, minutes, 0, 0);

      const selectedService = services.find(s => s.id === selectedServiceId);

      const { error } = await supabase
        .from("appointments")
        .insert({
          stylist_id: selectedStylistId,
          client_id: clientProfile.id,
          service_id: selectedServiceId,
          service_type: selectedService?.service_name || "Appointment",
          appointment_date: appointmentDate.toISOString(),
          duration_minutes: selectedService?.duration_minutes || 60,
          status: "scheduled",
          notes: notes.trim() || null,
        });

      if (error) throw error;

      showCelebration("appointment-booked");
      toast.success("Appointment booked successfully! 🎉");
      navigate("/appointments");
    } catch (error) {
      console.error("Error booking appointment:", error);
      toast.error("Failed to book appointment");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return <LoadingSpinner message="Loading booking form..." />;
  }

  const selectedService = services.find(s => s.id === selectedServiceId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10">
      <PageHeader
        title="Book Appointment"
        icon={<CalendarIcon className="h-6 w-6" />}
        backTo="/dashboard"
      />

      <main className="container mx-auto px-4 py-6 max-w-3xl">
        <form onSubmit={handleSubmit}>
          <Card className="border-2 border-foreground shadow-brutal">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scissors className="h-5 w-5" />
                Schedule Your Appointment
              </CardTitle>
              <CardDescription>
                Fill in the details below to book your appointment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Stylist Selection */}
              <div className="space-y-2">
                <Label>Select Stylist *</Label>
                <Select value={selectedStylistId} onValueChange={setSelectedStylistId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a stylist" />
                  </SelectTrigger>
                  <SelectContent>
                    {stylists.map((stylist) => (
                      <SelectItem key={stylist.id} value={stylist.id}>
                        {stylist.business_name || stylist.user?.full_name || "Stylist"}
                        {stylist.location && ` - ${stylist.location}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Service Selection */}
              <div className="space-y-2">
                <Label>Select Service *</Label>
                <Select 
                  value={selectedServiceId} 
                  onValueChange={setSelectedServiceId}
                  disabled={!selectedStylistId || services.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={
                      !selectedStylistId 
                        ? "Select a stylist first"
                        : services.length === 0 
                        ? "No services available"
                        : "Choose a service"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        <div className="flex justify-between items-center w-full">
                          <span>{service.service_name}</span>
                          <span className="text-sm text-muted-foreground ml-2">
                            ${service.price} • {service.duration_minutes}min
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedService && (
                  <p className="text-sm text-muted-foreground">
                    {selectedService.description}
                  </p>
                )}
              </div>

              {/* Date Selection */}
              <div className="space-y-2">
                <Label>Select Date *</Label>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < new Date() || date.getDay() === 0}
                  className="rounded-md border-2 border-foreground"
                />
              </div>

              {/* Time Selection */}
              <div className="space-y-2">
                <Label>Select Time *</Label>
                <Select value={selectedTime} onValueChange={setSelectedTime}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a time" />
                  </SelectTrigger>
                  <SelectContent>
                    {generateTimeSlots().map((time) => (
                      <SelectItem key={time} value={time}>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {time}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label>Additional Notes</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any special requests or information for your stylist..."
                  rows={3}
                />
              </div>

              {/* Summary */}
              {selectedService && selectedDate && selectedTime && (
                <div className="p-4 rounded-lg bg-primary/5 border-2 border-primary space-y-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Appointment Summary
                  </h3>
                  <div className="text-sm space-y-1">
                    <p><strong>Service:</strong> {selectedService.service_name}</p>
                    <p><strong>Date:</strong> {format(selectedDate, "EEEE, MMMM d, yyyy")}</p>
                    <p><strong>Time:</strong> {selectedTime}</p>
                    <p><strong>Duration:</strong> {selectedService.duration_minutes} minutes</p>
                    <p className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      <strong>Price:</strong> ${selectedService.price}
                    </p>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                  className="flex-1"
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <LoadingSpinner />
                      Booking...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Confirm Booking
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </main>
    </div>
  );
};

export default BookAppointment;
