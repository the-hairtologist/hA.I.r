import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AppleReceiptValidationResponse {
  status: number;
  receipt?: any;
  latest_receipt_info?: any[];
  pending_renewal_info?: any[];
  environment?: string;
}

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[VERIFY-APPLE-RECEIPT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header provided");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError) {
      throw new Error(`Authentication error: ${userError.message}`);
    }

    const user = userData.user;
    if (!user?.email) {
      throw new Error("User not authenticated or email not available");
    }

    logStep("User authenticated", { userId: user.id, email: user.email });

    const { receipt, productId, transactionId } = await req.json();
    
    if (!receipt) {
      throw new Error("Receipt data is required");
    }

    logStep("Validating receipt with Apple", { productId, transactionId });

    // Validate receipt with Apple
    // Try production first, then sandbox if it fails
    let validationResponse = await validateReceiptWithApple(receipt, false);
    
    // If status is 21007, it's a sandbox receipt in production - try sandbox
    if (validationResponse.status === 21007) {
      logStep("Sandbox receipt detected, validating with sandbox");
      validationResponse = await validateReceiptWithApple(receipt, true);
    }

    if (validationResponse.status !== 0) {
      throw new Error(`Apple receipt validation failed with status: ${validationResponse.status}`);
    }

    logStep("Receipt validated successfully", { 
      environment: validationResponse.environment 
    });

    // Extract subscription info
    const latestReceipt = validationResponse.latest_receipt_info?.[0];
    if (!latestReceipt) {
      throw new Error("No subscription info in receipt");
    }

    const expiresDate = new Date(parseInt(latestReceipt.expires_date_ms));
    const isActive = expiresDate > new Date();

    logStep("Subscription info extracted", {
      productId: latestReceipt.product_id,
      expiresDate: expiresDate.toISOString(),
      isActive
    });

    // Map Apple product ID to Stripe product ID for consistency
    const productMapping: Record<string, string> = {
      'hair_pro_monthly_subscription': 'prod_TAdxnWWlueCL0Y',
      'hair_pro_yearly_subscription': 'prod_TAdxnWWlueCL0Y',
    };

    const stripeProductId = productMapping[latestReceipt.product_id];

    // Store subscription info in profiles table
    const { error: updateError } = await supabaseClient
      .from('profiles')
      .update({
        subscription_status: isActive ? 'active' : 'expired',
        subscription_product_id: stripeProductId,
        subscription_end: expiresDate.toISOString(),
        apple_receipt: receipt,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (updateError) {
      logStep("Error updating profile", { error: updateError });
      throw new Error(`Failed to update subscription: ${updateError.message}`);
    }

    logStep("Subscription updated successfully");

    // Log the transaction for audit purposes
    const { error: logError } = await supabaseClient
      .from('audit_logs')
      .insert({
        user_id: user.id,
        action: 'IAP_PURCHASE',
        table_name: 'subscriptions',
        record_id: user.id,
        new_data: {
          product_id: latestReceipt.product_id,
          transaction_id: latestReceipt.transaction_id,
          expires_date: expiresDate.toISOString(),
          environment: validationResponse.environment,
        },
      });

    if (logError) {
      logStep("Warning: Failed to log transaction", { error: logError });
    }

    return new Response(
      JSON.stringify({
        success: true,
        subscribed: isActive,
        product_id: stripeProductId,
        subscription_end: expiresDate.toISOString(),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

async function validateReceiptWithApple(
  receipt: string,
  sandbox: boolean
): Promise<AppleReceiptValidationResponse> {
  const endpoint = sandbox
    ? "https://sandbox.itunes.apple.com/verifyReceipt"
    : "https://buy.itunes.apple.com/verifyReceipt";

  // Note: In production, you should use a shared secret for auto-renewable subscriptions
  // Set this in Supabase secrets as APPLE_SHARED_SECRET
  const sharedSecret = Deno.env.get("APPLE_SHARED_SECRET");

  const requestBody: any = {
    "receipt-data": receipt,
    "exclude-old-transactions": true,
  };

  if (sharedSecret) {
    requestBody.password = sharedSecret;
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    throw new Error(`Apple API request failed: ${response.statusText}`);
  }

  return await response.json();
}
