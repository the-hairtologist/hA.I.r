import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Calendar as CalendarIcon, ArrowLeft, Plus, Clock, User, XCircle, Loader2, RefreshCw, Search, Star } from "lucide-react";
import { format } from "date-fns";
import { RescheduleDialog } from "@/components/RescheduleDialog";
import { ReviewDialog } from "@/components/ReviewDialog";
import { Input } from "@/components/ui/input";

const MyAppointments = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [clientProfile, setClientProfile] = useState<any>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);

  useEffect(() => {
    loadData();
    
    // Check for payment success
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    
    if (paymentStatus === 'success') {
      toast.success('🎉 Payment successful!', {
        description: 'Your appointment has been confirmed. Check your email for details!',
        duration: 5000,
      });
      // Clean up URL
      window.history.replaceState({}, '', '/my-appointments');
    }
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

      // Get appointments
      const { data: appointmentsData } = await supabase
        .from("appointments")
        .select(`
          *,
          stylist:stylist_profiles(
            id,
            business_name,
            user:profiles(full_name, email, phone)
          )
        `)
        .eq("client_id", client.id)
        .order("appointment_date", { ascending: true });

      setAppointments(appointmentsData || []);
    } catch (error: any) {
      console.error("Error loading data:", error);
      toast.error("Error loading appointments");
    } finally {
      setLoading(false);
    }
  };

  const cancelAppointment = async (appointmentId: string) => {
    const apt = appointments.find(a => a.id === appointmentId);
    const stylistName = apt?.stylist?.user?.full_name || apt?.stylist?.business_name || "this stylist";
    const dateStr = apt ? format(new Date(apt.appointment_date), "MMMM d 'at' h:mm a") : "";
    
    if (!confirm(`Cancel appointment with ${stylistName} on ${dateStr}?\n\nYou may be subject to the stylist's cancellation policy.`)) return;

    try {
      const { error } = await supabase
        .from("appointments")
        .update({ status: "cancelled" })
        .eq("id", appointmentId);

      if (error) throw error;

      toast.success("Appointment cancelled successfully");
      setDetailsOpen(false);
      loadData();
    } catch (error: any) {
      console.error("Error cancelling appointment:", error);
      toast.error("Error cancelling appointment");
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      scheduled: "secondary",
      confirmed: "default",
      completed: "outline",
      cancelled: "destructive",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  const upcomingAppointments = appointments.filter(
    (apt) => new Date(apt.appointment_date) >= new Date() && apt.status !== "cancelled" && apt.status !== "completed"
  );

  const pastAppointments = appointments.filter(
    (apt) => new Date(apt.appointment_date) < new Date() || apt.status === "completed" || apt.status === "cancelled"
  );

  const filteredUpcoming = upcomingAppointments.filter(apt =>
    apt.stylist?.user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    apt.stylist?.business_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    apt.service_type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPast = pastAppointments.filter(apt =>
    apt.stylist?.user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    apt.stylist?.business_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    apt.service_type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <header className="border-b-[3px] border-foreground bg-card/50 backdrop-blur-sm sticky top-0 z-10 shadow-[4px_4px_0px_0px_hsl(var(--foreground)_/_0.1)]">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-6 w-6 text-primary" />
                <h1 className="text-2xl font-display font-bold gradient-text">My Appointments</h1>
              </div>
            </div>
            <Button 
              onClick={() => navigate("/book")}
              className="border-[3px] border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_hsl(var(--foreground))] transition-all"
            >
              <Plus className="h-4 w-4 mr-2" />
              Book New
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search appointments by stylist or service"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 border-[2px] border-foreground shadow-[3px_3px_0px_0px_hsl(var(--foreground))]"
            />
          </div>
        </div>

        {/* Upcoming Appointments */}
        <Card className="mb-6 border-[3px] border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))]">
          <CardHeader className="border-b-[2px] border-border">
            <CardTitle className="font-display">Upcoming Appointments</CardTitle>
            <CardDescription>Your scheduled and confirmed services</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredUpcoming.length === 0 ? (
              <div className="text-center py-12">
                <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  {searchTerm ? "No appointments match your search" : "No upcoming appointments scheduled"}
                </p>
                <Button onClick={() => navigate("/book")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Book Appointment
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredUpcoming.map((apt) => (
                  <div
                    key={apt.id}
                    className="flex items-center justify-between p-4 border-[2px] border-foreground rounded-lg hover:bg-secondary/5 hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_hsl(var(--foreground))] cursor-pointer transition-all"
                    onClick={() => {
                      setSelectedAppointment(apt);
                      setDetailsOpen(true);
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-primary/10 p-3 rounded-lg">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">
                          {apt.stylist?.user?.full_name || apt.stylist?.business_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(apt.appointment_date), "EEEE, MMM d 'at' h:mm a")}
                        </p>
                        <p className="text-sm text-muted-foreground">{apt.service_type}</p>
                      </div>
                    </div>
                    {getStatusBadge(apt.status)}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Past Appointments */}
        {filteredPast.length > 0 && (
          <Card className="border-[3px] border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))]">
            <CardHeader className="border-b-[2px] border-border">
              <CardTitle className="font-display">Past Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredPast.map((apt) => (
                  <div
                    key={apt.id}
                    className="flex items-center justify-between p-4 border-[2px] border-foreground rounded-lg hover:bg-secondary/5 hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_hsl(var(--foreground))] cursor-pointer transition-all opacity-75"
                    onClick={() => {
                      setSelectedAppointment(apt);
                      setDetailsOpen(true);
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-muted p-3 rounded-lg">
                        <Clock className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-semibold">
                          {apt.stylist?.user?.full_name || apt.stylist?.business_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(apt.appointment_date), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                        <p className="text-sm text-muted-foreground">{apt.service_type}</p>
                      </div>
                    </div>
                    {getStatusBadge(apt.status)}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Appointment Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Appointment Details</DialogTitle>
            <DialogDescription>
              {selectedAppointment && format(new Date(selectedAppointment.appointment_date), "EEEE, MMMM d, yyyy 'at' h:mm a")}
            </DialogDescription>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-4">
              <div>
                <Label>Stylist</Label>
                <p className="text-sm font-medium">
                  {selectedAppointment.stylist?.user?.full_name || selectedAppointment.stylist?.business_name}
                </p>
                <p className="text-sm text-muted-foreground">{selectedAppointment.stylist?.user?.email}</p>
                {selectedAppointment.stylist?.user?.phone && (
                  <p className="text-sm text-muted-foreground">{selectedAppointment.stylist?.user?.phone}</p>
                )}
              </div>
              <div>
                <Label>Service</Label>
                <p className="text-sm">{selectedAppointment.service_type}</p>
              </div>
              <div>
                <Label>Duration</Label>
                <p className="text-sm">{selectedAppointment.duration_minutes} minutes</p>
              </div>
              {selectedAppointment.notes && (
                <div>
                  <Label>Your Notes</Label>
                  <p className="text-sm text-muted-foreground">{selectedAppointment.notes}</p>
                </div>
              )}
              <div>
                <Label>Status</Label>
                <div className="mt-2">{getStatusBadge(selectedAppointment.status)}</div>
              </div>

              {selectedAppointment.status === "completed" && (
                <div className="space-y-3">
                  <div className="bg-gradient-to-br from-primary/5 to-secondary/5 p-4 rounded-lg border">
                    <p className="text-sm text-center text-muted-foreground">
                      💬 Your feedback helps other clients find the perfect stylist!
                    </p>
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => {
                      setDetailsOpen(false);
                      setReviewDialogOpen(true);
                    }}
                  >
                    <Star className="h-4 w-4 mr-2" />
                    Leave a Review
                  </Button>
                </div>
              )}

              {(selectedAppointment.status === "scheduled" || selectedAppointment.status === "confirmed") && 
               new Date(selectedAppointment.appointment_date) > new Date() && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setDetailsOpen(false);
                      setRescheduleOpen(true);
                    }}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reschedule
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => cancelAppointment(selectedAppointment.id)}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Cancel Appointment
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <RescheduleDialog
        open={rescheduleOpen}
        onOpenChange={setRescheduleOpen}
        appointment={selectedAppointment}
        onSuccess={loadData}
      />

      <ReviewDialog
        open={reviewDialogOpen}
        onOpenChange={setReviewDialogOpen}
        appointment={selectedAppointment}
        clientProfileId={clientProfile?.id}
        onSuccess={loadData}
      />
    </div>
  );
};

export default MyAppointments;
