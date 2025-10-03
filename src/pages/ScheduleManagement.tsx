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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ArrowLeft, Clock, Calendar as CalendarIcon, Save, Loader2, Plus, Trash2, X, CalendarDays, CalendarRange } from "lucide-react";
import { format, addMonths, startOfMonth, endOfMonth, eachDayOfInterval, addDays, startOfYear, endOfYear } from "date-fns";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";
import { Textarea } from "@/components/ui/textarea";

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
  const [rangeDialogOpen, setRangeDialogOpen] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [rangeReason, setRangeReason] = useState("");
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDatesInMonth, setSelectedDatesInMonth] = useState<Date[]>([]);
  const [scheduleOverrides, setScheduleOverrides] = useState<any[]>([]);
  const [overrideDialogOpen, setOverrideDialogOpen] = useState(false);
  const [overrideLabel, setOverrideLabel] = useState("");
  const [overrideDateRange, setOverrideDateRange] = useState<DateRange | undefined>();
  const [overrideSchedule, setOverrideSchedule] = useState<Record<string, DaySchedule> | null>(null);
  const [editingOverride, setEditingOverride] = useState<any>(null);

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
    loadScheduleOverrides();
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

  const loadScheduleOverrides = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: stylist } = await supabase
        .from("stylist_profiles")
        .select("id")
        .eq("user_id", session.user.id)
        .single();

      if (!stylist) return;

      const { data, error } = await supabase
        .from("stylist_schedule_overrides")
        .select("*")
        .eq("stylist_id", stylist.id)
        .order("start_date");

      if (error) throw error;
      setScheduleOverrides(data || []);
    } catch (error) {
      console.error("Error loading schedule overrides:", error);
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
      loadScheduleOverrides();
    } catch (error: any) {
      console.error("Error saving schedule:", error);
      toast.error("Failed to save schedule");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveOverride = async () => {
    if (!overrideDateRange?.from || !overrideDateRange?.to || !overrideSchedule || !stylistProfile) {
      toast.error("Please complete all fields");
      return;
    }

    setSaving(true);
    try {
      const overrideData = {
        stylist_id: stylistProfile.id,
        start_date: format(overrideDateRange.from, 'yyyy-MM-dd'),
        end_date: format(overrideDateRange.to, 'yyyy-MM-dd'),
        weekly_schedule: overrideSchedule as any,
        label: overrideLabel || null,
      };

      if (editingOverride) {
        const { error } = await supabase
          .from("stylist_schedule_overrides")
          .update(overrideData)
          .eq("id", editingOverride.id);

        if (error) throw error;
        toast.success("Schedule override updated!");
      } else {
        const { error } = await supabase
          .from("stylist_schedule_overrides")
          .insert(overrideData);

        if (error) throw error;
        toast.success("Schedule override created!");
      }

      setOverrideDialogOpen(false);
      setOverrideLabel("");
      setOverrideDateRange(undefined);
      setOverrideSchedule(null);
      setEditingOverride(null);
      loadScheduleOverrides();
    } catch (error) {
      console.error("Error saving override:", error);
      toast.error("Failed to save schedule override");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteOverride = async (id: string) => {
    try {
      const { error } = await supabase
        .from("stylist_schedule_overrides")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Schedule override deleted!");
      loadScheduleOverrides();
    } catch (error) {
      console.error("Error deleting override:", error);
      toast.error("Failed to delete schedule override");
    }
  };

  const handleEditOverride = (override: any) => {
    setEditingOverride(override);
    setOverrideLabel(override.label || "");
    setOverrideDateRange({
      from: new Date(override.start_date),
      to: new Date(override.end_date),
    });
    setOverrideSchedule(override.weekly_schedule);
    setOverrideDialogOpen(true);
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

  const handleBlockDateRange = async () => {
    if (!dateRange?.from) {
      toast.error("Please select a date range");
      return;
    }

    const endDate = dateRange.to || dateRange.from;
    const dates = eachDayOfInterval({ start: dateRange.from, end: endDate });

    setSubmitting(true);
    try {
      const datesToInsert = dates.map(date => ({
        stylist_id: stylistProfile.id,
        blocked_date: format(date, 'yyyy-MM-dd'),
        reason: rangeReason.trim() || null,
      }));

      const { error } = await supabase
        .from("stylist_blocked_dates")
        .insert(datesToInsert);

      if (error) throw error;

      toast.success(`${dates.length} date(s) blocked successfully!`);
      setRangeDialogOpen(false);
      setDateRange(undefined);
      setRangeReason("");
      loadData();
    } catch (error: any) {
      console.error("Error blocking date range:", error);
      toast.error("Error blocking dates");
    } finally {
      setSubmitting(false);
    }
  };

  const handleBlockMultipleDates = async () => {
    if (selectedDatesInMonth.length === 0) {
      toast.error("Please select at least one date");
      return;
    }

    setSubmitting(true);
    try {
      const datesToInsert = selectedDatesInMonth.map(date => ({
        stylist_id: stylistProfile.id,
        blocked_date: format(date, 'yyyy-MM-dd'),
        reason: reason.trim() || null,
      }));

      const { error } = await supabase
        .from("stylist_blocked_dates")
        .insert(datesToInsert);

      if (error) throw error;

      toast.success(`${selectedDatesInMonth.length} date(s) blocked successfully!`);
      setSelectedDatesInMonth([]);
      setReason("");
      loadData();
    } catch (error: any) {
      console.error("Error blocking dates:", error);
      toast.error("Error blocking dates");
    } finally {
      setSubmitting(false);
    }
  };

  const blockedDatesArray = blockedDates.map(bd => new Date(bd.blocked_date));
  
  const isDateBlocked = (date: Date) => {
    return blockedDatesArray.some(
      blocked => format(blocked, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
  };

  const isDateSelected = (date: Date) => {
    return selectedDatesInMonth.some(
      selected => format(selected, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
  };

  const toggleDateSelection = (date: Date) => {
    if (isDateBlocked(date)) return;
    
    if (isDateSelected(date)) {
      setSelectedDatesInMonth(selectedDatesInMonth.filter(
        d => format(d, 'yyyy-MM-dd') !== format(date, 'yyyy-MM-dd')
      ));
    } else {
      setSelectedDatesInMonth([...selectedDatesInMonth, date]);
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
          <TabsList className="grid w-full max-w-4xl mx-auto grid-cols-5">
            <TabsTrigger value="availability" className="gap-2">
              <Clock className="h-4 w-4" />
              Weekly
            </TabsTrigger>
            <TabsTrigger value="overrides" className="gap-2">
              <CalendarIcon className="h-4 w-4" />
              Overrides
            </TabsTrigger>
            <TabsTrigger value="blocked" className="gap-2">
              <X className="h-4 w-4" />
              Blocked Dates
            </TabsTrigger>
            <TabsTrigger value="month" className="gap-2">
              <CalendarDays className="h-4 w-4" />
              Month View
            </TabsTrigger>
            <TabsTrigger value="year" className="gap-2">
              <CalendarRange className="h-4 w-4" />
              Year View
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

          {/* Schedule Overrides Tab */}
          <TabsContent value="overrides" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Schedule Overrides</CardTitle>
                    <CardDescription>Set different working hours for specific date ranges (holidays, seasonal hours, etc.)</CardDescription>
                  </div>
                  <Dialog open={overrideDialogOpen} onOpenChange={(open) => {
                    setOverrideDialogOpen(open);
                    if (!open) {
                      setEditingOverride(null);
                      setOverrideLabel("");
                      setOverrideDateRange(undefined);
                      setOverrideSchedule(null);
                    }
                  }}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Override
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>{editingOverride ? 'Edit' : 'Add'} Schedule Override</DialogTitle>
                        <DialogDescription>
                          Set custom working hours for a specific date range
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Label (Optional)</Label>
                          <Input
                            placeholder="e.g., Summer Hours, Holiday Season"
                            value={overrideLabel}
                            onChange={(e) => setOverrideLabel(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Date Range *</Label>
                          <Calendar
                            mode="range"
                            selected={overrideDateRange}
                            onSelect={setOverrideDateRange}
                            numberOfMonths={2}
                            className="border rounded-md pointer-events-auto"
                            disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Working Hours for This Period *</Label>
                          {!overrideSchedule ? (
                            <div className="space-y-2">
                              <p className="text-sm text-muted-foreground">
                                Choose a template to start with:
                              </p>
                              <div className="grid grid-cols-2 gap-2">
                                <Button
                                  variant="outline"
                                  onClick={() => setOverrideSchedule(schedule)}
                                >
                                  Use Current Schedule
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() => setOverrideSchedule({
                                    monday: { enabled: true, startTime: "09:00", endTime: "17:00" },
                                    tuesday: { enabled: true, startTime: "09:00", endTime: "17:00" },
                                    wednesday: { enabled: true, startTime: "09:00", endTime: "17:00" },
                                    thursday: { enabled: true, startTime: "09:00", endTime: "17:00" },
                                    friday: { enabled: true, startTime: "09:00", endTime: "17:00" },
                                    saturday: { enabled: false, startTime: "10:00", endTime: "16:00" },
                                    sunday: { enabled: false, startTime: "10:00", endTime: "16:00" },
                                  })}
                                >
                                  Standard Hours
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-3 border rounded-lg p-4">
                              <div className="flex justify-between items-center">
                                <h4 className="font-semibold">Custom Schedule</h4>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setOverrideSchedule(null)}
                                >
                                  Reset
                                </Button>
                              </div>
                              {days.map(({ key, label }) => {
                                const daySchedule = overrideSchedule[key];
                                return (
                                  <div key={key} className="flex items-center gap-4">
                                    <div className="w-28">
                                      <span className="font-medium">{label}</span>
                                    </div>
                                    <Switch
                                      checked={daySchedule.enabled}
                                      onCheckedChange={(checked) => {
                                        setOverrideSchedule({
                                          ...overrideSchedule,
                                          [key]: { ...daySchedule, enabled: checked }
                                        });
                                      }}
                                    />
                                    {daySchedule.enabled && (
                                      <>
                                        <input
                                          type="time"
                                          value={daySchedule.startTime}
                                          onChange={(e) => {
                                            setOverrideSchedule({
                                              ...overrideSchedule,
                                              [key]: { ...daySchedule, startTime: e.target.value }
                                            });
                                          }}
                                          className="px-3 py-1 border rounded-md bg-background text-sm"
                                        />
                                        <span className="text-sm">to</span>
                                        <input
                                          type="time"
                                          value={daySchedule.endTime}
                                          onChange={(e) => {
                                            setOverrideSchedule({
                                              ...overrideSchedule,
                                              [key]: { ...daySchedule, endTime: e.target.value }
                                            });
                                          }}
                                          className="px-3 py-1 border rounded-md bg-background text-sm"
                                        />
                                      </>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setOverrideDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleSaveOverride}
                          disabled={saving || !overrideDateRange?.from || !overrideDateRange?.to || !overrideSchedule}
                        >
                          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : editingOverride ? 'Update' : 'Create'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {scheduleOverrides.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="font-semibold mb-1">No schedule overrides set</p>
                    <p className="text-sm">Create overrides for special hours during holidays, vacations, seasonal changes, etc.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {scheduleOverrides.map((override) => (
                      <Card key={override.id} className="border-2">
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              {override.label && (
                                <h4 className="font-semibold mb-1">{override.label}</h4>
                              )}
                              <p className="text-sm text-muted-foreground mb-2">
                                {format(new Date(override.start_date), 'MMM d, yyyy')} - {format(new Date(override.end_date), 'MMM d, yyyy')}
                              </p>
                              <div className="text-xs space-y-1">
                                {Object.entries(override.weekly_schedule as Record<string, DaySchedule>).map(([day, daySchedule]) => (
                                  daySchedule.enabled && (
                                    <div key={day} className="flex items-center gap-2">
                                      <span className="capitalize font-medium w-24">{day}:</span>
                                      <span>{daySchedule.startTime} - {daySchedule.endTime}</span>
                                    </div>
                                  )
                                ))}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditOverride(override)}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteOverride(override.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
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

          <TabsContent value="month" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Schedule View</CardTitle>
                <CardDescription>Select multiple dates in a month to block at once</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentMonth(addMonths(currentMonth, -1))}
                  >
                    Previous Month
                  </Button>
                  <h3 className="text-lg font-semibold">
                    {format(currentMonth, 'MMMM yyyy')}
                  </h3>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                  >
                    Next Month
                  </Button>
                </div>

                <div className="space-y-4">
                  <Calendar
                    mode="single"
                    month={currentMonth}
                    onMonthChange={setCurrentMonth}
                    modifiers={{
                      blocked: blockedDatesArray,
                      selected: selectedDatesInMonth,
                    }}
                    modifiersClassNames={{
                      blocked: "bg-destructive/20 text-destructive line-through",
                      selected: "bg-primary text-primary-foreground",
                    }}
                    onDayClick={toggleDateSelection}
                    className={cn("rounded-md border pointer-events-auto")}
                  />

                  <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-primary rounded"></div>
                      <span className="text-sm">Selected dates ({selectedDatesInMonth.length})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-destructive/20 rounded line-through"></div>
                      <span className="text-sm">Already blocked</span>
                    </div>
                  </div>

                  {selectedDatesInMonth.length > 0 && (
                    <div className="space-y-4 p-4 border rounded-lg">
                      <div>
                        <Label htmlFor="month-reason">Reason (Optional)</Label>
                        <Input
                          id="month-reason"
                          placeholder="e.g., Vacation, Holiday"
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                          className="mt-2"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSelectedDatesInMonth([]);
                            setReason("");
                          }}
                          className="flex-1"
                        >
                          Clear Selection
                        </Button>
                        <Button
                          onClick={handleBlockMultipleDates}
                          disabled={submitting}
                          className="flex-1"
                        >
                          {submitting ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Blocking...
                            </>
                          ) : (
                            <>Block {selectedDatesInMonth.length} Date(s)</>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="year" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Year View - Block Date Ranges</CardTitle>
                <CardDescription>Perfect for planning vacations and extended time off</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Dialog open={rangeDialogOpen} onOpenChange={setRangeDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full">
                      <CalendarRange className="h-4 w-4 mr-2" />
                      Block Date Range
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Block a Date Range</DialogTitle>
                      <DialogDescription>
                        Select start and end dates for your time off
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Select Date Range</Label>
                        <Calendar
                          mode="range"
                          selected={dateRange}
                          onSelect={setDateRange}
                          numberOfMonths={2}
                          disabled={blockedDatesArray}
                          className={cn("rounded-md border pointer-events-auto")}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="range-reason">Reason (Optional)</Label>
                        <Input
                          id="range-reason"
                          placeholder="e.g., Summer Vacation, Conference"
                          value={rangeReason}
                          onChange={(e) => setRangeReason(e.target.value)}
                        />
                      </div>
                      <Button
                        onClick={handleBlockDateRange}
                        disabled={submitting || !dateRange?.from}
                        className="w-full"
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Blocking...
                          </>
                        ) : (
                          "Block Date Range"
                        )}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 12 }, (_, i) => {
                    const monthDate = addMonths(startOfYear(new Date()), i);
                    const monthStart = startOfMonth(monthDate);
                    const monthEnd = endOfMonth(monthDate);
                    const blockedInMonth = blockedDates.filter(bd => {
                      const date = new Date(bd.blocked_date);
                      return date >= monthStart && date <= monthEnd;
                    }).length;

                    return (
                      <Card key={i} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base">
                            {format(monthDate, 'MMMM yyyy')}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Blocked dates:</span>
                              <Badge variant={blockedInMonth > 0 ? "default" : "outline"}>
                                {blockedInMonth}
                              </Badge>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full"
                              onClick={() => {
                                setCurrentMonth(monthDate);
                                document.querySelector('[value="month"]')?.dispatchEvent(new Event('click', { bubbles: true }));
                              }}
                            >
                              View Month
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default ScheduleManagement;
