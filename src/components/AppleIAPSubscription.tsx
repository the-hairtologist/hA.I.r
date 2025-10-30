import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Check, Loader2, Apple } from 'lucide-react';
import { appleIAP, IAP_PRODUCTS } from '@/lib/iap/appleIAP';
import { toast } from 'sonner';
import { useSubscription } from '@/contexts/SubscriptionContext';

interface IAPProduct {
  id: string;
  title: string;
  description: string;
  price: string;
  currency: string;
}

export const AppleIAPSubscription = () => {
  const [products, setProducts] = useState<IAPProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const { checkSubscription, subscribed } = useSubscription();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const iapProducts = await appleIAP.getProducts();
      setProducts(iapProducts);
    } catch (error) {
      console.error('Failed to load products:', error);
      toast.error('Failed to load subscription options');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (productId: string) => {
    try {
      setPurchasing(productId);

      const result = await appleIAP.purchaseProduct(productId);

      if (result.success) {
        toast.success('Subscription activated successfully!');
        // Refresh subscription status
        await checkSubscription();
      } else {
        toast.error(result.error || 'Purchase failed');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      toast.error('Purchase failed. Please try again.');
    } finally {
      setPurchasing(null);
    }
  };

  const handleRestore = async () => {
    try {
      setLoading(true);
      toast.loading('Restoring purchases...');

      const result = await appleIAP.restorePurchases();

      if (result.success) {
        toast.success('Purchases restored successfully!');
        await checkSubscription();
      } else {
        toast.error(result.error || 'No purchases to restore');
      }
    } catch (error) {
      console.error('Restore error:', error);
      toast.error('Failed to restore purchases');
    } finally {
      setLoading(false);
    }
  };

  const getProductFeatures = (productId: string) => {
    const baseFeatures = [
      'Unlimited clients',
      'AI Formula Generator',
      'Appointment booking',
      'Client messaging',
      'Portfolio showcase',
      'Business analytics',
    ];

    if (productId === IAP_PRODUCTS.STYLIST_PRO_YEARLY) {
      return [...baseFeatures, 'Save 20% vs monthly', 'Priority support'];
    }

    return baseFeatures;
  };

  const getProductBadge = (productId: string) => {
    if (productId === IAP_PRODUCTS.STYLIST_PRO_YEARLY) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
          Best Value
        </span>
      );
    }
    return null;
  };

  if (loading && products.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Choose Your Plan</h2>
          <p className="text-muted-foreground mt-1">
            Subscribe via Apple In-App Purchase
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRestore}
          disabled={loading}
        >
          <Apple className="h-4 w-4 mr-2" />
          Restore Purchases
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {products.map(product => (
          <Card key={product.id} className={subscribed ? 'border-primary' : ''}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {product.title}
                    {getProductBadge(product.id)}
                  </CardTitle>
                  <CardDescription className="mt-2">
                    {product.description}
                  </CardDescription>
                </div>
              </div>
              <div className="mt-4">
                <span className="text-3xl font-bold">{product.price}</span>
                <span className="text-muted-foreground ml-2">
                  / {product.id.includes('yearly') ? 'year' : 'month'}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <ul className="space-y-2">
                  {getProductFeatures(product.id).map(feature => (
                    <li
                      key={feature}
                      className="flex items-center gap-2 text-sm"
                    >
                      <Check className="h-4 w-4 text-primary flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className="w-full"
                  onClick={() => handlePurchase(product.id)}
                  disabled={purchasing !== null || subscribed}
                >
                  {purchasing === product.id && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {subscribed ? 'Current Plan' : 'Subscribe Now'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Apple className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="space-y-1 text-sm">
              <p className="font-medium">Managed by Apple</p>
              <p className="text-muted-foreground">
                Your subscription will be charged to your Apple ID account.
                Manage or cancel anytime in your App Store subscriptions.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
