import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Package } from 'lucide-react';
import { MetaTags } from '@/components/MetaTags';
import { useToast } from '@/hooks/use-toast';
import { OptimizedImage } from '@/components/OptimizedImage';
import { cn } from '@/lib/utils';
import { mobileFirst, touchButton } from '@/lib/responsive/mobile-first-utils';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock_quantity: number;
  image_url: string | null;
  category: string | null;
}

export default function Marketplace() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<Map<string, number>>(new Map());
  const { toast } = useToast();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (data) setProducts(data as any);
    setLoading(false);
  };

  const addToCart = (productId: string) => {
    const newCart = new Map(cart);
    newCart.set(productId, (cart.get(productId) || 0) + 1);
    setCart(newCart);
    toast({
      title: 'Added to cart',
      description: '1 item added',
    });
  };

  const cartTotal = Array.from(cart.entries()).reduce(
    (total, [productId, qty]) => {
      const product = products.find(p => p.id === productId);
      return total + (product?.price || 0) * qty;
    },
    0
  );

  return (
    <>
      <MetaTags
        title="Product Marketplace"
        description="Shop professional hair care products"
      />

      <div className={cn("min-h-screen bg-gradient-to-br from-background via-background to-primary/5", mobileFirst.padding.md)}>
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h1 className={cn(mobileFirst.text['2xl'], "font-bold flex items-center gap-2 break-words")}>
                <Package className="w-8 h-8 flex-shrink-0" />
                Marketplace
              </h1>
              <p className={cn(mobileFirst.text.sm, "text-muted-foreground break-words")}>
                Professional hair care products
              </p>
            </div>

            {cart.size > 0 && (
              <Button className={cn(touchButton.md, "flex-shrink-0")}>
                <ShoppingCart className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Cart ({cart.size}) - </span>${cartTotal.toFixed(2)}
              </Button>
            )}
          </div>

          {loading ? (
            <div className="grid md:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-muted" />
                  <CardContent className="space-y-2 pt-4">
                    <div className="h-4 bg-muted rounded" />
                    <div className="h-3 bg-muted rounded w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : products.length === 0 ? (
            <Card>
              <CardContent className={cn(mobileFirst.padding.lg, "p-12 text-center")}>
                <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className={cn(mobileFirst.text.lg, "font-semibold mb-2 break-words")}>No Products Yet</h3>
                <p className={cn(mobileFirst.text.sm, "text-muted-foreground break-words")}>
                  Products will appear here once your stylist adds them
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-3 gap-4">
              {products.map(product => (
                <Card key={product.id}>
                  {product.image_url && (
                    <OptimizedImage
                      src={product.image_url}
                      alt={product.name}
                      className="h-48"
                    />
                  )}
                  <CardHeader className={mobileFirst.padding.md}>
                    <CardTitle className={cn(mobileFirst.text.lg, "flex items-center justify-between gap-2")}>
                      <span className="break-words min-w-0 flex-1">{product.name}</span>
                      <span className={cn(mobileFirst.text.base, "font-bold text-primary flex-shrink-0")}>
                        ${product.price.toFixed(2)}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className={mobileFirst.padding.md}>
                    <p className={cn(mobileFirst.text.sm, "text-muted-foreground break-words")}>
                      {product.description || 'No description'}
                    </p>
                    {product.category && (
                      <Badge variant="outline" className={cn(mobileFirst.text.xs, "mt-2")}>
                        {product.category}
                      </Badge>
                    )}
                    <p className={cn(mobileFirst.text.xs, "text-muted-foreground mt-2")}>
                      {product.stock_quantity > 0
                        ? `${product.stock_quantity} in stock`
                        : 'Out of stock'}
                    </p>
                  </CardContent>
                  <CardFooter className={mobileFirst.padding.md}>
                    <Button
                      className={cn(touchButton.md, "w-full")}
                      disabled={product.stock_quantity === 0}
                      onClick={() => addToCart(product.id)}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Add to Cart
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
