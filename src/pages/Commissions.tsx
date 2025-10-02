import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { DollarSign, ArrowLeft, Plus, TrendingUp, CheckCircle, Clock, Loader2, Copy, ExternalLink, Tag, Calendar } from "lucide-react";
import { format } from "date-fns";

const Commissions = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [commissions, setCommissions] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [affiliateCodes, setAffiliateCodes] = useState<any[]>([]);
  const [stylistProfile, setStylistProfile] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [selectedBrandId, setSelectedBrandId] = useState("");
  const [productName, setProductName] = useState("");
  const [commissionAmount, setCommissionAmount] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");

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

      // Get hair brands
      const { data: brandsData } = await supabase
        .from("hair_brands")
        .select("*")
        .eq("is_active", true)
        .order("name");

      setBrands(brandsData || []);

      // Get stylist's affiliate codes
      const { data: codesData } = await supabase
        .from("stylist_affiliate_codes")
        .select(`
          *,
          brand:hair_brands(*)
        `)
        .eq("stylist_id", stylist.id)
        .eq("is_active", true);

      setAffiliateCodes(codesData || []);

      // Get commissions with brand info
      const { data: commissionsData } = await supabase
        .from("commissions")
        .select(`
          *,
          brand:hair_brands(name, logo_url)
        `)
        .eq("stylist_id", stylist.id)
        .order("created_at", { ascending: false });

      setCommissions(commissionsData || []);
    } catch (error: any) {
      console.error("Error loading data:", error);
      toast.error("Error loading data");
    } finally {
      setLoading(false);
    }
  };

  const generateAffiliateCode = async (brandId: string) => {
    try {
      // Generate unique code based on stylist name and brand
      const code = `${stylistProfile.business_name?.replace(/\s/g, '').toUpperCase().slice(0, 4) || 'STYL'}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      
      const { error } = await supabase
        .from("stylist_affiliate_codes")
        .insert({
          stylist_id: stylistProfile.id,
          brand_id: brandId,
          referral_code: code,
          is_active: true,
        });

      if (error) throw error;

      toast.success("Affiliate code generated!");
      loadData();
    } catch (error: any) {
      console.error("Error generating code:", error);
      toast.error("Error generating affiliate code");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const handleAddCommission = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedBrandId || !productName || !commissionAmount) {
      toast.error("Please fill in all required fields");
      return;
    }

    const amount = parseFloat(commissionAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setSubmitting(true);
    try {
      const affiliateCode = affiliateCodes.find(c => c.brand_id === selectedBrandId);
      
      const { error } = await supabase
        .from("commissions")
        .insert({
          stylist_id: stylistProfile.id,
          brand_id: selectedBrandId,
          product_name: productName,
          commission_amount: amount,
          referral_code_used: affiliateCode?.referral_code || null,
          purchase_date: purchaseDate || null,
          status: "pending",
        });

      if (error) throw error;

      toast.success("Commission recorded successfully!");
      setDialogOpen(false);
      setSelectedBrandId("");
      setProductName("");
      setCommissionAmount("");
      setPurchaseDate("");
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
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2">
              <Tag className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">Affiliate Commissions</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <Tabs defaultValue="codes" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="codes">My Affiliate Codes</TabsTrigger>
            <TabsTrigger value="earnings">Earnings</TabsTrigger>
          </TabsList>

          {/* Affiliate Codes Tab */}
          <TabsContent value="codes" className="space-y-6">
            <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  How It Works
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p>1. <strong>Generate your unique codes</strong> for each hair brand below</p>
                <p>2. <strong>Share your codes</strong> with clients when recommending products</p>
                <p>3. <strong>Clients use your code</strong> when purchasing on brand websites or retail partners</p>
                <p>4. <strong>Track your earnings</strong> manually once commissions are confirmed</p>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              {brands.map((brand) => {
                const affiliateCode = affiliateCodes.find(c => c.brand_id === brand.id);
                const commissionRate = affiliateCode?.custom_commission_rate || brand.base_commission_rate;

                return (
                  <Card key={brand.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-xl">{brand.name}</CardTitle>
                          <CardDescription className="mt-1">
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
                    <CardContent className="space-y-4">
                      {affiliateCode ? (
                        <>
                          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                            <Label className="text-xs text-muted-foreground">Your Affiliate Code</Label>
                            <div className="flex items-center gap-2">
                              <code className="flex-1 text-lg font-bold text-primary bg-background px-3 py-2 rounded border">
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
                          
                          {affiliateCode.affiliate_link && (
                            <div className="space-y-2">
                              <Label className="text-xs text-muted-foreground">Your Affiliate Link</Label>
                              <div className="flex items-center gap-2">
                                <Input
                                  value={affiliateCode.affiliate_link}
                                  readOnly
                                  className="text-xs"
                                />
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => copyToClipboard(affiliateCode.affiliate_link)}
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          )}

                          <p className="text-xs text-muted-foreground">
                            Share this code with your clients. They can use it when purchasing {brand.name} products.
                          </p>
                        </>
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-sm text-muted-foreground mb-3">
                            Generate your unique affiliate code for {brand.name}
                          </p>
                          <Button
                            onClick={() => generateAffiliateCode(brand.id)}
                            variant="outline"
                            className="w-full"
                          >
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

          {/* Earnings Tab */}
          <TabsContent value="earnings" className="space-y-6">
            <div className="flex justify-end">
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Record Commission
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Record Commission Earned</DialogTitle>
                    <DialogDescription>
                      Manually track commissions from client purchases using your affiliate codes
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddCommission} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="brand">Brand *</Label>
                      <Select value={selectedBrandId} onValueChange={setSelectedBrandId} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a brand" />
                        </SelectTrigger>
                        <SelectContent>
                          {brands.map((brand) => (
                            <SelectItem key={brand.id} value={brand.id}>
                              {brand.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

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
                      <Label htmlFor="purchaseDate">Purchase Date (Optional)</Label>
                      <Input
                        id="purchaseDate"
                        type="date"
                        value={purchaseDate}
                        onChange={(e) => setPurchaseDate(e.target.value)}
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

            {/* Summary Cards */}
            <div className="grid md:grid-cols-3 gap-6">
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

            {/* Commission History */}
            <Card>
              <CardHeader>
                <CardTitle>Commission History</CardTitle>
                <CardDescription>
                  Track all affiliate commission earnings
                </CardDescription>
              </CardHeader>
              <CardContent>
                {commissions.length === 0 ? (
                  <div className="text-center py-12">
                    <DollarSign className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-xl font-semibold mb-2">No commissions yet</p>
                    <p className="text-muted-foreground mb-4">
                      Start recording your affiliate commissions
                    </p>
                    <Button onClick={() => setDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Record First Commission
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
                              <Tag className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-semibold">{commission.product_name}</p>
                                {commission.brand && (
                                  <Badge variant="outline" className="text-xs">
                                    {commission.brand.name}
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-3 mt-1">
                                {commission.purchase_date && (
                                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {format(new Date(commission.purchase_date), "MMM d, yyyy")}
                                  </p>
                                )}
                                {commission.referral_code_used && (
                                  <code className="text-xs bg-muted px-2 py-0.5 rounded">
                                    {commission.referral_code_used}
                                  </code>
                                )}
                              </div>
                            </div>
                          </div>
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
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Commissions;
