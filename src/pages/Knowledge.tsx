import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  }, []);

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
        return;
      }

      await loadResources();
    } catch (error: any) {
      console.error("Error checking access:", error);
      toast.error("Error loading knowledge base");
    } finally {
      setLoading(false);
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
      toast.error("Error loading resources");
    }
  };

  const filteredResources = resources.filter((resource) => {
    const matchesSearch = 
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = 
      selectedCategory === "all" || 
      resource.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const categories = [
    { value: "all", label: "All Topics" },
    { value: "color_theory", label: "Color Theory" },
    { value: "techniques", label: "Techniques" },
    { value: "products", label: "Products" },
    { value: "trends", label: "Trends" },
    { value: "business", label: "Business" },
  ];

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
        {/* Welcome Card */}
        <Card className="mb-8 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
          <CardHeader>
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/20 rounded-lg">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl mb-2">Welcome to Your Learning Hub</CardTitle>
                <CardDescription className="text-base">
                  Expand your skills with curated resources on color theory, techniques, products, and business growth.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Search and Filter */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="w-full grid grid-cols-3 lg:grid-cols-6">
              {categories.map((cat) => (
                <TabsTrigger key={cat.value} value={cat.value} className="text-xs lg:text-sm">
                  {cat.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Resources Grid */}
        {filteredResources.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-xl font-semibold mb-2">No resources found</p>
              <p className="text-muted-foreground text-center max-w-md">
                {searchQuery 
                  ? "Try adjusting your search or filters" 
                  : "Check back soon for new educational content"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {filteredResources.map((resource) => (
              <Card key={resource.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{resource.title}</CardTitle>
                      {resource.category && (
                        <Badge variant="secondary" className="capitalize mb-2">
                          {resource.category.replace("_", " ")}
                        </Badge>
                      )}
                    </div>
                    {!resource.is_free && (
                      <Badge variant="outline" className="bg-primary/10">
                        Premium
                      </Badge>
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
                      onClick={() => window.open(resource.resource_url, "_blank")}
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

        {/* Info Card */}
        <Card className="mt-8 bg-muted/50">
          <CardHeader>
            <CardTitle className="text-lg">Growing Your Knowledge</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• Access curated educational content for stylists</p>
            <p>• Learn advanced color theory and application techniques</p>
            <p>• Stay updated with the latest industry trends</p>
            <p>• Discover product recommendations and usage tips</p>
            <p>• Get business advice to grow your salon career</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Knowledge;
