import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Calendar as CalendarIcon, ArrowLeft, Clock, User, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const Appointments = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [stylistProfile, setStylistProfile] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

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

      // Get appointments
      const { data: appointmentsData } = await supabase
        .from("appointments")
        .select(`
          *,
          client:client_profiles(
            id,
            user:profiles(full_name, email, phone)
          )
        `)
        .eq("stylist_id", stylist.id)
        .order("appointment_date", { ascending: true });

      setAppointments(appointmentsData || []);
    } catch (error: any) {
      console.error("Error loading data:", error);
      toast.error("Error loading appointments");
    } finally {
      setLoading(false);
    }
  };

  const toggleAvailability = async () => {
    try {
      const { error } = await supabase
        .from("stylist_profiles")
        .update({ is_available: !stylistProfile.is_available })
        .eq("id", stylistProfile.id);

      if (error) throw error;

      setStylistProfile({ ...stylistProfile, is_available: !stylistProfile.is_available });
      toast.success(`You are now ${!stylistProfile.is_available ? 'accepting' : 'not accepting'} appointments`);
    } catch (error: any) {
      console.error("Error updating availability:", error);
      toast.error("Error updating availability");
    }
  };

  const updateAppointmentStatus = async (appointmentId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("appointments")
        .update({ status: newStatus })
        .eq("id", appointmentId);

      if (error) throw error;

      toast.success(`Appointment ${newStatus}`);
      setDetailsOpen(false);
      loadData();
    } catch (error: any) {
      console.error("Error updating appointment:", error);
      toast.error("Error updating appointment");
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
    (apt) => new Date(apt.appointment_date) >= new Date() && apt.status !== "cancelled"
  );

  const todayAppointments = appointments.filter(
    (apt) => format(new Date(apt.appointment_date), "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd") && apt.status !== "cancelled"
  );

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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-6 w-6 text-primary" />
                <h1 className="text-2xl font-bold">My Appointments</h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Label htmlFor="availability">Accepting Bookings</Label>
                <Switch
                  id="availability"
                  checked={stylistProfile?.is_available}
                  onCheckedChange={toggleAvailability}
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Calendar Section */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Calendar</CardTitle>
                <CardDescription>Select a date to view appointments</CardDescription>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className={cn("rounded-md border pointer-events-auto")}
                />
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Today</span>
                  <Badge>{todayAppointments.length}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Upcoming</span>
                  <Badge>{upcomingAppointments.length}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant={stylistProfile?.is_available ? "default" : "secondary"}>
                    {stylistProfile?.is_available ? "Available" : "Unavailable"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Appointments List */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Today's Appointments</CardTitle>
              </CardHeader>
              <CardContent>
                {todayAppointments.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No appointments today</p>
                ) : (
                  <div className="space-y-3">
                    {todayAppointments.map((apt) => (
                      <div
                        key={apt.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/5 cursor-pointer transition-colors"
                        onClick={() => {
                          setSelectedAppointment(apt);
                          setDetailsOpen(true);
                        }}
                      >
                        <div className="flex items-center gap-4">
                          <div className="bg-primary/10 p-3 rounded-lg">
                            <Clock className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold">{apt.client?.user?.full_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(apt.appointment_date), "h:mm a")} • {apt.service_type}
                            </p>
                          </div>
                        </div>
                        {getStatusBadge(apt.status)}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upcoming Appointments</CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingAppointments.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No upcoming appointments</p>
                ) : (
                  <div className="space-y-3">
                    {upcomingAppointments.slice(0, 10).map((apt) => (
                      <div
                        key={apt.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/5 cursor-pointer transition-colors"
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
                            <p className="font-semibold">{apt.client?.user?.full_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(apt.appointment_date), "MMM d, h:mm a")} • {apt.service_type}
                            </p>
                          </div>
                        </div>
                        {getStatusBadge(apt.status)}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
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
                <Label>Client</Label>
                <p className="text-sm font-medium">{selectedAppointment.client?.user?.full_name}</p>
                <p className="text-sm text-muted-foreground">{selectedAppointment.client?.user?.email}</p>
                {selectedAppointment.client?.user?.phone && (
                  <p className="text-sm text-muted-foreground">{selectedAppointment.client?.user?.phone}</p>
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
                  <Label>Notes</Label>
                  <p className="text-sm text-muted-foreground">{selectedAppointment.notes}</p>
                </div>
              )}
              <div>
                <Label>Status</Label>
                <div className="mt-2">{getStatusBadge(selectedAppointment.status)}</div>
              </div>

              {selectedAppointment.status === "scheduled" && (
                <div className="flex gap-2 pt-4">
                  <Button
                    className="flex-1"
                    onClick={() => updateAppointmentStatus(selectedAppointment.id, "confirmed")}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Confirm
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => updateAppointmentStatus(selectedAppointment.id, "cancelled")}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              )}

              {selectedAppointment.status === "confirmed" && (
                <div className="flex gap-2 pt-4">
                  <Button
                    className="flex-1"
                    onClick={() => updateAppointmentStatus(selectedAppointment.id, "completed")}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark Complete
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => updateAppointmentStatus(selectedAppointment.id, "cancelled")}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Appointments;
