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
import { ArrowLeft, Send, Sparkles, Loader2, User, Bot, Trash2 } from "lucide-react";

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
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">AI Hair Assistant</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <Card className="h-[calc(100vh-200px)] flex flex-col">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" />
                Your Personal Color Expert
                <Badge variant="secondary" className="ml-2">
                  <Sparkles className="h-3 w-3 mr-1" />
                  AI Powered
                </Badge>
              </CardTitle>
              {messages.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearChat}
                  className="text-muted-foreground hover:text-destructive"
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
                  className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.role === 'assistant' && (
                    <Avatar className="h-8 w-8 border-2 border-primary">
                      <AvatarFallback className="bg-primary/10">
                        <Bot className="h-4 w-4 text-primary" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div
                    className={`rounded-lg px-4 py-3 max-w-[80%] ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">
                      {message.content}
                    </p>
                  </div>

                  {message.role === 'user' && (
                    <Avatar className="h-8 w-8 border-2 border-primary">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex gap-3 justify-start">
                  <Avatar className="h-8 w-8 border-2 border-primary">
                    <AvatarFallback className="bg-primary/10">
                      <Bot className="h-4 w-4 text-primary" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="rounded-lg px-4 py-3 bg-muted">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  </div>
                </div>
              )}

              {messages.length === 1 && (
                <div className="space-y-2 mt-4">
                  <p className="text-sm text-muted-foreground font-medium">
                    Try asking:
                  </p>
                  <div className="grid gap-2">
                    {exampleQuestions.map((question, idx) => (
                      <Button
                        key={idx}
                        variant="outline"
                        className="justify-start text-left h-auto py-2 px-3"
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

          <CardContent className="border-t p-4">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about hair color..."
                className="flex-1"
                disabled={loading}
                maxLength={2000}
              />
              <Button
                onClick={sendMessage}
                disabled={loading || !input.trim() || input.trim().length < 3}
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
              <p className="text-xs text-muted-foreground">
                💡 Be specific: mention hair level, condition, and desired results
              </p>
              <p className="text-xs text-muted-foreground">
                {input.length}/2000
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AIAssistant;
