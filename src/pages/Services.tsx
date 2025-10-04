import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { DollarSign, ArrowLeft, Plus, Edit, Loader2, Trash2, Info } from "lucide-react";
import { HelpTooltip } from "@/components/HelpTooltip";

const Services = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<any[]>([]);
  const [stylistProfile, setStylistProfile] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [serviceName, setServiceName] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("90");
  const [price, setPrice] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [requireDeposit, setRequireDeposit] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [depositType, setDepositType] = useState<"fixed" | "percentage">("fixed");
  const [customBufferTime, setCustomBufferTime] = useState<string>("");
  const [useCustomBuffer, setUseCustomBuffer] = useState(false);

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

      const { data: servicesData } = await supabase
        .from("stylist_services")
        .select("*")
        .eq("stylist_id", stylist.id)
        .order("created_at", { ascending: false });

      setServices(servicesData || []);
    } catch (error: any) {
      console.error("Error loading data:", error);
      toast.error("Error loading services");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setServiceName("");
    setDescription("");
    setDuration("90");
    setPrice("");
    setIsActive(true);
    setRequireDeposit(false);
    setDepositAmount("");
    setDepositType("fixed");
    setCustomBufferTime("");
    setUseCustomBuffer(false);
    setEditingService(null);
  };

  const handleEdit = (service: any) => {
    setEditingService(service);
    setServiceName(service.service_name);
    setDescription(service.description || "");
    setDuration(service.duration_minutes.toString());
    setPrice(service.price);
    setIsActive(service.is_active);
    setRequireDeposit(service.require_deposit || false);
    setDepositAmount(service.deposit_amount?.toString() || "");
    setDepositType(service.deposit_type || "fixed");
    setUseCustomBuffer(service.buffer_time_minutes !== null);
    setCustomBufferTime(service.buffer_time_minutes?.toString() || "");
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent double submission
    if (submitting) {
      return;
    }

    // Validate required fields
    if (!serviceName.trim() || !price || !duration) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Validate field lengths
    if (serviceName.trim().length > 100) {
      toast.error("Service name must be less than 100 characters");
      return;
    }

    if (description.trim().length > 500) {
      toast.error("Description must be less than 500 characters");
      return;
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      toast.error("Please enter a valid price");
      return;
    }

    if (priceNum > 10000) {
      toast.error("Price cannot exceed $10,000");
      return;
    }

    const durationNum = parseInt(duration);
    if (durationNum < 15 || durationNum > 480) {
      toast.error("Duration must be between 15 and 480 minutes");
      return;
    }

    // Validate deposit if required
    if (requireDeposit) {
      const depositNum = parseFloat(depositAmount);
      if (isNaN(depositNum) || depositNum <= 0) {
        toast.error("Please enter a valid deposit amount");
        return;
      }
      if (depositType === "percentage" && depositNum > 100) {
        toast.error("Percentage must be 100 or less");
        return;
      }
      if (depositType === "fixed" && depositNum > priceNum) {
        toast.error("Deposit cannot exceed service price");
        return;
      }
    }

    setSubmitting(true);
    try {
      const serviceData = {
        stylist_id: stylistProfile.id,
        service_name: serviceName.trim(),
        description: description.trim() || null,
        duration_minutes: durationNum,
        price: priceNum,
        is_active: isActive,
        require_deposit: requireDeposit,
        deposit_amount: requireDeposit ? parseFloat(depositAmount) : 0,
        deposit_type: requireDeposit ? depositType : 'fixed',
        buffer_time_minutes: useCustomBuffer && customBufferTime ? parseInt(customBufferTime) : null,
      };

      if (editingService) {
        const { error } = await supabase
          .from("stylist_services")
          .update(serviceData)
          .eq("id", editingService.id);

        if (error) throw error;
        toast.success("Service updated successfully!");
      } else {
        const { error } = await supabase
          .from("stylist_services")
          .insert(serviceData);

        if (error) throw error;
        toast.success("Service added successfully!");
      }

      setDialogOpen(false);
      resetForm();
      loadData();
    } catch (error: any) {
      console.error("Error saving service:", error);
      toast.error("Error saving service");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    const serviceName = service?.service_name || "this service";
    
    if (!confirm(`Delete "${serviceName}"?\n\nThis action cannot be undone. Clients won't be able to book this service anymore.`)) return;

    try {
      const { error } = await supabase
        .from("stylist_services")
        .delete()
        .eq("id", serviceId);

      if (error) throw error;
      toast.success(`${serviceName} deleted successfully`);
      loadData();
    } catch (error: any) {
      console.error("Error deleting service:", error);
      toast.error("Error deleting service");
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
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-teal-400 to-blue-500">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg">
        Skip to main content
      </a>
      <header role="banner" className="border-b-4 border-foreground bg-white/90 backdrop-blur-sm sticky top-0 z-10 shadow-[0_4px_0px_0px_hsl(var(--foreground))]">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")} className="border-2 border-foreground">
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2">
                <DollarSign className="h-6 w-6 text-primary" />
                <h1 className="text-2xl font-bold font-display">Service Pricing</h1>
              </div>
            </div>
            <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Service
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingService ? "Edit Service" : "Add New Service"}</DialogTitle>
                  <DialogDescription>
                    Define your service offerings and pricing
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="serviceName">Service Name *</Label>
                    <Input
                      id="serviceName"
                      placeholder="e.g., Color & Cut"
                      value={serviceName}
                      onChange={(e) => setServiceName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Brief description of the service"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="duration">Duration (minutes) *</Label>
                      <HelpTooltip content="Typical color services: 2-3 hours. Cuts: 30-60 minutes. Include consultation and styling time." />
                    </div>
                    <Input
                      id="duration"
                      type="number"
                      min="15"
                      step="15"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="price">Price ($) *</Label>
                      <HelpTooltip content="Set your price based on your experience, location, and product costs. You can always adjust later." />
                    </div>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      required
                    />
                  </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      id="isActive"
                      checked={isActive}
                      onCheckedChange={setIsActive}
                    />
                    <Label htmlFor="isActive">Service is active and bookable</Label>
                  </div>

                  {/* Buffer Time Configuration */}
                  <div className="space-y-4 border-t pt-4">
                    <div className="flex items-center gap-2">
                      <Switch
                        id="useCustomBuffer"
                        checked={useCustomBuffer}
                        onCheckedChange={setUseCustomBuffer}
                      />
                      <Label htmlFor="useCustomBuffer" className="flex items-center gap-2">
                        Custom buffer time for this service
                        <HelpTooltip content="Override your default buffer time for this specific service. Useful for services that need more or less prep time." />
                      </Label>
                    </div>

                    {useCustomBuffer && (
                      <div className="ml-6 space-y-3 p-4 bg-muted/50 rounded-lg border-2 border-foreground/10">
                        <div className="space-y-2">
                          <Label htmlFor="customBufferTime">
                            Buffer Time (minutes)
                          </Label>
                          <Select value={customBufferTime} onValueChange={setCustomBufferTime}>
                            <SelectTrigger id="customBufferTime">
                              <SelectValue placeholder="Select buffer time" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="0">⚡ No buffer</SelectItem>
                              <SelectItem value="10">🏃 10 minutes</SelectItem>
                              <SelectItem value="15">✨ 15 minutes</SelectItem>
                              <SelectItem value="20">🌟 20 minutes</SelectItem>
                              <SelectItem value="30">😌 30 minutes</SelectItem>
                              <SelectItem value="45">🧘 45 minutes</SelectItem>
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-muted-foreground">
                            Total time slot: {parseInt(duration) + (parseInt(customBufferTime) || 0)} minutes 
                            ({duration} min service + {customBufferTime || 0} min buffer)
                          </p>
                        </div>
                      </div>
                    )}

                    {!useCustomBuffer && (
                      <p className="text-xs text-muted-foreground ml-6">
                        Using default buffer: {stylistProfile?.buffer_time_minutes || 15} minutes
                      </p>
                    )}
                  </div>

                  {/* Deposit Configuration */}
                  <div className="space-y-4 border-t pt-4">
                    <div className="flex items-center gap-2">
                      <Switch
                        id="requireDeposit"
                        checked={requireDeposit}
                        onCheckedChange={setRequireDeposit}
                      />
                      <Label htmlFor="requireDeposit" className="flex items-center gap-2">
                        Require deposit for this service
                        <HelpTooltip content="Deposits reduce no-shows and secure bookings. Great for new clients or expensive services." />
                      </Label>
                    </div>

                    {requireDeposit && (
                      <div className="ml-6 space-y-4 p-4 bg-muted/50 rounded-lg border-2 border-foreground/10">
                        <div className="space-y-2">
                          <Label>Deposit Type</Label>
                          <Select value={depositType} onValueChange={(value: "fixed" | "percentage") => setDepositType(value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                              <SelectItem value="percentage">Percentage (%)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="depositAmount">
                            Deposit {depositType === "fixed" ? "Amount ($)" : "Percentage (%)"}
                          </Label>
                          <Input
                            id="depositAmount"
                            type="number"
                            step={depositType === "fixed" ? "0.01" : "1"}
                            min="0"
                            max={depositType === "percentage" ? "100" : undefined}
                            placeholder={depositType === "fixed" ? "50.00" : "50"}
                            value={depositAmount}
                            onChange={(e) => setDepositAmount(e.target.value)}
                            required={requireDeposit}
                          />
                          {depositType === "percentage" && depositAmount && (
                            <p className="text-sm text-muted-foreground">
                              = ${((parseFloat(price) || 0) * (parseFloat(depositAmount) / 100)).toFixed(2)} deposit
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <Button type="submit" disabled={submitting} className="w-full">
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>{editingService ? "Update Service" : "Add Service"}</>
                    )}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main id="main-content" role="main" aria-label="Service Pricing" className="container mx-auto px-4 py-8 max-w-4xl">
          {services.length === 0 ? (
          <Card className="border-[3px] border-foreground shadow-[5px_5px_0px_0px_hsl(var(--foreground))] bg-gradient-to-br from-yellow-400 to-amber-400">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <DollarSign className="h-16 w-16 text-foreground mb-4" />
              <p className="text-xl font-semibold mb-2 text-foreground font-display">No services yet</p>
              <p className="text-foreground/80 mb-1 font-medium text-center max-w-md">Define your service menu with clear pricing</p>
              <p className="text-sm text-foreground/70 mb-4 text-center max-w-md">This helps clients know what you offer and book with confidence</p>
              <Button onClick={() => setDialogOpen(true)} className="border-2 border-foreground">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Service
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {services.map((service, idx) => (
              <Card key={service.id} className={`border-[3px] border-foreground shadow-[5px_5px_0px_0px_hsl(var(--foreground))] hover:shadow-[7px_7px_0px_0px_hsl(var(--primary))] hover:-translate-y-1 transition-all ${
                idx % 4 === 0 ? 'bg-blue-400' :
                idx % 4 === 1 ? 'bg-green-400' :
                idx % 4 === 2 ? 'bg-pink-400' : 'bg-yellow-300'
              } ${!service.is_active ? "opacity-60" : ""}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-foreground font-display">
                        {service.service_name}
                        {!service.is_active && <span className="text-xs text-foreground/70 font-normal">(Inactive)</span>}
                      </CardTitle>
                      <CardDescription className="mt-1 text-foreground/80 font-medium space-y-1">
                        <div>
                          ⏱️ {service.duration_minutes} min service
                          {service.buffer_time_minutes !== null && (
                            <span className="ml-2 text-xs bg-white/50 text-foreground px-2 py-0.5 rounded-full border border-foreground/20">
                              + {service.buffer_time_minutes} min buffer
                            </span>
                          )}
                          {service.buffer_time_minutes === null && (
                            <span className="ml-2 text-xs opacity-70">
                              (using default {stylistProfile?.buffer_time_minutes || 15} min buffer)
                            </span>
                          )}
                        </div>
                        <div>
                          💰 ${parseFloat(service.price).toFixed(2)}
                          {service.require_deposit && (
                            <span className="ml-2 text-xs bg-yellow-300 text-foreground px-2 py-0.5 rounded-full border-2 border-foreground font-bold">
                              Requires ${service.deposit_type === 'percentage' 
                                ? ((parseFloat(service.price) * service.deposit_amount) / 100).toFixed(2)
                                : parseFloat(service.deposit_amount).toFixed(2)} deposit
                            </span>
                          )}
                        </div>
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(service)} className="border-2 border-foreground bg-white hover:bg-white/90">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(service.id)} className="border-2 border-foreground bg-white hover:bg-white/90">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                {service.description && (
                  <CardContent>
                    <p className="text-sm text-foreground/80 font-medium">{service.description}</p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Services;