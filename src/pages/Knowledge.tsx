import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpen, Search, Video, FileText, Lightbulb, TrendingUp, Award, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Knowledge = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    { id: "all", label: "All Topics", icon: BookOpen },
    { id: "techniques", label: "Techniques", icon: Lightbulb },
    { id: "trends", label: "Trends", icon: TrendingUp },
    { id: "business", label: "Business", icon: Award },
  ];

  const articles = [
    {
      id: 1,
      title: "Behindthechair.com - Industry-Leading Education",
      category: "techniques",
      description: "The #1 platform for professional stylists. Access thousands of color formulas, step-by-step tutorials, and inspiration from top artists worldwide.",
      type: "platform",
      featured: true,
      url: "https://behindthechair.com/",
    },
    {
      id: 2,
      title: "Hair Color Formulation and Application - Full Class",
      category: "techniques",
      description: "Complete YouTube masterclass covering color theory, formulation techniques, and professional application methods from FreeSalonEducation.",
      type: "video",
      featured: true,
      url: "https://www.youtube.com/watch?v=-iIWU0pqyL8",
    },
    {
      id: 3,
      title: "Sam Villa - 86 Free Haircutting Video Tutorials",
      category: "techniques",
      description: "Master cutting techniques with 86 free video tutorials covering everything from basic cuts to advanced styling methods.",
      type: "video",
      featured: true,
      url: "https://pros.samvilla.com/blogs/hair-tutorials/best-haircutting-techniques",
    },
    {
      id: 4,
      title: "Hair Love University - Perfect Pricing Method",
      category: "business",
      description: "Free training on pricing strategy that has helped thousands of stylists create financial freedom. Learn how to price your services for profitability.",
      type: "course",
      featured: true,
      url: "https://hairloveuniversity.com/freebies",
    },
    {
      id: 5,
      title: "Joico Pro Education - 24/7 Learning Platform",
      category: "techniques",
      description: "Free access to live events, tutorials, and trend information from Joico's comprehensive educational platform.",
      type: "platform",
      featured: false,
      url: "https://www.joico.com/pro-education/",
    },
    {
      id: 6,
      title: "L'Oréal Professionnel Signature Education",
      category: "techniques",
      description: "Best-in-class education programs for every skill level - essential, advanced, expert, and specialist. Comprehensive and customizable learning.",
      type: "platform",
      featured: false,
      url: "https://us.lorealprofessionnel.com/pro-resources/loreal-professional-signature-education",
    },
    {
      id: 7,
      title: "Milady Training - Trending Techniques Webinar",
      category: "trends",
      description: "Free 90-minute webinar covering on-trend cutting and styling techniques, blowout methods, and finishing skills for salon looks.",
      type: "course",
      featured: false,
      url: "https://www.miladytraining.com/courses/trending-techniques",
    },
    {
      id: 8,
      title: "Elite Beauty Society Resource Center",
      category: "business",
      description: "Free business resources, educational tools, eBooks, and guides specifically designed for beauty professionals.",
      type: "platform",
      featured: false,
      url: "https://elitebeautysociety.com/resource-center/",
    },
    {
      id: 9,
      title: "Cursa - Hair Coloring & Styling Techniques Course",
      category: "techniques",
      description: "Free comprehensive online course with certificate covering professional hair coloring and styling techniques.",
      type: "course",
      featured: false,
      url: "https://cursa.app/en/free-course/hair-coloring-and-styling-techniques-ecjb",
    },
    {
      id: 10,
      title: "BTC University - Quick Tips & Tutorials",
      category: "techniques",
      description: "Access quick tips, downloadable resources, and courses on hair color, cutting, and business from industry educators.",
      type: "platform",
      featured: false,
      url: "https://www.btcuniversity.com/tips",
    },
    {
      id: 11,
      title: "Paul Mitchell eLearning Platform",
      category: "techniques",
      description: "Free continuing education courses covering cutting, coloring, styling, and business skills from Paul Mitchell Schools.",
      type: "platform",
      featured: false,
      url: "https://elearning.paulmitchell.com/pages/homepage",
    },
    {
      id: 12,
      title: "Alison - Fundamentals of Cosmetology",
      category: "techniques",
      description: "Free online cosmetology course covering fundamentals with CPD accreditation. Perfect for refreshing core skills.",
      type: "course",
      featured: false,
      url: "https://alison.com/course/fundamentals-of-cosmetology",
    },
  ];

  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredArticles = articles.filter((article) => {
    const matchesCategory = selectedCategory === "all" || article.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredArticles = articles.filter(a => a.featured);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10">
      <PageHeader
        title="Knowledge Base"
        icon={<BookOpen className="h-6 w-6" />}
        backTo="/dashboard"
      />

      <main className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Search Bar */}
        <Card className="mb-8 brutal-card">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search articles, guides, and resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-14 text-lg border-2 border-foreground"
              />
            </div>
          </CardContent>
        </Card>

        {/* Quick Access */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <Card 
            className="brutal-card cursor-pointer bg-gradient-to-br from-purple-400 to-pink-400"
            onClick={() => navigate("/ai-assistant")}
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-background border-2 border-foreground shadow-[3px_3px_0px_0px_hsl(var(--foreground))] flex items-center justify-center">
                  <Lightbulb className="h-8 w-8 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-display font-bold text-foreground mb-1">AI Assistant</h3>
                  <p className="text-sm text-foreground/80 font-medium">Get instant answers and custom formulas</p>
                </div>
                <ExternalLink className="h-5 w-5 text-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card className="brutal-border brutal-shadow bg-gradient-to-br from-blue-400 to-cyan-400">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-background border-2 border-foreground shadow-[3px_3px_0px_0px_hsl(var(--foreground))] flex items-center justify-center">
                  <Video className="h-8 w-8 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-display font-bold text-foreground mb-1">Video Tutorials</h3>
                  <p className="text-sm text-foreground/80 font-medium">Coming Soon - Watch and learn from experts</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Featured Articles */}
        {!searchQuery && (
          <div className="mb-8">
            <h2 className="text-2xl font-display font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-primary" />
              Featured Resources
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              {featuredArticles.slice(0, 3).map((article) => (
                <Card 
                  key={article.id}
                  className="brutal-card cursor-pointer bg-gradient-to-br from-yellow-300 to-orange-400 hover:shadow-[8px_8px_0px_0px_hsl(var(--foreground))] transition-all"
                  onClick={() => window.open(article.url, '_blank')}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant="secondary" className="bg-background border-2 border-foreground shadow-[2px_2px_0px_0px_hsl(var(--foreground))]">
                        {article.type}
                      </Badge>
                      <Badge className="bg-cyan-400 text-foreground border-2 border-foreground shadow-[2px_2px_0px_0px_hsl(var(--foreground))]">
                        Featured
                      </Badge>
                    </div>
                    <CardTitle className="text-lg font-display text-foreground line-clamp-2">{article.title}</CardTitle>
                    <CardDescription className="text-foreground/80 font-medium line-clamp-3">
                      {article.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button size="sm" variant="outline" className="w-full">
                      Read →
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Category Tabs */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
          <TabsList className="grid grid-cols-4 mb-6 h-auto p-1 bg-background border-[3px] border-foreground shadow-[5px_5px_0px_0px_hsl(var(--foreground))] rounded-xl gap-1">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <TabsTrigger 
                  key={cat.id} 
                  value={cat.id}
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-[3px] data-[state=active]:border-foreground data-[state=active]:shadow-[3px_3px_0px_0px_hsl(var(--foreground))] font-display font-bold py-3 px-4 text-sm md:text-base rounded-lg transition-all hover:scale-[1.02]"
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {cat.label}
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value={selectedCategory} className="space-y-4">
            {filteredArticles.length === 0 ? (
              <Card className="brutal-card bg-yellow-300">
                <CardContent className="py-16 text-center">
                  <Search className="h-16 w-16 mx-auto mb-4 text-foreground/60" />
                  <h3 className="text-2xl font-bold mb-2 text-foreground">No articles found</h3>
                  <p className="text-foreground/80 font-medium">Try adjusting your search or browse all topics</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {filteredArticles.map((article) => (
                  <Card 
                    key={article.id}
                    className="brutal-card cursor-pointer hover:shadow-[8px_8px_0px_0px_hsl(var(--foreground))] transition-all bg-gradient-to-br from-green-400 via-blue-400 to-cyan-400"
                    onClick={() => window.open(article.url, '_blank')}
                  >
                    <CardHeader>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary" className="bg-background border-[3px] border-foreground shadow-[2px_2px_0px_0px_hsl(var(--foreground))]">
                          {article.type}
                        </Badge>
                        {article.featured && (
                          <Badge className="bg-cyan-400 text-foreground border-2 border-foreground shadow-[2px_2px_0px_0px_hsl(var(--foreground))] ml-auto">
                            Featured
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="font-display text-foreground line-clamp-2">
                        {article.title}
                      </CardTitle>
                      <CardDescription className="text-foreground/80 font-medium line-clamp-3">
                        {article.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <Badge className="bg-background/50 text-foreground border-2 border-foreground">
                          {article.category}
                        </Badge>
                        <Button size="sm" variant="outline">
                          Read Article →
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Knowledge;
