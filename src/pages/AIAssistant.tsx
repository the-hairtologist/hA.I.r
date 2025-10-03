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
import { ArrowLeft, Send, Sparkles, Loader2, User, Bot, Trash2, BookmarkPlus } from "lucide-react";
import { SaveFormulaDialog } from "@/components/SaveFormulaDialog";
import { cn } from "@/lib/utils";
import { HelpTooltip } from "@/components/HelpTooltip";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

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
  const [chatMode, setChatMode] = useState<"temporary" | "saved">("temporary");

  useEffect(() => {
    loadStylistProfile();
  }, []);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    // Load saved messages when switching to saved mode
    if (chatMode === "saved" && stylistProfile) {
      loadSavedMessages();
    }
  }, [chatMode, stylistProfile]);

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

  const loadSavedMessages = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: savedMessages, error } = await supabase
        .from("ai_chat_messages")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: true });

      if (error) throw error;

      if (savedMessages && savedMessages.length > 0) {
        setMessages(savedMessages.map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        })));
        toast.success("Chat history loaded");
      } else {
        // Add welcome message if no history
        setMessages([{
          role: 'assistant',
          content: `Hi! I'm your personal AI Hair Color Assistant. I can help you with:\n\n✨ **Formula consultations** - Get expert advice on color formulations\n🔧 **Troubleshooting** - Fix color issues and challenges\n💡 **Technique guidance** - Learn best practices and application methods\n👥 **Client consultations** - Interpret requests and set expectations\n\nWhat can I help you with today?`
        }]);
      }
    } catch (error: any) {
      console.error("Error loading saved messages:", error);
      toast.error("Failed to load chat history");
    }
  };

  const saveMessageToDb = async (message: Message) => {
    if (chatMode !== "saved") return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase
        .from("ai_chat_messages")
        .insert({
          user_id: session.user.id,
          role: message.role,
          content: message.content
        });

      if (error) throw error;
    } catch (error: any) {
      console.error("Error saving message:", error);
      // Don't show toast for save errors to avoid interrupting conversation
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

    // Save user message if in saved mode
    await saveMessageToDb(userMessage);

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
      
      // Save assistant message if in saved mode
      await saveMessageToDb(assistantMessage);
      
    } catch (error: any) {
      console.error("❌ Error sending message:", error);
      
      // Remove the user message if the request failed
      setMessages(prev => prev.slice(0, -1));
      setInput(messageText); // Restore the input so user can try again
      
    } finally {
      setLoading(false);
    }
  };

  const clearChat = async () => {
    if (chatMode === "saved") {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const { error } = await supabase
          .from("ai_chat_messages")
          .delete()
          .eq("user_id", session.user.id);

        if (error) throw error;
        toast.success("Chat history cleared from database");
      } catch (error: any) {
        console.error("Error clearing chat history:", error);
        toast.error("Failed to clear chat history");
        return;
      }
    }

    setMessages([{
      role: 'assistant',
      content: `Hi! I'm your personal AI Hair Color Assistant. I can help you with:\n\n✨ **Formula consultations** - Get expert advice on color formulations\n🔧 **Troubleshooting** - Fix color issues and challenges\n💡 **Technique guidance** - Learn best practices and application methods\n👥 **Client consultations** - Interpret requests and set expectations\n\nWhat can I help you with today?`
    }]);
    setInput("");
    if (chatMode === "temporary") {
      toast.success("Chat cleared");
    }
  };

  const handleModeChange = (value: string) => {
    if (!value) return;
    
    const newMode = value as "temporary" | "saved";
    
    if (newMode === "saved" && messages.length > 1) {
      toast.info("Switching to saved mode. Your current chat will be saved.");
    } else if (newMode === "temporary" && chatMode === "saved") {
      toast.info("Switching to temporary mode. Future messages won't be saved.");
    }
    
    setChatMode(newMode);
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
    <div className="min-h-screen bg-yellow-300">
      <header className="border-b-[3px] border-foreground bg-yellow-400 sticky top-0 z-10 shadow-[0_4px_0px_0px_hsl(var(--foreground))]">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate("/dashboard")}
                className="border-2 border-foreground shadow-[2px_2px_0px_0px_hsl(var(--foreground))] hover:shadow-[1px_1px_0px_0px_hsl(var(--foreground))] hover:translate-x-[1px] hover:translate-y-[1px] bg-white"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-r from-primary to-secondary p-2 rounded-lg border-2 border-foreground shadow-[3px_3px_0px_0px_hsl(var(--foreground))]">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-display font-bold text-foreground">
                    AI Chat Assistant
                  </h1>
                  <p className="text-xs font-bold text-black">
                    Get instant expert advice
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ToggleGroup type="single" value={chatMode} onValueChange={handleModeChange}>
                <ToggleGroupItem 
                  value="temporary" 
                  className="border-2 border-foreground font-semibold bg-white hover:bg-secondary/20 data-[state=on]:bg-secondary data-[state=on]:text-secondary-foreground shadow-[2px_2px_0px_0px_hsl(var(--foreground))] data-[state=on]:shadow-none data-[state=on]:translate-x-[2px] data-[state=on]:translate-y-[2px] transition-all"
                >
                  Temporary Chat
                </ToggleGroupItem>
                <ToggleGroupItem 
                  value="saved" 
                  className="border-2 border-foreground font-semibold bg-white hover:bg-secondary/20 data-[state=on]:bg-secondary data-[state=on]:text-secondary-foreground shadow-[2px_2px_0px_0px_hsl(var(--foreground))] data-[state=on]:shadow-none data-[state=on]:translate-x-[2px] data-[state=on]:translate-y-[2px] transition-all"
                >
                  Save History
                </ToggleGroupItem>
              </ToggleGroup>
              <HelpTooltip 
                title="Chat Modes"
                content={`📝 Temporary Chat
Your conversations only last for this session. Once you leave or refresh this page, your chat history will be cleared. Perfect for quick questions!

💾 Save History
Your conversations are saved to your account and will persist across sessions. You can come back anytime to continue your chat. Great for ongoing projects!`}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <Card className="h-[calc(100vh-200px)] flex flex-col border-[3px] border-foreground shadow-[6px_6px_0px_0px_hsl(var(--foreground))] bg-yellow-200 overflow-hidden">
          <CardHeader className="border-b-[3px] border-foreground bg-yellow-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border-[3px] border-foreground shadow-[3px_3px_0px_0px_hsl(var(--foreground))] bg-gradient-to-br from-primary to-secondary">
                  <AvatarFallback className="bg-transparent">
                    <Bot className="h-5 w-5 text-white" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="font-display text-lg">
                    AI Color Expert
                  </CardTitle>
                  <p className="text-xs font-bold text-black">
                    Ask me anything about hair color
                  </p>
                </div>
              </div>
              {messages.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearChat}
                  className="border-2 border-foreground shadow-[2px_2px_0px_0px_hsl(var(--foreground))] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] bg-white"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              )}
            </div>
          </CardHeader>

          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex gap-3 animate-fade-in",
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {message.role === 'assistant' && (
                    <Avatar className="h-8 w-8 border-[3px] border-foreground shadow-[2px_2px_0px_0px_hsl(var(--foreground))] bg-gradient-to-br from-primary to-secondary">
                      <AvatarFallback className="bg-transparent">
                        <Bot className="h-4 w-4 text-white" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div className="flex flex-col gap-2 max-w-[75%]">
                    <div
                      className={cn(
                        "rounded-lg px-4 py-3 border-[3px] border-foreground shadow-[3px_3px_0px_0px_hsl(var(--foreground))]",
                        "bg-black text-white"
                      )}
                    >
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">
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
                        className="self-start gap-2 text-xs h-7 border-2 border-foreground bg-white shadow-[2px_2px_0px_0px_hsl(var(--foreground))] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
                      >
                        <BookmarkPlus className="h-3 w-3" />
                        Save
                      </Button>
                    )}
                  </div>

                  {message.role === 'user' && (
                    <Avatar className="h-8 w-8 border-[3px] border-foreground shadow-[2px_2px_0px_0px_hsl(var(--foreground))] bg-primary">
                      <AvatarFallback className="bg-transparent text-primary-foreground">
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex gap-3 justify-start animate-fade-in">
                  <Avatar className="h-8 w-8 border-[3px] border-foreground shadow-[2px_2px_0px_0px_hsl(var(--foreground))] bg-gradient-to-br from-primary to-secondary">
                    <AvatarFallback className="bg-transparent">
                      <Bot className="h-4 w-4 text-white" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="rounded-lg px-4 py-3 bg-black text-white border-[3px] border-foreground shadow-[3px_3px_0px_0px_hsl(var(--foreground))]">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                </div>
              )}

              {messages.length === 1 && !loading && (
                <div className="space-y-2 mt-4">
                  <p className="text-sm font-bold text-foreground/70">
                    Try asking:
                  </p>
                  <div className="grid gap-2">
                    {exampleQuestions.map((question, idx) => (
                      <Button
                        key={idx}
                        variant="outline"
                        className="justify-start text-left h-auto py-2 px-3 border-[3px] border-foreground bg-white shadow-[3px_3px_0px_0px_hsl(var(--foreground))] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all"
                        onClick={() => setInput(question)}
                      >
                        <span className="text-sm">{question}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <CardContent className="border-t-[3px] border-foreground p-4 bg-yellow-300">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about hair color..."
                className="flex-1 border-[3px] border-foreground shadow-[3px_3px_0px_0px_hsl(var(--foreground))] bg-white placeholder:text-black"
                disabled={loading}
                maxLength={2000}
              />
              <Button
                onClick={sendMessage}
                disabled={loading || !input.trim() || input.trim().length < 3}
                className="border-[3px] border-foreground shadow-[3px_3px_0px_0px_hsl(var(--foreground))] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all bg-primary text-primary-foreground"
                size="icon"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs font-bold text-black">
                💡 Be specific for best results
              </p>
              <p className="text-xs font-mono font-bold text-black">
                {input.length}/2000
              </p>
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
