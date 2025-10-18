import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { appleIAP, shouldUseAppleIAP, getPaymentMethod } from "@/lib/iap/appleIAP";
import { logger } from "@/lib/logger";

interface SubscriptionContextType {
  subscribed: boolean;
  inTrial: boolean;
  loading: boolean;
  productId: string | null;
  subscriptionEnd: string | null;
  hasAccessCode: boolean;
  checkSubscription: () => Promise<void>;
  isFeatureAllowed: (feature: string) => boolean;
  paymentMethod: 'apple-iap' | 'stripe';
  isAppleIAP: boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

const STYLIST_PRODUCT_ID = "prod_TAdxnWWlueCL0Y";

// Features that require subscription for stylists
const PREMIUM_FEATURES = [
  "clients",
  "appointments",
  "formulas", 
  "ai-assistant",
  "payments",
  "commissions",
  "services",
  "schedule",
  "portfolio",
  "messages"
];

export const SubscriptionProvider = ({ children }: { children: ReactNode }) => {
  const [subscribed, setSubscribed] = useState(false);
  const [inTrial, setInTrial] = useState(false);
  const [loading, setLoading] = useState(true);
  const [productId, setProductId] = useState<string | null>(null);
  const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [hasAccessCode, setHasAccessCode] = useState(false);
  const [paymentMethod] = useState<'apple-iap' | 'stripe'>(getPaymentMethod());
  const [isAppleIAP] = useState(shouldUseAppleIAP());

  // Initialize Apple IAP if on iOS
  useEffect(() => {
    if (isAppleIAP) {
      appleIAP.initialize().catch((error) => {
        console.error('[Subscription] Failed to initialize Apple IAP:', error);
      });
    }
  }, [isAppleIAP]);

  const checkSubscription = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setSubscribed(false);
        setInTrial(false);
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      // Check user role
      const { data: rolesData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id);

      const isStylist = rolesData?.some(r => r.role === "stylist");
      const adminCheck = rolesData?.some(r => r.role === "admin") || false;
      
      setUserRole(isStylist ? "stylist" : "client");
      setIsAdmin(adminCheck);

      // Admins get full access without subscription checks
      if (adminCheck) {
        setSubscribed(true);
        setInTrial(false);
        setLoading(false);
        return;
      }

      // Check if user has a valid access code
      const { data: accessCodeData } = await supabase
        .from("access_codes")
        .select("id")
        .eq("used_by", session.user.id)
        .eq("is_active", true)
        .maybeSingle();
      
      const hasValidAccessCode = !!accessCodeData;
      setHasAccessCode(hasValidAccessCode);

      // Users with access codes get full access
      if (hasValidAccessCode) {
        setSubscribed(true);
        setInTrial(false);
        setLoading(false);
        return;
      }

      // Clients don't need subscriptions
      if (!isStylist) {
        setSubscribed(true);
        setLoading(false);
        return;
      }

      // On iOS, check both Apple IAP and backend
      if (isAppleIAP) {
        logger.debug('[Subscription] Checking Apple IAP subscription');
        const hasActiveIAP = await appleIAP.checkActiveSubscription();
        
        if (hasActiveIAP) {
          // Restore purchases to sync with backend
          await appleIAP.restorePurchases();
        }
      }

      // Check subscription status for stylists (works for both Stripe and Apple IAP)
      const { data, error } = await supabase.functions.invoke("check-subscription", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Subscription check failed:', error);
        // Set safe defaults instead of crashing
        setSubscribed(false);
        setInTrial(false);
        return;
      }

      const isSubscribed = data.subscribed || false;
      const isInTrial = data.in_trial || false;
      
      setSubscribed(isSubscribed);
      setInTrial(isInTrial);
      setProductId(data.product_id);
      setSubscriptionEnd(data.subscription_end);
      
      // Clear subscription prompt dismissal if user becomes subscribed
      if (isSubscribed || isInTrial) {
        localStorage.removeItem('subscription_prompt_dismissed');
      }
    } catch (error) {
      console.error("Error checking subscription:", error);
      setSubscribed(false);
    } finally {
      setLoading(false);
    }
  };

  const isFeatureAllowed = (feature: string): boolean => {
    // Admins always have full access
    if (isAdmin) return true;
    
    // Users with access codes have full access
    if (hasAccessCode) return true;
    
    // Clients have access to all features
    if (userRole === "client") return true;
    
    // Stylists need subscription for premium features
    if (userRole === "stylist") {
      if (PREMIUM_FEATURES.includes(feature)) {
        return subscribed || inTrial;
      }
      return true;
    }
    
    return false;
  };

  useEffect(() => {
    checkSubscription();

    // Check subscription on auth state change (deferred to allow auth to settle)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setTimeout(() => {
          checkSubscription();
        }, 2000);
      } else {
        setSubscribed(false);
        setUserRole(null);
        setLoading(false);
      }
    });

    // Refresh subscription status periodically (every 2 minutes)
    const interval = setInterval(checkSubscription, 120000);

    return () => {
      subscription.unsubscribe();
      clearInterval(interval);
    };
  }, []);

  return (
    <SubscriptionContext.Provider
      value={{
        subscribed,
        inTrial,
        loading,
        productId,
        subscriptionEnd,
        hasAccessCode,
        checkSubscription,
        isFeatureAllowed,
        paymentMethod,
        isAppleIAP,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error("useSubscription must be used within a SubscriptionProvider");
  }
  return context;
};
