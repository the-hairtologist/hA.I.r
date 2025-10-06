import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpen, Search, Video, FileText, Lightbulb, TrendingUp, Award, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";


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
      title: "Mastering Balayage: From Consultation to Final Look",
      category: "techniques",
      description: "A comprehensive guide to creating natural-looking balayage with proper sectioning, placement, and blending techniques.",
      readTime: "12 min read",
      type: "article",
      featured: true,
      url: "https://www.behindthechair.com/articles/balayage-101-the-ultimate-guide-to-beautiful-balayage/"
    },
    {
      id: 2,
      title: "Color Theory for Hair Professionals",
      category: "techniques",
      description: "Understanding undertones, neutralization, and how to achieve any color result with confidence.",
      readTime: "8 min read",
      type: "article",
      featured: true,
      url: "https://www.matrix.com/blog/hair-color-theory-101"
    },
    {
      id: 3,
      title: "Building a Six-Figure Salon Business",
      category: "business",
      description: "Proven strategies for pricing, marketing, and client retention that successful stylists use.",
      readTime: "15 min read",
      type: "article",
      featured: false,
      url: "https://www.modernsalon.com/business/management/article/21164543/how-to-build-a-sixfigure-salon-career"
    },
    {
      id: 4,
      title: "2025 Hair Color Trends You Need to Know",
      category: "trends",
      description: "The hottest color trends your clients will be asking for this year, from butter blonde to rich espresso.",
      readTime: "6 min read",
      type: "article",
      featured: true,
      url: "https://www.allure.com/gallery/spring-summer-hair-color-trends"
    },
    {
      id: 5,
      title: "Fixing Common Color Mistakes",
      category: "techniques",
      description: "Step-by-step solutions for brassy tones, uneven color, over-processing, and more common issues.",
      readTime: "10 min read",
      type: "article",
      featured: false,
      url: "https://www.redken.com/blog/hair-care/how-to-fix-hair-color-mistakes"
    },
    {
      id: 6,
      title: "Client Consultation Best Practices",
      category: "business",
      description: "How to have effective consultations that set expectations and build trust with new clients.",
      readTime: "7 min read",
      type: "article",
      featured: false,
      url: "https://www.behindthechair.com/articles/mastering-the-client-consultation/"
    },
    {
      id: 7,
      title: "Understanding Hair Damage and How to Prevent It",
      category: "techniques",
      description: "Learn the science behind hair damage and how to maintain hair integrity during chemical services.",
      readTime: "11 min read",
      type: "article",
      featured: false,
      url: "https://www.olaplex.com/blogs/blog/hair-damage-causes-prevention-repair"
    },
    {
      id: 8,
      title: "Instagram Marketing for Hair Stylists",
      category: "business",
      description: "Grow your following and attract dream clients with strategic content that showcases your work.",
      readTime: "9 min read",
      type: "article",
      featured: false,
      url: "https://www.glossgenius.com/blog/instagram-tips-for-hair-stylists"
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

      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-7xl">
        {/* Search Bar */}
        <Card className="mb-6 sm:mb-8 border-[2px] sm:border-[3px] border-foreground shadow-[3px_3px_0px_0px_hsl(var(--foreground))] sm:shadow-[5px_5px_0px_0px_hsl(var(--foreground))]">
          <CardContent className="p-4 sm:p-6">
            <div className="relative">
              <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
              <Input
                placeholder="Search articles, guides, and resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 sm:pl-12 h-12 sm:h-14 text-base sm:text-lg border-2 border-foreground"
              />
            </div>
          </CardContent>
        </Card>

        {/* Quick Access */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 sm:mb-8">
          <Card 
            className="border-[2px] sm:border-[3px] border-foreground shadow-[3px_3px_0px_0px_hsl(var(--foreground))] sm:shadow-[5px_5px_0px_0px_hsl(var(--foreground))] hover:shadow-[5px_5px_0px_0px_hsl(var(--primary))] sm:hover:shadow-[7px_7px_0px_0px_hsl(var(--primary))] hover:-translate-y-1 transition-all cursor-pointer bg-gradient-to-br from-purple-400 to-pink-400"
            onClick={() => navigate("/ai-assistant")}
          >
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-background border-2 border-foreground shadow-[2px_2px_0px_0px_hsl(var(--foreground))] sm:shadow-[3px_3px_0px_0px_hsl(var(--foreground))] flex items-center justify-center flex-shrink-0">
                  <Lightbulb className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg sm:text-xl font-display font-bold text-foreground mb-1">AI Assistant</h3>
                  <p className="text-xs sm:text-sm text-foreground/80 font-medium">Get instant answers and custom formulas</p>
                </div>
                <ExternalLink className="h-4 w-4 sm:h-5 sm:w-5 text-foreground flex-shrink-0" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-[2px] sm:border-[3px] border-foreground shadow-[3px_3px_0px_0px_hsl(var(--foreground))] sm:shadow-[5px_5px_0px_0px_hsl(var(--foreground))] bg-gradient-to-br from-blue-400 to-cyan-400">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-background border-2 border-foreground shadow-[2px_2px_0px_0px_hsl(var(--foreground))] sm:shadow-[3px_3px_0px_0px_hsl(var(--foreground))] flex items-center justify-center flex-shrink-0">
                  <Video className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg sm:text-xl font-display font-bold text-foreground mb-1">Video Tutorials</h3>
                  <p className="text-xs sm:text-sm text-foreground/80 font-medium">Coming Soon - Watch and learn from experts</p>
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
              Featured Articles
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {featuredArticles.map((article) => (
                <a
                  key={article.id}
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Card 
                    className="border-[3px] border-foreground shadow-[5px_5px_0px_0px_hsl(var(--foreground))] hover:shadow-[7px_7px_0px_0px_hsl(var(--primary))] hover:-translate-y-1 transition-all cursor-pointer bg-gradient-to-br from-yellow-300 to-orange-400 h-full"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <Badge className="bg-background border-[3px] border-foreground shadow-[2px_2px_0px_0px_hsl(var(--foreground))] text-foreground font-bold hover:bg-background">
                          {article.category}
                        </Badge>
                        <ExternalLink className="h-4 w-4 text-foreground" />
                      </div>
                      <CardTitle className="text-lg font-display text-foreground">{article.title}</CardTitle>
                      <CardDescription className="text-foreground/80 font-medium">
                        {article.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-foreground/70 font-semibold">{article.readTime}</span>
                        <Button size="sm" className="bg-background text-foreground border-[3px] border-foreground shadow-[3px_3px_0px_0px_hsl(var(--foreground))] font-bold hover:bg-background pointer-events-none">
                          Read →
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Category Filter Buttons - Brutalist Style */}
        <div className="mb-6 sm:mb-8">
          <div className="flex gap-0 border-[2px] sm:border-[3px] border-foreground rounded-xl sm:rounded-2xl overflow-hidden shadow-[3px_3px_0px_0px_hsl(var(--foreground))] sm:shadow-[5px_5px_0px_0px_hsl(var(--foreground))] bg-background">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 py-3 sm:py-4 px-2 sm:px-4 font-display font-bold text-xs sm:text-sm md:text-base transition-all border-r-[2px] sm:border-r-[3px] last:border-r-0 border-foreground min-h-[44px] ${
                    selectedCategory === cat.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-background text-foreground hover:bg-muted'
                  }`}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span className="hidden xs:inline truncate">{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* All Articles */}
        {filteredArticles.length === 0 ? (
          <Card className="border-[3px] border-foreground shadow-[5px_5px_0px_0px_hsl(var(--foreground))] bg-gradient-to-br from-yellow-300 to-orange-400">
            <CardContent className="py-16 text-center">
              <Search className="h-16 w-16 mx-auto mb-4 text-foreground/60" />
              <h3 className="text-2xl font-bold mb-2 text-foreground">No articles found</h3>
              <p className="text-foreground/80 font-medium">Try adjusting your search or browse all topics</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {filteredArticles.map((article, index) => {
              // Cycle through gradient backgrounds
              const gradients = [
                'from-green-400 to-blue-400',
                'from-cyan-300 to-blue-500', 
                'from-blue-400 to-purple-400',
                'from-purple-400 to-pink-400',
              ];
              const gradientClass = gradients[index % gradients.length];
              
              return (
                <a
                  key={article.id}
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Card 
                    className={`border-[3px] border-foreground shadow-[5px_5px_0px_0px_hsl(var(--foreground))] hover:shadow-[7px_7px_0px_0px_hsl(var(--primary))] hover:-translate-y-1 transition-all cursor-pointer bg-gradient-to-br ${gradientClass} h-full`}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <Badge className="bg-background border-[3px] border-foreground shadow-[2px_2px_0px_0px_hsl(var(--foreground))] text-foreground font-bold hover:bg-background">
                          {article.category}
                        </Badge>
                        <div className="flex items-center gap-2">
                          {article.featured && (
                            <Badge className="bg-cyan-400 text-foreground border-[3px] border-foreground shadow-[2px_2px_0px_0px_hsl(var(--foreground))] font-bold hover:bg-cyan-400">
                              Featured
                            </Badge>
                          )}
                          <ExternalLink className="h-4 w-4 text-foreground" />
                        </div>
                      </div>
                      <CardTitle className="font-display text-foreground">{article.title}</CardTitle>
                      <CardDescription className="text-foreground/80 font-medium">
                        {article.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-foreground/70 font-semibold">{article.readTime}</span>
                        <Button size="sm" className="bg-background text-foreground border-[3px] border-foreground shadow-[3px_3px_0px_0px_hsl(var(--foreground))] font-bold hover:bg-background pointer-events-none">
                          Read Article →
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </a>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default Knowledge;
