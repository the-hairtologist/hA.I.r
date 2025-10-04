import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Sparkles, Send, Save, CheckSquare, History, Trash2, BookOpen } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const Knowledge = () => {
  const navigate = useNavigate();
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [aiMessages]);

  useEffect(() => {
    checkUserRole();
  }, []);

  useEffect(() => {
    if (userRole === "stylist") {
      loadSavedFormulas();
    }
  }, [userRole]);

  const checkUserRole = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id);

      setUserRole(roleData?.[0]?.role || "client");
    } catch (error: any) {
      console.error("Error checking role:", error);
    } finally {
      setLoading(false);
    }
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
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <PageHeader
        title="AI Assistant"
        icon={<Sparkles className="h-6 w-6" />}
        backTo="/dashboard"
      />

      <main className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Mode Selection Tabs */}
        <div className="mb-6">
          <div className="flex gap-3 p-1.5 bg-muted/50 rounded-xl w-fit mx-auto backdrop-blur-sm">
            <button
              onClick={() => setAiMode("formula")}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                aiMode === "formula"
                  ? "bg-background shadow-md text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Sparkles className="h-4 w-4" />
              Formula Generator
            </button>
            <button
              onClick={() => setAiMode("stepbystep")}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                aiMode === "stepbystep"
                  ? "bg-background shadow-md text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <BookOpen className="h-4 w-4" />
              Color Correction
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-[280px_1fr] gap-6">
          {/* Left Sidebar - Quick Actions & Features */}
          <div className="space-y-4">
            {/* Quick Examples */}
            <Card className="border-primary/20 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Quick Start
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1.5">
                {aiMode === "formula" ? (
                  <>
                    <button
                      onClick={() => setAiInput("What's the best approach for lifting level 5 hair to a warm blonde?")}
                      className="w-full text-left px-3 py-2 rounded-md text-xs hover:bg-primary/10 transition-colors"
                    >
                      💫 Blonde Lifting
                    </button>
                    <button
                      onClick={() => setAiInput("I need a balayage formula for natural dimension on level 6 hair")}
                      className="w-full text-left px-3 py-2 rounded-md text-xs hover:bg-primary/10 transition-colors"
                    >
                      ✨ Balayage Formula
                    </button>
                    <button
                      onClick={() => setAiInput("Recommend a toner formula for level 9 blonde")}
                      className="w-full text-left px-3 py-2 rounded-md text-xs hover:bg-primary/10 transition-colors"
                    >
                      🎨 Toner Guide
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setAiInput("How do I fix brassy orange hair from a failed lift?")}
                      className="w-full text-left px-3 py-2 rounded-md text-xs hover:bg-primary/10 transition-colors"
                    >
                      🔧 Fix Brassy Hair
                    </button>
                    <button
                      onClick={() => setAiInput("Step-by-step to remove green tones from blonde hair")}
                      className="w-full text-left px-3 py-2 rounded-md text-xs hover:bg-primary/10 transition-colors"
                    >
                      🌿 Remove Green Tones
                    </button>
                    <button
                      onClick={() => setAiInput("How to correct uneven color and banding")}
                      className="w-full text-left px-3 py-2 rounded-md text-xs hover:bg-primary/10 transition-colors"
                    >
                      📏 Fix Banding
                    </button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Formula History */}
            {aiMode === "formula" && savedFormulas.length > 0 && (
              <Card className="border-primary/20 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <History className="h-4 w-4 text-primary" />
                    Saved Formulas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1.5">
                  {savedFormulas.map((formula) => (
                    <div key={formula.id} className="group flex items-center justify-between p-2 rounded-md hover:bg-muted/50 transition-colors">
                      <span className="text-xs truncate flex-1 font-medium">{formula.formula_name}</span>
                      <button
                        onClick={() => handleDeleteFormula(formula.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-destructive/10 rounded"
                      >
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Step Progress */}
            {aiMode === "stepbystep" && correctionSteps.length > 0 && (
              <Card className="border-primary/20 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <CheckSquare className="h-4 w-4 text-primary" />
                    Progress
                  </CardTitle>
                  <div className="text-xs text-muted-foreground mt-1">
                    {correctionSteps.filter(s => s.completed).length} of {correctionSteps.length} completed
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {correctionSteps.map((step, idx) => (
                    <label key={idx} className="flex items-start gap-2.5 cursor-pointer group">
                      <Checkbox
                        checked={step.completed}
                        onCheckedChange={() => toggleStepCompletion(idx)}
                        className="mt-0.5"
                      />
                      <span className={`text-xs leading-relaxed transition-colors ${
                        step.completed ? "line-through text-muted-foreground" : "group-hover:text-primary"
                      }`}>
                        {step.step}
                      </span>
                    </label>
                  ))}
                </CardContent>
              </Card>
            )}

          </div>

          {/* Main Chat Area */}
          <div>
            <Card className="h-[calc(100vh-200px)] flex flex-col shadow-lg border-primary/20">
              <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-accent/5 py-4">
                <CardTitle className="text-base flex items-center gap-2">
                  {aiMode === "formula" ? (
                    <>
                      <div className="p-1.5 rounded-lg bg-primary/10">
                        <Sparkles className="h-4 w-4 text-primary" />
                      </div>
                      <span>Formula Generator</span>
                    </>
                  ) : (
                    <>
                      <div className="p-1.5 rounded-lg bg-primary/10">
                        <BookOpen className="h-4 w-4 text-primary" />
                      </div>
                      <span>Color Correction Guide</span>
                    </>
                  )}
                </CardTitle>
                <CardDescription className="text-xs mt-1.5">
                  {aiMode === "formula"
                    ? "AI-powered formulas and color approaches tailored to your needs"
                    : "Step-by-step guidance for complex color corrections"}
                </CardDescription>
              </CardHeader>

              {/* Chat Messages */}
              <ScrollArea className="flex-1 p-4">
                {aiMessages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4 px-4">
                    <div className="relative">
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center backdrop-blur-sm">
                        {aiMode === "formula" ? (
                          <Sparkles className="h-10 w-10 text-primary" />
                        ) : (
                          <BookOpen className="h-10 w-10 text-primary" />
                        )}
                      </div>
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center animate-pulse">
                        <span className="text-xs">✨</span>
                      </div>
                    </div>
                    <div className="space-y-2 max-w-md">
                      <p className="text-base font-semibold">
                        {aiMode === "formula" ? "Let's Create Your Perfect Formula" : "I'm Here to Help Fix It"}
                      </p>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {aiMode === "formula"
                          ? "Share your vision and I'll craft precise formulas with professional guidance"
                          : "Describe what went wrong and I'll walk you through fixing it, step by step"}
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
                          className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${
                            msg.role === "user"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted/80 backdrop-blur-sm"
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                          {msg.role === "assistant" && aiMode === "formula" && idx === aiMessages.length - 1 && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="mt-3 hover:bg-primary/10"
                              onClick={() => {
                                setFormulaToSave(msg.content);
                                setShowSaveDialog(true);
                              }}
                            >
                              <Save className="h-3 w-3 mr-2" />
                              Save This Formula
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {aiLoading && (
                      <div className="flex justify-start animate-fade-in">
                        <div className="bg-muted/80 backdrop-blur-sm rounded-2xl px-4 py-3 flex items-center gap-2 shadow-sm">
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                          <span className="text-sm text-muted-foreground">Crafting your response...</span>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </ScrollArea>

              {/* Input Form */}
              <form onSubmit={handleAiSubmit} className="p-4 border-t bg-gradient-to-r from-muted/30 to-muted/50">
                <div className="flex gap-2">
                  <Input
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    placeholder={
                      aiMode === "formula"
                        ? "Describe what you want to create..."
                        : "What color issue are you facing?"
                    }
                    disabled={aiLoading}
                    className="flex-1 border-primary/20 focus-visible:ring-primary/30"
                  />
                  <Button 
                    type="submit" 
                    disabled={aiLoading || !aiInput.trim()} 
                    size="icon" 
                    className="shrink-0 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </form>
            </Card>
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
      </main>
    </div>
  );
};

export default Knowledge;
