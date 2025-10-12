import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, Sparkles, Clock, TrendingUp, BarChart3 } from "lucide-react";
import { Breadcrumbs } from "@/components/Breadcrumbs";

const Products = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Breadcrumbs />
        
        <div className="min-h-[60vh] flex items-center justify-center p-4">
          <Card className="border-[3px] border-foreground shadow-brutal-2xl max-w-3xl mx-auto hover:shadow-[10px_10px_0px_0px_hsl(var(--primary))] transition-all duration-300">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="w-28 h-28 rounded-2xl bg-gradient-emerald-teal flex items-center justify-center border-[3px] border-foreground shadow-brutal-lg">
                    <Package className="h-16 w-16 text-on-surface-primary" />
                  </div>
                  <div className="absolute -top-3 -right-3">
                    <Sparkles className="h-10 w-10 text-primary animate-pulse drop-shadow-lg" />
                  </div>
                </div>
              </div>
              
              <Badge className="mx-auto mb-3 bg-warning text-warning-foreground border-2 border-foreground px-4 py-1 text-sm font-bold shadow-brutal-sm animate-pulse">
                <Clock className="h-3 w-3 mr-1" />
                COMING SOON
              </Badge>
              
              <CardTitle className="text-5xl font-bold mb-2 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Product Inventory
              </CardTitle>
              
              <CardDescription className="text-lg mt-3 font-medium">
                Track products, monitor stock & boost profits
              </CardDescription>
            </CardHeader>
            
            <CardContent className="pb-8 space-y-6">
              <p className="text-muted-foreground text-lg leading-relaxed text-center max-w-2xl mx-auto">
                We're building an amazing inventory management system to help you track hair products, 
                monitor stock levels, and analyze usage patterns.
              </p>
              
              <div className="grid md:grid-cols-3 gap-4 mt-8">
                <div className="p-4 border-2 border-foreground rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-gradient-cyan-blue flex items-center justify-center mb-3">
                    <Package className="h-5 w-5 text-on-surface-primary" />
                  </div>
                  <h4 className="font-semibold mb-1">Smart Tracking</h4>
                  <p className="text-xs text-muted-foreground">Real-time stock monitoring</p>
                </div>
                
                <div className="p-4 border-2 border-foreground rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-gradient-amber-orange flex items-center justify-center mb-3">
                    <TrendingUp className="h-5 w-5 text-on-surface-primary" />
                  </div>
                  <h4 className="font-semibold mb-1">Usage Analytics</h4>
                  <p className="text-xs text-muted-foreground">See what you use most</p>
                </div>
                
                <div className="p-4 border-2 border-foreground rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-gradient-purple-pink flex items-center justify-center mb-3">
                    <BarChart3 className="h-5 w-5 text-on-surface-primary" />
                  </div>
                  <h4 className="font-semibold mb-1">Cost Insights</h4>
                  <p className="text-xs text-muted-foreground">Track your inventory value</p>
                </div>
              </div>
              
              <p className="text-center text-sm text-muted-foreground mt-6">
                Stay tuned for this exciting feature! 🚀
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Products;
