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
import { Scissors, Plus, Upload, Sparkles, ArrowLeft, Loader2, CheckCircle } from "lucide-react";

const Formulas = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [formulas, setFormulas] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [stylistProfile, setStylistProfile] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  
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

      // Get clients
      const { data: clientsData } = await supabase
        .from("client_profiles")
        .select(`
          id,
          user:profiles(full_name, email)
        `)
        .eq("preferred_stylist_id", stylist.id);

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
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2">
              <Scissors className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">Formulas & History</h1>
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
                <DialogTitle>Generate AI Formula</DialogTitle>
                <DialogDescription>
                  Upload a hair photo and describe what you want to achieve
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
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
                    <div className="flex items-center gap-2 text-primary">
                      <Sparkles className="h-5 w-5" />
                      <h3 className="font-semibold text-lg">AI Generated Formulas</h3>
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
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6">
          {formulas.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Scissors className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-xl font-semibold mb-2">No formulas yet</p>
                <p className="text-muted-foreground mb-4">Create your first AI-powered formula</p>
                <Button onClick={() => setDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Formula
                </Button>
              </CardContent>
            </Card>
          ) : (
            formulas.map((formula) => (
              <Card key={formula.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>
                        {formula.client?.user?.full_name || "Client"}
                      </CardTitle>
                      <CardDescription>
                        {new Date(formula.created_at).toLocaleDateString()} • {formula.color_line || "Professional"}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="font-semibold text-sm mb-1">Formula:</p>
                    <p className="text-sm whitespace-pre-wrap bg-muted p-3 rounded-md">
                      {formula.formula_text}
                    </p>
                  </div>
                  {formula.instructions && (
                    <div>
                      <p className="font-semibold text-sm mb-1">Instructions:</p>
                      <p className="text-sm whitespace-pre-wrap">
                        {formula.instructions}
                      </p>
                    </div>
                  )}
                  {formula.result_notes && (
                    <div>
                      <p className="font-semibold text-sm mb-1">Notes:</p>
                      <p className="text-sm text-muted-foreground">
                        {formula.result_notes}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default Formulas;
