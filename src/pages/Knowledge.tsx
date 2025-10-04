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
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <PageHeader
        title="AI Assistant"
        icon={<Sparkles className="h-6 w-6" />}
        backTo="/dashboard"
      />

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Sidebar - Mode Selection */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Choose Assistant Mode</CardTitle>
                <CardDescription>Select what you need help with</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant={aiMode === "formula" ? "default" : "outline"}
                  className="w-full justify-start h-auto py-3 px-4"
                  onClick={() => setAiMode("formula")}
                >
                  <div className="text-left">
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles className="h-4 w-4" />
                      <span className="font-semibold">Formula Generator</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Get formulas and color approaches
                    </p>
                  </div>
                </Button>
                <Button
                  variant={aiMode === "stepbystep" ? "default" : "outline"}
                  className="w-full justify-start h-auto py-3 px-4"
                  onClick={() => setAiMode("stepbystep")}
                >
                  <div className="text-left">
                    <div className="flex items-center gap-2 mb-1">
                      <BookOpen className="h-4 w-4" />
                      <span className="font-semibold">Color Correction Guide</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Complex fixes & detailed steps
                    </p>
                  </div>
                </Button>
              </CardContent>
            </Card>

            {/* Quick Examples */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Quick Examples</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {aiMode === "formula" ? (
                  <>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="w-full justify-start text-xs h-auto py-2"
                      onClick={() => setAiInput("What's the best approach for lifting level 5 hair to a warm blonde?")}
                    >
                      Blonde Lifting Approach
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="w-full justify-start text-xs h-auto py-2"
                      onClick={() => setAiInput("I need a balayage formula for natural dimension on level 6 hair")}
                    >
                      Balayage Formula
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="w-full justify-start text-xs h-auto py-2"
                      onClick={() => setAiInput("Recommend a toner formula for level 9 blonde")}
                    >
                      Toner Recommendation
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="w-full justify-start text-xs h-auto py-2"
                      onClick={() => setAiInput("How do I fix brassy orange hair from a failed lift?")}
                    >
                      Fix Brassy Hair
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="w-full justify-start text-xs h-auto py-2"
                      onClick={() => setAiInput("Step-by-step to remove green tones from blonde hair")}
                    >
                      Remove Green Tones
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="w-full justify-start text-xs h-auto py-2"
                      onClick={() => setAiInput("How to correct uneven color and banding")}
                    >
                      Fix Banding Issues
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Formula History (only for formula mode) */}
            {aiMode === "formula" && savedFormulas.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <History className="h-4 w-4" />
                    Recent Formulas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {savedFormulas.map((formula) => (
                    <div key={formula.id} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                      <span className="text-xs truncate flex-1">{formula.formula_name}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0"
                        onClick={() => handleDeleteFormula(formula.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Step Progress (only for step-by-step mode) */}
            {aiMode === "stepbystep" && correctionSteps.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <CheckSquare className="h-4 w-4" />
                    Progress Tracker
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-xs text-muted-foreground mb-2">
                    {correctionSteps.filter(s => s.completed).length} of {correctionSteps.length} steps
                  </div>
                  {correctionSteps.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <Checkbox
                        checked={step.completed}
                        onCheckedChange={() => toggleStepCompletion(idx)}
                        className="mt-1"
                      />
                      <span className={`text-xs ${step.completed ? "line-through text-muted-foreground" : ""}`}>
                        {step.step}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

          </div>

          {/* Main Chat Area */}
          <div className="lg:col-span-2">
            <Card className="h-[calc(100vh-220px)] flex flex-col">
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {aiMode === "formula" ? (
                        <>
                          <Sparkles className="h-5 w-5 text-primary" />
                          Formula Generator
                        </>
                      ) : (
                        <>
                          <BookOpen className="h-5 w-5 text-primary" />
                          Color Correction Guide
                        </>
                      )}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {aiMode === "formula"
                        ? "Get formulas and guidance for color approaches"
                        : "Detailed step-by-step instructions for complex color corrections"}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              {/* Chat Messages */}
              <ScrollArea className="flex-1 p-6">
                {aiMessages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      {aiMode === "formula" ? (
                        <Sparkles className="h-8 w-8 text-primary" />
                      ) : (
                        <BookOpen className="h-8 w-8 text-primary" />
                      )}
                    </div>
                    <div className="space-y-2">
                      <p className="text-lg font-medium">
                        {aiMode === "formula" ? "Ready to create formulas" : "Ready to solve problems"}
                      </p>
                      <p className="text-sm text-muted-foreground max-w-md">
                        {aiMode === "formula"
                          ? "Tell me what color result you're aiming for and I'll suggest formulas and approaches"
                          : "Describe the color problem you're facing and I'll guide you through the correction process step by step"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {aiMessages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                            msg.role === "user"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                          {msg.role === "assistant" && aiMode === "formula" && idx === aiMessages.length - 1 && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="mt-3"
                              onClick={() => {
                                setFormulaToSave(msg.content);
                                setShowSaveDialog(true);
                              }}
                            >
                              <Save className="h-3 w-3 mr-2" />
                              Save Formula
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {aiLoading && (
                      <div className="flex justify-start">
                        <div className="bg-muted rounded-2xl px-4 py-3 flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-sm text-muted-foreground">Thinking...</span>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </ScrollArea>

              {/* Input Form */}
              <form onSubmit={handleAiSubmit} className="p-4 border-t bg-muted/30">
                <div className="flex gap-3">
                  <Input
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    placeholder={
                      aiMode === "formula"
                        ? "Describe the formula you need..."
                        : "Ask your question..."
                    }
                    disabled={aiLoading}
                    className="flex-1"
                  />
                  <Button type="submit" disabled={aiLoading || !aiInput.trim()} size="icon" className="shrink-0">
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
