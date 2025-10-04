import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, BookOpen, HelpCircle, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";

const Resources = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState("");

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
        .eq("user_id", session.user.id)
        .single();

      setUserRole(roleData?.role || "client");
    } catch (error: any) {
      console.error("Error checking role:", error);
    } finally {
      setLoading(false);
    }
  };

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
        title="Resources & Help"
        icon={<Sparkles className="h-6 w-6" />}
        backTo="/dashboard"
      />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Knowledge Base */}
          <Card className="border-[3px] border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))] hover:shadow-[6px_6px_0px_0px_hsl(var(--foreground))] hover:-translate-y-1 transition-all">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Knowledge Base
              </CardTitle>
              <CardDescription>
                {userRole === "stylist"
                  ? "Professional hair styling resources and techniques"
                  : "Hair care guides and tips"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Access our comprehensive library of articles, tutorials, and best practices
              </p>
              <Button 
                className="w-full" 
                variant="outline"
                onClick={() => navigate("/knowledge")}
              >
                Browse Knowledge Base
              </Button>
            </CardContent>
          </Card>

          {/* Help & Support */}
          <Card className="border-[3px] border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))] hover:shadow-[6px_6px_0px_0px_hsl(var(--foreground))] hover:-translate-y-1 transition-all">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                Help & Support
              </CardTitle>
              <CardDescription>
                Get help and answers to common questions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Find answers in our FAQ section or contact our support team
              </p>
              <Button className="w-full" variant="outline">
                View Help Center
              </Button>
            </CardContent>
          </Card>

          {/* AI Assistant (Stylists Only) */}
          {userRole === "stylist" && (
            <Card className="border-[3px] border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))] hover:shadow-[6px_6px_0px_0px_hsl(var(--foreground))] hover:-translate-y-1 transition-all md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  AI Color Assistant
                </CardTitle>
                <CardDescription>
                  Get instant expert advice on color formulations and techniques
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Chat with our AI assistant for personalized guidance on color theory, formulation, troubleshooting, and client consultations
                </p>
                <Button className="w-full">
                  Open AI Assistant
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Quick Tips */}
        <Card className="mt-8 border-[3px] border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))]">
          <CardHeader>
            <CardTitle>💡 Quick Tips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {userRole === "stylist" ? (
              <>
                <p>• Use the AI Assistant for quick formula consultations</p>
                <p>• Browse the Knowledge Base for advanced techniques</p>
                <p>• Check Help & Support for platform guidance</p>
                <p>• Bookmark useful articles for quick reference</p>
              </>
            ) : (
              <>
                <p>• Learn proper aftercare for your hair treatments</p>
                <p>• Discover tips for maintaining color between appointments</p>
                <p>• Get answers to common hair care questions</p>
                <p>• Find product recommendations for your hair type</p>
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Resources;
