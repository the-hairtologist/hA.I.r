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
import { Plus, Loader2, Search, Edit, Save, Trash2, UserPlus, Palette, Mic, Copy, Tag as TagIcon, X, FileText, User, Calendar as CalendarIcon, ArrowLeft, Clock, CheckCircle, XCircle, Filter, CalendarDays, Repeat } from "lucide-react";
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
import { useGlobalShortcuts } from "@/hooks/useKeyboardShortcuts";
import { QuickRebookButton } from "@/components/QuickRebookButton";
import { ContextualAI } from "@/components/ContextualAI";
import { SmartSchedulingSuggestions } from "@/components/SmartSchedulingSuggestions";
import { showCelebration } from "@/components/CelebrationToast";
import { QuickReviewButton } from "@/components/QuickReviewButton";
import { WaitlistDialog } from "@/components/WaitlistDialog";
import { RescheduleDialog } from "@/components/RescheduleDialog";

import { PrerequisiteCheck } from "@/components/PrerequisiteCheck";

const Appointments = () => {
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [stylistProfile, setStylistProfile] = useState<any>(null);
  const [clientProfile, setClientProfile] = useState<any>(null);
  const [userRole, setUserRole] = useState<"stylist" | "client" | null>(null);
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
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);
  const [rescheduleAppointment, setRescheduleAppointment] = useState<any>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [services, setServices] = useState<any[]>([]);
  const [selectedAppointments, setSelectedAppointments] = useState<Set<string>>(new Set());

  // Global keyboard shortcut for search focus
  useEffect(() => {
    const handleSearchFocus = () => {
      searchInputRef.current?.focus();
    };

    window.addEventListener('global-search-focus', handleSearchFocus);
    return () => window.removeEventListener('global-search-focus', handleSearchFocus);
  }, []);

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

      // Check if user is a stylist
      const { data: stylist } = await supabase
        .from("stylist_profiles")
        .select("*")
        .eq("user_id", session.user.id)
        .maybeSingle();

      // Check if user is a client
      const { data: client } = await supabase
        .from("client_profiles")
        .select("*")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (stylist) {
        // Stylist view
        setUserRole("stylist");
        setStylistProfile(stylist);

        // Get services
        const { data: servicesData } = await supabase
          .from("stylist_services")
          .select("id")
          .eq("stylist_id", stylist.id);

        setServices(servicesData || []);

        // Get appointments for this stylist
        const { data: appointmentsData } = await supabase
          .from("appointments")
          .select(`
            *,
            client:client_profiles(
              id,
              user:profiles(full_name, email, phone)
            ),
            stylist:stylist_profiles(
              business_name,
              user:profiles(full_name)
            )
          `)
          .eq("stylist_id", stylist.id)
          .order("appointment_date", { ascending: true });

        setAppointments(appointmentsData || []);
      } else if (client) {
        // Client view
        setUserRole("client");
        setClientProfile(client);

        // Get appointments for this client
        const { data: appointmentsData } = await supabase
          .from("appointments")
          .select(`
            *,
            stylist:stylist_profiles(
              id,
              business_name,
              user:profiles(full_name, email, phone)
            ),
            client:client_profiles(
              id,
              user:profiles(full_name)
            )
          `)
          .eq("client_id", client.id)
          .order("appointment_date", { ascending: true });

        setAppointments(appointmentsData || []);
      } else {
        toast.error("No profile found");
        navigate("/dashboard");
      }
    } catch (error: any) {
      console.error("Error loading data:", error);
      toast.error("Unable to load your appointments. Please refresh the page or check your connection.");
    } finally {
      setLoading(false);
    }
  };

  // Real-time updates
  useRealtimeUpdates("appointments", loadData, stylistProfile?.id || clientProfile?.id);

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
      toast.error("Unable to update your availability status. Please try again.");
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

          // Celebration for completed appointments
          if (newStatus === "completed") {
            showCelebration("income-secured", `${clientName} - appointment completed!`);
            
            // Check for milestones (database trigger handles creation)
            const { data: milestones } = await supabase
              .from("client_milestones")
              .select("*")
              .eq("client_id", selectedAppointment.client_id)
              .eq("celebrated", false)
              .order("created_at", { ascending: false })
              .limit(1);

            if (milestones && milestones.length > 0) {
              toast.success("🎉 Milestone Unlocked!", {
                description: `Check the client's profile for their reward!`,
                duration: 5000,
              });
            }
          } else {
            toast.success(`Appointment ${newStatus}`);
          }
          setDetailsOpen(false);
          loadData();
        } catch (error: any) {
          console.error("Error updating appointment:", error);
          toast.error("Unable to update appointment status. Please try again.");
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
      filtered = filtered.filter((apt) => {
        if (userRole === "client") {
          return (
            apt.stylist?.business_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            apt.stylist?.user?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            apt.service_type?.toLowerCase().includes(searchQuery.toLowerCase())
          );
        } else {
          return (
            apt.client?.user?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            apt.service_type?.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }
      });
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
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4 min-w-0">
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => navigate("/dashboard")} 
                  className="min-h-[44px] min-w-[44px] flex-shrink-0 border-2 border-foreground bg-background hover:bg-primary hover:text-primary-foreground shadow-brutal"
                  aria-label="Go back to dashboard"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="flex items-center gap-2 min-w-0">
                  <CalendarIcon className="h-6 w-6 text-primary flex-shrink-0" />
                  <h1 className="text-2xl font-display font-bold gradient-text truncate">
                    {userRole === "client" ? "My Appointments" : "Appointments"}
                  </h1>
                </div>
              </div>
              {userRole === "stylist" && (
                <div className="flex items-center gap-2">
                  <Label htmlFor="availability" className="whitespace-nowrap">Accepting Bookings</Label>
                  <Switch
                    id="availability"
                    checked={stylistProfile?.is_available}
                    onCheckedChange={toggleAvailability}
                  />
                </div>
              )}
            </div>
        </div>
      </header>

      <main id="main-content" role="main" aria-label="Appointments" className="container mx-auto px-4 py-8">
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "list" | "calendar" | "week")} className="space-y-6">
          <TabsList className="w-full max-w-3xl">
            <TabsTrigger value="list">List View</TabsTrigger>
            <TabsTrigger value="calendar">Calendar View</TabsTrigger>
            <TabsTrigger value="week">Week View</TabsTrigger>
          </TabsList>

          <TabsContent value="list">
            {/* Show prerequisite alert if no services (stylist only) */}
            {userRole === "stylist" && services.length === 0 && (
              <div className="mb-6">
                <PrerequisiteCheck type="services" />
              </div>
            )}
            
            {/* Contextual AI Suggestions (stylist only) */}
            {userRole === "stylist" && (
              <ContextualAI
                context="appointment"
                data={{
                  availableSlots: todayAppointments.length,
                }}
                onAction={(action) => {
                  if (action === "send-rebook-reminder") {
                    toast.info("Rebook reminders are being configured for this feature.", {
                      description: "Automated reminders will be available soon"
                    });
                  }
                }}
              />
            )}

            {/* Smart Scheduling Suggestions (stylist only) */}
            {userRole === "stylist" && (
              <div className="mb-6">
                <SmartSchedulingSuggestions
                  stylistId={stylistProfile?.id}
                  onSelectTime={(datetime) => {
                    toast.success("Time selected! You can now create an appointment for this time.");
                    setSelectedDate(new Date(datetime));
                  }}
                />
              </div>
            )}

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6 animate-fade-in">
              <SearchInput
                ref={searchInputRef}
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder={
                  userRole === "client"
                    ? "Search by stylist name or service... (Press / or Ctrl+K)"
                    : "Search by client name or service... (Press / or Ctrl+K)"
                }
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

            {/* Bulk Actions Bar (stylist only) */}
            {userRole === "stylist" && selectedAppointments.size > 0 && (
              <Card className="border-[3px] border-primary shadow-[4px_4px_0px_0px_hsl(var(--primary))] mb-4 bg-primary/5">
                <CardContent className="p-4 flex items-center justify-between gap-4">
                  <span className="font-medium">
                    {selectedAppointments.size} appointment{selectedAppointments.size !== 1 ? 's' : ''} selected
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        const confirmed = window.confirm(
                          `Mark ${selectedAppointments.size} appointment${selectedAppointments.size !== 1 ? 's' : ''} as completed?\n\nThis will update all selected appointments to completed status.`
                        );
                        if (confirmed) {
                          try {
                            const { error } = await supabase
                              .from("appointments")
                              .update({ status: "completed" })
                              .in("id", Array.from(selectedAppointments));
                            
                            if (error) throw error;
                            toast.success(`${selectedAppointments.size} appointment${selectedAppointments.size !== 1 ? 's' : ''} completed`);
                            setSelectedAppointments(new Set());
                            loadData();
                          } catch (error) {
                            console.error("Error updating appointments:", error);
                            toast.error("Failed to update appointments");
                          }
                        }
                      }}
                    >
                      Mark as Completed
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedAppointments(new Set())}
                    >
                      Clear Selection
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

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
                  <div className="py-8 text-center">
                    <Clock className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground font-medium">
                      {searchQuery || statusFilter !== "all"
                        ? "No appointments match your filters"
                        : "Your schedule is clear today! ☕"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {searchQuery || statusFilter !== "all"
                        ? "Try adjusting your search or filters"
                        : "Time to relax or catch up on other tasks"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredAppointments(todayAppointments).map((apt) => (
                      <div
                        key={apt.id}
                        className={cn(
                          "flex items-center justify-between p-3 border-[2px] rounded-lg hover:bg-secondary/5 hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_hsl(var(--foreground))] transition-all group",
                          selectedAppointments.has(apt.id) ? "border-primary ring-2 ring-primary" : "border-foreground"
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={selectedAppointments.has(apt.id)}
                          onChange={(e) => {
                            e.stopPropagation();
                            const newSelected = new Set(selectedAppointments);
                            if (newSelected.has(apt.id)) {
                              newSelected.delete(apt.id);
                            } else {
                              newSelected.add(apt.id);
                            }
                            setSelectedAppointments(newSelected);
                          }}
                          className="h-5 w-5 rounded border-2 border-foreground cursor-pointer"
                          onClick={(e) => e.stopPropagation()}
                        />
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
                            <p className="font-semibold">
                              {userRole === "client" 
                                ? (apt.stylist?.business_name || apt.stylist?.user?.full_name)
                                : apt.client?.user?.full_name
                              }
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(apt.appointment_date), "h:mm a")} • {apt.service_type} • {apt.duration_minutes}min
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(apt.status)}
                          {apt.status === "completed" && (
                            <>
                              <QuickRebookButton
                                appointmentId={apt.id}
                                clientId={userRole === "stylist" ? apt.client_id : clientProfile?.id}
                                clientName={userRole === "client" ? (apt.stylist?.business_name || apt.stylist?.user?.full_name || "Stylist") : (apt.client?.user?.full_name || "Client")}
                                serviceType={apt.service_type}
                                stylistId={apt.stylist_id}
                                duration={apt.duration_minutes}
                                variant="outline"
                                className="h-8 opacity-0 group-hover:opacity-100 transition-opacity"
                              />
                              {userRole === "client" && (
                                <QuickReviewButton
                                  appointmentId={apt.id}
                                  stylistId={apt.stylist_id}
                                  stylistName={apt.stylist?.business_name || apt.stylist?.user?.full_name || "Your Stylist"}
                                  onSuccess={loadData}
                                  className="h-8 opacity-0 group-hover:opacity-100 transition-opacity relative"
                                />
                              )}
                            </>
                          )}
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Appointment Details</DialogTitle>
            <DialogDescription>
              {selectedAppointment && format(new Date(selectedAppointment.appointment_date), "EEEE, MMMM d, yyyy 'at' h:mm a")}
            </DialogDescription>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-4">
              <div>
                <Label>{userRole === "client" ? "Stylist" : "Client"}</Label>
                <p className="text-sm font-medium">
                  {userRole === "client"
                    ? (selectedAppointment.stylist?.business_name || selectedAppointment.stylist?.user?.full_name)
                    : selectedAppointment.client?.user?.full_name
                  }
                </p>
                <p className="text-sm text-muted-foreground">
                  {userRole === "client"
                    ? selectedAppointment.stylist?.user?.email
                    : selectedAppointment.client?.user?.email
                  }
                </p>
                {((userRole === "client" && selectedAppointment.stylist?.user?.phone) ||
                  (userRole === "stylist" && selectedAppointment.client?.user?.phone)) && (
                  <p className="text-sm text-muted-foreground">
                    {userRole === "client" 
                      ? selectedAppointment.stylist?.user?.phone
                      : selectedAppointment.client?.user?.phone
                    }
                  </p>
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

              {/* Quick Context Links */}
              {userRole === "stylist" && (
                <div className="pt-4 border-t space-y-2">
                  <p className="text-sm font-medium mb-3">Quick Actions</p>
                  <div className="grid gap-2">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start gap-2" 
                      size="sm"
                      onClick={() => {
                        navigate(`/clients?view=${selectedAppointment.client_id}`);
                        setDetailsOpen(false);
                      }}
                    >
                      <User className="h-4 w-4" />
                      View Client History
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start gap-2"
                      size="sm" 
                      onClick={() => {
                        navigate(`/formulas?client=${selectedAppointment.client_id}`);
                        setDetailsOpen(false);
                      }}
                    >
                      <FileText className="h-4 w-4" />
                      View Client Formulas
                    </Button>
                    <Button 
                      variant="default" 
                      className="w-full justify-start gap-2"
                      size="sm" 
                      onClick={() => {
                        navigate(`/formulas?new=true&client=${selectedAppointment.client_id}`);
                        setDetailsOpen(false);
                      }}
                    >
                      <Plus className="h-4 w-4" />
                      Create New Formula
                    </Button>
                  </div>
                </div>
              )}

              {userRole === "stylist" && selectedAppointment.status === "scheduled" && (
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    className="flex-1 min-h-[44px]"
                    onClick={() => updateAppointmentStatus(selectedAppointment.id, "confirmed")}
                    disabled={updatingStatus === selectedAppointment.id}
                  >
                    {updatingStatus === selectedAppointment.id ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Confirming...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Confirm
                      </>
                    )}
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1 min-h-[44px]"
                    onClick={() => updateAppointmentStatus(selectedAppointment.id, "cancelled")}
                    disabled={updatingStatus === selectedAppointment.id}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              )}

              {userRole === "stylist" && selectedAppointment.status === "confirmed" && (
                <div className="flex gap-3 pt-4">
                  <Button
                    className="flex-1 min-h-[44px]"
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
                <div className="pt-4 space-y-2">
                  <Button
                    className="w-full"
                    onClick={() => {
                      setRebookAppointment(selectedAppointment);
                      setRebookDialogOpen(true);
                      setDetailsOpen(false);
                    }}
                  >
                    <Repeat className="h-4 w-4 mr-2" />
                    Book Again
                  </Button>
                  {userRole === "client" && (
                    <QuickReviewButton
                      appointmentId={selectedAppointment.id}
                      stylistId={selectedAppointment.stylist_id}
                      stylistName={selectedAppointment.stylist?.business_name || selectedAppointment.stylist?.user?.full_name || "Your Stylist"}
                      onSuccess={loadData}
                      className="relative w-full h-10 rounded-lg"
                    />
                  )}
                </div>
              )}

              {userRole === "client" && ["scheduled", "confirmed"].includes(selectedAppointment.status) && (
                <div className="pt-4">
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => updateAppointmentStatus(selectedAppointment.id, "cancelled")}
                    disabled={updatingStatus === selectedAppointment.id}
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

      <RescheduleDialog
        open={rescheduleDialogOpen}
        onOpenChange={setRescheduleDialogOpen}
        appointment={rescheduleAppointment}
        onSuccess={loadData}
      />

      <WaitlistDialog />

      {/* Quick Review Button - shows for completed client appointments */}
      {userRole === "client" && selectedAppointment?.status === "completed" && selectedAppointment?.stylist_id && (
        <QuickReviewButton
          appointmentId={selectedAppointment.id}
          stylistId={selectedAppointment.stylist_id}
          stylistName={selectedAppointment.stylist?.business_name || selectedAppointment.stylist?.user?.full_name || "Your Stylist"}
          onSuccess={loadData}
        />
      )}
    </div>
  );
};

export default Appointments;
