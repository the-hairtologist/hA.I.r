import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Scissors, Plus, Upload, Sparkles, ArrowLeft, Loader2, CheckCircle, Search, Edit, Save, FileText, History } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  
  // Form state
  const [selectedClient, setSelectedClient] = useState("");
  const [hairDescription, setHairDescription] = useState("");
  const [colorLine, setColorLine] = useState("");
  const [clientNotes, setClientNotes] = useState("");
  const [hairPhoto, setHairPhoto] = useState<File | null>(null);
  const [generatedFormulas, setGeneratedFormulas] = useState<any[]>([]);

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

      // Get clients from appointments (all clients who have booked with this stylist)
      const { data: appointmentsData } = await supabase
        .from("appointments")
        .select(`client_id`)
        .eq("stylist_id", stylist.id);

      const clientIds = [...new Set(appointmentsData?.map(apt => apt.client_id) || [])];
      
      let clientsData = [];
      if (clientIds.length > 0) {
        const { data } = await supabase
          .from("client_profiles")
          .select(`
            id,
            user:profiles(full_name, email)
          `)
          .in("id", clientIds);
        clientsData = data || [];
      }

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
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file");
        return null;
      }

      // Validate file size (10MB limit)
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
      setSelectedClient("");
      setHairDescription("");
      setClientNotes("");
      setColorLine("");
      setActiveTab("manual");
      loadData();
    } catch (error: any) {
      console.error("Error saving formula:", error);
      toast.error("Error saving formula");
    }
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

  const filteredFormulas = formulas.filter(formula =>
    formula.client?.user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    formula.formula_text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    formula.color_line?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
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
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Formula
                </Button>
              </DialogTrigger>
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
                  <div className="space-y-2">
                    <Label htmlFor="manual-client">Select Client *</Label>
                    <Select value={selectedClient} onValueChange={setSelectedClient}>
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Choose a client" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover z-50 max-h-[300px]">
                        {clients.length === 0 ? (
                          <div className="p-4 text-sm text-muted-foreground text-center">
                            <p>No clients found</p>
                            <p className="text-xs mt-1">Clients will appear after their first booking</p>
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
                    <Label htmlFor="client">Select Client *</Label>
                  <Select value={selectedClient} onValueChange={setSelectedClient}>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Choose a client" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover z-50 max-h-[300px]">
                      {clients.length === 0 ? (
                        <div className="p-4 text-sm text-muted-foreground text-center">
                          <p>No clients found</p>
                          <p className="text-xs mt-1">Clients will appear after their first booking</p>
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

        {formulas.length > 0 && (
          <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-lg border border-amber-200 dark:border-amber-900 mb-6">
            <p className="text-sm text-amber-800 dark:text-amber-200 leading-relaxed">
              <strong>⚠️ Professional Disclaimer:</strong> All formulas are suggestions based on AI analysis. Individual results may vary due to hair chemistry, porosity, and previous treatments. Always perform strand and patch tests before applying any formula to clients.
            </p>
          </div>
        )}

        {filteredFormulas.length === 0 && formulas.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <History className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-xl font-semibold mb-2">No client formulas yet</p>
              <p className="text-muted-foreground mb-4">Create your first formula manually or with AI assistance</p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Formula
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
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

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
      </main>
    </div>
  );
};

export default Formulas;
