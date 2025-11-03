import { Capacitor } from '@capacitor/core';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

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
  private purchaseCallbacks: Map<
    string,
    (success: boolean, data?: any) => void
  > = new Map();

  async initialize(): Promise<void> {
    if (!this.isIOS()) {
      logger.info('Not iOS platform, skipping initialization', 'IAP');
      return;
    }

    if (this.isInitialized) {
      logger.info('Already initialized', 'IAP');
      return;
    }

    try {
      // Dynamically import the store
      const CdvPurchase = (window as any).CdvPurchase;
      if (!CdvPurchase) {
        throw new Error('CdvPurchase not available');
      }

      this.store = CdvPurchase.store;

      logger.info('Registering products...', 'IAP');

      // Register products
      this.store.register([
        {
          id: IAP_PRODUCTS.STYLIST_PRO_MONTHLY,
          type: CdvPurchase.ProductType.PAID_SUBSCRIPTION,
        },
        {
          id: IAP_PRODUCTS.STYLIST_PRO_YEARLY,
          type: CdvPurchase.ProductType.PAID_SUBSCRIPTION,
        },
      ]);

      this.setupEventHandlers();

      await this.store.initialize();
      this.isInitialized = true;

      logger.info('Initialization complete', 'IAP');
    } catch (error) {
      console.error('[IAP] Initialization failed:', error);
      throw error;
    }
  }

  private setupEventHandlers(): void {
    if (!this.store) return;

    // Handle approved purchases
    this.store
      .when()
      .approved((transaction: any) => {
        logger.info('Purchase approved', 'IAP', {
          transactionId: transaction.id,
        });
        transaction.verify();
      })
      .verified((receipt: any) => {
        logger.info('Receipt verified', 'IAP', { receiptId: receipt.id });
        this.handleVerifiedPurchase(receipt);
        receipt.finish();
      })
      .finished((purchase: any) => {
        logger.info('Purchase finished', 'IAP', { purchaseId: purchase.id });
        const callback = this.purchaseCallbacks.get(purchase.id);
        if (callback) {
          callback(true, purchase);
          this.purchaseCallbacks.delete(purchase.id);
        }
      })
      .error((error: any) => {
        logger.error('Purchase error', 'IAP', error);
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
      logger.info('Sending receipt to backend for verification...', 'IAP');

      const { data, error } = await supabase.functions.invoke(
        'verify-apple-receipt',
        {
          body: {
            receipt: receipt.receipt,
            productId: receipt.id,
            transactionId: receipt.transaction?.id,
          },
        }
      );

      if (error) {
        logger.error('Backend verification failed', 'IAP', error);
        return;
      }

      logger.info('Backend verification successful', 'IAP', data);
    } catch (error) {
      logger.error('Error handling verified purchase', 'IAP', error as Error);
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

  async purchaseProduct(
    productId: string
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.isIOS()) {
      return { success: false, error: 'Not available on this platform' };
    }

    await this.ensureInitialized();

    return new Promise(resolve => {
      this.purchaseCallbacks.set(productId, (success, data) => {
        if (success) {
          resolve({ success: true });
        } else {
          resolve({
            success: false,
            error: data?.message || 'Purchase failed',
          });
        }
      });

      try {
        const product = this.store.get(productId);
        if (!product) {
          throw new Error('Product not found');
        }

        logger.info('Ordering product', 'IAP', { productId });
        this.store.order(product);
      } catch (error: any) {
        resolve({
          success: false,
          error: error.message || 'Failed to initiate purchase',
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
      logger.info('Restoring purchases...', 'IAP');
      await this.store.restorePurchases();
      return { success: true };
    } catch (error: any) {
      logger.error('Restore failed', 'IAP', error);
      return {
        success: false,
        error: error.message || 'Failed to restore purchases',
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

      return monthlyProduct?.owned || yearlyProduct?.owned || false;
    } catch (error) {
      logger.error('Error checking subscription', 'IAP', error as Error);
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
      logger.error('Error getting receipt', 'IAP', error as Error);
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
