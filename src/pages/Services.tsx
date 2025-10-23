import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { getServicesByStylist } from "@/lib/queries/serviceQueries";
import { useFormSubmit } from "@/hooks/useFormSubmit";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { DollarSign, Plus, Edit, Loader2, Trash2, Info, Palette } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { HelpTooltip } from "@/components/HelpTooltip";
import { ServiceTypeColorManager } from "@/components/ServiceTypeColorManager";
import { ServiceTemplatesDialog } from "@/components/ServiceTemplatesDialog";
import { FormFieldError } from "@/components/FormFieldError";

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
  const [validationErrors, setValidationErrors] = useState<{
    serviceName?: string;
    description?: string;
    price?: string;
    duration?: string;
    depositAmount?: string;
  }>({});

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

      const { data: stylist, error: stylistError } = await supabase
        .from("stylist_profiles")
        .select("*")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (stylistError) {
        console.error("Error fetching stylist profile:", stylistError);
        toast.error("Failed to load stylist profile");
        navigate("/dashboard");
        return;
      }

      if (!stylist) {
        toast.error("Stylist profile not found");
        navigate("/dashboard");
        return;
      }

      setStylistProfile(stylist);

      // Use optimized query with request deduplication
      const servicesData = await getServicesByStylist(stylist.id);
      setServices(servicesData || []);
    } catch (error: any) {
      console.error("Error loading data:", error);
      toast.error("Unable to load your services. Please refresh or check your connection.");
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
    setValidationErrors({});
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

    const errors: {
      serviceName?: string;
      description?: string;
      price?: string;
      duration?: string;
      depositAmount?: string;
    } = {};

    // Validate required fields
    if (!serviceName.trim()) {
      errors.serviceName = "Service name is required";
    } else if (serviceName.trim().length > 100) {
      errors.serviceName = "Service name must be less than 100 characters";
    }

    if (description.trim().length > 500) {
      errors.description = "Description must be less than 500 characters";
    }

    const priceNum = parseFloat(price);
    if (!price || isNaN(priceNum) || priceNum <= 0) {
      errors.price = "Please enter a valid price";
    } else if (priceNum > 10000) {
      errors.price = "Price cannot exceed $10,000";
    }

    const durationNum = parseInt(duration);
    if (!duration || durationNum < 15 || durationNum > 480) {
      errors.duration = "Duration must be between 15 and 480 minutes";
    }

    // Validate deposit if required
    if (requireDeposit) {
      const depositNum = parseFloat(depositAmount);
      if (!depositAmount || isNaN(depositNum) || depositNum <= 0) {
        errors.depositAmount = "Please enter a valid deposit amount";
      } else if (depositType === "percentage" && depositNum > 100) {
        errors.depositAmount = "Percentage must be 100 or less";
      } else if (depositType === "fixed" && depositNum > priceNum) {
        errors.depositAmount = "Deposit cannot exceed service price";
      }
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors({});

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

  const [serviceToDelete, setServiceToDelete] = useState<string | null>(null);

  const {
    handleSubmit: confirmDelete,
    isSubmitting: isDeletingService,
  } = useFormSubmit(
    async () => {
      if (!serviceToDelete) return;
      
      const service = services.find(s => s.id === serviceToDelete);
      const serviceName = service?.service_name || "this service";
      
      const { error } = await supabase
        .from("stylist_services")
        .delete()
        .eq("id", serviceToDelete);

      if (error) throw error;
      
      await loadData();
      setServiceToDelete(null);
    },
    {
      successMessage: "Service deleted successfully",
      errorMessage: "Failed to delete service",
    }
  );

  const handleDelete = async (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    const serviceName = service?.service_name || "this service";
    
    if (!confirm(`Delete "${serviceName}"?\n\nThis action cannot be undone. Clients won't be able to book this service anymore.`)) return;

    setServiceToDelete(serviceId);
    await confirmDelete();
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
      <PageHeader
        title="Service Pricing"
        icon={<DollarSign className="h-6 w-6" />}
        backTo="/dashboard"
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <ServiceTemplatesDialog />
            <Button onClick={() => setDialogOpen(true)} className="border-2 border-foreground min-h-[44px] flex-shrink-0">
              <Plus className="h-4 w-4 mr-2" />
              Add Service
            </Button>
          </div>
        }
      />

      {/* Service Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
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
                      onChange={(e) => {
                        setServiceName(e.target.value);
                        setValidationErrors(prev => ({ ...prev, serviceName: undefined }));
                      }}
                      required
                      aria-invalid={!!validationErrors.serviceName}
                    />
                    {validationErrors.serviceName && <FormFieldError message={validationErrors.serviceName} />}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Brief description of the service"
                      value={description}
                      onChange={(e) => {
                        setDescription(e.target.value);
                        setValidationErrors(prev => ({ ...prev, description: undefined }));
                      }}
                      rows={3}
                      aria-invalid={!!validationErrors.description}
                    />
                    {validationErrors.description && <FormFieldError message={validationErrors.description} />}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="duration">Duration (minutes) *</Label>
                      <HelpTooltip 
                        title="Service Duration"
                        content={{
                          stylist: "Set realistic service times including consultation, application, processing, and styling. Underestimating leads to rushed work and scheduling conflicts."
                        }}
                        examples={[
                          "Full highlight: 2.5-3 hours",
                          "Single process color: 1.5-2 hours",
                          "Women's haircut: 45-60 minutes",
                          "Men's haircut: 30-45 minutes",
                          "Balayage: 2-4 hours depending on length"
                        ]}
                        tips={[
                          "Build in time for difficult hair or clients who talk a lot",
                          "Consider your skill level - it's okay to need more time",
                          "Include blow dry and styling in your estimate"
                        ]}
                      />
                    </div>
                    <Input
                      id="duration"
                      type="number"
                      min="15"
                      step="15"
                      value={duration}
                      onChange={(e) => {
                        setDuration(e.target.value);
                        setValidationErrors(prev => ({ ...prev, duration: undefined }));
                      }}
                      required
                      aria-invalid={!!validationErrors.duration}
                    />
                    {validationErrors.duration && <FormFieldError message={validationErrors.duration} />}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="price">Price ($) *</Label>
                      <HelpTooltip 
                        title="Service Pricing"
                        content={{
                          stylist: "Your pricing should cover product costs, time, expertise, and overhead (rent, utilities, tools). Don't undervalue your work - clients who only want cheap won't be loyal."
                        }}
                        examples={[
                          "New stylist in small town: $60-80 color",
                          "Experienced stylist in city: $150-300 color",
                          "Master stylist in metro: $300-500+ color"
                        ]}
                        tips={[
                          "Price by value, not by how fast you work",
                          "Consider product costs - premium color costs more",
                          "Raise prices 10-15% annually as you gain experience",
                          "Offer new client discounts sparingly - they attract bargain hunters"
                        ]}
                      />
                    </div>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={price}
                      onChange={(e) => {
                        setPrice(e.target.value);
                        setValidationErrors(prev => ({ ...prev, price: undefined }));
                      }}
                      required
                      aria-invalid={!!validationErrors.price}
                    />
                    {validationErrors.price && <FormFieldError message={validationErrors.price} />}
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
                        <HelpTooltip 
                          title="Buffer Time"
                          content={{
                            stylist: "Buffer time is the gap between appointments for cleanup, setup, and mental preparation. Different services need different buffers."
                          }}
                          examples={[
                            "Quick trim: 10-15 min buffer",
                            "Color service: 20-30 min buffer (more cleanup)",
                            "Complex color correction: 30-45 min buffer"
                          ]}
                          tips={[
                            "Use buffers to prevent running late all day",
                            "Build in time for client questions and product recommendations",
                            "Messy services (color, bleach) need longer cleanup"
                          ]}
                        />
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
                        <HelpTooltip 
                          title="Service Deposits"
                          content={{
                            stylist: "Deposits protect your time and income. They show client commitment and filter out people who aren't serious. Industry standard is 20-50% or $50-100 minimum.",
                            client: "Deposits hold your appointment slot and show your stylist you're committed. They're applied to your final service cost and are usually non-refundable within 48 hours of your appointment."
                          }}
                          examples={[
                            "All appointments over 2 hours",
                            "First-time clients (you don't know their reliability yet)",
                            "Expensive services (color corrections, extensions)",
                            "Holiday season bookings (high-demand times)"
                          ]}
                          tips={[
                            "Deposits dramatically reduce no-shows by 60-80%",
                            "Make it clear: deposit goes toward the service, not extra",
                            "Have a cancellation policy (48-72 hours notice)",
                            "Use deposits to filter serious clients from tire-kickers"
                          ]}
                        />
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
                            onChange={(e) => {
                              setDepositAmount(e.target.value);
                              setValidationErrors(prev => ({ ...prev, depositAmount: undefined }));
                            }}
                            required={requireDeposit}
                            aria-invalid={!!validationErrors.depositAmount}
                          />
                          {validationErrors.depositAmount && <FormFieldError message={validationErrors.depositAmount} />}
                          {depositType === "percentage" && depositAmount && (
                            <p className="text-sm text-muted-foreground">
                              = ${((parseFloat(price) || 0) * (parseFloat(depositAmount) / 100)).toFixed(2)} deposit
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <Button type="submit" disabled={submitting} className="w-full border-2 border-foreground min-h-[44px]">
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

      <main id="main-content" role="main" aria-label="Service Pricing" className="container mx-auto px-4 py-8 max-w-4xl">
          {services.length === 0 ? (
          <Card className="border-[3px] border-foreground shadow-[5px_5px_0px_0px_hsl(var(--foreground))] bg-gradient-to-br from-yellow-400 to-amber-400">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <DollarSign className="h-16 w-16 text-foreground mb-4" />
              <p className="text-xl font-sans font-semibold mb-2 text-foreground">No services yet</p>
              <p className="text-foreground/80 mb-1 font-sans font-medium text-center max-w-md">Define your service menu with clear pricing</p>
              <p className="text-sm font-sans text-foreground/70 mb-4 text-center max-w-md">This helps clients know what you offer and book with confidence</p>
              <Button onClick={() => setDialogOpen(true)} className="border-2 border-foreground min-h-[44px]">
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
                      <CardTitle className="flex items-center gap-2 text-foreground font-pixel">
                        {service.service_name}
                        {!service.is_active && <span className="text-xs text-foreground/70 font-normal">(Inactive)</span>}
                      </CardTitle>
                      <CardDescription className="mt-1 text-foreground/80 font-sans font-medium space-y-1">
                        <div>
                          ⏱️ {service.duration_minutes} min service
                          {service.buffer_time_minutes !== null && (
                            <span className="ml-2 text-xs bg-card/50 text-foreground px-2 py-0.5 rounded-full border border-foreground/20">
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
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => handleEdit(service)} 
                        className="border-2 border-foreground bg-card hover:bg-secondary min-h-[44px] min-w-[44px] shadow-brutal"
                        aria-label="Edit service"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => handleDelete(service.id)} 
                        disabled={isDeletingService && serviceToDelete === service.id}
                        className="border-2 border-foreground bg-card hover:bg-destructive hover:text-destructive-foreground min-h-[44px] min-w-[44px] shadow-brutal"
                        aria-label="Delete service"
                      >
                        {isDeletingService && serviceToDelete === service.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
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

        {/* Service Color Customization */}
        {stylistProfile && (
          <div className="mt-8">
            <div className="flex items-center gap-3 mb-4">
              <Palette className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-pixel">Service Colors</h2>
            </div>
            <p className="text-sm font-sans text-muted-foreground mb-4">
              Customize the colors that appear in your weekly schedule for each service type.
            </p>
            <ServiceTypeColorManager stylistId={stylistProfile.id} />
          </div>
        )}
      </main>
    </div>
  );
};

export default Services;