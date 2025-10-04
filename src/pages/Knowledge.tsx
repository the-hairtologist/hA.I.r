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
        title="Knowledge Base"
        icon={<BookOpen className="h-6 w-6" />}
        backTo="/dashboard"
      />

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* AI Assistant Section */}
        <Card className="mb-8 border-[3px] border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))]">
          <CardHeader className="border-b-[2px] border-border">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <CardTitle>AI Hair Assistant</CardTitle>
            </div>
            <CardDescription>
              Get instant help with formulas or step-by-step guidance
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs value={aiMode} onValueChange={(v) => setAiMode(v as "formula" | "stepbystep")}>
              <div className="border-b-[2px] border-border px-4 pt-4">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="formula" className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Formula Generation
                  </TabsTrigger>
                  <TabsTrigger value="stepbystep" className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Step-by-Step Guide
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="formula" className="m-0">
                <div className="px-4 py-3 bg-primary/5 border-b border-border">
                  <p className="text-sm text-muted-foreground mb-3">
                    Ask me to generate a custom hair color formula based on your requirements
                  </p>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        setAiInput("Create a balayage formula for level 6 hair going to level 9 blonde");
                      }}
                      className="flex-1"
                    >
                      <Sparkles className="h-3 w-3 mr-1" />
                      Balayage Example
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        setAiInput("I need a color correction formula for brassy level 7 hair");
                      }}
                      className="flex-1"
                    >
                      <Sparkles className="h-3 w-3 mr-1" />
                      Color Correction
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="stepbystep" className="m-0">
                <div className="px-4 py-3 bg-secondary/5 border-b border-border">
                  <p className="text-sm text-muted-foreground mb-3">
                    Get detailed step-by-step instructions for techniques and processes
                  </p>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        setAiInput("How do I apply toner after bleaching?");
                      }}
                      className="flex-1"
                    >
                      <BookOpen className="h-3 w-3 mr-1" />
                      Toning Guide
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        setAiInput("Show me how to do a root touch-up");
                      }}
                      className="flex-1"
                    >
                      <BookOpen className="h-3 w-3 mr-1" />
                      Root Touch-Up
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Chat Messages */}
            <ScrollArea className="h-[400px] px-4">
              <div className="space-y-4 py-4">
                {aiMessages.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-sm">
                      {aiMode === "formula" 
                        ? "Ask me to create a formula. Example: 'Create a formula for balayage on level 6 hair'"
                        : "Ask me for guidance. Example: 'How do I apply toner after bleaching?'"}
                    </p>
                  </div>
                )}
                
                {aiMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))}
                
                {aiLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg p-3">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input Form */}
            <form onSubmit={handleAiSubmit} className="border-t-[2px] border-border p-4">
              <div className="flex gap-2">
                <Input
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  placeholder={
                    aiMode === "formula"
                      ? "Describe the formula you need..."
                      : "Ask for step-by-step help..."
                  }
                  disabled={aiLoading}
                  className="flex-1"
                />
                <Button type="submit" disabled={aiLoading || !aiInput.trim()} size="icon">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search articles, guides, and tips..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-[2px] border-foreground shadow-[2px_2px_0px_0px_hsl(var(--foreground))]"
            />
          </div>
        </div>

        {/* Category Stats */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card className="border-[2px] border-foreground shadow-[2px_2px_0px_0px_hsl(var(--foreground))]">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{articles.length}</p>
                  <p className="text-sm text-muted-foreground">Total Articles</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[2px] border-foreground shadow-[2px_2px_0px_0px_hsl(var(--foreground))]">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {articles.filter((a) => a.trending).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Trending Now</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[2px] border-foreground shadow-[2px_2px_0px_0px_hsl(var(--foreground))]">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <Tag className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {new Set(articles.flatMap((a) => a.tags)).size}
                  </p>
                  <p className="text-sm text-muted-foreground">Topics Covered</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Articles Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((article, index) => (
            <Card
              key={index}
              className="border-[3px] border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))] hover:shadow-[6px_6px_0px_0px_hsl(var(--foreground))] hover:-translate-y-1 transition-all"
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
          <Card className="border-[2px] border-foreground shadow-[2px_2px_0px_0px_hsl(var(--foreground))] mt-8">
            <CardContent className="pt-8 pb-8 text-center">
              <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium mb-2">No articles found</p>
              <p className="text-sm text-muted-foreground">
                Try adjusting your search query or browse all articles
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Knowledge;
