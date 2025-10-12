import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Sparkles } from "lucide-react";
import { Breadcrumbs } from "@/components/Breadcrumbs";

const Products = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Breadcrumbs />
        
        <div className="min-h-[60vh] flex items-center justify-center">
          <Card className="border-[3px] border-foreground shadow-[8px_8px_0px_0px_hsl(var(--foreground))] max-w-2xl mx-auto">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <Package className="h-20 w-20 text-primary" />
                  <Sparkles className="h-8 w-8 text-primary absolute -top-2 -right-2 animate-pulse" />
                </div>
              </div>
              <CardTitle className="text-4xl font-bold">Product Inventory</CardTitle>
              <CardDescription className="text-lg mt-2">
                Coming Soon
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center pb-8">
              <p className="text-muted-foreground text-lg leading-relaxed">
                We're building an amazing product inventory management system to help you track your hair products, monitor stock levels, and analyze usage patterns.
              </p>
              <p className="text-muted-foreground mt-4">
                Stay tuned for this exciting feature!
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Products;
