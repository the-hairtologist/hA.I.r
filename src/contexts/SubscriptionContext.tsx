import { createContext, useCallback, useContext, useEffect, useRef, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
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

interface UserRoleRow {
  role: string;
}

interface CheckSubscriptionResponse {
  subscribed?: boolean;
  in_trial?: boolean;
  product_id?: string | null;
  subscription_end?: string | null;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

const STYLIST_PRODUCT_ID = "prod_TAdxnWWlueCL0Y";

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
  "messages",
] as const;

type PremiumFeature = (typeof PREMIUM_FEATURES)[number];

type FeatureName = PremiumFeature | string;

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
  const isCheckingRef = useRef(false);

  useEffect(() => {
    if (isAppleIAP) {
      appleIAP.initialize().catch((error) => {
        import("@/lib/logging/productionLogger").then(({ logger }) => {
          logger.error("[Subscription] Failed to initialize Apple IAP", error);
        });
      });
    }
  }, [isAppleIAP]);

  const checkSubscription = useCallback(async () => {
    if (isCheckingRef.current) {
      return;
    }
    isCheckingRef.current = true;
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setSubscribed(false);
        setInTrial(false);
        setIsAdmin(false);
        setUserRole(null);
        setHasAccessCode(false);
        setProductId(null);
        setSubscriptionEnd(null);
        return;
      }

      const { data: rolesData = [] } = await supabase
        .from<UserRoleRow>("user_roles")
        .select("role")
        .eq("user_id", session.user.id);

      const isStylist = rolesData.some(roleRow => roleRow.role === "stylist");
      const adminCheck = rolesData.some(roleRow => roleRow.role === "admin");

      setUserRole(isStylist ? "stylist" : "client");
      setIsAdmin(adminCheck);

      if (adminCheck) {
        setSubscribed(true);
        setInTrial(false);
        return;
      }

      const { data: accessCodeData } = await supabase
        .from("access_codes")
        .select("id")
        .eq("used_by", session.user.id)
        .eq("is_active", true)
        .maybeSingle();

      const hasValidAccessCode = Boolean(accessCodeData);
      setHasAccessCode(hasValidAccessCode);

      if (hasValidAccessCode) {
        setSubscribed(true);
        setInTrial(false);
        return;
      }

      if (!isStylist) {
        setSubscribed(true);
        setInTrial(false);
        return;
      }

      if (isAppleIAP) {
        logger.debug("[Subscription] Checking Apple IAP subscription");
        const hasActiveIAP = await appleIAP.checkActiveSubscription();

        if (hasActiveIAP) {
          await appleIAP.restorePurchases();
        }
      }

      const { data, error } = await supabase.functions.invoke<CheckSubscriptionResponse>("check-subscription", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      const subscriptionData = data ?? {};
      const isSubscribed = Boolean(subscriptionData.subscribed);
      const isInTrial = Boolean(subscriptionData.in_trial);

      setSubscribed(isSubscribed);
      setInTrial(isInTrial);
      setProductId(subscriptionData.product_id ?? null);
      setSubscriptionEnd(subscriptionData.subscription_end ?? null);

      if (isSubscribed || isInTrial) {
        localStorage.removeItem("subscription_prompt_dismissed");
      }
    } catch (error) {
      import("@/lib/logging/productionLogger").then(({ logger }) => {
        logger.error("Error checking subscription", error);
      });
      setSubscribed(false);
      setInTrial(false);
      setHasAccessCode(false);
    } finally {
      isCheckingRef.current = false;
      setLoading(false);
    }
  }, [isAppleIAP]);

  const isFeatureAllowed = useCallback((feature: FeatureName): boolean => {
    if (isAdmin) return true;
    if (hasAccessCode) return true;
    if (userRole === "client") return true;

    if (userRole === "stylist") {
      if ((PREMIUM_FEATURES as readonly string[]).includes(feature)) {
        return subscribed || inTrial;
      }
      return true;
    }

    return false;
  }, [hasAccessCode, inTrial, isAdmin, subscribed, userRole]);

  useEffect(() => {
    void checkSubscription();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        void checkSubscription();
      } else {
        setSubscribed(false);
        setUserRole(null);
        setInTrial(false);
        setHasAccessCode(false);
        setProductId(null);
        setSubscriptionEnd(null);
        setIsAdmin(false);
        setLoading(false);
      }
    });

    const interval = setInterval(() => {
      void checkSubscription();
    }, 120000);

    return () => {
      subscription.unsubscribe();
      clearInterval(interval);
    };
  }, [checkSubscription]);

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
