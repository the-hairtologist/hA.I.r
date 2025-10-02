import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowLeft, Clock, Calendar, Save, Loader2 } from "lucide-react";

interface DaySchedule {
  enabled: boolean;
  startTime: string;
  endTime: string;
}

const Availability = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [stylistProfile, setStylistProfile] = useState<any>(null);

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
      
      // Load saved schedule from database
      if (stylist.weekly_schedule) {
        setSchedule(stylist.weekly_schedule as unknown as Record<string, DaySchedule>);
      }
    } catch (error: any) {
      console.error("Error loading data:", error);
      toast.error("Error loading availability");
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
      toast.success("Availability saved successfully!");
    } catch (error: any) {
      console.error("Error saving availability:", error);
      toast.error("Failed to save availability");
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
                <Calendar className="h-6 w-6 text-primary" />
                <h1 className="text-2xl font-bold">Availability Settings</h1>
              </div>
            </div>
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
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
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
        </div>
      </main>
    </div>
  );
};

export default Availability;
