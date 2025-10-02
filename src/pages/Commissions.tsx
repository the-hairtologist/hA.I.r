import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { DollarSign, ArrowLeft, Plus, TrendingUp, CheckCircle, Clock, Loader2 } from "lucide-react";
import { format } from "date-fns";

const Commissions = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [commissions, setCommissions] = useState<any[]>([]);
  const [stylistProfile, setStylistProfile] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [productName, setProductName] = useState("");
  const [productUrl, setProductUrl] = useState("");
  const [commissionAmount, setCommissionAmount] = useState("");

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

      // Get commissions
      const { data: commissionsData } = await supabase
        .from("commissions")
        .select("*")
        .eq("stylist_id", stylist.id)
        .order("created_at", { ascending: false });

      setCommissions(commissionsData || []);
    } catch (error: any) {
      console.error("Error loading data:", error);
      toast.error("Error loading commissions");
    } finally {
      setLoading(false);
    }
  };

  const handleAddCommission = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!productName || !commissionAmount) {
      toast.error("Please fill in required fields");
      return;
    }

    const amount = parseFloat(commissionAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from("commissions")
        .insert({
          stylist_id: stylistProfile.id,
          product_name: productName,
          product_url: productUrl || null,
          commission_amount: amount,
          status: "pending",
        });

      if (error) throw error;

      toast.success("Commission recorded successfully!");
      setDialogOpen(false);
      setProductName("");
      setProductUrl("");
      setCommissionAmount("");
      loadData();
    } catch (error: any) {
      console.error("Error adding commission:", error);
      toast.error("Error recording commission");
    } finally {
      setSubmitting(false);
    }
  };

  const markAsPaid = async (commissionId: string) => {
    try {
      const { error } = await supabase
        .from("commissions")
        .update({ status: "paid" })
        .eq("id", commissionId);

      if (error) throw error;

      toast.success("Commission marked as paid!");
      loadData();
    } catch (error: any) {
      console.error("Error updating commission:", error);
      toast.error("Error updating commission");
    }
  };

  const totalPending = commissions
    .filter(c => c.status === "pending")
    .reduce((sum, c) => sum + parseFloat(c.commission_amount), 0);

  const totalPaid = commissions
    .filter(c => c.status === "paid")
    .reduce((sum, c) => sum + parseFloat(c.commission_amount), 0);

  const totalEarnings = totalPending + totalPaid;

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
                <DollarSign className="h-6 w-6 text-primary" />
                <h1 className="text-2xl font-bold">Commission Tracking</h1>
              </div>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Commission
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Record Product Commission</DialogTitle>
                  <DialogDescription>
                    Track commissions from product sales to clients
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddCommission} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="productName">Product Name *</Label>
                    <Input
                      id="productName"
                      placeholder="e.g., Olaplex No. 3"
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="amount">Commission Amount ($) *</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={commissionAmount}
                      onChange={(e) => setCommissionAmount(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="url">Product Link (Optional)</Label>
                    <Input
                      id="url"
                      type="url"
                      placeholder="https://..."
                      value={productUrl}
                      onChange={(e) => setProductUrl(e.target.value)}
                    />
                  </div>

                  <Button type="submit" disabled={submitting} className="w-full">
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Recording...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Record Commission
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
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Earnings
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">
                ${totalEarnings.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                All time commission earnings
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending
              </CardTitle>
              <Clock className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-600">
                ${totalPending.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Awaiting payment
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Paid
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                ${totalPaid.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Successfully received
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Commissions List */}
        <Card>
          <CardHeader>
            <CardTitle>Commission History</CardTitle>
            <CardDescription>
              Track all your product commission earnings
            </CardDescription>
          </CardHeader>
          <CardContent>
            {commissions.length === 0 ? (
              <div className="text-center py-12">
                <DollarSign className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-xl font-semibold mb-2">No commissions yet</p>
                <p className="text-muted-foreground mb-4">
                  Start tracking product commissions
                </p>
                <Button onClick={() => setDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Commission
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {commissions.map((commission) => (
                  <div
                    key={commission.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/5 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-lg">
                          <DollarSign className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold">{commission.product_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(commission.created_at), "MMM d, yyyy")}
                          </p>
                        </div>
                      </div>
                      {commission.product_url && (
                        <a
                          href={commission.product_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline ml-11 mt-1 inline-block"
                        >
                          View Product →
                        </a>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold text-lg">
                          ${parseFloat(commission.commission_amount).toFixed(2)}
                        </p>
                        <Badge
                          variant={commission.status === "paid" ? "default" : "secondary"}
                        >
                          {commission.status}
                        </Badge>
                      </div>
                      {commission.status === "pending" && (
                        <Button
                          size="sm"
                          onClick={() => markAsPaid(commission.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Mark Paid
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="mt-6 bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg">How Commission Tracking Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• Record commissions when clients purchase products via your referral links</p>
            <p>• Track pending commissions awaiting payment</p>
            <p>• Mark commissions as paid once you receive them</p>
            <p>• View your total earnings at a glance</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Commissions;
