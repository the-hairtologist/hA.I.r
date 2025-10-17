import { Capacitor } from '@capacitor/core';
import { supabase } from '@/integrations/supabase/client';

// Apple IAP Product IDs (must match App Store Connect)
export const IAP_PRODUCTS = {
  STYLIST_PRO_MONTHLY: 'hair_pro_monthly_subscription',
  STYLIST_PRO_YEARLY: 'hair_pro_yearly_subscription',
} as const;

// Map IAP products to Stripe products for backend sync
export const IAP_TO_STRIPE_MAPPING = {
  [IAP_PRODUCTS.STYLIST_PRO_MONTHLY]: 'prod_TAdxnWWlueCL0Y',
  [IAP_PRODUCTS.STYLIST_PRO_YEARLY]: 'prod_TAdxnWWlueCL0Y', // Same product, different billing
} as const;

interface IAPProduct {
  id: string;
  title: string;
  description: string;
  price: string;
  currency: string;
}

interface IAPPurchase {
  productId: string;
  transactionId: string;
  receipt: string;
  purchaseDate: Date;
}

class AppleIAPManager {
  private store: any = null;
  private isInitialized = false;
  private purchaseCallbacks: Map<string, (success: boolean, data?: any) => void> = new Map();

  async initialize(): Promise<void> {
    if (!this.isIOS()) {
      logger.info('[IAP] Not iOS platform, skipping initialization');
...
      logger.info('[IAP] Already initialized');
      return;
    }

    try {
      // Dynamically import the store
      const CdvPurchase = (window as any).CdvPurchase;
      if (!CdvPurchase) {
        throw new Error('CdvPurchase not available');
      }

      this.store = CdvPurchase.store;
      
      logger.info('[IAP] Registering products...');
...
      logger.info('[IAP] Initialization complete');
    } catch (error) {
      console.error('[IAP] Initialization failed:', error);
      throw error;
    }
  }

  private setupEventHandlers(): void {
    if (!this.store) return;

    // Handle approved purchases
    this.store.when()
      .approved((transaction: any) => {
        console.log('[IAP] Purchase approved:', transaction.id);
        transaction.verify();
      })
      .verified((receipt: any) => {
        console.log('[IAP] Receipt verified:', receipt.id);
        this.handleVerifiedPurchase(receipt);
        receipt.finish();
      })
      .finished((purchase: any) => {
        console.log('[IAP] Purchase finished:', purchase.id);
        const callback = this.purchaseCallbacks.get(purchase.id);
        if (callback) {
          callback(true, purchase);
          this.purchaseCallbacks.delete(purchase.id);
        }
      })
      .error((error: any) => {
        console.error('[IAP] Purchase error:', error);
        const productId = error.product?.id;
        if (productId) {
          const callback = this.purchaseCallbacks.get(productId);
          if (callback) {
            callback(false, error);
            this.purchaseCallbacks.delete(productId);
          }
        }
      });
  }

  private async handleVerifiedPurchase(receipt: any): Promise<void> {
    try {
      console.log('[IAP] Sending receipt to backend for verification...');
      
      const { data, error } = await supabase.functions.invoke('verify-apple-receipt', {
        body: {
          receipt: receipt.receipt,
          productId: receipt.id,
          transactionId: receipt.transaction?.id,
        },
      });

      if (error) {
        console.error('[IAP] Backend verification failed:', error);
        return;
      }

      console.log('[IAP] Backend verification successful:', data);
    } catch (error) {
      console.error('[IAP] Error handling verified purchase:', error);
    }
  }

  async getProducts(): Promise<IAPProduct[]> {
    if (!this.isIOS()) {
      return [];
    }

    await this.ensureInitialized();

    const products = [
      this.store.get(IAP_PRODUCTS.STYLIST_PRO_MONTHLY),
      this.store.get(IAP_PRODUCTS.STYLIST_PRO_YEARLY),
    ].filter(Boolean);

    return products.map((product: any) => ({
      id: product.id,
      title: product.title,
      description: product.description,
      price: product.price,
      currency: product.currency,
    }));
  }

  async purchaseProduct(productId: string): Promise<{ success: boolean; error?: string }> {
    if (!this.isIOS()) {
      return { success: false, error: 'Not available on this platform' };
    }

    await this.ensureInitialized();

    return new Promise((resolve) => {
      this.purchaseCallbacks.set(productId, (success, data) => {
        if (success) {
          resolve({ success: true });
        } else {
          resolve({ 
            success: false, 
            error: data?.message || 'Purchase failed' 
          });
        }
      });

      try {
        const product = this.store.get(productId);
        if (!product) {
          throw new Error('Product not found');
        }

        console.log('[IAP] Ordering product:', productId);
        this.store.order(product);
      } catch (error: any) {
        resolve({ 
          success: false, 
          error: error.message || 'Failed to initiate purchase' 
        });
      }
    });
  }

  async restorePurchases(): Promise<{ success: boolean; error?: string }> {
    if (!this.isIOS()) {
      return { success: false, error: 'Not available on this platform' };
    }

    await this.ensureInitialized();

    try {
      console.log('[IAP] Restoring purchases...');
      await this.store.restorePurchases();
      return { success: true };
    } catch (error: any) {
      console.error('[IAP] Restore failed:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to restore purchases' 
      };
    }
  }

  async checkActiveSubscription(): Promise<boolean> {
    if (!this.isIOS()) {
      return false;
    }

    await this.ensureInitialized();

    try {
      const monthlyProduct = this.store.get(IAP_PRODUCTS.STYLIST_PRO_MONTHLY);
      const yearlyProduct = this.store.get(IAP_PRODUCTS.STYLIST_PRO_YEARLY);

      return (monthlyProduct?.owned || yearlyProduct?.owned) || false;
    } catch (error) {
      console.error('[IAP] Error checking subscription:', error);
      return false;
    }
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }
  }

  private isIOS(): boolean {
    return Capacitor.getPlatform() === 'ios';
  }

  async getReceipt(): Promise<string | null> {
    if (!this.isIOS() || !this.store) {
      return null;
    }

    try {
      // Get the latest receipt
      const receipt = this.store.applicationReceipt;
      return receipt || null;
    } catch (error) {
      console.error('[IAP] Error getting receipt:', error);
      return null;
    }
  }
}

// Singleton instance
export const appleIAP = new AppleIAPManager();

// Platform detection helper
export const shouldUseAppleIAP = (): boolean => {
  return Capacitor.getPlatform() === 'ios' && Capacitor.isNativePlatform();
};

// Helper to determine payment method
export const getPaymentMethod = (): 'apple-iap' | 'stripe' => {
  return shouldUseAppleIAP() ? 'apple-iap' : 'stripe';
};
