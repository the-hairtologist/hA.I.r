import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Sparkles, Send, Save, CheckSquare, History, Trash2 } from "lucide-react";
import { LoadingDots } from "@/components/ui/loading-dots";
import { PageHeader } from "@/components/PageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { AIDisclaimer } from "@/components/AIDisclaimer";

const Knowledge = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { roles, loading: roleLoading } = useUserRole(user?.id);
  
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState("");
  const [aiMessages, setAiMessages] = useState<Array<{ role: "user" | "assistant"; content: string | any; imageUrls?: string[] }>>([]);
  const [aiInput, setAiInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Formula Generator specific state
  const [savedFormulas, setSavedFormulas] = useState<any[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [formulaToSave, setFormulaToSave] = useState("");
  const [formulaName, setFormulaName] = useState("");
  
  // Color Correction specific state
  const [correctionSteps, setCorrectionSteps] = useState<Array<{ step: string; completed: boolean }>>([]);

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
    const messageWithImages = uploadedImages.length > 0 
      ? { role: "user" as const, content: userMessage, imageUrls: uploadedImages }
      : { role: "user" as const, content: userMessage };
    
    setAiInput("");
    setAiMessages(prev => [...prev, messageWithImages]);
    setAiLoading(true);

    try {
      // Build conversation history with images
      const historyWithImages = aiMessages.map(msg => {
        if (msg.imageUrls && msg.imageUrls.length > 0) {
          return {
            role: msg.role,
            content: [
              { type: 'text', text: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content) },
              ...msg.imageUrls.map(url => ({
                type: 'image_url',
                image_url: { url }
              }))
            ]
          };
        }
        return { role: msg.role, content: msg.content };
      });

      const { data, error } = await supabase.functions.invoke("hair-assistant-chat", {
        body: {
          message: userMessage,
          mode: "unified", // Unified mode handles both formulas and steps
          conversationHistory: historyWithImages,
          images: uploadedImages.length > 0 ? uploadedImages : undefined
        }
      });

      if (error) throw error;

      setAiMessages(prev => [...prev, { role: "assistant", content: data.response }]);
      
      // Auto-parse steps from any response that contains numbered lists
      const steps = parseStepsFromResponse(data.response);
      if (steps.length > 0) {
        setCorrectionSteps(steps);
      }
    } catch (error: any) {
      console.error("AI Error:", error);
      
      // Provide actionable error message
      const errorMessage = error.message?.includes("rate limit") 
        ? "AI service is busy. Please wait a moment and try again."
        : error.message?.includes("network")
        ? "Connection issue. Check your internet and try again."
        : "AI service temporarily unavailable. Please try again.";
      
      toast.error(errorMessage, {
        description: "Your message was saved and you can retry",
        action: {
          label: "Retry",
          onClick: () => handleAiSubmit(new Event('submit') as any)
        }
      });
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
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">Loading AI Assistant...</p>
        </div>
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
        {/* AI Assistant Header */}
        <div className="mb-6">
          <div className="max-w-2xl mx-auto text-center p-5 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 rounded-2xl border-4 border-foreground shadow-[6px_6px_0px_0px_hsl(var(--foreground)_/_0.2)]">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Sparkles className="h-7 w-7 text-primary animate-pulse" />
              <h2 className="text-xl font-display font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                AI Hair Pro
              </h2>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              <span className="font-semibold text-foreground">Your expert stylist assistant.</span> Get color formulas, step-by-step techniques, corrections, and pro advice instantly.
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-[300px_1fr] gap-6">
          {/* Left Sidebar */}
          <div className="space-y-5">
            {/* Formula History */}
            {savedFormulas.length > 0 && (
              <div className="window-chrome bg-gradient-to-br from-secondary/5 to-primary/5">
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <History className="h-4 w-4 text-secondary" />
                    <h3 className="text-sm font-display font-bold">Saved Formulas</h3>
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

            {/* Step Progress - Auto-shows when AI provides steps */}
            {correctionSteps.length > 0 && (
              <div className="window-chrome bg-gradient-to-br from-accent/5 to-primary/5">
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckSquare className="h-4 w-4 text-accent" />
                    <h3 className="text-sm font-display font-bold">Step Tracker</h3>
                  </div>
                  <div className="text-xs font-semibold text-accent mb-3">
                    {correctionSteps.filter(s => s.completed).length} / {correctionSteps.length} Complete
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
                    <div className="window-control bg-warning"></div>
                    <div className="window-control bg-accent"></div>
                  </div>
                  <h2 className="text-primary-foreground font-display font-bold text-sm flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    AI Hair Pro Assistant
                  </h2>
                </div>
              </div>

              {/* Chat Messages */}
              <ScrollArea className="flex-1 p-5 bg-gradient-to-br from-background to-muted/20">
                {/* AI Disclaimer */}
                <div className="mb-4">
                  <AIDisclaimer context="chat" />
                </div>
                
                {aiLoading && aiMessages.length === 0 ? (
                  <div className="space-y-4">
                    <div className="flex justify-start">
                      <div className="max-w-[80%] rounded-2xl p-4 bg-muted/50 border-2 border-border animate-pulse">
                        <div className="h-4 w-64 bg-muted-foreground/20 rounded mb-2" />
                        <div className="h-4 w-48 bg-muted-foreground/20 rounded" />
                      </div>
                    </div>
                  </div>
                ) : aiMessages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-5 px-4">
                    <div className="relative animate-bounce-gentle">
                      <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center shadow-[6px_6px_0px_0px_hsl(var(--foreground)_/_0.2)] border-4 border-foreground">
                        <Sparkles className="h-12 w-12 text-primary-foreground" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-accent rounded-full flex items-center justify-center animate-pulse border-3 border-foreground">
                        <span className="text-sm">✨</span>
                      </div>
                    </div>
                    <div className="space-y-3 max-w-md">
                      <p className="text-lg font-display font-bold gradient-text">
                        Ready to Create Magic ✨
                      </p>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Ask me anything! I can create custom color formulas ("warm blonde balayage for level 5 hair"), guide you through corrections ("fix brassy orange tones"), or provide step-by-step techniques ("how to do a root melt"). Let's get started!
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
                              ? "bg-gradient-to-r from-primary to-secondary text-primary-foreground border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground)_/_0.2)]"
                              : "bg-background border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground)_/_0.1)]"
                          }`}
                          style={{ border: "3px solid" }}
                        >
                          <p className="text-sm whitespace-pre-wrap leading-relaxed font-medium">{msg.content}</p>
                          {msg.role === "assistant" && idx === aiMessages.length - 1 && (
                            <button
                              onClick={() => {
                                setFormulaToSave(msg.content);
                                setShowSaveDialog(true);
                              }}
                              className="mt-4 retro-button bg-gradient-to-r from-secondary to-accent text-secondary-foreground px-4 py-2 rounded-lg font-display font-bold text-sm flex items-center gap-2"
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
                        <div className="bg-muted/80 backdrop-blur-sm rounded-2xl px-5 py-3 flex items-center gap-3 border-3 border-accent shadow-[3px_3px_0px_0px_hsl(var(--foreground)_/_0.1)]" style={{ border: "3px solid" }}>
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
                    placeholder="Ask me anything: formulas, techniques, corrections..."
                    disabled={aiLoading}
                    className="flex-1 border-3 border-foreground rounded-xl font-medium focus-visible:ring-primary/50 shadow-[2px_2px_0px_0px_hsl(var(--foreground)_/_0.1)]"
                    style={{ border: "3px solid" }}
                  />
                  <button
                    type="submit" 
                    disabled={aiLoading || !aiInput.trim()} 
                    className="retro-button bg-gradient-to-r from-primary to-accent text-primary-foreground px-6 rounded-xl font-display font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
      </main>
    </div>
  );
};

export default Knowledge;
