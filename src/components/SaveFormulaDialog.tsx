import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Save, Loader2, UserPlus } from "lucide-react";
import { AddClientDialog } from "./AddClientDialog";
import { cn } from "@/lib/utils";

interface SaveFormulaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formulaText: string;
  stylistId: string;
}

export const SaveFormulaDialog = ({
  open,
  onOpenChange,
  formulaText,
  stylistId,
}: SaveFormulaDialogProps) => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState("");
  const [colorLine, setColorLine] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingClients, setLoadingClients] = useState(true);
  const [addClientDialogOpen, setAddClientDialogOpen] = useState(false);

  useEffect(() => {
    if (open) {
      loadClients();
    }
  }, [open]);

  const loadClients = async () => {
    try {
      setLoadingClients(true);

      // Get ALL clients linked to this stylist
      const { data: clientsData } = await supabase
        .from("client_profiles")
        .select(`
          id,
          full_name,
          email,
          user:profiles(full_name, email)
        `)
        .eq("preferred_stylist_id", stylistId)
        .order("full_name");
      
      setClients(clientsData || []);
    } catch (error: any) {
      console.error("Error loading clients:", error);
      toast.error("Failed to load clients");
    } finally {
      setLoadingClients(false);
    }
  };

  const handleSave = async () => {
    if (!selectedClient) {
      toast.error("Please select a client");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("formulas")
        .insert({
          stylist_id: stylistId,
          client_id: selectedClient,
          formula_text: formulaText,
          instructions: notes,
          color_line: colorLine,
          result_notes: "Saved from AI Chat Assistant",
        });

      if (error) throw error;

      toast.success("Formula saved successfully! ✨", {
        description: "You can find it in your Formula History",
        action: {
          label: "View Formulas",
          onClick: () => navigate("/formulas"),
        },
      });
      
      // Reset form
      setSelectedClient("");
      setColorLine("");
      setNotes("");
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error saving formula:", error);
      toast.error("Failed to save formula");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto brutal-border brutal-shadow-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="h-5 w-5 text-primary" />
            Save as Formula
          </DialogTitle>
          <DialogDescription>
            Save this AI recommendation to a client's formula history
          </DialogDescription>
        </DialogHeader>

        {loadingClients ? (
          <div className="py-8 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4 py-4">
            {/* Formula Preview */}
            <div className="space-y-2">
              <Label>Formula from AI</Label>
              <div className="bg-muted/50 p-4 rounded-lg border max-h-48 overflow-y-auto">
                <p className="text-sm whitespace-pre-wrap leading-relaxed">
                  {formulaText}
                </p>
              </div>
            </div>

            {/* Client Selection */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="client">Select Client *</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setAddClientDialogOpen(true)}
                  className="h-auto py-1 px-2 text-xs gap-1"
                >
                  <UserPlus className="h-3 w-3" />
                  Add New
                </Button>
              </div>
              <Select value={selectedClient} onValueChange={setSelectedClient}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Choose a client" />
                </SelectTrigger>
                <SelectContent className="bg-popover z-50 max-h-[300px]">
                  {clients.length === 0 ? (
                    <div className="p-4 text-sm text-muted-foreground text-center">
                      <p>No clients yet</p>
                      <p className="text-xs mt-1">Click "Add New" to create your first client</p>
                    </div>
                  ) : (
                    clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.full_name || client.user?.full_name || client.email || client.user?.email || "Unknown Client"}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Color Line */}
            <div className="space-y-2">
              <Label htmlFor="colorLine">Color Line (Optional)</Label>
              <Input
                id="colorLine"
                placeholder="e.g., Wella, Redken, L'Oréal"
                value={colorLine}
                onChange={(e) => setColorLine(e.target.value)}
              />
            </div>

            {/* Additional Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any modifications, application notes, or timing..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                maxLength={500}
                className="resize-none"
              />
              <div className="flex justify-end">
                <span className={cn(
                  "text-xs",
                  notes.length > 500 ? "text-destructive" : "text-muted-foreground"
                )}>
                  {notes.length} / 500
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={loading || !selectedClient}
                className="flex-1 gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Formula
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>

      {/* Add Client Dialog */}
      <AddClientDialog
        open={addClientDialogOpen}
        onOpenChange={setAddClientDialogOpen}
        stylistId={stylistId}
        onClientAdded={(newClientId) => {
          // Reload clients and select the new one
          loadClients().then(() => {
            setSelectedClient(newClientId);
          });
        }}
      />
    </Dialog>
  );
};
