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
  const [serviceType, setServiceType] = useState<string>("");
  const [duration, setDuration] = useState<string>("90");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const serviceTypes = [
    "Color & Cut",
    "Color Only",
    "Haircut",
    "Highlights",
    "Balayage",
    "Color Correction",
    "Consultation",
  ];

  const timeSlots = [
    "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
    "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM"
  ];

  useEffect(() => {
    loadData();
  }, []);

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

      // Get available stylists
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

  const handleBookAppointment = async () => {
    if (!selectedStylist || !selectedDate || !selectedTime || !serviceType) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    try {
      // Convert selected time to date
      const [time, period] = selectedTime.split(" ");
      const [hours, minutes] = time.split(":").map(Number);
      const adjustedHours = period === "PM" && hours !== 12 ? hours + 12 : hours === 12 && period === "AM" ? 0 : hours;
      
      const appointmentDate = setMinutes(setHours(selectedDate, adjustedHours), minutes);

      // Check if appointment is in the past
      if (isBefore(appointmentDate, new Date())) {
        toast.error("Cannot book appointments in the past");
        setSubmitting(false);
        return;
      }

      const { error } = await supabase
        .from("appointments")
        .insert({
          stylist_id: selectedStylist,
          client_id: clientProfile.id,
          appointment_date: appointmentDate.toISOString(),
          service_type: serviceType,
          duration_minutes: parseInt(duration),
          notes,
          status: "scheduled",
        });

      if (error) throw error;

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
                <CardTitle>Select Your Stylist</CardTitle>
                <CardDescription>Choose from available stylists</CardDescription>
              </CardHeader>
              <CardContent>
                {stylists.length === 0 ? (
                  <p className="text-muted-foreground">No stylists available at the moment</p>
                ) : (
                  <div className="space-y-2">
                    <Select value={selectedStylist} onValueChange={setSelectedStylist}>
                      <SelectTrigger className="bg-background">
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
                    <p className="text-xs text-muted-foreground">
                      All stylists are currently accepting bookings
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Service Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Service Type *</Label>
                  <Select value={serviceType} onValueChange={setServiceType}>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Select service" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover z-50 max-h-[300px]">
                      {serviceTypes.map((service) => (
                        <SelectItem key={service} value={service}>
                          {service}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Choose the service you'd like to book
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Duration</Label>
                  <Select value={duration} onValueChange={setDuration}>
                    <SelectTrigger className="bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover z-50">
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="90">1.5 hours (recommended)</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                      <SelectItem value="180">3 hours</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Choose appointment duration
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Additional Notes (Optional)</Label>
                  <Textarea
                    placeholder="Example: I'd like to discuss color options during the appointment. I have a sensitive scalp."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    Share any concerns or special requests with your stylist
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Date & Time */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Select Date</CardTitle>
                <CardDescription>Choose your preferred appointment date</CardDescription>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => isBefore(date, startOfDay(new Date()))}
                  className={cn("rounded-md border pointer-events-auto w-full")}
                />
                {selectedDate && (
                  <p className="text-sm text-primary mt-3 font-medium">
                    Selected: {format(selectedDate, "EEEE, MMMM d, yyyy")}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Select Time</CardTitle>
                <CardDescription>Pick your preferred time slot</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {timeSlots.map((time) => (
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
            {!selectedStylist || !selectedDate || !selectedTime || !serviceType ? (
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
                {serviceType && (
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-muted-foreground">Service:</span>
                    <span className="font-medium">{serviceType}</span>
                  </div>
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
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="font-medium">{duration} minutes</span>
                </div>

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
              disabled={submitting || !selectedStylist || !selectedDate || !selectedTime || !serviceType}
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
