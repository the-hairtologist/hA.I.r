import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowLeft, Send, Sparkles, Loader2, User, Bot, Trash2, BookmarkPlus, Zap, Star } from "lucide-react";
import { SaveFormulaDialog } from "@/components/SaveFormulaDialog";
import { cn } from "@/lib/utils";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const AIAssistant = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [stylistProfile, setStylistProfile] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [selectedFormulaText, setSelectedFormulaText] = useState("");

  useEffect(() => {
    loadStylistProfile();
  }, []);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const loadStylistProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      const { data: stylist } = await supabase
        .from("stylist_profiles")
        .select("*")
        .eq("user_id", session.user.id)
        .single();

      if (stylist) {
        setStylistProfile(stylist);
        // Add welcome message
        setMessages([{
          role: 'assistant',
          content: `Hi! I'm your personal AI Hair Color Assistant. I can help you with:\n\n✨ **Formula consultations** - Get expert advice on color formulations\n🔧 **Troubleshooting** - Fix color issues and challenges\n💡 **Technique guidance** - Learn best practices and application methods\n👥 **Client consultations** - Interpret requests and set expectations\n\nWhat can I help you with today?`
        }]);
      }
    } catch (error: any) {
      console.error("Error loading profile:", error);
      toast.error("Failed to load profile");
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    // Input validation
    const messageText = input.trim();
    const MAX_MESSAGE_LENGTH = 2000;
    
    if (messageText.length > MAX_MESSAGE_LENGTH) {
      toast.error(`Message too long. Please keep it under ${MAX_MESSAGE_LENGTH} characters.`);
      return;
    }

    if (messageText.length < 3) {
      toast.error("Please enter a more detailed question.");
      return;
    }

    const userMessage: Message = {
      role: 'user',
      content: messageText
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      console.log('🤖 Sending message to AI assistant...');
      
      const { data, error } = await supabase.functions.invoke('hair-assistant-chat', {
        body: {
          messages: [...messages, userMessage],
          stylistProfile: stylistProfile
        },
      });

      console.log('📨 AI response:', data);

      if (error) {
        console.error('❌ Error from edge function:', error);
        
        // Handle specific error types
        if (error.message?.includes('Rate limit')) {
          toast.error("Too many requests. Please wait a moment and try again.");
        } else if (error.message?.includes('usage limit')) {
          toast.error("AI usage limit reached. Please contact support to add credits.");
        } else {
          toast.error("Failed to get response. Please try again.");
        }
        
        throw error;
      }

      if (!data?.message) {
        throw new Error("Invalid response from AI assistant");
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.message
      };

      setMessages(prev => [...prev, assistantMessage]);
      
    } catch (error: any) {
      console.error("❌ Error sending message:", error);
      
      // Remove the user message if the request failed
      setMessages(prev => prev.slice(0, -1));
      setInput(messageText); // Restore the input so user can try again
      
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([{
      role: 'assistant',
      content: `Hi! I'm your personal AI Hair Color Assistant. I can help you with:\n\n✨ **Formula consultations** - Get expert advice on color formulations\n🔧 **Troubleshooting** - Fix color issues and challenges\n💡 **Technique guidance** - Learn best practices and application methods\n👥 **Client consultations** - Interpret requests and set expectations\n\nWhat can I help you with today?`
    }]);
    setInput("");
    toast.success("Chat cleared");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const exampleQuestions = [
    "How do I lighten dark hair to honey blonde?",
    "My client has banding from previous color, how do I fix it?",
    "What's the best way to cover gray on resistant hair?",
    "I need a formula for a dimensional balayage on level 6 hair"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-fuchsia-50 to-cyan-50">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-violet-400/20 to-fuchsia-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-cyan-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-br from-pink-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <header className="border-b-[3px] border-foreground bg-white/80 backdrop-blur-sm sticky top-0 z-10 shadow-[0_4px_0px_0px_hsl(var(--foreground))]">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4 mb-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate("/dashboard")}
              className="border-2 border-foreground shadow-[2px_2px_0px_0px_hsl(var(--foreground))] hover:shadow-[1px_1px_0px_0px_hsl(var(--foreground))] hover:translate-x-[1px] hover:translate-y-[1px]"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-lg blur opacity-75 animate-pulse" />
                <div className="relative bg-gradient-to-r from-violet-500 to-fuchsia-500 p-2 rounded-lg border-2 border-foreground shadow-[3px_3px_0px_0px_hsl(var(--foreground))]">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-2">
                  AI Expert Chat
                  <Zap className="h-6 w-6 text-violet-500 animate-pulse" />
                </h1>
                <p className="text-sm font-semibold text-foreground/70">
                  Powered by Advanced AI • Instant Expert Advice
                </p>
              </div>
            </div>
          </div>
          <div className="ml-16 flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="border-2 border-violet-500 bg-violet-50 text-violet-700 font-semibold">
              <Star className="h-3 w-3 mr-1" />
              Nothing Saved
            </Badge>
            <span className="text-sm text-foreground/60">•</span>
            <p className="text-sm text-foreground/70">
              For client formulas, use <button onClick={() => navigate("/formulas")} className="text-violet-600 hover:text-violet-700 underline font-bold transition-colors">Formula Generator →</button>
            </p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-4xl relative">
        <Card className="h-[calc(100vh-200px)] flex flex-col border-[3px] border-foreground shadow-[8px_8px_0px_0px_hsl(var(--foreground))] bg-white overflow-hidden">
          {/* Gradient header overlay */}
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-violet-100 via-fuchsia-50 to-transparent pointer-events-none" />
          
          <CardHeader className="border-b-[3px] border-foreground relative bg-gradient-to-r from-violet-50 to-fuchsia-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-full blur-md opacity-50 animate-pulse" />
                  <Avatar className="h-12 w-12 border-[3px] border-foreground shadow-[3px_3px_0px_0px_hsl(var(--foreground))] relative bg-gradient-to-br from-violet-500 to-fuchsia-500">
                    <AvatarFallback className="bg-transparent">
                      <Bot className="h-6 w-6 text-white" />
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div>
                  <CardTitle className="font-display text-xl flex items-center gap-2">
                    Your AI Color Expert
                    <Badge className="bg-gradient-to-r from-violet-500 to-fuchsia-500 border-2 border-foreground shadow-[2px_2px_0px_0px_hsl(var(--foreground))] text-white font-bold">
                      <Sparkles className="h-3 w-3 mr-1 animate-pulse" />
                      LIVE
                    </Badge>
                  </CardTitle>
                  <p className="text-xs font-semibold text-foreground/60 mt-1">
                    ⚡ Instant responses • 🧠 Expert knowledge • 💯 Always available
                  </p>
                </div>
              </div>
              {messages.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearChat}
                  className="border-2 border-foreground shadow-[2px_2px_0px_0px_hsl(var(--foreground))] hover:shadow-[1px_1px_0px_0px_hsl(var(--foreground))] hover:translate-x-[1px] hover:translate-y-[1px] bg-white"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              )}
            </div>
          </CardHeader>

          <ScrollArea className="flex-1 p-6 bg-gradient-to-b from-transparent to-violet-50/30" ref={scrollRef}>
            <div className="space-y-6">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex gap-3 animate-fade-in",
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {message.role === 'assistant' && (
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-full blur-sm opacity-40 animate-pulse" />
                      <Avatar className="h-10 w-10 border-[3px] border-foreground shadow-[3px_3px_0px_0px_hsl(var(--foreground))] relative bg-gradient-to-br from-violet-500 to-fuchsia-500">
                        <AvatarFallback className="bg-transparent">
                          <Bot className="h-5 w-5 text-white" />
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  )}
                  
                  <div className="flex flex-col gap-2 max-w-[75%]">
                    <div
                      className={cn(
                        "rounded-xl px-5 py-4 border-[3px] border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))] transition-all hover:shadow-[6px_6px_0px_0px_hsl(var(--foreground))] hover:-translate-y-0.5",
                        message.role === 'user'
                          ? 'bg-gradient-to-br from-cyan-400 to-blue-500 text-white'
                          : 'bg-white'
                      )}
                    >
                      {message.role === 'assistant' && index === 0 && (
                        <div className="flex items-center gap-2 mb-3 pb-3 border-b-2 border-foreground/10">
                          <Sparkles className="h-4 w-4 text-violet-500 animate-pulse" />
                          <span className="text-xs font-bold text-violet-600">AI EXPERT</span>
                        </div>
                      )}
                      <p className={cn(
                        "text-sm whitespace-pre-wrap leading-relaxed font-medium",
                        message.role === 'user' ? 'text-white' : 'text-foreground'
                      )}>
                        {message.content}
                      </p>
                    </div>
                    
                    {/* Save as Formula button for AI messages */}
                    {message.role === 'assistant' && index > 0 && message.content.length > 50 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedFormulaText(message.content);
                          setSaveDialogOpen(true);
                        }}
                        className="self-start gap-2 text-xs h-8 border-2 border-foreground bg-white shadow-[2px_2px_0px_0px_hsl(var(--foreground))] hover:shadow-[1px_1px_0px_0px_hsl(var(--foreground))] hover:translate-x-[1px] hover:translate-y-[1px]"
                      >
                        <BookmarkPlus className="h-3 w-3" />
                        Save as Formula
                      </Button>
                    )}
                  </div>

                  {message.role === 'user' && (
                    <Avatar className="h-10 w-10 border-[3px] border-foreground shadow-[3px_3px_0px_0px_hsl(var(--foreground))] bg-gradient-to-br from-cyan-400 to-blue-500">
                      <AvatarFallback className="bg-transparent text-white">
                        <User className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex gap-3 justify-start animate-fade-in">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-full blur-sm opacity-40 animate-pulse" />
                    <Avatar className="h-10 w-10 border-[3px] border-foreground shadow-[3px_3px_0px_0px_hsl(var(--foreground))] relative bg-gradient-to-br from-violet-500 to-fuchsia-500">
                      <AvatarFallback className="bg-transparent">
                        <Bot className="h-5 w-5 text-white" />
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="rounded-xl px-5 py-4 bg-white border-[3px] border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))]">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-violet-500" />
                      <Sparkles className="h-3 w-3 text-fuchsia-500 animate-pulse" />
                      <span className="text-sm font-semibold text-foreground/60">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}

              {messages.length === 1 && !loading && (
                <div className="space-y-3 mt-6">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-violet-500" />
                    <p className="text-sm font-bold text-foreground/80">
                      Quick Start - Try these:
                    </p>
                  </div>
                  <div className="grid gap-3">
                    {exampleQuestions.map((question, idx) => (
                      <Button
                        key={idx}
                        variant="outline"
                        className="justify-start text-left h-auto py-3 px-4 border-[3px] border-foreground bg-white shadow-[3px_3px_0px_0px_hsl(var(--foreground))] hover:shadow-[5px_5px_0px_0px_hsl(var(--foreground))] hover:-translate-y-0.5 transition-all"
                        onClick={() => setInput(question)}
                      >
                        <Sparkles className="h-4 w-4 mr-2 text-violet-500 shrink-0" />
                        <span className="text-sm font-medium">{question}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <CardContent className="border-t-[3px] border-foreground p-4 bg-gradient-to-r from-violet-50 to-fuchsia-50">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about hair color..."
                  className="border-[3px] border-foreground shadow-[3px_3px_0px_0px_hsl(var(--foreground))] focus:shadow-[5px_5px_0px_0px_hsl(var(--foreground))] transition-all pr-12 font-medium"
                  disabled={loading}
                  maxLength={2000}
                />
                <Sparkles className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-violet-400 animate-pulse" />
              </div>
              <Button
                onClick={sendMessage}
                disabled={loading || !input.trim() || input.trim().length < 3}
                className="border-[3px] border-foreground shadow-[3px_3px_0px_0px_hsl(var(--foreground))] hover:shadow-[5px_5px_0px_0px_hsl(var(--foreground))] hover:-translate-y-0.5 transition-all bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white h-10 w-10 p-0"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </div>
            <div className="flex items-center justify-between mt-3 px-1">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse border border-foreground" />
                <p className="text-xs font-bold text-foreground/70">
                  💡 Be specific: mention hair level, condition & desired results
                </p>
              </div>
              <Badge variant="outline" className="border-2 border-foreground font-mono text-xs">
                {input.length}/2000
              </Badge>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Save Formula Dialog */}
      {stylistProfile && (
        <SaveFormulaDialog
          open={saveDialogOpen}
          onOpenChange={setSaveDialogOpen}
          formulaText={selectedFormulaText}
          stylistId={stylistProfile.id}
        />
      )}
    </div>
  );
};

export default AIAssistant;
