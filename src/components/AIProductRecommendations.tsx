import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ExternalLink, TrendingUp, Tag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { analytics } from "@/lib/analytics";

interface ProductRecommendation {
  id: string;
  name: string;
  brand: string;
  description: string;
  price: number;
  imageUrl?: string;
  affiliateUrl: string;
  commissionRate: number;
  category: string;
  matchReason: string;
}

interface AIProductRecommendationsProps {
  formula?: any;
  hairType?: string;
  desiredResult?: string;
  stylistId?: string;
}

export const AIProductRecommendations = ({
  formula,
  hairType,
  desiredResult,
  stylistId
}: AIProductRecommendationsProps) => {
  const [recommendations, setRecommendations] = useState<ProductRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [affiliateCode, setAffiliateCode] = useState<string | null>(null);

  useEffect(() => {
    loadRecommendations();
  }, [formula, hairType, desiredResult]);

  const loadRecommendations = async () => {
    if (!formula && !hairType && !desiredResult) {
      setLoading(false);
      return;
    }

    try {
      // Get stylist's affiliate codes
      if (stylistId) {
        const { data: codes } = await supabase
          .from('stylist_affiliate_codes')
          .select('referral_code')
          .eq('stylist_id', stylistId)
          .eq('is_active', true)
          .limit(1)
          .maybeSingle();

        if (codes?.referral_code) {
          setAffiliateCode(codes.referral_code);
        }
      }

      // AI recommendation engine integration ready for future enhancement
      // For now, show mock recommendations based on common products
      const mockRecommendations: ProductRecommendation[] = [
        {
          id: '1',
          name: 'Olaplex No. 3 Hair Perfector',
          brand: 'Olaplex',
          description: 'Bond-building treatment to repair damaged hair',
          price: 28.00,
          affiliateUrl: 'https://example.com/olaplex',
          commissionRate: 0.15,
          category: 'Treatment',
          matchReason: 'Perfect for color-treated hair repair'
        },
        {
          id: '2',
          name: 'Redken Color Extend Shampoo',
          brand: 'Redken',
          description: 'Color-safe shampoo with pH-balanced formula',
          price: 24.00,
          affiliateUrl: 'https://example.com/redken',
          commissionRate: 0.12,
          category: 'Shampoo',
          matchReason: 'Extends color vibrancy'
        },
        {
          id: '3',
          name: 'Matrix Total Results Blonde Care',
          brand: 'Matrix',
          description: 'Purple toning conditioner for blonde hair',
          price: 18.00,
          affiliateUrl: 'https://example.com/matrix',
          commissionRate: 0.10,
          category: 'Conditioner',
          matchReason: 'Maintains cool blonde tones'
        }
      ];

      setRecommendations(mockRecommendations);
    } catch (error) {
      console.error('Error loading recommendations:', error);
      toast.error('Failed to load product recommendations');
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = (product: ProductRecommendation) => {
    // Track click
    analytics.affiliateCodeUsed(product.brand, affiliateCode || 'none');
    
    // Open affiliate link with code if available
    const url = affiliateCode 
      ? `${product.affiliateUrl}?ref=${affiliateCode}`
      : product.affiliateUrl;
    
    window.open(url, '_blank');
    
    toast.success(`Opening ${product.brand} product page`);
  };

  if (loading) {
    return (
      <Card className="border-[3px] border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))]">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  const totalCommissionPotential = recommendations.reduce(
    (sum, product) => sum + (product.price * product.commissionRate),
    0
  );

  return (
    <Card className="brutal-border shadow-brutal-lg">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-primary" />
              Recommended Products
            </CardTitle>
            <CardDescription>
              Earn up to ${totalCommissionPotential.toFixed(2)} in commissions
            </CardDescription>
          </div>
          <Badge variant="secondary" className="flex items-center gap-1">
            <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
            AI Matched
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recommendations.map((product) => {
            const commission = (product.price * product.commissionRate).toFixed(2);
            
            return (
              <div
                key={product.id}
                className="flex items-start gap-4 p-4 border-2 border-foreground rounded-lg hover:bg-accent/5 transition-colors"
              >
                {/* Product Image Placeholder */}
                <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center border-2 border-foreground">
                  <Tag className="h-8 w-8 text-muted-foreground" />
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-semibold text-xs sm:text-sm">{product.name}</h4>
                      <p className="text-[11px] sm:text-xs text-muted-foreground">{product.brand}</p>
                    </div>
                    <Badge variant="outline" className="text-[11px] sm:text-xs">
                      {product.category}
                    </Badge>
                  </div>

                  <p className="text-xs sm:text-sm text-muted-foreground mt-2 line-clamp-2">
                    {product.description}
                  </p>

                  <div className="flex items-center gap-4 mt-3">
                    <div>
                      <span className="text-base sm:text-lg font-bold text-primary">
                        ${product.price.toFixed(2)}
                      </span>
                    </div>
                    <div className="text-[11px] sm:text-xs text-success font-medium">
                      Earn ${commission}
                      <span className="text-muted-foreground ml-1">
                        ({(product.commissionRate * 100).toFixed(0)}%)
                      </span>
                    </div>
                  </div>

                  {/* Match Reason */}
                  <div className="mt-2 text-[11px] sm:text-xs text-muted-foreground italic">
                    💡 {product.matchReason}
                  </div>
                </div>

                {/* Action Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleProductClick(product)}
                  className="shrink-0"
                >
                  <ExternalLink className="h-5 w-5 sm:h-6 sm:w-6" />
                </Button>
              </div>
            );
          })}
        </div>

        {/* Footer Info */}
        <div className="mt-6 p-4 bg-muted/50 rounded-lg border-2 border-foreground/10">
          <p className="text-[11px] sm:text-xs text-muted-foreground">
            💰 <strong>Commissions are automatic:</strong> When your client purchases through your link,
            you earn {affiliateCode ? 'with your code' : 'a commission'}. Track all earnings in the Finance tab.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
