/**
 * AI Feature Showcase - Highlights AI capabilities for users
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Brain, TrendingUp, Zap, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";
import { useAuth } from "@/hooks/useAuth";

export const AIFeatureShowcase = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isStylist, isAdmin } = useUserRole(user?.id);

  const features = [
    {
      icon: Sparkles,
      title: "AI Chat Assistant",
      description: "24/7 hair expert answering your questions instantly",
      gradient: "from-purple-500/20 to-pink-500/20",
      route: "/ai-assistant",
      show: true,
    },
    {
      icon: Brain,
      title: "Smart Retention",
      description: "AI predicts at-risk clients and suggests retention strategies",
      gradient: "from-blue-500/20 to-cyan-500/20",
      route: "/system-health",
      show: isStylist || isAdmin,
    },
    {
      icon: TrendingUp,
      title: "Predictive Insights",
      description: "Get personalized recommendations based on your patterns",
      gradient: "from-green-500/20 to-emerald-500/20",
      route: "/dashboard",
      show: true,
    },
  ].filter(f => f.show);

  if (features.length === 0) return null;

  return (
    <Card className="border-4 border-primary/20 shadow-brutal overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5" />
      
      <CardHeader className="relative">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-full bg-primary/10 animate-pulse">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="flex items-center gap-2">
              AI-Powered Features
              <span className="text-xs bg-warning text-warning-foreground px-2 py-0.5 rounded-full border-2 border-foreground">
                NEW
              </span>
            </CardTitle>
            <CardDescription>
              Intelligent tools working for you automatically
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative">
        <div className="grid gap-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className={`p-4 rounded-lg border-2 border-foreground bg-gradient-to-br ${feature.gradient} hover:scale-[1.02] transition-transform cursor-pointer group`}
                onClick={() => navigate(feature.route)}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-background/80 border-2 border-foreground">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                      {feature.title}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 p-3 bg-muted/50 rounded-lg border-2 border-foreground/10">
          <p className="text-xs text-muted-foreground">
            <Zap className="h-3 w-3 inline mr-1" />
            All AI features are enabled by default and working in the background to enhance your experience
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
