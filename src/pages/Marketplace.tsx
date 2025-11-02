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

      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Package className="w-8 h-8" />
                Marketplace
              </h1>
              <p className="text-muted-foreground">
                Professional hair care products
              </p>
            </div>

            {cart.size > 0 && (
              <Button>
                <ShoppingCart className="w-4 h-4 mr-2" />
                Cart ({cart.size}) - ${cartTotal.toFixed(2)}
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
              <CardContent className="p-12 text-center">
                <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Products Yet</h3>
                <p className="text-muted-foreground">
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
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {product.name}
                      <span className="text-lg font-bold text-primary">
                        ${product.price.toFixed(2)}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {product.description || 'No description'}
                    </p>
                    {product.category && (
                      <Badge variant="outline" className="mt-2">
                        {product.category}
                      </Badge>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      {product.stock_quantity > 0
                        ? `${product.stock_quantity} in stock`
                        : 'Out of stock'}
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full"
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
