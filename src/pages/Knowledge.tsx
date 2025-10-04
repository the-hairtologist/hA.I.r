import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Sparkles, Send, Save, CheckSquare, History, Trash2, BookOpen } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { HelpCircle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const Knowledge = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { roles, loading: roleLoading } = useUserRole(user?.id);
  
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState("");
  const [aiMode, setAiMode] = useState<"formula" | "stepbystep">("formula");
  const [aiMessages, setAiMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([]);
  const [aiInput, setAiInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Formula Generator specific state
  const [savedFormulas, setSavedFormulas] = useState<any[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [formulaToSave, setFormulaToSave] = useState("");
  const [formulaName, setFormulaName] = useState("");
  
  // Color Correction specific state
  const [correctionSteps, setCorrectionSteps] = useState<Array<{ step: string; completed: boolean }>>([]);
  const [currentCorrection, setCurrentCorrection] = useState<any>(null);
  
  // Feature info dialog state
  const [showFeatureInfo, setShowFeatureInfo] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<"formula" | "stepbystep" | null>(null);

  const featureDescriptions = {
    formula: {
      title: "Formula Generator",
      description: "Get AI-powered hair color formulas instantly. Perfect for creating custom color blends, balayage formulas, and toner recommendations.",
      benefits: ["Custom color formulas", "Balayage techniques", "Toner recommendations", "Level calculations"]
    },
    stepbystep: {
      title: "Color Correction",
      description: "Step-by-step guidance for fixing color mishaps. Track your progress with interactive checklists.",
      benefits: ["Fix brassy tones", "Remove unwanted colors", "Correct uneven color", "Professional troubleshooting"]
    }
  };

  const handleFeatureClick = (feature: "formula" | "stepbystep") => {
    setSelectedFeature(feature);
    setShowFeatureInfo(true);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [aiMessages]);

  useEffect(() => {
    if (!authLoading && !roleLoading && user && roles.length > 0) {
      const primaryRole = roles.includes('stylist') ? 'stylist' : roles[0];
      setUserRole(primaryRole);
      setLoading(false);
    } else if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [authLoading, roleLoading, user, roles]);

  useEffect(() => {
    if (userRole === "stylist") {
      loadSavedFormulas();
    }
  }, [userRole]);

  const checkUserRole = async () => {
    // This function is now handled by the useEffect above with useUserRole hook
  };

  const loadSavedFormulas = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from("ai_formulas")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      setSavedFormulas(data || []);
    } catch (error: any) {
      console.error("Error loading formulas:", error);
    }
  };

  const handleSaveFormula = async () => {
    if (!formulaName.trim() || !formulaToSave) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase
        .from("ai_formulas")
        .insert({
          user_id: session.user.id,
          formula_name: formulaName,
          prompt: aiMessages[aiMessages.length - 2]?.content || "",
          formula_content: formulaToSave,
        });

      if (error) throw error;

      toast.success("Formula saved successfully!");
      setShowSaveDialog(false);
      setFormulaName("");
      setFormulaToSave("");
      loadSavedFormulas();
    } catch (error: any) {
      console.error("Error saving formula:", error);
      toast.error("Failed to save formula");
    }
  };

  const handleDeleteFormula = async (id: string) => {
    try {
      const { error } = await supabase
        .from("ai_formulas")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Formula deleted");
      loadSavedFormulas();
    } catch (error: any) {
      console.error("Error deleting formula:", error);
      toast.error("Failed to delete formula");
    }
  };

  const parseStepsFromResponse = (response: string) => {
    const lines = response.split("\n");
    const steps: Array<{ step: string; completed: boolean }> = [];
    
    lines.forEach(line => {
      if (line.match(/^\d+\.|^Step \d+:|^-/)) {
        steps.push({
          step: line.replace(/^\d+\.|^Step \d+:|^-/, "").trim(),
          completed: false
        });
      }
    });
    
    return steps;
  };

  const handleAiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiInput.trim() || aiLoading) return;

    const userMessage = aiInput.trim();
    setAiInput("");
    setAiMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setAiLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("hair-assistant-chat", {
        body: {
          message: userMessage,
          mode: aiMode,
          conversationHistory: aiMessages
        }
      });

      if (error) throw error;

      setAiMessages(prev => [...prev, { role: "assistant", content: data.response }]);
      
      // For step-by-step mode, parse steps
      if (aiMode === "stepbystep") {
        const steps = parseStepsFromResponse(data.response);
        if (steps.length > 0) {
          setCorrectionSteps(steps);
        }
      }
    } catch (error: any) {
      console.error("AI Error:", error);
      toast.error("Failed to get AI response. Please try again.");
    } finally {
      setAiLoading(false);
    }
  };

  const toggleStepCompletion = (index: number) => {
    setCorrectionSteps(prev => prev.map((step, i) => 
      i === index ? { ...step, completed: !step.completed } : step
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10">
      <PageHeader
        title="AI Assistant"
        icon={<Sparkles className="h-6 w-6" />}
        backTo="/dashboard"
      />

      <main className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Mode Selection Tabs with Retro Style */}
        <div className="mb-6">
          <div className="flex gap-4 p-2 bg-background rounded-2xl w-fit mx-auto border-4 border-foreground shadow-[6px_6px_0px_0px_rgba(0,0,0,0.2)]">
            <div className="relative group">
              <button
                onClick={() => setAiMode("formula")}
                className={`flex items-center gap-2 px-8 py-4 rounded-xl font-display font-bold text-base transition-all border-3 ${
                  aiMode === "formula"
                    ? "bg-gradient-to-r from-primary to-secondary text-white border-foreground shadow-[3px_3px_0px_0px_rgba(0,0,0,0.3)] translate-x-0 translate-y-0"
                    : "bg-muted text-foreground border-border hover:translate-x-[1px] hover:translate-y-[1px] shadow-[3px_3px_0px_0px_rgba(0,0,0,0.1)]"
                }`}
                style={{ border: "3px solid" }}
              >
                <Sparkles className="h-5 w-5" />
                Formula Generator
              </button>
              <button
                onClick={() => handleFeatureClick("formula")}
                className="absolute -top-2 -right-2 w-6 h-6 bg-accent rounded-full flex items-center justify-center border-2 border-foreground shadow-md hover:scale-110 transition-transform z-10"
              >
                <HelpCircle className="h-3.5 w-3.5 text-white" />
              </button>
            </div>
            <div className="relative group">
              <button
                onClick={() => setAiMode("stepbystep")}
                className={`flex items-center gap-2 px-8 py-4 rounded-xl font-display font-bold text-base transition-all border-3 ${
                  aiMode === "stepbystep"
                    ? "bg-gradient-to-r from-accent to-primary text-white border-foreground shadow-[3px_3px_0px_0px_rgba(0,0,0,0.3)] translate-x-0 translate-y-0"
                    : "bg-muted text-foreground border-border hover:translate-x-[1px] hover:translate-y-[1px] shadow-[3px_3px_0px_0px_rgba(0,0,0,0.1)]"
                }`}
                style={{ border: "3px solid" }}
              >
                <BookOpen className="h-5 w-5" />
                Color Correction
              </button>
              <button
                onClick={() => handleFeatureClick("stepbystep")}
                className="absolute -top-2 -right-2 w-6 h-6 bg-accent rounded-full flex items-center justify-center border-2 border-foreground shadow-md hover:scale-110 transition-transform z-10"
              >
                <HelpCircle className="h-3.5 w-3.5 text-white" />
              </button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-[300px_1fr] gap-6">
          {/* Left Sidebar */}
          <div className="space-y-5">
            {/* Formula History */}
            {aiMode === "formula" && savedFormulas.length > 0 && (
              <div className="window-chrome bg-gradient-to-br from-secondary/5 to-primary/5">
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <History className="h-4 w-4 text-secondary" />
                    <h3 className="text-sm font-display font-bold">💾 Saved Formulas</h3>
                  </div>
                  <div className="space-y-2">
                    {savedFormulas.map((formula) => (
                      <div key={formula.id} className="group flex items-center justify-between p-3 rounded-lg bg-background/50 border-2 border-secondary/20 hover:border-secondary/40 transition-all">
                        <span className="text-xs truncate flex-1 font-medium">{formula.formula_name}</span>
                        <button
                          onClick={() => handleDeleteFormula(formula.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-destructive/20 rounded-md"
                        >
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step Progress */}
            {aiMode === "stepbystep" && correctionSteps.length > 0 && (
              <div className="window-chrome bg-gradient-to-br from-accent/5 to-primary/5">
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckSquare className="h-4 w-4 text-accent" />
                    <h3 className="text-sm font-display font-bold">📋 Progress Tracker</h3>
                  </div>
                  <div className="text-xs font-semibold text-accent mb-3">
                    {correctionSteps.filter(s => s.completed).length} / {correctionSteps.length} Done
                  </div>
                  <div className="space-y-2.5">
                    {correctionSteps.map((step, idx) => (
                      <label key={idx} className="flex items-start gap-3 cursor-pointer group p-2 rounded-lg hover:bg-accent/5 transition-colors">
                        <Checkbox
                          checked={step.completed}
                          onCheckedChange={() => toggleStepCompletion(idx)}
                          className="mt-0.5"
                        />
                        <span className={`text-xs leading-relaxed transition-all ${
                          step.completed ? "line-through text-muted-foreground" : "group-hover:text-accent font-medium"
                        }`}>
                          {step.step}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Main Chat Area */}
          <div>
            <div className="window-frame h-[calc(100vh-200px)] flex flex-col bg-background">
              <div className="window-titlebar bg-gradient-to-r from-primary via-secondary to-accent">
                <div className="flex items-center gap-3">
                  <div className="window-controls">
                    <div className="window-control bg-destructive"></div>
                    <div className="window-control bg-[hsl(40_95%_60%)]"></div>
                    <div className="window-control bg-accent"></div>
                  </div>
                  <h2 className="text-white font-display font-bold text-sm flex items-center gap-2">
                    {aiMode === "formula" ? (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Formula Generator
                      </>
                    ) : (
                      <>
                        <BookOpen className="h-4 w-4" />
                        Color Correction Guide
                      </>
                    )}
                  </h2>
                </div>
              </div>

              {/* Chat Messages */}
              <ScrollArea className="flex-1 p-5 bg-gradient-to-br from-background to-muted/20">
                {aiMessages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-5 px-4">
                    <div className="relative animate-bounce-gentle">
                      <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center shadow-[6px_6px_0px_0px_rgba(0,0,0,0.2)] border-4 border-foreground">
                        {aiMode === "formula" ? (
                          <Sparkles className="h-12 w-12 text-white" />
                        ) : (
                          <BookOpen className="h-12 w-12 text-white" />
                        )}
                      </div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-accent rounded-full flex items-center justify-center animate-pulse border-3 border-foreground">
                        <span className="text-sm">✨</span>
                      </div>
                    </div>
                    <div className="space-y-3 max-w-md">
                      <p className="text-lg font-display font-bold gradient-text">
                        {aiMode === "formula" ? "Let's Create Magic ✨" : "I Got You! 🔧"}
                      </p>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {aiMode === "formula"
                          ? "Tell me your vision and I'll craft the perfect formula with pro tips"
                          : "Describe the problem and I'll guide you through fixing it step-by-step"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {aiMessages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
                      >
                        <div
                          className={`max-w-[80%] rounded-2xl px-5 py-4 border-3 ${
                            msg.role === "user"
                              ? "bg-gradient-to-r from-primary to-secondary text-white border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]"
                              : "bg-background border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]"
                          }`}
                          style={{ border: "3px solid" }}
                        >
                          <p className="text-sm whitespace-pre-wrap leading-relaxed font-medium">{msg.content}</p>
                          {msg.role === "assistant" && aiMode === "formula" && idx === aiMessages.length - 1 && (
                            <button
                              onClick={() => {
                                setFormulaToSave(msg.content);
                                setShowSaveDialog(true);
                              }}
                              className="mt-4 retro-button bg-gradient-to-r from-secondary to-accent text-white px-4 py-2 rounded-lg font-display font-bold text-sm flex items-center gap-2"
                            >
                              <Save className="h-4 w-4" />
                              Save Formula
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {aiLoading && (
                      <div className="flex justify-start animate-fade-in">
                        <div className="bg-muted/80 backdrop-blur-sm rounded-2xl px-5 py-3 flex items-center gap-3 border-3 border-accent shadow-[3px_3px_0px_0px_rgba(0,0,0,0.1)]" style={{ border: "3px solid" }}>
                          <Loader2 className="h-5 w-5 animate-spin text-accent" />
                          <span className="text-sm font-medium text-foreground">Crafting magic...</span>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </ScrollArea>

              {/* Input Form */}
              <form onSubmit={handleAiSubmit} className="p-4 bg-gradient-to-r from-muted/50 to-muted/30 border-t-4 border-foreground">
                <div className="flex gap-3">
                  <Input
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    placeholder={
                      aiMode === "formula"
                        ? "What formula do you need? ✨"
                        : "What's the color issue? 🔧"
                    }
                    disabled={aiLoading}
                    className="flex-1 border-3 border-foreground rounded-xl font-medium focus-visible:ring-primary/50 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]"
                    style={{ border: "3px solid" }}
                  />
                  <button
                    type="submit" 
                    disabled={aiLoading || !aiInput.trim()} 
                    className="retro-button bg-gradient-to-r from-primary to-accent text-white px-6 rounded-xl font-display font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Send className="h-4 w-4" />
                    Send
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Save Formula Dialog */}
        <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Save Formula</DialogTitle>
              <DialogDescription>
                Give this formula a name to save it to your library
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="formula-name">Formula Name</Label>
                <Input
                  id="formula-name"
                  value={formulaName}
                  onChange={(e) => setFormulaName(e.target.value)}
                  placeholder="e.g., Warm Blonde Balayage"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveFormula} disabled={!formulaName.trim()}>
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Feature Info Dialog */}
        <Dialog open={showFeatureInfo} onOpenChange={setShowFeatureInfo}>
          <DialogContent className="max-w-md border-4 border-foreground shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)]">
            <DialogHeader>
              <DialogTitle className="font-display text-2xl gradient-text flex items-center gap-2">
                {selectedFeature === "formula" ? <Sparkles className="h-6 w-6" /> : <BookOpen className="h-6 w-6" />}
                {selectedFeature && featureDescriptions[selectedFeature].title}
              </DialogTitle>
              <DialogDescription className="text-base pt-2">
                {selectedFeature && featureDescriptions[selectedFeature].description}
              </DialogDescription>
            </DialogHeader>
            {selectedFeature && (
              <div className="space-y-4 pt-2">
                <div>
                  <h4 className="font-display font-bold mb-2 text-sm">What You Can Do:</h4>
                  <ul className="space-y-2">
                    {featureDescriptions[selectedFeature].benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default Knowledge;
