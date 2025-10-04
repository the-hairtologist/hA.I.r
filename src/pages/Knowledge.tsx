import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Search, Tag, TrendingUp, Loader2, ExternalLink, Sparkles, Send } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

const Knowledge = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [aiMode, setAiMode] = useState<"formula" | "stepbystep">("formula");
  const [aiMessages, setAiMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([]);
  const [aiInput, setAiInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [aiMessages]);

  useEffect(() => {
    checkUserRole();
  }, []);

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

  const stylistArticles = [
    {
      title: "Color Theory Fundamentals",
      category: "Education",
      description: "Master the basics of color theory for professional hair coloring",
      tags: ["Color", "Theory", "Basics"],
      trending: true,
    },
    {
      title: "Balayage Techniques",
      category: "Techniques",
      description: "Advanced balayage application methods and sectioning strategies",
      tags: ["Balayage", "Highlights", "Advanced"],
      trending: true,
    },
    {
      title: "Client Consultation Best Practices",
      category: "Business",
      description: "How to conduct effective color consultations and manage expectations",
      tags: ["Consultation", "Communication", "Client Management"],
      trending: false,
    },
    {
      title: "Color Correction Guide",
      category: "Techniques",
      description: "Step-by-step approach to fixing common color mistakes",
      tags: ["Color Correction", "Problem Solving", "Advanced"],
      trending: false,
    },
    {
      title: "Toner Application Mastery",
      category: "Techniques",
      description: "Understanding toners and how to achieve perfect tones",
      tags: ["Toner", "Blonde", "Technique"],
      trending: true,
    },
    {
      title: "Product Knowledge: Developer Ratios",
      category: "Education",
      description: "Understanding developer volumes and mixing ratios",
      tags: ["Developer", "Chemistry", "Basics"],
      trending: false,
    },
  ];

  const clientArticles = [
    {
      title: "Hair Color Aftercare 101",
      category: "Care",
      description: "Essential tips for maintaining your color between salon visits",
      tags: ["Aftercare", "Maintenance", "Tips"],
      trending: true,
    },
    {
      title: "Understanding Hair Porosity",
      category: "Education",
      description: "Learn how your hair's porosity affects color and treatments",
      tags: ["Education", "Hair Science", "Care"],
      trending: false,
    },
    {
      title: "Choosing the Right Shade",
      category: "Planning",
      description: "How to work with your stylist to pick the perfect color",
      tags: ["Color Selection", "Consultation", "Planning"],
      trending: true,
    },
    {
      title: "Home Hair Care Routine",
      category: "Care",
      description: "Building an effective routine to keep your hair healthy",
      tags: ["Routine", "Products", "Maintenance"],
      trending: false,
    },
    {
      title: "What to Expect: First Color Appointment",
      category: "Planning",
      description: "A guide to your first professional hair coloring experience",
      tags: ["First Time", "Expectations", "Guide"],
      trending: true,
    },
    {
      title: "Product Recommendations by Hair Type",
      category: "Care",
      description: "Find the best products for your specific hair needs",
      tags: ["Products", "Recommendations", "Hair Type"],
      trending: false,
    },
  ];

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
    } catch (error: any) {
      console.error("AI Error:", error);
      toast.error("Failed to get AI response. Please try again.");
    } finally {
      setAiLoading(false);
    }
  };

  const articles = userRole === "stylist" ? stylistArticles : clientArticles;

  const filteredArticles = articles.filter(
    (article) =>
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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
                  className="w-full justify-start"
                  onClick={() => setAiMode("formula")}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Formula Generation
                </Button>
                <Button
                  variant={aiMode === "stepbystep" ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => setAiMode("stepbystep")}
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Step-by-Step Guide
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
                      onClick={() => setAiInput("Create a balayage formula for level 6 hair going to level 9 blonde")}
                    >
                      Balayage Formula
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="w-full justify-start text-xs h-auto py-2"
                      onClick={() => setAiInput("I need a color correction formula for brassy level 7 hair")}
                    >
                      Color Correction
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="w-full justify-start text-xs h-auto py-2"
                      onClick={() => setAiInput("Root touch-up formula for dark brown hair")}
                    >
                      Root Touch-Up
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="w-full justify-start text-xs h-auto py-2"
                      onClick={() => setAiInput("How do I apply toner after bleaching?")}
                    >
                      Toning Guide
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="w-full justify-start text-xs h-auto py-2"
                      onClick={() => setAiInput("Show me how to do a root touch-up")}
                    >
                      Root Touch-Up Steps
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="w-full justify-start text-xs h-auto py-2"
                      onClick={() => setAiInput("Best way to section hair for highlights")}
                    >
                      Sectioning Tips
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Knowledge Base Link */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="text-center space-y-2">
                  <BookOpen className="h-8 w-8 mx-auto text-primary" />
                  <p className="text-sm font-medium">Need Articles?</p>
                  <p className="text-xs text-muted-foreground">
                    Browse our knowledge base for detailed guides and tips
                  </p>
                </div>
              </CardContent>
            </Card>
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
                          Step-by-Step Assistant
                        </>
                      )}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {aiMode === "formula"
                        ? "Get custom hair color formulas based on your requirements"
                        : "Receive detailed instructions for techniques and processes"}
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
                        {aiMode === "formula" ? "Ready to create formulas" : "Ready to guide you"}
                      </p>
                      <p className="text-sm text-muted-foreground max-w-md">
                        {aiMode === "formula"
                          ? "Describe the hair color transformation you need and I'll generate a detailed formula"
                          : "Ask me any question about hair styling techniques and I'll provide step-by-step guidance"}
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

        {/* Knowledge Base Section - Moved Below */}
        <div className="mt-8 pt-8 border-t">
          <h2 className="text-2xl font-bold mb-6 text-center">Knowledge Base</h2>
          
          {/* Search Bar */}
          <div className="mb-8">
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search articles, guides, and tips..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Articles Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((article, index) => (
              <Card
                key={index}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="outline" className="text-xs">
                      {article.category}
                    </Badge>
                    {article.trending && (
                      <Badge className="text-xs bg-gradient-to-r from-orange-500 to-red-500">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Trending
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg">{article.title}</CardTitle>
                  <CardDescription>{article.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {article.tags.map((tag, tagIndex) => (
                      <Badge key={tagIndex} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full" size="sm">
                    Read Article
                    <ExternalLink className="h-3 w-3 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredArticles.length === 0 && (
            <Card className="mt-8">
              <CardContent className="pt-8 pb-8 text-center">
                <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium mb-2">No articles found</p>
                <p className="text-sm text-muted-foreground">
                  Try adjusting your search query or browse all articles
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default Knowledge;
