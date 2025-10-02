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
import { toast } from "sonner";
import { DollarSign, ArrowLeft, Plus, Edit, Loader2, Trash2 } from "lucide-react";

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
    setEditingService(null);
  };

  const handleEdit = (service: any) => {
    setEditingService(service);
    setServiceName(service.service_name);
    setDescription(service.description || "");
    setDuration(service.duration_minutes.toString());
    setPrice(service.price);
    setIsActive(service.is_active);
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!serviceName || !price || !duration) {
      toast.error("Please fill in all required fields");
      return;
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      toast.error("Please enter a valid price");
      return;
    }

    setSubmitting(true);
    try {
      const serviceData = {
        stylist_id: stylistProfile.id,
        service_name: serviceName,
        description: description || null,
        duration_minutes: parseInt(duration),
        price: priceNum,
        is_active: isActive,
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
    if (!confirm("Are you sure you want to delete this service?")) return;

    try {
      const { error } = await supabase
        .from("stylist_services")
        .delete()
        .eq("id", serviceId);

      if (error) throw error;
      toast.success("Service deleted successfully!");
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
      <header className="border-b-4 border-foreground bg-white/90 backdrop-blur-sm sticky top-0 z-10 shadow-[0_4px_0px_0px_hsl(var(--foreground))]">
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
                      <Label htmlFor="duration">Duration (minutes) *</Label>
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
                      <Label htmlFor="price">Price ($) *</Label>
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

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {services.length === 0 ? (
          <Card className="border-[3px] border-foreground shadow-[5px_5px_0px_0px_hsl(var(--foreground))] bg-gradient-to-br from-yellow-400 to-amber-400">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <DollarSign className="h-16 w-16 text-foreground mb-4" />
              <p className="text-xl font-semibold mb-2 text-foreground font-display">No services yet</p>
              <p className="text-foreground/80 mb-4 font-medium">Add your first service with pricing</p>
              <Button onClick={() => setDialogOpen(true)} className="border-2 border-foreground">
                <Plus className="h-4 w-4 mr-2" />
                Add Service
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
                      <CardDescription className="mt-1 text-foreground/80 font-medium">
                        {service.duration_minutes} minutes • ${parseFloat(service.price).toFixed(2)}
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