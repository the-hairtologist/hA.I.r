import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Calendar as CalendarIcon, ArrowLeft, Plus, Loader2, Trash2, X } from "lucide-react";
import { format, startOfDay } from "date-fns";

const BlockedDates = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [blockedDates, setBlockedDates] = useState<any[]>([]);
  const [stylistProfile, setStylistProfile] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

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

      const { data: datesData } = await supabase
        .from("stylist_blocked_dates")
        .select("*")
        .eq("stylist_id", stylist.id)
        .order("blocked_date", { ascending: true });

      setBlockedDates(datesData || []);
    } catch (error: any) {
      console.error("Error loading data:", error);
      toast.error("Error loading blocked dates");
    } finally {
      setLoading(false);
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
                <X className="h-6 w-6 text-primary" />
                <h1 className="text-2xl font-bold">Blocked Dates</h1>
              </div>
            </div>
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
                      className="rounded-md border"
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
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {blockedDates.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <X className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-xl font-semibold mb-2">No blocked dates</p>
              <p className="text-muted-foreground mb-4">Block dates when you're unavailable</p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Block Date
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {blockedDates.map((blockedDate) => (
              <Card key={blockedDate.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{format(new Date(blockedDate.blocked_date), 'EEEE, MMMM d, yyyy')}</CardTitle>
                      {blockedDate.reason && (
                        <CardDescription className="mt-1">{blockedDate.reason}</CardDescription>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveBlockedDate(blockedDate.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default BlockedDates;