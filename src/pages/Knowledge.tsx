import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Search, Tag, TrendingUp, Loader2, ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const Knowledge = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

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
