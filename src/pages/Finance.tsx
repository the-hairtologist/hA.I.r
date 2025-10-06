import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { DollarSign, TrendingUp, Loader2, Plus, Copy, ExternalLink, Tag } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const Finance = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("payments");
  const [payments, setPayments] = useState<any[]>([]);
  const [commissions, setCommissions] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [affiliateCodes, setAffiliateCodes] = useState<any[]>([]);
  const [stylistProfile, setStylistProfile] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Handle hash navigation
    const hash = location.hash.replace('#', '');
    if (hash === 'commissions') {
      setActiveTab('commissions');
    } else if (hash === 'affiliate') {
      setActiveTab('affiliate');
    }
  }, [location.hash]);

  const loadData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      console.log("Finance: Loading stylist profile for user:", session.user.id);

      const { data: stylist, error: stylistError } = await supabase
        .from("stylist_profiles")
        .select("*")
        .eq("user_id", session.user.id)
        .maybeSingle();

      console.log("Finance: Stylist profile query result:", { stylist, stylistError });

      if (stylistError) {
        console.error("Error fetching stylist profile:", stylistError);
        toast.error("Failed to load stylist profile");
        navigate("/dashboard");
        return;
      }

      if (!stylist) {
        console.warn("Finance: No stylist profile found for user");
        toast.error("Stylist profile not found. Please complete your profile first.");
        navigate("/settings");
        return;
      }

      setStylistProfile(stylist);

      // Load payments
      const { data: paymentsData } = await supabase
        .from("payments")
        .select(`
          *,
          client:client_profiles(
            user:profiles(full_name)
          ),
          appointment:appointments(service_type)
        `)
        .eq("stylist_id", stylist.id)
        .order("created_at", { ascending: false });

      setPayments(paymentsData || []);

      // Load commissions
      const { data: commissionsData } = await supabase
        .from("commissions")
        .select(`
          *,
          brand:hair_brands(name, logo_url)
        `)
        .eq("stylist_id", stylist.id)
        .order("created_at", { ascending: false });

      setCommissions(commissionsData || []);

      // Load brands
      const { data: brandsData } = await supabase
        .from("hair_brands")
        .select("*")
        .eq("is_active", true);

      setBrands(brandsData || []);

      // Load affiliate codes
      const { data: codesData } = await supabase
        .from("stylist_affiliate_codes")
        .select(`
          *,
          brand:hair_brands(*)
        `)
        .eq("stylist_id", stylist.id)
        .eq("is_active", true);

      setAffiliateCodes(codesData || []);
    } catch (error: any) {
      console.error("Error loading data:", error);
      toast.error("Failed to load financial data");
    } finally {
      setLoading(false);
    }
  };

  const totalPayments = payments
    .filter(p => p.status === "completed")
    .reduce((sum, p) => sum + parseFloat(p.amount), 0);

  const totalCommissions = commissions
    .filter(c => c.status === "paid")
    .reduce((sum, c) => sum + parseFloat(c.commission_amount), 0);

  const pendingCommissions = commissions
    .filter(c => c.status === "pending")
    .reduce((sum, c) => sum + parseFloat(c.commission_amount), 0);

  const totalRevenue = totalPayments + totalCommissions;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <PageHeader
        title="Finance"
        icon={<DollarSign className="h-6 w-6" />}
        backTo="/dashboard"
      />

      <main className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 max-w-6xl">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card className="border-[2px] sm:border-[3px] border-foreground shadow-[3px_3px_0px_0px_hsl(var(--foreground))] sm:shadow-[4px_4px_0px_0px_hsl(var(--foreground))]">
            <CardHeader className="pb-2 p-4 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="text-2xl sm:text-3xl font-bold text-primary">
                ${totalRevenue.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">All time earnings</p>
            </CardContent>
          </Card>

          <Card className="border-[3px] border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Service Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                ${totalPayments.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Client payments</p>
            </CardContent>
          </Card>

          <Card className="border-[3px] border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Commissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">
                ${totalCommissions.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                ${pendingCommissions.toFixed(2)} pending
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-3 h-auto">
            <TabsTrigger value="payments" className="min-h-[44px] text-xs sm:text-sm px-2 sm:px-4">Service Payments</TabsTrigger>
            <TabsTrigger value="commissions" className="min-h-[44px] text-xs sm:text-sm px-2 sm:px-4">Product Commissions</TabsTrigger>
            <TabsTrigger value="affiliate" className="min-h-[44px] text-xs sm:text-sm px-2 sm:px-4">Affiliate Codes</TabsTrigger>
          </TabsList>

          {/* Payments Tab */}
          <TabsContent value="payments">
            <Card className="border-[3px] border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))]">
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
                <CardDescription>Track service payments from clients</CardDescription>
              </CardHeader>
              <CardContent>
                {payments.length === 0 ? (
                  <div className="text-center py-12">
                    <DollarSign className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No payments recorded yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {payments.map((payment) => (
                      <div
                        key={payment.id}
                        className="flex items-center justify-between p-4 border-[2px] border-foreground rounded-lg hover:bg-secondary/5 transition-colors"
                      >
                        <div>
                          <p className="font-semibold">
                            {payment.client?.user?.full_name || "Walk-in Client"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {payment.appointment?.service_type || "Service Payment"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(payment.created_at), "MMM d, yyyy")}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg text-green-600">
                            ${parseFloat(payment.amount).toFixed(2)}
                          </p>
                          <Badge variant="outline">{payment.payment_method}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Commissions Tab */}
          <TabsContent value="commissions">
            <Card className="border-[3px] border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))]">
              <CardHeader>
                <CardTitle>Commission Earnings</CardTitle>
                <CardDescription>Track product affiliate commissions</CardDescription>
              </CardHeader>
              <CardContent>
                {commissions.length === 0 ? (
                  <div className="text-center py-12">
                    <TrendingUp className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No commissions recorded yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {commissions.map((commission) => (
                      <div
                        key={commission.id}
                        className="flex items-center justify-between p-4 border-[2px] border-foreground rounded-lg hover:bg-secondary/5 transition-colors"
                      >
                        <div>
                          <p className="font-semibold">{commission.product_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {commission.brand?.name || "Unknown Brand"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(commission.created_at), "MMM d, yyyy")}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg text-purple-600">
                            ${parseFloat(commission.commission_amount).toFixed(2)}
                          </p>
                          <Badge variant={commission.status === "paid" ? "default" : "secondary"}>
                            {commission.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Affiliate Codes Tab */}
          <TabsContent value="affiliate">
            <div className="grid md:grid-cols-2 gap-6">
              {brands.map((brand) => {
                const affiliateCode = affiliateCodes.find(c => c.brand_id === brand.id);
                const commissionRate = affiliateCode?.custom_commission_rate || brand.base_commission_rate;

                return (
                  <Card key={brand.id} className="border-[3px] border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))]">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle>{brand.name}</CardTitle>
                          <CardDescription>
                            Commission: {(commissionRate * 100).toFixed(0)}%
                          </CardDescription>
                        </div>
                        {brand.affiliate_program_url && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(brand.affiliate_program_url, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      {affiliateCode ? (
                        <div className="space-y-3">
                          <div className="bg-muted/50 p-4 rounded-lg">
                            <Label className="text-xs text-muted-foreground">Your Code</Label>
                            <div className="flex items-center gap-2 mt-1">
                              <code className="flex-1 text-lg font-bold text-primary">
                                {affiliateCode.referral_code}
                              </code>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => copyToClipboard(affiliateCode.referral_code)}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-sm text-muted-foreground mb-3">
                            Generate your affiliate code
                          </p>
                          <Button variant="outline" size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Generate Code
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Finance;
