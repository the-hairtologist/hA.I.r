import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { HelpCircle, Search, BookOpen, Video, MessageSquare, ExternalLink } from "lucide-react";
import { haptic } from "@/platform/haptics";

interface HelpArticle {
  id: string;
  title: string;
  description: string;
  category: string;
  url?: string;
}

export const HelpButton = () => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const articles: HelpArticle[] = [
    {
      id: "add-client",
      title: "How to Add Your First Client",
      description: "Step-by-step guide to adding clients and building their hair history",
      category: "Getting Started",
    },
    {
      id: "formulas",
      title: "Saving Color Formulas",
      description: "Learn how to document and save perfect color formulas",
      category: "Features",
    },
    {
      id: "milestones",
      title: "Understanding Client Milestones",
      description: "How milestone celebrations work and reward your loyal clients",
      category: "Features",
    },
    {
      id: "referrals",
      title: "Referral Program Guide",
      description: "Earn free months by inviting other stylists to join",
      category: "Growth",
    },
    {
      id: "timeline",
      title: "Hair Memory Timeline",
      description: "Track every client's hair journey and share their story",
      category: "Features",
    },
    {
      id: "booking",
      title: "Managing Appointments",
      description: "How to create, update, and track client appointments",
      category: "Getting Started",
    },
  ];

  const filteredArticles = articles.filter(
    (article) =>
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpen = () => {
    haptic.tap();
    setOpen(true);
  };

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        onClick={handleOpen}
        className="fixed bottom-20 right-6 h-14 w-14 rounded-full brutal-border brutal-shadow-xs brutal-hover z-50 bg-primary text-on-surface-primary lg:bottom-6"
        aria-label="Help & Support"
      >
        <HelpCircle className="h-6 w-6" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden brutal-border brutal-shadow-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <HelpCircle className="h-6 w-6 text-primary" />
              Help & Support
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="articles" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="articles" className="gap-1">
                <BookOpen className="h-4 w-4" />
                Articles
              </TabsTrigger>
              <TabsTrigger value="videos" className="gap-1">
                <Video className="h-4 w-4" />
                Videos
              </TabsTrigger>
              <TabsTrigger value="contact" className="gap-1">
                <MessageSquare className="h-4 w-4" />
                Contact
              </TabsTrigger>
            </TabsList>

            <TabsContent value="articles" className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search help articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Articles */}
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {filteredArticles.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No articles found. Try a different search term.
                  </p>
                ) : (
                  filteredArticles.map((article) => (
                    <Card
                      key={article.id}
                      className="brutal-border hover:border-primary/40 transition-colors cursor-pointer"
                      onClick={() => {
                        // Article detail view available on click
                        haptic.tap();
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="flex items-start justify-between">
                            <h4 className="font-semibold text-sm">{article.title}</h4>
                            <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {article.description}
                          </p>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-primary font-medium">
                              {article.category}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="videos" className="space-y-4">
              <div className="text-center py-12">
                <Video className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Video Tutorials</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Step-by-step video guides will be available in a future update. In the meantime, explore the app and check our FAQ section!
                </p>
              </div>
            </TabsContent>

            <TabsContent value="contact" className="space-y-4">
              <div className="space-y-6 py-4">
                <Card className="border-[2px] border-primary/30">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <MessageSquare className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold">Live Chat Support</h4>
                        <p className="text-sm text-muted-foreground">
                          Chat with our team Monday-Friday, 9am-6pm EST
                        </p>
                      </div>
                      <Button
                        onClick={() => {
                          // Chat widget integration point
                          haptic.tap();
                        }}
                        className="border-[2px] border-foreground"
                      >
                        Start Chat
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-[2px] border-border">
                  <CardContent className="p-6">
                    <h4 className="font-semibold mb-2">Email Support</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Send us an email and we'll respond within 24 hours
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        window.location.href = "mailto:support@hair.app";
                      }}
                      className="border-[2px] border-foreground"
                    >
                      support@hair.app
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
};
