import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpen, Search, Video, FileText, Lightbulb, TrendingUp, Award, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useUserRole } from "@/hooks/useUserRole";


const Knowledge = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const { isStylist, isClient } = useUserRole();

  const categories = [
    { id: "all", label: "All Topics", icon: BookOpen },
    { id: "techniques", label: "Techniques", icon: Lightbulb },
    { id: "trends", label: "Trends", icon: TrendingUp },
    { id: "business", label: "Business", icon: Award },
  ];

  const articles = [
    // Client-Focused Articles
    {
      id: 1,
      title: "Preparing for Your Hair Appointment: What to Know",
      category: "business",
      description: "What to do before your appointment, what to bring, and how to ensure the best results from your salon visit.",
      readTime: "6 min read",
      type: "article",
      featured: true,
      targetAudience: "client" as const,
      url: "https://www.allure.com/story/how-to-prepare-for-a-hair-appointment"
    },
    {
      id: 2,
      title: "How to Communicate Your Hair Goals",
      category: "business",
      description: "Learn how to describe what you want, bring inspiration photos effectively, and set realistic expectations with your stylist.",
      readTime: "5 min read",
      type: "article",
      featured: true,
      targetAudience: "client" as const,
      url: "https://www.byrdie.com/how-to-talk-to-your-hairstylist-5184037"
    },
    {
      id: 3,
      title: "Understanding Hair Color Pricing",
      category: "business",
      description: "Why professional color services cost what they do - from products to time and expertise required.",
      readTime: "7 min read",
      type: "article",
      featured: false,
      targetAudience: "both" as const,
      url: "https://www.modernsalon.com/hair-color"
    },
    {
      id: 4,
      title: "Making Your Color Last: Aftercare Tips",
      category: "techniques",
      description: "Essential tips for maintaining your color, recommended products, and what to avoid after salon visits.",
      readTime: "8 min read",
      type: "article",
      featured: true,
      targetAudience: "client" as const,
      url: "https://www.matrix.com/blog/how-to-make-hair-color-last-longer"
    },
    {
      id: 5,
      title: "Color Transformation Reality Check",
      category: "techniques",
      description: "Why going from dark to platinum takes time, understanding hair health, and planning multi-session transformations.",
      readTime: "10 min read",
      type: "article",
      featured: true,
      targetAudience: "both" as const,
      url: "https://www.allure.com/story/realistic-hair-color-expectations"
    },
    
    // Stylist Technique Articles
    {
      id: 6,
      title: "Mastering Balayage Technique",
      category: "techniques",
      description: "Complete guide to creating natural-looking balayage with proper sectioning, placement, and blending.",
      readTime: "12 min read",
      type: "article",
      featured: true,
      targetAudience: "stylist" as const,
      url: "https://www.behindthechair.com/balayage"
    },
    {
      id: 7,
      title: "Color Theory for Hair Professionals",
      category: "techniques",
      description: "Understanding undertones, neutralization, and how to achieve any color result with confidence.",
      readTime: "8 min read",
      type: "article",
      featured: false,
      targetAudience: "stylist" as const,
      url: "https://www.matrix.com/blog/color-theory"
    },
    {
      id: 8,
      title: "Working with Different Hair Textures",
      category: "techniques",
      description: "How texture and porosity affect color results, processing times, and formula adjustments needed.",
      readTime: "11 min read",
      type: "article",
      featured: false,
      targetAudience: "stylist" as const,
      url: "https://www.naturallycurly.com/curlreading/hair-color/hair-porosity-guide"
    },
    {
      id: 9,
      title: "Fixing Common Color Mistakes",
      category: "techniques",
      description: "Step-by-step solutions for brassy tones, uneven color, over-processing, and more common issues.",
      readTime: "10 min read",
      type: "article",
      featured: false,
      targetAudience: "stylist" as const,
      url: "https://www.redken.com/blog/how-to-fix-hair-color-mistakes"
    },
    {
      id: 10,
      title: "Understanding Hair Damage Prevention",
      category: "techniques",
      description: "The science behind hair damage and how to maintain hair integrity during chemical services.",
      readTime: "11 min read",
      type: "article",
      featured: false,
      targetAudience: "stylist" as const,
      url: "https://www.olaplex.com/blogs/blog/understanding-hair-damage"
    },
    
    // Stylist Business Articles
    {
      id: 11,
      title: "Advanced Consultation Techniques",
      category: "business",
      description: "Beyond basic listening - reading body language, asking the right questions, and documenting effectively.",
      readTime: "9 min read",
      type: "article",
      featured: false,
      targetAudience: "stylist" as const,
      url: "https://www.behindthechair.com/articles/consultation-techniques"
    },
    {
      id: 12,
      title: "Handling Difficult Client Conversations",
      category: "business",
      description: "How to say no professionally, manage unrealistic expectations, and navigate pricing discussions.",
      readTime: "8 min read",
      type: "article",
      featured: false,
      targetAudience: "stylist" as const,
      url: "https://www.modernsalon.com/business/management"
    },
    {
      id: 13,
      title: "Building a Six-Figure Salon Career",
      category: "business",
      description: "Proven strategies for pricing, marketing, and client retention that successful stylists use.",
      readTime: "15 min read",
      type: "article",
      featured: false,
      targetAudience: "stylist" as const,
      url: "https://www.modernsalon.com/business"
    },
    {
      id: 14,
      title: "Strategic Time Management for Stylists",
      category: "business",
      description: "Understanding service timing, building in buffer time, and maximizing your chair time revenue.",
      readTime: "10 min read",
      type: "article",
      featured: false,
      targetAudience: "stylist" as const,
      url: "https://www.glossgenius.com/blog/time-management-for-salon-owners"
    },
    {
      id: 15,
      title: "Client Retention: The First 90 Days",
      category: "business",
      description: "Strategies for turning one-time clients into loyal regulars through follow-up and relationship building.",
      readTime: "12 min read",
      type: "article",
      featured: false,
      targetAudience: "stylist" as const,
      url: "https://www.squareup.com/us/en/townsquare/salon-client-retention"
    },
    {
      id: 16,
      title: "Instagram Marketing for Hair Stylists",
      category: "business",
      description: "Grow your following and attract dream clients with strategic content that showcases your work.",
      readTime: "9 min read",
      type: "article",
      featured: false,
      targetAudience: "stylist" as const,
      url: "https://www.glossgenius.com/blog/instagram-marketing-for-salons"
    },
    {
      id: 17,
      title: "Photographing Your Work: Portfolio Building",
      category: "business",
      description: "Lighting, angles, and editing tips to showcase your work professionally on social media.",
      readTime: "8 min read",
      type: "article",
      featured: false,
      targetAudience: "stylist" as const,
      url: "https://www.behindthechair.com/articles/how-to-photograph-hair"
    },
    {
      id: 18,
      title: "Retail Without Being Pushy",
      category: "business",
      description: "How to recommend products authentically, increase retail revenue, and help clients maintain results.",
      readTime: "7 min read",
      type: "article",
      featured: false,
      targetAudience: "stylist" as const,
      url: "https://www.modernsalon.com/business/retail-sales"
    },
    
    // Trends for Both
    {
      id: 19,
      title: "2025 Hair Color Trends",
      category: "trends",
      description: "The hottest color trends this year, from butter blonde to rich espresso browns.",
      readTime: "6 min read",
      type: "article",
      featured: true,
      targetAudience: "both" as const,
      url: "https://www.allure.com/gallery/hair-color-trends"
    },
    {
      id: 20,
      title: "Seasonal Hair Care Guide",
      category: "trends",
      description: "How weather affects hair health and what to do in different seasons.",
      readTime: "7 min read",
      type: "article",
      featured: false,
      targetAudience: "both" as const,
      url: "https://www.redken.com/blog/seasonal-hair-care"
    }
  ];

  const [selectedCategory, setSelectedCategory] = useState("all");

  // Filter articles based on role and category
  const filteredArticles = articles.filter((article) => {
    const matchesCategory = selectedCategory === "all" || article.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Role-based filtering
    const matchesRole = 
      article.targetAudience === "both" ||
      (isStylist && article.targetAudience === "stylist") ||
      (isClient && article.targetAudience === "client");
    
    return matchesCategory && matchesSearch && matchesRole;
  });

  const featuredArticles = filteredArticles.filter(a => a.featured);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10">
      <PageHeader
        title="Knowledge Base"
        icon={<BookOpen className="h-6 w-6" />}
        backTo="/dashboard"
      />

      <main className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Role-specific subtitle */}
        <p className="text-muted-foreground text-center mb-6">
          {isStylist 
            ? "Professional guides and techniques for hair stylists"
            : isClient
            ? "Learn about hair care and what to expect from your appointments"
            : "Browse articles, guides, and resources"}
        </p>
        {/* Search Bar */}
        <Card className="mb-8 border-[3px] border-foreground shadow-[5px_5px_0px_0px_hsl(var(--foreground))]">
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

        {/* Quick Access Card - AI Assistant for Stylists Only */}
        {(isStylist || !isClient) && (
          <Card 
            className="border-[3px] border-foreground shadow-[5px_5px_0px_0px_hsl(var(--foreground))] hover:shadow-[7px_7px_0px_0px_hsl(var(--primary))] hover:-translate-y-1 transition-all cursor-pointer bg-gradient-to-br from-purple-400 to-pink-400 mb-8"
            onClick={() => navigate("/ai-assistant")}
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-background border-2 border-foreground shadow-[3px_3px_0px_0px_hsl(var(--foreground))] flex items-center justify-center">
                  <Lightbulb className="h-8 w-8 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-pixel text-foreground mb-1">Need AI Help?</h3>
                  <p className="text-sm font-sans text-foreground/80 font-medium">Get instant color formulas, corrections, and professional advice from our AI Assistant</p>
                </div>
                <ExternalLink className="h-5 w-5 text-foreground" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Featured Articles */}
        {!searchQuery && (
          <div className="mb-8">
            <h2 className="text-2xl font-pixel mb-4 flex items-center gap-2">
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
                      <CardTitle className="text-lg font-pixel text-foreground">{article.title}</CardTitle>
                      <CardDescription className="font-sans text-foreground/80 font-medium">
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
        <div className="mb-8">
          <div className="flex gap-0 border-[3px] border-foreground rounded-2xl overflow-hidden shadow-[5px_5px_0px_0px_hsl(var(--foreground))] bg-background">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-4 px-4 font-bold uppercase tracking-wide text-sm md:text-base transition-all border-r-[3px] last:border-r-0 border-foreground ${
                    selectedCategory === cat.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-background text-foreground hover:bg-muted'
                  }`}
                >
                  <Icon className="h-4 w-4 md:h-5 md:w-5" />
                  <span className="hidden sm:inline">{cat.label}</span>
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
                      <CardTitle className="font-pixel text-foreground">{article.title}</CardTitle>
                      <CardDescription className="font-sans text-foreground/80 font-medium">
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
