import { useState, useEffect, useRef } from "react";
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
import { Calendar as CalendarIcon, ArrowLeft, Clock, User, CheckCircle, XCircle, Loader2, CalendarDays, UserPlus, Filter } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { CalendarView } from "@/components/CalendarView";
import { WeeklyScheduleView } from "@/components/WeeklyScheduleView";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { SearchInput } from "@/components/SearchInput";
import { AppointmentSkeleton } from "@/components/LoadingSkeleton";
import { useRealtimeUpdates } from "@/hooks/useRealtimeUpdates";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RebookDialog } from "@/components/RebookDialog";
import { Repeat } from "lucide-react";
import { useGlobalShortcuts } from "@/hooks/useKeyboardShortcuts";

const Appointments = () => {
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [stylistProfile, setStylistProfile] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "calendar" | "week">("list");
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({ open: false, title: "", description: "", onConfirm: () => {} });
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [rebookDialogOpen, setRebookDialogOpen] = useState(false);
  const [rebookAppointment, setRebookAppointment] = useState<any>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

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

  // Real-time updates
  useRealtimeUpdates("appointments", loadData, stylistProfile?.id);

  // Keyboard shortcuts
  useGlobalShortcuts(searchInputRef);

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
    // Prevent concurrent updates
    if (updatingStatus) {
      toast.error("Please wait for the current update to complete");
      return;
    }
    
    const appointment = appointments.find(a => a.id === appointmentId);
    const clientName = appointment?.client?.user?.full_name || "this client";
    const statusAction = newStatus === "cancelled" ? "cancel" : newStatus;
    
    setConfirmDialog({
      open: true,
      title: `${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)} Appointment`,
      description: `${statusAction === "cancel" ? "Are you sure you want to cancel" : `Mark as ${statusAction}`} this appointment with ${clientName}?\n\n${statusAction === "cancel" ? "The client will be notified." : ""}`,
      onConfirm: async () => {
        setUpdatingStatus(appointmentId);
        try {
          const { error } = await supabase
            .from("appointments")
            .update({ status: newStatus })
            .eq("id", appointmentId);

          if (error) throw error;

          // Send SMS notification for cancellation
          if (newStatus === "cancelled") {
            try {
              await supabase.functions.invoke('send-sms-notification', {
                body: {
                  appointmentId: appointmentId,
                  notificationType: 'cancellation',
                },
              });
            } catch (smsError) {
              console.error("SMS notification failed:", smsError);
            }
          }

          toast.success(`Appointment ${newStatus}`);
          setDetailsOpen(false);
          loadData();
        } catch (error: any) {
          console.error("Error updating appointment:", error);
          toast.error("Error updating appointment");
        } finally {
          setUpdatingStatus(null);
        }
      },
    });
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

  // Get today's appointments
  const todayAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.appointment_date);
    const today = new Date();
    return format(aptDate, "yyyy-MM-dd") === format(today, "yyyy-MM-dd") && apt.status !== "cancelled";
  }).sort((a, b) => 
    new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime()
  );

  // Filter appointments
  const filteredAppointments = (list: any[]) => {
    let filtered = list;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (apt) =>
          apt.client?.user?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          apt.service_type?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((apt) => apt.status === statusFilter);
    }

    return filtered;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">My Appointments</h1>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <AppointmentSkeleton key={i} />
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg">
        Skip to main content
      </a>
      <header role="banner" className="border-b-[3px] border-foreground bg-card/50 backdrop-blur-sm sticky top-0 z-10 shadow-[4px_4px_0px_0px_hsl(var(--foreground)_/_0.1)]">
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

      <main id="main-content" role="main" aria-label="Appointments" className="container mx-auto px-4 py-8">
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "list" | "calendar" | "week")} className="space-y-6">
          <TabsList className="grid w-full max-w-3xl grid-cols-3">
            <TabsTrigger value="list">List View</TabsTrigger>
            <TabsTrigger value="calendar">Calendar View</TabsTrigger>
            <TabsTrigger value="week">Week View</TabsTrigger>
          </TabsList>

          <TabsContent value="list">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6 animate-fade-in">
              <SearchInput
                ref={searchInputRef}
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search by client name or service... (Press / or Ctrl+K)"
                className="flex-1"
              />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48 border-[2px] border-foreground shadow-[3px_3px_0px_0px_hsl(var(--foreground))]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Today's Appointments */}
            <Card className="border-[3px] border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))]">
              <CardHeader className="border-b-[2px] border-border py-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="font-display text-lg">
                    Today's Schedule - {format(new Date(), 'EEEE, MMMM d')}
                  </CardTitle>
                  {todayAppointments.length > 0 && (
                    <Badge variant="default">{todayAppointments.length} appointment{todayAppointments.length !== 1 ? 's' : ''}</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-4">
                {filteredAppointments(todayAppointments).length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    {searchQuery || statusFilter !== "all"
                      ? "No matching appointments"
                      : "No appointments scheduled for today"}
                  </p>
                ) : (
                  <div className="space-y-3">
                    {filteredAppointments(todayAppointments).map((apt) => (
                      <div
                        key={apt.id}
                        className="flex items-center justify-between p-3 border-[2px] border-foreground rounded-lg hover:bg-secondary/5 hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_hsl(var(--foreground))] transition-all group"
                      >
                        <div 
                          className="flex items-center gap-3 flex-1 cursor-pointer"
                          onClick={() => {
                            setSelectedAppointment(apt);
                            setDetailsOpen(true);
                          }}
                        >
                          <div className="bg-primary/10 p-2.5 rounded-lg">
                            <Clock className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold">{apt.client?.user?.full_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(apt.appointment_date), "h:mm a")} • {apt.service_type} • {apt.duration_minutes}min
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(apt.status)}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setRebookAppointment(apt);
                              setRebookDialogOpen(true);
                            }}
                            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Repeat className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calendar">
            <CalendarView 
              appointments={appointments}
              onAppointmentClick={(apt) => {
                setSelectedAppointment(apt);
                setDetailsOpen(true);
              }}
            />
          </TabsContent>

          <TabsContent value="week">
            <WeeklyScheduleView
              appointments={appointments}
              stylistSchedule={stylistProfile?.weekly_schedule}
              stylistId={stylistProfile?.id}
              onAppointmentClick={(apt) => {
                setSelectedAppointment(apt);
                setDetailsOpen(true);
              }}
            />
          </TabsContent>
        </Tabs>
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

              {selectedAppointment.status === "completed" && (
                <div className="pt-4">
                  <Button
                    className="w-full"
                    onClick={() => {
                      setRebookAppointment(selectedAppointment);
                      setRebookDialogOpen(true);
                      setDetailsOpen(false);
                    }}
                  >
                    <Repeat className="h-4 w-4 mr-2" />
                    Rebook Client
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        description={confirmDialog.description}
        confirmText="Confirm"
        variant={confirmDialog.title.toLowerCase().includes("cancel") ? "destructive" : "default"}
      />

      <RebookDialog
        open={rebookDialogOpen}
        onOpenChange={setRebookDialogOpen}
        appointment={rebookAppointment}
        onSuccess={loadData}
      />
    </div>
  );
};

export default Appointments;
