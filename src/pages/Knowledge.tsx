import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { BookOpen, ArrowLeft, Search, ExternalLink, Loader2, Sparkles } from "lucide-react";

const Knowledge = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [resources, setResources] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    checkAccess();
    loadResources();
    seedIfEmpty();
  }, []);

  const seedIfEmpty = async () => {
    const { data } = await supabase.from('knowledge_resources').select('id').limit(1);
    if (!data || data.length === 0) {
      try {
        await supabase.functions.invoke('seed-knowledge-base');
        loadResources();
      } catch (error) {
        console.error('Error seeding knowledge:', error);
      }
    }
  };

  const checkAccess = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      // Check if user is a stylist
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .single();

      if (roleData?.role !== "stylist") {
        toast.error("This feature is only available for stylists");
        navigate("/dashboard");
      }
    } catch (error: any) {
      console.error("Error checking access:", error);
      navigate("/dashboard");
    }
  };

  const loadResources = async () => {
    try {
      const { data, error } = await supabase
        .from("knowledge_resources")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setResources(data || []);
    } catch (error: any) {
      console.error("Error loading resources:", error);
      toast.error("Error loading knowledge base");
    } finally {
      setLoading(false);
    }
  };

  const categories = Array.from(new Set(resources.map(r => r.category).filter(Boolean)));

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || resource.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">Knowledge Base</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Hero Section */}
        <Card className="mb-8 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <CardTitle className="text-2xl">Professional Hair Styling Resources</CardTitle>
            </div>
            <CardDescription className="text-base">
              Expand your expertise with curated color theory, techniques, and industry best practices
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search knowledge base..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Categories */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-6">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            {categories.map(category => (
              <TabsTrigger key={category} value={category}>
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Resources Grid */}
        {filteredResources.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-xl font-semibold mb-2">
                {searchQuery ? "No results found" : "No resources available yet"}
              </p>
              <p className="text-muted-foreground">
                {searchQuery ? "Try a different search term" : "Check back soon for educational content"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {filteredResources.map((resource) => (
              <Card key={resource.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="mb-2">{resource.title}</CardTitle>
                      {resource.category && (
                        <Badge variant="secondary" className="mb-2">
                          {resource.category}
                        </Badge>
                      )}
                    </div>
                    {!resource.is_free && (
                      <Badge variant="outline" className="ml-2">Premium</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {resource.content}
                  </p>
                  {resource.resource_url && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => window.open(resource.resource_url, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Resource
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Tips Card */}
        <Card className="mt-8 bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Pro Tips
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>• Bookmark important articles for quick reference during client consultations</p>
            <p>• Stay updated with the latest color trends and techniques</p>
            <p>• Apply color theory principles to create custom formulas</p>
            <p>• Share knowledge with clients to build trust and expertise</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Knowledge;
