import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Loader2, Search, Edit, Save, Trash2, UserPlus, Palette, Mic } from "lucide-react";
import { AddClientDialog } from "@/components/AddClientDialog";
import { useKeyboardShortcut, SHORTCUTS } from "@/hooks/useKeyboardShortcut";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { VoiceInput } from "@/components/VoiceInput";
import { ContextualAI } from "@/components/ContextualAI";
import { showCelebration } from "@/components/CelebrationToast";

const Formulas = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [formulas, setFormulas] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [stylistProfile, setStylistProfile] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingFormula, setEditingFormula] = useState<any>(null);
  const [clientSearchOpen, setClientSearchOpen] = useState(false);
  const [addClientDialogOpen, setAddClientDialogOpen] = useState(false);
  
  // Form state
  const [selectedClient, setSelectedClient] = useState("");
  const [formulaText, setFormulaText] = useState("");
  const [instructions, setInstructions] = useState("");
  const [colorLine, setColorLine] = useState("");
  const [resultNotes, setResultNotes] = useState("");

  useEffect(() => {
    loadData();
  }, []);
  
  // Keyboard shortcut: Ctrl+N to open new formula dialog
  useKeyboardShortcut(() => {
    if (!dialogOpen) {
      setDialogOpen(true);
    }
  }, { ...SHORTCUTS.NEW });

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

      // Get formulas
      const { data: formulasData } = await supabase
        .from("formulas")
        .select(`
          *,
          client:client_profiles(
            id,
            full_name,
            email
          )
        `)
        .eq("stylist_id", stylist.id)
        .order("created_at", { ascending: false });

      setFormulas(formulasData || []);

      // Get clients
      const { data: clientsData } = await supabase
        .from("client_profiles")
        .select("id, full_name, email")
        .eq("preferred_stylist_id", stylist.id)
        .order("full_name");

      setClients(clientsData || []);
    } catch (error: any) {
      console.error("Error loading data:", error);
      toast.error("Error loading formulas");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveFormula = async () => {
    if (!selectedClient || !formulaText) {
      toast.error("Pick a client and add your formula magic! ✨");
      return;
    }

    try {
      if (editingFormula) {
        // Update existing formula
        const { error } = await supabase
          .from("formulas")
          .update({
            formula_text: formulaText,
            instructions,
            color_line: colorLine,
            result_notes: resultNotes,
          })
          .eq("id", editingFormula.id);

        if (error) throw error;
        toast.success("Formula updated successfully!");
      } else {
        // Create new formula
        const { error } = await supabase
          .from("formulas")
          .insert({
            stylist_id: stylistProfile.id,
            client_id: selectedClient,
            formula_text: formulaText,
            instructions,
            color_line: colorLine,
            result_notes: resultNotes,
          });

        if (error) throw error;
        
        // Show celebration
        showCelebration("formula-saved", undefined, formulas.length + 1);
      }

      handleCloseDialog();
      loadData();
    } catch (error: any) {
      console.error("Error saving formula:", error);
      toast.error("Error saving formula");
    }
  };

  const handleEditFormula = (formula: any) => {
    setEditingFormula(formula);
    setSelectedClient(formula.client_id);
    setFormulaText(formula.formula_text || "");
    setInstructions(formula.instructions || "");
    setColorLine(formula.color_line || "");
    setResultNotes(formula.result_notes || "");
    setDialogOpen(true);
  };

  const handleDeleteFormula = async (formulaId: string) => {
    if (!confirm("Are you sure you want to delete this formula?")) return;

    try {
      const { error } = await supabase
        .from("formulas")
        .delete()
        .eq("id", formulaId);

      if (error) throw error;
      toast.success("Formula deleted successfully!");
      loadData();
    } catch (error: any) {
      console.error("Error deleting formula:", error);
      toast.error("Error deleting formula");
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingFormula(null);
    setSelectedClient("");
    setFormulaText("");
    setInstructions("");
    setColorLine("");
    setResultNotes("");
  };

  const filteredFormulas = formulas.filter(formula => {
    const search = searchTerm.toLowerCase();
    return (
      formula.client?.full_name?.toLowerCase().includes(search) ||
      formula.client?.email?.toLowerCase().includes(search) ||
      formula.formula_text?.toLowerCase().includes(search) ||
      formula.color_line?.toLowerCase().includes(search)
    );
  });

  const selectedClientData = clients.find(c => c.id === selectedClient);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">Loading formulas...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Contextual AI Suggestions */}
        {selectedClient && (
          <ContextualAI
            context="formula"
            data={{ clientId: selectedClient }}
            onAction={(action) => {
              if (action === "load-last-formula") {
                const lastFormula = formulas.find(f => f.client_id === selectedClient);
                if (lastFormula) {
                  setFormulaText(lastFormula.formula_text || "");
                  setInstructions(lastFormula.instructions || "");
                  setColorLine(lastFormula.color_line || "");
                  toast.success("Last formula loaded!");
                }
              }
            }}
          />
        )}

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Client Formulas</h1>
            <p className="text-muted-foreground">View and manage your client formulas</p>
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Formula
          </Button>
        </div>

        {/* Keyboard shortcut hint */}
        <div className="flex justify-end">
          <p className="text-xs text-muted-foreground">
            Press <kbd className="px-2 py-1 text-xs font-semibold bg-muted rounded border">Ctrl</kbd> + <kbd className="px-2 py-1 text-xs font-semibold bg-muted rounded border">N</kbd> to add new formula
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search formulas by client, formula, or color line..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Formulas List */}
        <div className="grid gap-4">
          {filteredFormulas.length === 0 ? (
            <div className="py-16 px-4 text-center animate-fade-in">
              <div className="relative mb-6 inline-block">
                <div className="bg-gradient-to-br from-primary/10 to-accent/10 p-8 rounded-full border-[3px] border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))]">
                  <Palette className="h-16 w-16 text-primary" />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-secondary p-2 rounded-full border-2 border-foreground">
                  <span className="text-2xl" role="img" aria-label="magic">🔮</span>
                </div>
              </div>
              <h2 className="text-2xl font-display font-bold mb-2 gradient-text">
                Your Formula Library Awaits!
              </h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {searchTerm 
                  ? "No formulas match your search. Try different keywords or create a new formula!"
                  : "Start documenting your color formulas and never forget that perfect shade again"}
              </p>
              <Button 
                onClick={() => setDialogOpen(true)}
                size="lg"
                className="gap-2 hover-scale"
              >
                <Plus className="h-5 w-5" />
                Create Your First Formula
              </Button>
              <p className="text-xs text-muted-foreground mt-4">
                <kbd className="px-2 py-1 text-xs font-semibold bg-muted rounded border">Ctrl</kbd> + <kbd className="px-2 py-1 text-xs font-semibold bg-muted rounded border">N</kbd> for quick access
              </p>
            </div>
          ) : (
            filteredFormulas.map((formula) => (
              <Card key={formula.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {formula.client?.full_name || "Client"}
                      </CardTitle>
                      <CardDescription>
                        {formula.client?.email}
                        {formula.color_line && ` • ${formula.color_line}`}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditFormula(formula)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteFormula(formula.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm font-medium mb-1">Formula:</p>
                    <p className="text-sm whitespace-pre-wrap text-muted-foreground">
                      {formula.formula_text}
                    </p>
                  </div>
                  {formula.instructions && (
                    <div>
                      <p className="text-sm font-medium mb-1">Instructions:</p>
                      <p className="text-sm whitespace-pre-wrap text-muted-foreground">
                        {formula.instructions}
                      </p>
                    </div>
                  )}
                  {formula.result_notes && (
                    <div>
                      <p className="text-sm font-medium mb-1">Notes:</p>
                      <p className="text-sm text-muted-foreground">{formula.result_notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Add/Edit Formula Dialog */}
      <Dialog open={dialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingFormula ? "Edit Formula" : "Add New Formula"}
            </DialogTitle>
            <DialogDescription>
              {editingFormula ? "Update the formula details" : "Create a new formula for a client"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Client Selection */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Client *</Label>
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
              <Popover open={clientSearchOpen} onOpenChange={setClientSearchOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={clientSearchOpen}
                    className="w-full justify-between"
                    disabled={!!editingFormula}
                  >
                    {selectedClientData
                      ? (selectedClientData.full_name || selectedClientData.email || "Client")
                      : "Search and select a client..."}
                    <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search clients..." />
                    <CommandEmpty>
                      <div className="p-4 text-sm text-center">
                        <p className="text-muted-foreground mb-2">No clients found</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setClientSearchOpen(false);
                            setAddClientDialogOpen(true);
                          }}
                        >
                          <UserPlus className="h-3 w-3 mr-1" />
                          Add New Client
                        </Button>
                      </div>
                    </CommandEmpty>
                    <CommandGroup>
                      {clients.map((client) => (
                        <CommandItem
                          key={client.id}
                          value={client.full_name || client.email || ""}
                          onSelect={() => {
                            setSelectedClient(client.id);
                            setClientSearchOpen(false);
                          }}
                        >
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {client.full_name || "Client"}
                            </span>
                            {client.email && (
                              <span className="text-xs text-muted-foreground">{client.email}</span>
                            )}
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Formula Text */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="formula">Formula *</Label>
                <VoiceInput
                  variant="icon"
                  onTranscription={(text) => setFormulaText(prev => prev ? `${prev}\n${text}` : text)}
                />
              </div>
              <Textarea
                id="formula"
                placeholder="Enter the complete formula or use voice input..."
                value={formulaText}
                onChange={(e) => setFormulaText(e.target.value)}
                rows={6}
                className="resize-none"
              />
            </div>

            {/* Instructions */}
            <div className="space-y-2">
              <Label htmlFor="instructions">Application Instructions</Label>
              <Textarea
                id="instructions"
                placeholder="Step-by-step application instructions..."
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>

            {/* Color Line */}
            <div className="space-y-2">
              <Label htmlFor="colorline">Color Line</Label>
              <Input
                id="colorline"
                placeholder="e.g., Wella, Redken"
                value={colorLine}
                onChange={(e) => setColorLine(e.target.value)}
              />
            </div>

            {/* Result Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Result Notes</Label>
              <Textarea
                id="notes"
                placeholder="Notes about the result..."
                value={resultNotes}
                onChange={(e) => setResultNotes(e.target.value)}
                rows={2}
                className="resize-none"
              />
            </div>

            <Button onClick={handleSaveFormula} className="w-full">
              <Save className="h-4 w-4 mr-2" />
              {editingFormula ? "Update Formula" : "Save Formula"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Client Dialog */}
      <AddClientDialog
        open={addClientDialogOpen}
        onOpenChange={setAddClientDialogOpen}
        stylistId={stylistProfile?.id}
        onClientAdded={() => {
          loadData();
          setAddClientDialogOpen(false);
        }}
      />
    </DashboardLayout>
  );
};

export default Formulas;
