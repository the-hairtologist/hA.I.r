/**
 * Waitlist Dialog
 * Manage appointment waitlist
 */

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, Mail, Phone, X, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";

interface WaitlistEntry {
  id: string;
  client_name: string;
  client_email?: string;
  client_phone?: string;
  preferred_date?: string;
  preferred_time?: string;
  service_type: string;
  notes?: string;
  created_at: string;
  status: string;
}

export function WaitlistDialog() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(false);
  
  // New entry form
  const [formData, setFormData] = useState({
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    serviceType: "",
    notes: "",
  });

  useEffect(() => {
    if (open) {
      loadWaitlist();
    }
  }, [open]);

  const loadWaitlist = async () => {
    setLoading(true);
    try {
      const { data: stylistProfile } = await supabase
        .from("stylist_profiles")
        .select("id")
        .eq("user_id", user?.id)
        .maybeSingle();

      if (!stylistProfile) return;

      const { data, error } = await supabase
        .from("waitlist")
        .select("*")
        .eq("stylist_id", stylistProfile.id)
        .eq("status", "active")
        .order("created_at", { ascending: true });

      if (error) throw error;
      setEntries((data || []) as WaitlistEntry[]);
    } catch (error) {
      console.error("Error loading waitlist:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToWaitlist = async () => {
    if (!formData.clientName || !formData.serviceType) {
      toast.error("Name and service type are required");
      return;
    }

    setLoading(true);
    try {
      const { data: stylistProfile } = await supabase
        .from("stylist_profiles")
        .select("id")
        .eq("user_id", user?.id)
        .maybeSingle();

      if (!stylistProfile) throw new Error("Stylist profile not found");

      const { error } = await supabase.from("waitlist").insert({
        stylist_id: stylistProfile.id,
        client_name: formData.clientName,
        client_email: formData.clientEmail || null,
        client_phone: formData.clientPhone || null,
        service_type: formData.serviceType,
        notes: formData.notes || null,
        status: "active",
      });

      if (error) throw error;

      toast.success("Added to waitlist!");
      setFormData({
        clientName: "",
        clientEmail: "",
        clientPhone: "",
        serviceType: "",
        notes: "",
      });
      loadWaitlist();
    } catch (error: any) {
      console.error("Error adding to waitlist:", error);
      toast.error(error.message || "Failed to add to waitlist");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWaitlist = async (id: string) => {
    try {
      const { error } = await supabase
        .from("waitlist")
        .update({ status: "removed" })
        .eq("id", id);

      if (error) throw error;
      toast.success("Removed from waitlist");
      loadWaitlist();
    } catch (error: any) {
      console.error("Error removing from waitlist:", error);
      toast.error("Failed to remove from waitlist");
    }
  };

  const notifyClient = (entry: WaitlistEntry, method: "email" | "phone") => {
    if (method === "email" && entry.client_email) {
      window.location.href = `mailto:${entry.client_email}?subject=Slot Available - ${entry.service_type}`;
    } else if (method === "phone" && entry.client_phone) {
      window.location.href = `sms:${entry.client_phone}`;
    } else {
      toast.error(`No ${method} available`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Clock className="mr-2 h-4 w-4" />
          Waitlist {entries.length > 0 && `(${entries.length})`}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Appointment Waitlist</DialogTitle>
          <DialogDescription>
            Manage clients waiting for available slots
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Add to Waitlist Form */}
          <div className="space-y-3 p-4 border rounded-lg">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Add to Waitlist
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="clientName">Client Name *</Label>
                <Input
                  id="clientName"
                  value={formData.clientName}
                  onChange={(e) =>
                    setFormData({ ...formData, clientName: e.target.value })
                  }
                  placeholder="John Doe"
                />
              </div>
              <div>
                <Label htmlFor="serviceType">Service *</Label>
                <Input
                  id="serviceType"
                  value={formData.serviceType}
                  onChange={(e) =>
                    setFormData({ ...formData, serviceType: e.target.value })
                  }
                  placeholder="Haircut"
                />
              </div>
              <div>
                <Label htmlFor="clientEmail">Email</Label>
                <Input
                  id="clientEmail"
                  type="email"
                  value={formData.clientEmail}
                  onChange={(e) =>
                    setFormData({ ...formData, clientEmail: e.target.value })
                  }
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <Label htmlFor="clientPhone">Phone</Label>
                <Input
                  id="clientPhone"
                  type="tel"
                  value={formData.clientPhone}
                  onChange={(e) =>
                    setFormData({ ...formData, clientPhone: e.target.value })
                  }
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Input
                id="notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Any special requests or preferences"
              />
            </div>
            <Button
              onClick={handleAddToWaitlist}
              disabled={loading}
              size="sm"
              className="w-full"
            >
              Add to Waitlist
            </Button>
          </div>

          {/* Waitlist Entries */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Current Waitlist</h4>
            {loading ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
                <Clock className="h-6 w-6 mx-auto mb-2 animate-spin" />
                Loading waitlist...
              </div>
            ) : entries.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground space-y-2">
                <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="font-medium">Waitlist is empty</p>
                <p className="text-xs">
                  Add clients who want to be notified when slots become available
                </p>
              </div>
            ) : (
              <ScrollArea className="max-h-[300px]">
                <div className="space-y-2">
                  {entries.map((entry, index) => (
                    <div
                      key={entry.id}
                      className="flex items-center gap-2 p-3 border rounded-lg"
                    >
                      <Badge variant="outline" className="flex-shrink-0">
                        #{index + 1}
                      </Badge>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{entry.client_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {entry.service_type}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Added {format(new Date(entry.created_at), "MMM d, h:mm a")}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {entry.client_email && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => notifyClient(entry, "email")}
                            className="h-7 w-7 p-0"
                            title="Notify via email"
                          >
                            <Mail className="h-4 w-4 sm:h-5 sm:w-5" />
                          </Button>
                        )}
                        {entry.client_phone && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => notifyClient(entry, "phone")}
                            className="h-7 w-7 p-0"
                            title="Notify via SMS"
                          >
                            <Phone className="h-4 w-4 sm:h-5 sm:w-5" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveFromWaitlist(entry.id)}
                          className="h-7 w-7 p-0 text-destructive hover:text-destructive/80"
                          title="Remove from waitlist"
                        >
                          <X className="h-4 w-4 sm:h-5 sm:w-5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
