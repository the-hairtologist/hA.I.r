/**
 * Service Templates Dialog
 * Save and manage common service combinations
 */

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Bookmark,
  Plus,
  Trash2,
  Check,
  Package,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface ServiceTemplate {
  id: string;
  name: string;
  services: string[];
  total_duration: number;
  total_price: number;
  created_at: string;
}

interface ServiceTemplatesDialogProps {
  onSelectTemplate?: (template: ServiceTemplate) => void;
}

export function ServiceTemplatesDialog({ onSelectTemplate }: ServiceTemplatesDialogProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [templates, setTemplates] = useState<ServiceTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  
  // New template form
  const [newTemplateName, setNewTemplateName] = useState("");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [availableServices, setAvailableServices] = useState<any[]>([]);

  useEffect(() => {
    if (open) {
      loadTemplates();
      loadAvailableServices();
    }
  }, [open]);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      // Get stylist profile
      const { data: stylistProfile } = await supabase
        .from("stylist_profiles")
        .select("id")
        .eq("user_id", user?.id)
        .maybeSingle();

      if (!stylistProfile) return;

      // Load service templates
      const { data, error } = await supabase
        .from("service_templates")
        .select("*")
        .eq("stylist_id", stylistProfile.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error("Error loading templates:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableServices = async () => {
    try {
      const { data: stylistProfile } = await supabase
        .from("stylist_profiles")
        .select("id")
        .eq("user_id", user?.id)
        .maybeSingle();

      if (!stylistProfile) return;

      const { data, error } = await supabase
        .from("stylist_services")
        .select("*")
        .eq("stylist_id", stylistProfile.id)
        .eq("is_active", true);

      if (error) throw error;
      setAvailableServices(data || []);
    } catch (error) {
      console.error("Error loading services:", error);
    }
  };

  const handleCreateTemplate = async () => {
    if (!newTemplateName.trim() || selectedServices.length === 0) {
      toast.error("Please provide a name and select at least one service");
      return;
    }

    setCreating(true);
    try {
      const { data: stylistProfile } = await supabase
        .from("stylist_profiles")
        .select("id")
        .eq("user_id", user?.id)
        .maybeSingle();

      if (!stylistProfile) throw new Error("Stylist profile not found");

      // Calculate totals
      const selectedServiceData = availableServices.filter((s) =>
        selectedServices.includes(s.id)
      );
      const totalDuration = selectedServiceData.reduce(
        (sum, s) => sum + (s.duration_minutes || 0),
        0
      );
      const totalPrice = selectedServiceData.reduce(
        (sum, s) => sum + (Number(s.price) || 0),
        0
      );

      const { error } = await supabase.from("service_templates").insert({
        stylist_id: stylistProfile.id,
        name: newTemplateName,
        services: selectedServices,
        total_duration: totalDuration,
        total_price: totalPrice,
      });

      if (error) throw error;

      toast.success("Template created successfully!");
      setNewTemplateName("");
      setSelectedServices([]);
      loadTemplates();
    } catch (error: any) {
      console.error("Error creating template:", error);
      toast.error(error.message || "Failed to create template");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    try {
      const { error } = await supabase
        .from("service_templates")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Template deleted");
      loadTemplates();
    } catch (error: any) {
      console.error("Error deleting template:", error);
      toast.error("Failed to delete template");
    }
  };

  const handleSelectService = (serviceId: string) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Package className="mr-2 h-4 w-4" />
          Service Templates
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Service Templates</DialogTitle>
          <DialogDescription>
            Save frequently used service combinations for faster booking.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Create New Template */}
          <div className="space-y-3 p-4 border rounded-lg">
            <h4 className="font-medium text-sm">Create New Template</h4>
            <div className="space-y-3">
              <div>
                <Label htmlFor="templateName">Template Name</Label>
                <Input
                  id="templateName"
                  placeholder="e.g., Full Color Package"
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                />
              </div>

              <div>
                <Label>Select Services</Label>
                <div className="mt-2 space-y-2">
                  {availableServices.map((service) => (
                    <button
                      key={service.id}
                      onClick={() => handleSelectService(service.id)}
                      className="w-full flex items-center gap-2 p-2 rounded-lg border hover:bg-muted transition-colors text-left"
                    >
                      <div
                        className={`flex-shrink-0 h-4 w-4 rounded border flex items-center justify-center ${
                          selectedServices.includes(service.id)
                            ? "bg-primary border-primary"
                            : "border-muted-foreground"
                        }`}
                      >
                        {selectedServices.includes(service.id) && (
                          <Check className="h-3 w-3 text-primary-foreground" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{service.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {service.duration_minutes}min • ${service.price}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleCreateTemplate}
                disabled={creating}
                size="sm"
                className="w-full"
              >
                <Plus className="mr-2 h-4 w-4" />
                {creating ? "Creating..." : "Create Template"}
              </Button>
            </div>
          </div>

          {/* Existing Templates */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Saved Templates</h4>
            <ScrollArea className="max-h-[300px]">
              <div className="space-y-2">
                {templates.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No templates yet. Create one above!
                  </p>
                ) : (
                  templates.map((template) => (
                    <div
                      key={template.id}
                      className="flex items-center gap-2 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <Bookmark className="h-4 w-4 text-primary flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{template.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {template.services.length} services
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {template.total_duration}min • $
                            {template.total_price.toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {onSelectTemplate && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              onSelectTemplate(template);
                              setOpen(false);
                            }}
                            className="h-8 px-2"
                          >
                            Use
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTemplate(template.id)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive/80"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
