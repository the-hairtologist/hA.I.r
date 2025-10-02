import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { DollarSign, ArrowLeft, Plus, CreditCard, CheckCircle, Clock, Loader2, Search } from "lucide-react";
import { format } from "date-fns";

const Payments = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [stylistProfile, setStylistProfile] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Form state
  const [selectedAppointment, setSelectedAppointment] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");

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

      // Get payments
      const { data: paymentsData } = await supabase
        .from("payments")
        .select(`
          *,
          appointment:appointments(
            id,
            service_type,
            appointment_date
          ),
          client:client_profiles(
            id,
            user:profiles(full_name, email)
          )
        `)
        .eq("stylist_id", stylist.id)
        .order("created_at", { ascending: false });

      setPayments(paymentsData || []);

      // Get completed appointments without payment
      const { data: appointmentsData } = await supabase
        .from("appointments")
        .select(`
          *,
          client:client_profiles(
            id,
            user:profiles(full_name, email)
          )
        `)
        .eq("stylist_id", stylist.id)
        .eq("status", "completed")
        .order("appointment_date", { ascending: false });

      // Filter out appointments that already have payments
      const paidAppointmentIds = paymentsData?.map(p => p.appointment_id).filter(Boolean) || [];
      const unpaidAppointments = appointmentsData?.filter(
        apt => !paidAppointmentIds.includes(apt.id)
      ) || [];

      setAppointments(unpaidAppointments);
    } catch (error: any) {
      console.error("Error loading data:", error);
      toast.error("Error loading payments");
    } finally {
      setLoading(false);
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount) {
      toast.error("Please enter an amount");
      return;
    }

    const paymentAmount = parseFloat(amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setSubmitting(true);
    try {
      // Get appointment details if selected
      let clientId = null;
      if (selectedAppointment) {
        const appointment = appointments.find(apt => apt.id === selectedAppointment);
        clientId = appointment?.client_id;
      }

      const { error } = await supabase
        .from("payments")
        .insert({
          stylist_id: stylistProfile.id,
          client_id: clientId,
          appointment_id: selectedAppointment || null,
          amount: paymentAmount,
          payment_method: paymentMethod,
          status: "completed",
        });

      if (error) throw error;

      toast.success("Payment recorded successfully!");
      setDialogOpen(false);
      setSelectedAppointment("");
      setAmount("");
      setPaymentMethod("cash");
      loadData();
    } catch (error: any) {
      console.error("Error recording payment:", error);
      toast.error("Error recording payment");
    } finally {
      setSubmitting(false);
    }
  };

  const totalRevenue = payments
    .filter(p => p.status === "completed")
    .reduce((sum, p) => sum + parseFloat(p.amount), 0);

  const thisMonthRevenue = payments
    .filter(p => {
      const paymentDate = new Date(p.created_at);
      const now = new Date();
      return p.status === "completed" && 
             paymentDate.getMonth() === now.getMonth() &&
             paymentDate.getFullYear() === now.getFullYear();
    })
    .reduce((sum, p) => sum + parseFloat(p.amount), 0);

  const filteredPayments = payments.filter(payment =>
    payment.client?.user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.appointment?.service_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.payment_method?.toLowerCase().includes(searchTerm.toLowerCase())
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
                <CreditCard className="h-6 w-6 text-primary" />
                <h1 className="text-2xl font-bold">Payment Tracking</h1>
              </div>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Record Payment
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Record Payment</DialogTitle>
                  <DialogDescription>
                    Track payments received from clients
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleRecordPayment} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="appointment">Link to Appointment (Optional)</Label>
                    <Select value={selectedAppointment} onValueChange={setSelectedAppointment}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select appointment" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover z-50">
                        {appointments.map((apt) => (
                          <SelectItem key={apt.id} value={apt.id}>
                            {apt.client?.user?.full_name} - {apt.service_type} ({format(new Date(apt.appointment_date), "MMM d")})
                          </SelectItem>
                        ))}
                        {appointments.length === 0 && (
                          <div className="p-2 text-sm text-muted-foreground">
                            No unpaid completed appointments
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount ($) *</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="method">Payment Method</Label>
                    <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover z-50">
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="card">Card</SelectItem>
                        <SelectItem value="tap">Tap to Pay</SelectItem>
                        <SelectItem value="venmo">Venmo</SelectItem>
                        <SelectItem value="zelle">Zelle</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button type="submit" disabled={submitting} className="w-full">
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Recording...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Record Payment
                      </>
                    )}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Summary Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">
                ${totalRevenue.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                All time earnings
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                This Month
              </CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                ${thisMonthRevenue.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Current month revenue
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Payments List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Payment History</CardTitle>
                <CardDescription>All payments received from clients</CardDescription>
              </div>
              {payments.length > 0 && (
                <div className="relative w-64">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search payments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {filteredPayments.length === 0 && payments.length === 0 ? (
              <div className="text-center py-12">
                <CreditCard className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-xl font-semibold mb-2">No payments recorded</p>
                <p className="text-muted-foreground mb-4">
                  Start tracking your payments
                </p>
                <Button onClick={() => setDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Record First Payment
                </Button>
              </div>
            ) : filteredPayments.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No payments match your search</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredPayments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/5 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-primary/10 p-3 rounded-lg">
                        <CreditCard className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">
                          {payment.client?.user?.full_name || "Walk-in Client"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {payment.appointment?.service_type || "Service Payment"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(payment.created_at), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-green-600">
                        ${parseFloat(payment.amount).toFixed(2)}
                      </p>
                      <Badge variant="outline" className="mt-1">
                        {payment.payment_method}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Unpaid Appointments Alert */}
        {appointments.length > 0 && (
          <Card className="mt-6 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-amber-600" />
                <CardTitle className="text-lg">Unpaid Appointments</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                You have {appointments.length} completed appointment{appointments.length !== 1 ? 's' : ''} without recorded payments
              </p>
              <Button variant="outline" onClick={() => setDialogOpen(true)}>
                Record Payment
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Payments;
