import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ArrowLeft, Clock, Calendar as CalendarIcon, Save, Loader2, Plus, Trash2, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface DaySchedule {
  enabled: boolean;
  startTime: string;
  endTime: string;
}

const ScheduleManagement = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [stylistProfile, setStylistProfile] = useState<any>(null);
  const [blockedDates, setBlockedDates] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [schedule, setSchedule] = useState<Record<string, DaySchedule>>({
    monday: { enabled: true, startTime: "09:00", endTime: "17:00" },
    tuesday: { enabled: true, startTime: "09:00", endTime: "17:00" },
    wednesday: { enabled: true, startTime: "09:00", endTime: "17:00" },
    thursday: { enabled: true, startTime: "09:00", endTime: "17:00" },
    friday: { enabled: true, startTime: "09:00", endTime: "17:00" },
    saturday: { enabled: false, startTime: "10:00", endTime: "16:00" },
    sunday: { enabled: false, startTime: "10:00", endTime: "16:00" },
  });

  const days = [
    { key: "monday", label: "Monday" },
    { key: "tuesday", label: "Tuesday" },
    { key: "wednesday", label: "Wednesday" },
    { key: "thursday", label: "Thursday" },
    { key: "friday", label: "Friday" },
    { key: "saturday", label: "Saturday" },
    { key: "sunday", label: "Sunday" },
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
      
      if (stylist.weekly_schedule) {
        setSchedule(stylist.weekly_schedule as unknown as Record<string, DaySchedule>);
      }

      const { data: datesData } = await supabase
        .from("stylist_blocked_dates")
        .select("*")
        .eq("stylist_id", stylist.id)
        .order("blocked_date", { ascending: true });

      setBlockedDates(datesData || []);
    } catch (error: any) {
      console.error("Error loading data:", error);
      toast.error("Error loading schedule");
    } finally {
      setLoading(false);
    }
  };

  const handleDayToggle = (day: string) => {
    setSchedule({
      ...schedule,
      [day]: { ...schedule[day], enabled: !schedule[day].enabled },
    });
  };

  const handleTimeChange = (day: string, type: "startTime" | "endTime", value: string) => {
    setSchedule({
      ...schedule,
      [day]: { ...schedule[day], [type]: value },
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("stylist_profiles")
        .update({ weekly_schedule: schedule as any })
        .eq("id", stylistProfile.id);

      if (error) throw error;

      setStylistProfile({ ...stylistProfile, weekly_schedule: schedule as any });
      toast.success("Schedule saved successfully!");
    } catch (error: any) {
      console.error("Error saving schedule:", error);
      toast.error("Failed to save schedule");
    } finally {
      setSaving(false);
    }
  };

  const toggleGeneralAvailability = async () => {
    try {
      const { error } = await supabase
        .from("stylist_profiles")
        .update({ is_available: !stylistProfile.is_available })
        .eq("id", stylistProfile.id);

      if (error) throw error;

      setStylistProfile({ ...stylistProfile, is_available: !stylistProfile.is_available });
      toast.success(`You are now ${!stylistProfile.is_available ? 'accepting' : 'not accepting'} bookings`);
    } catch (error: any) {
      console.error("Error updating availability:", error);
      toast.error("Error updating availability");
    }
  };

  const handleAddBlockedDate = async () => {
    if (!selectedDate) {
      toast.error("Please select a date");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from("stylist_blocked_dates")
        .insert({
          stylist_id: stylistProfile.id,
          blocked_date: format(selectedDate, 'yyyy-MM-dd'),
          reason: reason.trim() || null,
        });

      if (error) {
        if (error.code === '23505') {
          toast.error("This date is already blocked");
        } else {
          throw error;
        }
        return;
      }

      toast.success("Date blocked successfully!");
      setDialogOpen(false);
      setSelectedDate(undefined);
      setReason("");
      loadData();
    } catch (error: any) {
      console.error("Error blocking date:", error);
      toast.error("Error blocking date");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveBlockedDate = async (id: string) => {
    if (!confirm("Remove this blocked date?")) return;

    try {
      const { error } = await supabase
        .from("stylist_blocked_dates")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Blocked date removed");
      loadData();
    } catch (error: any) {
      console.error("Error removing blocked date:", error);
      toast.error("Error removing blocked date");
    }
  };

  const blockedDatesArray = blockedDates.map(bd => new Date(bd.blocked_date));

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
                <h1 className="text-2xl font-bold">Schedule Management</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <Tabs defaultValue="availability" className="space-y-6">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="availability" className="gap-2">
              <Clock className="h-4 w-4" />
              Weekly Schedule
            </TabsTrigger>
            <TabsTrigger value="blocked" className="gap-2">
              <X className="h-4 w-4" />
              Blocked Dates
            </TabsTrigger>
          </TabsList>

          <TabsContent value="availability" className="space-y-6">
            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>

            {/* General Availability Toggle */}
            <Card>
              <CardHeader>
                <CardTitle>Booking Status</CardTitle>
                <CardDescription>Control whether clients can book appointments with you</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="general-availability" className="text-base font-semibold">
                      Accepting New Bookings
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Turn off to temporarily stop accepting appointments
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={stylistProfile?.is_available ? "default" : "secondary"}>
                      {stylistProfile?.is_available ? "Available" : "Unavailable"}
                    </Badge>
                    <Switch
                      id="general-availability"
                      checked={stylistProfile?.is_available}
                      onCheckedChange={toggleGeneralAvailability}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Weekly Schedule */}
            <Card>
              <CardHeader>
                <CardTitle>Weekly Schedule</CardTitle>
                <CardDescription>Set your working hours for each day of the week</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {days.map(({ key, label }) => (
                  <div key={key} className="flex items-center gap-4 pb-4 border-b last:border-0">
                    <div className="w-32">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={schedule[key].enabled}
                          onCheckedChange={() => handleDayToggle(key)}
                        />
                        <Label className="font-semibold">{label}</Label>
                      </div>
                    </div>

                    {schedule[key].enabled ? (
                      <div className="flex items-center gap-4 flex-1">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <input
                            type="time"
                            value={schedule[key].startTime}
                            onChange={(e) => handleTimeChange(key, "startTime", e.target.value)}
                            className="px-3 py-2 border rounded-md bg-background text-sm"
                          />
                        </div>
                        <span className="text-muted-foreground">to</span>
                        <input
                          type="time"
                          value={schedule[key].endTime}
                          onChange={(e) => handleTimeChange(key, "endTime", e.target.value)}
                          className="px-3 py-2 border rounded-md bg-background text-sm"
                        />
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground flex-1">Closed</p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    const newSchedule = { ...schedule };
                    Object.keys(newSchedule).forEach(day => {
                      newSchedule[day] = { enabled: true, startTime: "09:00", endTime: "17:00" };
                    });
                    setSchedule(newSchedule);
                    toast.success("Set to business hours (9 AM - 5 PM)");
                  }}
                >
                  Set All to Business Hours (9 AM - 5 PM)
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    const newSchedule = { ...schedule };
                    Object.keys(newSchedule).forEach(day => {
                      if (day === "saturday" || day === "sunday") {
                        newSchedule[day] = { ...newSchedule[day], enabled: false };
                      }
                    });
                    setSchedule(newSchedule);
                    toast.success("Weekends disabled");
                  }}
                >
                  Disable Weekends
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="blocked" className="space-y-6">
            <div className="flex justify-end">
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Block Date
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Block a Date</DialogTitle>
                    <DialogDescription>
                      Mark dates when you're unavailable (vacation, holidays, etc.)
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Select Date</Label>
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        disabled={blockedDatesArray}
                        className={cn("rounded-md border pointer-events-auto")}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reason">Reason (Optional)</Label>
                      <Input
                        id="reason"
                        placeholder="e.g., Vacation, Holiday, Personal"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                      />
                    </div>
                    <Button onClick={handleAddBlockedDate} disabled={submitting || !selectedDate} className="w-full">
                      {submitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Blocking...
                        </>
                      ) : (
                        "Block Date"
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {blockedDates.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <X className="h-16 w-16 text-muted-foreground mb-4" />
                  <p className="text-xl font-semibold mb-2">No blocked dates</p>
                  <p className="text-muted-foreground mb-4">Block dates when you're unavailable for appointments</p>
                  <Button onClick={() => setDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Block Your First Date
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Blocked Dates Overview</CardTitle>
                    <CardDescription>
                      You have {blockedDates.length} date{blockedDates.length !== 1 ? 's' : ''} blocked
                    </CardDescription>
                  </CardHeader>
                </Card>
                {blockedDates.map((blockedDate) => (
                  <Card key={blockedDate.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">
                            {format(new Date(blockedDate.blocked_date), 'EEEE, MMMM d, yyyy')}
                          </CardTitle>
                          {blockedDate.reason && (
                            <CardDescription className="mt-1">{blockedDate.reason}</CardDescription>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveBlockedDate(blockedDate.id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default ScheduleManagement;
