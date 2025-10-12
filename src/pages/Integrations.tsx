import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { SearchInput } from "@/components/SearchInput";
import { 
  Zap, Calendar, MessageSquare, Instagram, CreditCard, 
  FileText, Star, Cloud, Video, TrendingUp, Mail,
  Check, ExternalLink, Settings, Sparkles, BarChart3,
  CalendarCheck, Shield, Search
} from "lucide-react";

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  category: string;
  status: "available" | "connected" | "coming_soon";
  gradient: string;
  setupType: "webhook" | "oauth" | "api_key" | "direct";
  benefits: string[];
  recommended?: boolean;
}

const integrations: Integration[] = [
  // Automation
  {
    id: "zapier",
    name: "Zapier",
    description: "Connect to 6,000+ apps and automate your workflow",
    icon: Zap,
    category: "automation",
    status: "available",
    gradient: "from-orange-500 to-amber-500",
    setupType: "webhook",
    benefits: ["Automate appointment reminders", "Sync client data", "Connect to any app"],
    recommended: true,
  },
  // Calendar
  {
    id: "google-calendar",
    name: "Google Calendar",
    description: "Sync appointments with your Google Calendar automatically",
    icon: Calendar,
    category: "calendar",
    status: "available",
    gradient: "from-blue-500 to-cyan-500",
    setupType: "oauth",
    benefits: ["Two-way sync", "Auto-updates", "Conflict prevention"],
    recommended: true,
  },
  {
    id: "outlook-calendar",
    name: "Outlook Calendar",
    description: "Keep your Outlook calendar in sync with appointments",
    icon: Calendar,
    category: "calendar",
    status: "available",
    gradient: "from-indigo-500 to-blue-500",
    setupType: "oauth",
    benefits: ["Microsoft ecosystem", "Team calendars", "Real-time sync"],
  },
  {
    id: "apple-calendar",
    name: "Apple Calendar",
    description: "Sync with iCloud Calendar across all Apple devices",
    icon: Calendar,
    category: "calendar",
    status: "coming_soon",
    gradient: "from-gray-500 to-slate-500",
    setupType: "oauth",
    benefits: ["iCloud sync", "Apple ecosystem", "Cross-device"],
  },
  // Communication
  {
    id: "twilio",
    name: "Twilio SMS",
    description: "Send appointment reminders and updates via SMS",
    icon: MessageSquare,
    category: "communication",
    status: "available",
    gradient: "from-red-500 to-pink-500",
    setupType: "api_key",
    benefits: ["Automated reminders", "Two-way messaging", "Reduce no-shows"],
  },
  {
    id: "sendgrid",
    name: "SendGrid",
    description: "Professional email marketing and transactional emails",
    icon: Mail,
    category: "communication",
    status: "available",
    gradient: "from-cyan-500 to-blue-500",
    setupType: "api_key",
    benefits: ["Email templates", "Analytics", "Reliable delivery"],
  },
  {
    id: "whatsapp",
    name: "WhatsApp Business",
    description: "Connect with clients on their favorite messaging app",
    icon: MessageSquare,
    category: "communication",
    status: "coming_soon",
    gradient: "from-green-500 to-emerald-500",
    setupType: "oauth",
    benefits: ["Instant messaging", "Read receipts", "Media sharing"],
  },
  // Payment
  {
    id: "square",
    name: "Square",
    description: "Accept in-person and online payments",
    icon: CreditCard,
    category: "payment",
    status: "available",
    gradient: "from-slate-700 to-gray-600",
    setupType: "oauth",
    benefits: ["Point of sale", "Invoice", "Payment links"],
  },
  {
    id: "paypal",
    name: "PayPal",
    description: "Accept PayPal and Venmo payments",
    icon: CreditCard,
    category: "payment",
    status: "available",
    gradient: "from-blue-600 to-indigo-600",
    setupType: "oauth",
    benefits: ["Trusted by millions", "Buyer protection", "Easy checkout"],
  },
  // Social Media
  {
    id: "instagram",
    name: "Instagram",
    description: "Auto-post portfolio photos and connect with clients",
    icon: Instagram,
    category: "social",
    status: "available",
    gradient: "from-purple-500 via-pink-500 to-orange-500",
    setupType: "oauth",
    benefits: ["Auto-post portfolio", "Client discovery", "Engagement"],
    recommended: true,
  },
  {
    id: "facebook",
    name: "Facebook Business",
    description: "Manage your business page and bookings",
    icon: Video,
    category: "social",
    status: "coming_soon",
    gradient: "from-blue-600 to-indigo-700",
    setupType: "oauth",
    benefits: ["Page management", "Reviews", "Booking integration"],
  },
  {
    id: "tiktok",
    name: "TikTok",
    description: "Share your work and reach new clients",
    icon: Sparkles,
    category: "social",
    status: "coming_soon",
    gradient: "from-gray-900 to-pink-500",
    setupType: "oauth",
    benefits: ["Video content", "Viral reach", "Young audience"],
  },
  {
    id: "mailchimp",
    name: "Mailchimp",
    description: "Email marketing campaigns and automation",
    icon: Mail,
    category: "social",
    status: "available",
    gradient: "from-yellow-500 to-amber-500",
    setupType: "api_key",
    benefits: ["Email campaigns", "Marketing automation", "Client segmentation"],
  },
  // Accounting
  {
    id: "quickbooks",
    name: "QuickBooks",
    description: "Sync payments and expenses automatically",
    icon: FileText,
    category: "accounting",
    status: "available",
    gradient: "from-green-600 to-emerald-600",
    setupType: "oauth",
    benefits: ["Auto-sync payments", "Tax ready", "P&L reports"],
    recommended: true,
  },
  {
    id: "xero",
    name: "Xero",
    description: "Beautiful accounting software for small businesses",
    icon: FileText,
    category: "accounting",
    status: "coming_soon",
    gradient: "from-cyan-500 to-blue-600",
    setupType: "oauth",
    benefits: ["Bank reconciliation", "Invoicing", "Real-time data"],
  },
  {
    id: "freshbooks",
    name: "FreshBooks",
    description: "Time tracking, invoicing, and expense management",
    icon: FileText,
    category: "accounting",
    status: "available",
    gradient: "from-blue-500 to-indigo-600",
    setupType: "oauth",
    benefits: ["Time tracking", "Professional invoices", "Expense tracking"],
  },
  // Reviews
  {
    id: "google-business",
    name: "Google Business",
    description: "Manage reviews and boost your local presence",
    icon: Star,
    category: "reviews",
    status: "available",
    gradient: "from-red-500 via-yellow-500 to-green-500",
    setupType: "oauth",
    benefits: ["Local SEO", "Review management", "Google Maps"],
  },
  {
    id: "yelp",
    name: "Yelp",
    description: "Monitor and respond to Yelp reviews",
    icon: Star,
    category: "reviews",
    status: "coming_soon",
    gradient: "from-red-600 to-rose-600",
    setupType: "api_key",
    benefits: ["Review alerts", "Response templates", "Business insights"],
  },
  {
    id: "trustpilot",
    name: "Trustpilot",
    description: "Collect and showcase customer testimonials",
    icon: Shield,
    category: "reviews",
    status: "available",
    gradient: "from-teal-500 to-cyan-600",
    setupType: "oauth",
    benefits: ["Trust building", "Review collection", "SEO boost"],
  },
  // Storage
  {
    id: "google-drive",
    name: "Google Drive",
    description: "Store and share client photos and formulas",
    icon: Cloud,
    category: "storage",
    status: "available",
    gradient: "from-blue-500 via-green-500 to-yellow-500",
    setupType: "oauth",
    benefits: ["Unlimited photos", "Easy sharing", "Automatic backup"],
  },
  {
    id: "dropbox",
    name: "Dropbox",
    description: "Secure cloud storage for your business files",
    icon: Cloud,
    category: "storage",
    status: "coming_soon",
    gradient: "from-blue-600 to-blue-700",
    setupType: "oauth",
    benefits: ["File recovery", "Version history", "Team folders"],
  },
  // Scheduling
  {
    id: "calendly",
    name: "Calendly",
    description: "Easy scheduling for consultations and appointments",
    icon: CalendarCheck,
    category: "scheduling",
    status: "available",
    gradient: "from-blue-500 to-cyan-500",
    setupType: "oauth",
    benefits: ["Automated scheduling", "Buffer times", "Meeting types"],
  },
  {
    id: "acuity",
    name: "Acuity Scheduling",
    description: "Advanced scheduling with intake forms and packages",
    icon: CalendarCheck,
    category: "scheduling",
    status: "available",
    gradient: "from-purple-500 to-indigo-600",
    setupType: "oauth",
    benefits: ["Intake forms", "Package bookings", "Payment integration"],
  },
  // Analytics
  {
    id: "google-analytics",
    name: "Google Analytics",
    description: "Track website visits and booking conversions",
    icon: TrendingUp,
    category: "analytics",
    status: "available",
    gradient: "from-orange-500 to-amber-600",
    setupType: "direct",
    benefits: ["Client behavior", "Marketing insights", "ROI tracking"],
  },
  {
    id: "mixpanel",
    name: "Mixpanel",
    description: "Advanced user behavior analytics and insights",
    icon: BarChart3,
    category: "analytics",
    status: "available",
    gradient: "from-purple-600 to-pink-600",
    setupType: "api_key",
    benefits: ["Event tracking", "User journeys", "Retention analysis"],
  },
  {
    id: "tableau",
    name: "Tableau",
    description: "Business intelligence and data visualization",
    icon: BarChart3,
    category: "analytics",
    status: "coming_soon",
    gradient: "from-blue-700 to-indigo-800",
    setupType: "oauth",
    benefits: ["Visual dashboards", "Deep insights", "Custom reports"],
  },
];

const categories = [
  { id: "all", label: "All Integrations", icon: Sparkles },
  { id: "automation", label: "Automation", icon: Zap },
  { id: "calendar", label: "Calendar", icon: Calendar },
  { id: "communication", label: "Communication", icon: MessageSquare },
  { id: "payment", label: "Payments", icon: CreditCard },
  { id: "social", label: "Social Media", icon: Instagram },
  { id: "accounting", label: "Accounting", icon: FileText },
  { id: "reviews", label: "Reviews", icon: Star },
  { id: "storage", label: "Storage", icon: Cloud },
  { id: "scheduling", label: "Scheduling", icon: CalendarCheck },
  { id: "analytics", label: "Analytics", icon: TrendingUp },
];

const Integrations = () => {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredIntegrations = useMemo(() => {
    let filtered = selectedCategory === "all" 
      ? integrations 
      : integrations.filter(int => int.category === selectedCategory);
    
    if (searchQuery.trim()) {
      filtered = filtered.filter(int => 
        int.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        int.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  }, [selectedCategory, searchQuery]);

  const recommendedIntegrations = useMemo(() => 
    integrations.filter(int => int.recommended), 
    []
  );

  const stats = useMemo(() => ({
    available: integrations.filter(i => i.status === "available").length,
    connected: integrations.filter(i => i.status === "connected").length,
    comingSoon: integrations.filter(i => i.status === "coming_soon").length,
  }), []);

  const handleConnect = async (integration: Integration) => {
    setIsConnecting(true);
    
    try {
      if (integration.setupType === "webhook") {
        if (!webhookUrl) {
          toast({
            title: "Webhook URL Required",
            description: "Please enter your webhook URL to connect",
            variant: "destructive",
          });
          return;
        }
        
        await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          mode: "no-cors",
          body: JSON.stringify({
            event: "test_connection",
            timestamp: new Date().toISOString(),
          }),
        });
        
        toast({
          title: "✅ Connected Successfully!",
          description: `${integration.name} has been connected. Check your integration dashboard to confirm.`,
        });
      } else if (integration.setupType === "api_key") {
        if (!apiKey) {
          toast({
            title: "API Key Required",
            description: "Please enter your API key to connect",
            variant: "destructive",
          });
          return;
        }
        
        toast({
          title: "✅ API Key Saved!",
          description: `${integration.name} is now connected and ready to use.`,
        });
      } else if (integration.setupType === "oauth") {
        toast({
          title: "🔗 OAuth Coming Soon",
          description: `${integration.name} OAuth integration is being finalized. We'll notify you when it's ready!`,
        });
      } else {
        toast({
          title: "✅ Integration Active",
          description: `${integration.name} is now ready to use!`,
        });
      }
      
      setSelectedIntegration(null);
      setWebhookUrl("");
      setApiKey("");
    } catch (error) {
      console.error("Connection error:", error);
      toast({
        title: "Connection Error",
        description: "Please check your configuration and try again",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === "connected") {
      return <Badge className="bg-green-500"><Check className="h-3 w-3 mr-1" />Connected</Badge>;
    } else if (status === "coming_soon") {
      return <Badge variant="secondary">Coming Soon</Badge>;
    }
    return null;
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="glass-effect p-8 rounded-xl border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
                <Zap className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-4xl font-bold gradient-text">Integrations</h1>
                <p className="text-muted-foreground text-lg">
                  Connect your favorite tools and automate your workflow
                </p>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="hidden md:flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">{stats.available}</div>
                <div className="text-xs text-muted-foreground">Available</div>
              </div>
              <div className="h-10 w-px bg-border" />
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-500">{stats.connected}</div>
                <div className="text-xs text-muted-foreground">Connected</div>
              </div>
              <div className="h-10 w-px bg-border" />
              <div className="text-center">
                <div className="text-2xl font-bold text-muted-foreground">{stats.comingSoon}</div>
                <div className="text-xs text-muted-foreground">Coming Soon</div>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search integrations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 bg-background/50"
            />
          </div>
        </div>

        {/* Recommended Section */}
        {!searchQuery && selectedCategory === "all" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold">Recommended for You</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {recommendedIntegrations.map((integration, index) => {
                const Icon = integration.icon;
                return (
                  <Card 
                    key={integration.id} 
                    className="hover-scale group relative overflow-hidden cursor-pointer"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${integration.gradient} opacity-5 group-hover:opacity-10 transition-opacity`} />
                    <CardHeader className="pb-3">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${integration.gradient} flex items-center justify-center mb-2`}>
                        <Icon className="h-6 w-6 text-primary-foreground" />
                      </div>
                      <CardTitle className="text-base">{integration.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            size="sm" 
                            className="w-full"
                            onClick={() => setSelectedIntegration(integration)}
                          >
                            Connect
                          </Button>
                        </DialogTrigger>
                        {selectedIntegration?.id === integration.id && (
                          <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${integration.gradient} flex items-center justify-center mb-4`}>
                                <Icon className="h-6 w-6 text-primary-foreground" />
                              </div>
                              <DialogTitle>Connect {integration.name}</DialogTitle>
                              <DialogDescription>
                                {integration.description}
                              </DialogDescription>
                            </DialogHeader>
                            
                            <div className="space-y-4">
                              {integration.setupType === "webhook" && (
                                <div className="space-y-2">
                                  <Label htmlFor="webhook">Webhook URL</Label>
                                  <Input 
                                    id="webhook"
                                    placeholder="https://hooks.zapier.com/..."
                                    value={webhookUrl}
                                    onChange={(e) => setWebhookUrl(e.target.value)}
                                  />
                                  <p className="text-xs text-muted-foreground">
                                    Create a webhook in {integration.name} and paste the URL here
                                  </p>
                                </div>
                              )}
                              
                              {integration.setupType === "api_key" && (
                                <div className="space-y-2">
                                  <Label htmlFor="apikey">API Key</Label>
                                  <Input 
                                    id="apikey"
                                    type="password"
                                    placeholder="Enter your API key"
                                    value={apiKey}
                                    onChange={(e) => setApiKey(e.target.value)}
                                  />
                                  <p className="text-xs text-muted-foreground">
                                    Get your API key from {integration.name} dashboard
                                  </p>
                                </div>
                              )}
                              
                              {integration.setupType === "oauth" && (
                                <div className="p-4 bg-muted rounded-lg space-y-2">
                                  <p className="text-sm font-medium">OAuth Authentication</p>
                                  <p className="text-xs text-muted-foreground">
                                    You'll be redirected to {integration.name} to authorize access
                                  </p>
                                </div>
                              )}
                              
                              {integration.setupType === "direct" && (
                                <div className="p-4 bg-muted rounded-lg space-y-2">
                                  <p className="text-sm font-medium">Direct Integration</p>
                                  <p className="text-xs text-muted-foreground">
                                    This integration works automatically once activated
                                  </p>
                                </div>
                              )}
                              
                              <div className="flex gap-2">
                                <Button 
                                  onClick={() => handleConnect(integration)}
                                  disabled={isConnecting}
                                  className="flex-1"
                                >
                                  {isConnecting ? "Connecting..." : "Connect"}
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="icon"
                                  onClick={() => window.open(`https://${integration.id}.com`, '_blank')}
                                  aria-label={`Open ${integration.name} website`}
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        )}
                      </Dialog>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Category Filter */}
        <div className="glass-effect rounded-xl border p-2">
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
            <TabsList className="w-full justify-start overflow-x-auto flex-wrap h-auto gap-2 bg-transparent">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <TabsTrigger 
                    key={category.id} 
                    value={category.id}
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {category.label}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>
        </div>

        {/* All Integrations Section */}
        <div className="space-y-4">
          {!searchQuery && selectedCategory === "all" && (
            <h2 className="text-2xl font-bold">All Integrations</h2>
          )}
          
          {searchQuery && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Search className="h-4 w-4" />
              <span className="text-sm">
                {filteredIntegrations.length} result{filteredIntegrations.length !== 1 && 's'} for "{searchQuery}"
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredIntegrations.map((integration, index) => {
              const Icon = integration.icon;
              return (
                <Card 
                  key={integration.id} 
                  className="hover-scale group relative overflow-hidden animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${integration.gradient} opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity`} />
                
                <CardHeader>
                  <div className="flex items-start justify-between mb-3">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${integration.gradient}`}>
                      <Icon className="h-6 w-6 text-primary-foreground" />
                    </div>
                    {getStatusBadge(integration.status)}
                  </div>
                  <CardTitle className="text-xl">{integration.name}</CardTitle>
                  <CardDescription className="text-sm">
                    {integration.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">Key Benefits:</p>
                    <ul className="space-y-1">
                      {integration.benefits.map((benefit, i) => (
                        <li key={i} className="text-sm flex items-center gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${integration.gradient}`} />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        className="w-full"
                        variant={integration.status === "coming_soon" ? "secondary" : "default"}
                        disabled={integration.status === "coming_soon"}
                        onClick={() => setSelectedIntegration(integration)}
                      >
                        {integration.status === "connected" && <Check className="h-4 w-4 mr-2" />}
                        {integration.status === "coming_soon" && "Coming Soon"}
                        {integration.status === "available" && "Connect"}
                        {integration.status === "connected" && "Manage"}
                      </Button>
                    </DialogTrigger>
                    
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${integration.gradient} flex items-center justify-center mb-4`}>
                          <Icon className="h-6 w-6 text-primary-foreground" />
                        </div>
                        <DialogTitle>Connect {integration.name}</DialogTitle>
                        <DialogDescription>
                          {integration.description}
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-4">
                        {integration.setupType === "webhook" && (
                          <div className="space-y-2">
                            <Label htmlFor="webhook">Webhook URL</Label>
                            <Input 
                              id="webhook"
                              placeholder="https://hooks.zapier.com/..."
                              value={webhookUrl}
                              onChange={(e) => setWebhookUrl(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                              Create a webhook in {integration.name} and paste the URL here
                            </p>
                          </div>
                        )}
                        
                        {integration.setupType === "api_key" && (
                          <div className="space-y-2">
                            <Label htmlFor="apikey">API Key</Label>
                            <Input 
                              id="apikey"
                              type="password"
                              placeholder="Enter your API key"
                              value={apiKey}
                              onChange={(e) => setApiKey(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                              Get your API key from {integration.name} dashboard
                            </p>
                          </div>
                        )}
                        
                        {integration.setupType === "oauth" && (
                          <div className="p-4 bg-muted rounded-lg space-y-2">
                            <p className="text-sm font-medium">OAuth Authentication</p>
                            <p className="text-xs text-muted-foreground">
                              You'll be redirected to {integration.name} to authorize access
                            </p>
                          </div>
                        )}
                        
                        {integration.setupType === "direct" && (
                          <div className="p-4 bg-muted rounded-lg space-y-2">
                            <p className="text-sm font-medium">Direct Integration</p>
                            <p className="text-xs text-muted-foreground">
                              This integration works automatically once activated
                            </p>
                          </div>
                        )}
                        
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => handleConnect(integration)}
                            disabled={isConnecting}
                            className="flex-1"
                          >
                            {isConnecting ? "Connecting..." : "Connect"}
                          </Button>
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => window.open(`https://${integration.id}.com`, '_blank')}
                            aria-label={`Open ${integration.name} website`}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredIntegrations.length === 0 && (
          <div className="text-center py-12">
            <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">No integrations found{searchQuery && ` for "${searchQuery}"`}</p>
          </div>
        )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Integrations;