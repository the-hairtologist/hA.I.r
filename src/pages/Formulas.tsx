import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Scissors, Plus, Upload, Sparkles, ArrowLeft, Loader2, CheckCircle, Search, Edit, Save, FileText, History, UserPlus, Copy, Zap } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AddClientDialog } from "@/components/AddClientDialog";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const Formulas = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [formulas, setFormulas] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [stylistProfile, setStylistProfile] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingFormula, setEditingFormula] = useState<any>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"manual" | "ai">("manual");
  const [clientSearchOpen, setClientSearchOpen] = useState(false);
  
  // Form state
  const [selectedClient, setSelectedClient] = useState("");
  const [hairDescription, setHairDescription] = useState("");
  const [colorLine, setColorLine] = useState("");
  const [clientNotes, setClientNotes] = useState("");
  const [hairPhoto, setHairPhoto] = useState<File | null>(null);
  const [generatedFormulas, setGeneratedFormulas] = useState<any[]>([]);
  const [addClientDialogOpen, setAddClientDialogOpen] = useState(false);

  // Formula templates
  const formulaTemplates = [
    {
      name: "Full Head Color",
      formula: "Base: [Color Line] [Level][Tone]\nDeveloper: [Volume]\nRatio: [Mixing ratio]",
      instructions: "1. Section hair into 4 quadrants\n2. Apply to roots first\n3. Process for [time]\n4. Emulsify and rinse"
    },
    {
      name: "Balayage",
      formula: "Lightener: [Brand]\nDeveloper: [Volume]\nToner: [Color Line] [Level][Tone]",
      instructions: "1. Paint lightener freehand\n2. Process to desired lift\n3. Apply toner\n4. Process and rinse"
    },
    {
      name: "Root Touch-Up",
      formula: "Root Color: [Color Line] [Level][Tone]\nDeveloper: [Volume]",
      instructions: "1. Apply to new growth only\n2. Process for [time]\n3. Emulsify and rinse"
    },
  ];

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

      // Get formulas
      const { data: formulasData } = await supabase
        .from("formulas")
        .select(`
          *,
          client:client_profiles(
            id,
            user:profiles(full_name, email)
          )
        `)
        .eq("stylist_id", stylist.id)
        .order("created_at", { ascending: false });

      setFormulas(formulasData || []);

      // Get ALL clients linked to this stylist (not just those with appointments)
      const { data: clientsData } = await supabase
        .from("client_profiles")
        .select(`
          id,
          full_name,
          email,
          user:profiles(full_name, email)
        `)
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

  const handlePhotoUpload = async (file: File): Promise<string | null> => {
    try {
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file");
        return null;
      }

      const MAX_SIZE = 10 * 1024 * 1024;
      if (file.size > MAX_SIZE) {
        toast.error("Image must be less than 10MB");
        return null;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;

      const fileExt = file.name.split('.').pop();
      const fileName = `${session.user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('hair-photos')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('hair-photos')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error: any) {
      console.error("Error uploading photo:", error);
      toast.error("Error uploading photo");
      return null;
    }
  };

  const handleGenerateFormula = async () => {
    if (!selectedClient || !hairDescription) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsGenerating(true);
    try {
      let hairPhotoUrl = null;
      if (hairPhoto) {
        hairPhotoUrl = await handlePhotoUpload(hairPhoto);
      }

      const { data, error } = await supabase.functions.invoke('generate-formula', {
        body: {
          hairDescription,
          colorLine: colorLine || stylistProfile?.color_line || "professional hair color",
          clientNotes,
          imageAnalysis: hairPhotoUrl ? "Photo uploaded for reference" : null,
        },
      });

      if (error) throw error;

      setGeneratedFormulas(data.formulas);
      toast.success("Formulas generated successfully!");
    } catch (error: any) {
      console.error("Error generating formula:", error);
      toast.error(error.message || "Error generating formulas");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveFormula = async (formula: any) => {
    try {
      const { error } = await supabase
        .from("formulas")
        .insert({
          stylist_id: stylistProfile.id,
          client_id: selectedClient,
          formula_text: formula.formula_text,
          instructions: formula.instructions,
          color_line: colorLine || stylistProfile?.color_line,
          result_notes: `${formula.expected_result} - Difficulty: ${formula.difficulty}`,
        });

      if (error) throw error;

      toast.success("Formula saved successfully!");
      setDialogOpen(false);
      setGeneratedFormulas([]);
      setSelectedClient("");
      setHairDescription("");
      setClientNotes("");
      setHairPhoto(null);
      loadData();
    } catch (error: any) {
      console.error("Error saving formula:", error);
      toast.error("Error saving formula");
    }
  };

  const handleSaveManualFormula = async () => {
    if (!selectedClient || !hairDescription) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const { error } = await supabase
        .from("formulas")
        .insert({
          stylist_id: stylistProfile.id,
          client_id: selectedClient,
          formula_text: hairDescription,
          instructions: clientNotes,
          color_line: colorLine || stylistProfile?.color_line,
        });

      if (error) throw error;

      toast.success("Formula saved successfully!");
      setDialogOpen(false);
      resetForm();
      loadData();
    } catch (error: any) {
      console.error("Error saving formula:", error);
      toast.error("Error saving formula");
    }
  };

  const resetForm = () => {
    setSelectedClient("");
    setHairDescription("");
    setClientNotes("");
    setColorLine("");
    setHairPhoto(null);
    setActiveTab("manual");
  };

  const handleCopyFormula = (formula: any) => {
    setSelectedClient(formula.client_id);
    setHairDescription(formula.formula_text);
    setClientNotes(formula.instructions || "");
    setColorLine(formula.color_line || "");
    setActiveTab("manual");
    setDialogOpen(true);
    toast.success("Formula copied! Adjust as needed and save.");
  };

  const handleApplyTemplate = (template: any) => {
    setHairDescription(template.formula);
    setClientNotes(template.instructions);
    toast.success(`${template.name} template applied!`);
  };

  const handleEditFormula = async () => {
    if (!editingFormula) return;

    try {
      const { error } = await supabase
        .from("formulas")
        .update({
          formula_text: editingFormula.formula_text,
          instructions: editingFormula.instructions,
          result_notes: editingFormula.result_notes,
          color_line: editingFormula.color_line,
        })
        .eq("id", editingFormula.id);

      if (error) throw error;

      toast.success("Formula updated successfully!");
      setEditDialogOpen(false);
      setEditingFormula(null);
      loadData();
    } catch (error: any) {
      console.error("Error updating formula:", error);
      toast.error("Error updating formula");
    }
  };

  const filteredFormulas = formulas.filter(formula => {
    const search = searchTerm.toLowerCase();
    return (
      formula.client?.user?.full_name?.toLowerCase().includes(search) ||
      formula.client?.full_name?.toLowerCase().includes(search) ||
      formula.formula_text?.toLowerCase().includes(search) ||
      formula.color_line?.toLowerCase().includes(search) ||
      formula.instructions?.toLowerCase().includes(search)
    );
  });

  const selectedClientData = clients.find(c => c.id === selectedClient);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      {/* Main Dialog for creating formulas */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Formula</DialogTitle>
            <DialogDescription>
              Add a formula manually or generate suggestions with AI
            </DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "manual" | "ai")} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="manual" className="gap-2">
                <FileText className="h-4 w-4" />
                Manual Entry
              </TabsTrigger>
              <TabsTrigger value="ai" className="gap-2">
                <Sparkles className="h-4 w-4" />
                AI Generate
              </TabsTrigger>
            </TabsList>

            <TabsContent value="manual" className="space-y-4 mt-4">
              {/* Quick Templates */}
              <div className="bg-primary/5 p-3 rounded-lg border border-primary/20">
                <p className="text-xs font-semibold mb-2 text-primary">Quick Start Templates:</p>
                <div className="flex flex-wrap gap-2">
                  {formulaTemplates.map((template, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      size="sm"
                      onClick={() => handleApplyTemplate(template)}
                      className="h-auto py-1.5 px-3 text-xs"
                    >
                      <Zap className="h-3 w-3 mr-1" />
                      {template.name}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="manual-client">Select Client *</Label>
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
                      className="w-full justify-between bg-background"
                    >
                      {selectedClientData
                        ? (selectedClientData.full_name || selectedClientData.user?.full_name || selectedClientData.email || "Client")
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
                            value={client.full_name || client.user?.full_name || client.email || ""}
                            onSelect={() => {
                              setSelectedClient(client.id);
                              setClientSearchOpen(false);
                            }}
                          >
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {client.full_name || client.user?.full_name || "Client"}
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

              <div className="space-y-2">
                <Label htmlFor="manual-formula">Formula *</Label>
                <Textarea
                  id="manual-formula"
                  placeholder="Enter the complete formula..."
                  value={hairDescription}
                  onChange={(e) => setHairDescription(e.target.value)}
                  rows={6}
                  className="resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="manual-instructions">Application Instructions</Label>
                <Textarea
                  id="manual-instructions"
                  placeholder="Step-by-step application instructions..."
                  value={clientNotes}
                  onChange={(e) => setClientNotes(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="manual-colorline">Color Line</Label>
                <Input
                  id="manual-colorline"
                  placeholder="e.g., Wella, Redken"
                  value={colorLine}
                  onChange={(e) => setColorLine(e.target.value)}
                />
              </div>

              <Button onClick={handleSaveManualFormula} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Save Formula
              </Button>
            </TabsContent>

            <TabsContent value="ai" className="space-y-4 mt-4">
              <div className="bg-amber-50 dark:bg-amber-950/20 p-3 rounded-lg border border-amber-200 dark:border-amber-900 mb-4">
                <p className="text-xs text-amber-800 dark:text-amber-200 leading-relaxed">
                  AI-generated formulas are suggestions only - results may vary based on individual hair chemistry. Always perform a strand test.
                </p>
              </div>
              
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
                          {client.user?.full_name || client.user?.email}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Select the client this formula is for
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="photo">Hair Photo (Optional)</Label>
                <Input
                  id="photo"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setHairPhoto(e.target.files?.[0] || null)}
                  className="cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                />
                {hairPhoto && (
                  <p className="text-xs text-primary flex items-center gap-1">
                    <Upload className="h-3 w-3" />
                    {hairPhoto.name} ready to upload
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Upload a photo for better AI formula suggestions
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Hair Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Example: Natural level 6 brown, virgin hair, wants to go lighter with dimension. Hair is healthy, no previous color treatments."
                  value={hairDescription}
                  onChange={(e) => setHairDescription(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  Include: current level, condition, desired result, any previous treatments
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="colorLine">Color Line (Optional)</Label>
                <Input
                  id="colorLine"
                  placeholder="e.g., Wella, Redken, Schwarzkopf"
                  value={colorLine}
                  onChange={(e) => setColorLine(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  AI will tailor formulas to your preferred brand
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Example: Client wants low maintenance, avoid warm tones, sensitive scalp"
                  value={clientNotes}
                  onChange={(e) => setClientNotes(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  Add any special considerations or client preferences
                </p>
              </div>

              <Button 
                onClick={handleGenerateFormula} 
                disabled={isGenerating}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Formula with AI
                  </>
                )}
              </Button>

              {generatedFormulas.length > 0 && (
                <div className="space-y-4 mt-6 animate-fade-in">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-primary">
                      <Sparkles className="h-5 w-5" />
                      <h3 className="font-semibold text-lg">AI Formula Suggestions</h3>
                    </div>
                    <div className="bg-amber-50 dark:bg-amber-950/20 p-3 rounded-lg border border-amber-200 dark:border-amber-900">
                      <p className="text-xs text-amber-800 dark:text-amber-200 leading-relaxed">
                        <strong>⚠️ Disclaimer:</strong> These are AI-generated suggestions only. Hair color results vary significantly between individuals due to differences in hair chemistry, porosity, previous treatments, and other factors. Always perform strand and patch tests before full application. Use professional judgment and adjust formulas as needed for each client.
                      </p>
                    </div>
                  </div>
                  {generatedFormulas.map((formula, index) => (
                    <Card key={index} className="border-primary/20 shadow-lg">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{formula.formula_name}</CardTitle>
                            <CardDescription className="mt-1">
                              ⏱️ {formula.processing_time} • 📊 {formula.difficulty}
                            </CardDescription>
                          </div>
                          <Badge variant="outline" className="bg-primary/10">
                            Option {index + 1}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="bg-muted/50 p-4 rounded-lg">
                          <p className="font-semibold text-sm mb-2 text-primary">Formula:</p>
                          <p className="text-sm whitespace-pre-wrap leading-relaxed">{formula.formula_text}</p>
                        </div>
                        <div>
                          <p className="font-semibold text-sm mb-2 text-primary">Step-by-Step Instructions:</p>
                          <p className="text-sm whitespace-pre-wrap leading-relaxed">{formula.instructions}</p>
                        </div>
                        <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-200 dark:border-green-900">
                          <p className="font-semibold text-sm mb-1 text-green-700 dark:text-green-400">Expected Result:</p>
                          <p className="text-sm text-green-600 dark:text-green-300">{formula.expected_result}</p>
                        </div>
                        <Button 
                          onClick={() => handleSaveFormula(formula)}
                          className="w-full"
                          size="lg"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Save This Formula
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Edit Formula Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Formula</DialogTitle>
            <DialogDescription>Update formula details</DialogDescription>
          </DialogHeader>
          {editingFormula && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-formula">Formula</Label>
                <Textarea
                  id="edit-formula"
                  value={editingFormula.formula_text}
                  onChange={(e) => setEditingFormula({...editingFormula, formula_text: e.target.value})}
                  rows={6}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-instructions">Instructions</Label>
                <Textarea
                  id="edit-instructions"
                  value={editingFormula.instructions || ""}
                  onChange={(e) => setEditingFormula({...editingFormula, instructions: e.target.value})}
                  rows={6}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-notes">Notes</Label>
                <Textarea
                  id="edit-notes"
                  value={editingFormula.result_notes || ""}
                  onChange={(e) => setEditingFormula({...editingFormula, result_notes: e.target.value})}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-colorline">Color Line</Label>
                <Input
                  id="edit-colorline"
                  value={editingFormula.color_line || ""}
                  onChange={(e) => setEditingFormula({...editingFormula, color_line: e.target.value})}
                />
              </div>
              <Button onClick={handleEditFormula} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <DashboardLayout>
        <div>
          <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-4">
                  <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center gap-2">
                    <History className="h-6 w-6 text-primary" />
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Client Formula History</h1>
                  </div>
                </div>
                {formulas.length > 0 && (
                  <Button size="lg" className="gap-2" onClick={() => setDialogOpen(true)}>
                    <Plus className="h-5 w-5" />
                    New Formula
                  </Button>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Track all client formulas • Enter manually or generate with AI • For quick questions, use <button onClick={() => navigate("/ai-assistant")} className="text-primary hover:underline font-medium transition-colors">AI Chat Assistant →</button>
              </p>
            </div>
          </header>

          <main className="container mx-auto px-4 py-8">
            {/* Search Bar */}
            {formulas.length > 0 && (
              <div className="mb-6 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search formulas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            )}

            {/* Professional Disclaimer */}
            {formulas.length > 0 && (
              <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-lg border border-amber-200 dark:border-amber-900 mb-6">
                <p className="text-sm text-amber-800 dark:text-amber-200 leading-relaxed">
                  <strong>⚠️ Professional Disclaimer:</strong> All formulas are suggestions based on AI analysis. Individual results may vary due to hair chemistry, porosity, and previous treatments. Always perform strand and patch tests before applying any formula to clients.
                </p>
              </div>
            )}

            {/* Empty State */}
            {filteredFormulas.length === 0 && formulas.length === 0 ? (
              <Card className="border-[3px] border-primary/20 shadow-lg">
                <CardContent className="flex flex-col items-center justify-center py-16 px-4">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6 animate-scale-in">
                    <History className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="text-2xl font-display font-bold mb-3">Start Your Formula Library</h3>
                  <div className="max-w-md text-center space-y-3 mb-6">
                    <p className="text-muted-foreground">
                      Keep all your client color formulas in one place - perfect for recreating their favorite looks!
                    </p>
                    <div className="flex items-center justify-center gap-8 text-sm">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        <span className="font-medium">Manual Entry</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <span className="font-medium">AI Generation</span>
                      </div>
                    </div>
                  </div>
                  <Button 
                    size="lg" 
                    onClick={() => setDialogOpen(true)}
                    className="gap-2 shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-r from-primary to-secondary border-2 border-foreground shadow-[3px_3px_0px_0px_hsl(var(--foreground))] hover:shadow-[5px_5px_0px_0px_hsl(var(--foreground))] hover:-translate-y-0.5 font-display font-bold text-base"
                  >
                    <Plus className="h-5 w-5" />
                    Create Your First Formula
                    <Sparkles className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ) : filteredFormulas.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-muted-foreground">No formulas match your search</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {/* Group formulas by client */}
                {Object.entries(
                  filteredFormulas.reduce((acc: any, formula: any) => {
                    const clientName = formula.client?.user?.full_name || formula.client?.user?.email || "Unknown Client";
                    if (!acc[clientName]) {
                      acc[clientName] = [];
                    }
                    acc[clientName].push(formula);
                    return acc;
                  }, {})
                ).map(([clientName, clientFormulas]: [string, any]) => (
                  <div key={clientName} className="space-y-3">
                    <div className="flex items-center gap-2 px-1">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-semibold text-primary">
                          {clientName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h2 className="font-semibold text-lg">{clientName}</h2>
                        <p className="text-xs text-muted-foreground">{clientFormulas.length} formula{clientFormulas.length !== 1 ? 's' : ''}</p>
                      </div>
                    </div>
                    <div className="grid gap-4 pl-10">
                      {clientFormulas.map((formula: any) => (
                        <Card key={formula.id} className="border-l-4 border-l-primary/30">
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge variant="outline" className="text-xs">
                                    {new Date(formula.created_at).toLocaleDateString('en-US', { 
                                      month: 'short', 
                                      day: 'numeric', 
                                      year: 'numeric' 
                                    })}
                                  </Badge>
                                  {formula.color_line && (
                                    <Badge variant="secondary" className="text-xs">
                                      {formula.color_line}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <Button variant="ghost" size="sm" onClick={() => {
                                setEditingFormula(formula);
                                setEditDialogOpen(true);
                              }}>
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="bg-muted/50 p-4 rounded-lg">
                              <p className="font-semibold text-sm mb-2 text-primary">Formula:</p>
                              <p className="text-sm whitespace-pre-wrap leading-relaxed">
                                {formula.formula_text}
                              </p>
                            </div>
                            {formula.instructions && (
                              <div>
                                <p className="font-semibold text-sm mb-2 text-primary">Application Instructions:</p>
                                <p className="text-sm whitespace-pre-wrap leading-relaxed text-muted-foreground">
                                  {formula.instructions}
                                </p>
                              </div>
                            )}
                            {formula.result_notes && (
                              <div className="bg-secondary/10 p-3 rounded-lg">
                                <p className="font-semibold text-sm mb-1 text-secondary-foreground">Notes:</p>
                                <p className="text-sm text-muted-foreground">
                                  {formula.result_notes}
                                </p>
                              </div>
                            )}
                            {formula.hair_photo_url && (
                              <div>
                                <p className="font-semibold text-sm mb-2 text-primary">Reference Photo:</p>
                                <img 
                                  src={formula.hair_photo_url} 
                                  alt="Hair reference" 
                                  className="rounded-lg max-w-sm w-full object-cover"
                                />
                              </div>
                            )}
                            
                            {/* Quick Actions */}
                            <div className="flex gap-2 pt-2 border-t">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCopyFormula(formula)}
                                className="flex-1"
                              >
                                <Copy className="h-3 w-3 mr-1" />
                                Copy & Modify
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingFormula(formula);
                                  setEditDialogOpen(true);
                                }}
                                className="flex-1"
                              >
                                <Edit className="h-3 w-3 mr-1" />
                                Edit
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </DashboardLayout>

      {/* Add Client Dialog */}
      {stylistProfile && (
        <AddClientDialog
          open={addClientDialogOpen}
          onOpenChange={setAddClientDialogOpen}
          stylistId={stylistProfile.id}
          onClientAdded={(newClientId) => {
            // Reload clients and select the new one
            loadData().then(() => {
              setSelectedClient(newClientId);
            });
          }}
        />
      )}
    </>
  );
};

export default Formulas;
