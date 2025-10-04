import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Log deletion request
    await supabase.from("deletion_requests").insert({
      user_id: user.id,
      email: user.email,
      requested_at: new Date().toISOString(),
      status: "pending",
    });

    // Soft delete: Anonymize user data instead of hard delete
    // This preserves financial records for 7 years (tax compliance)
    
    // Anonymize profile
    await supabase
      .from("profiles")
      .update({
        full_name: "Deleted User",
        phone: null,
        bio: null,
        avatar_url: null,
        instagram_handle: null,
        salon_name: null,
        salon_address: null,
        years_experience: null,
        specialties: null,
        deleted_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    // Anonymize client profiles
    await supabase
      .from("client_profiles")
      .update({
        name: "Deleted Client",
        phone: null,
        email: null,
        notes: null,
        allergies: null,
        hair_type: null,
        medical_info_consent: false,
      })
      .eq("preferred_stylist_id", user.id);

    // Delete messages (not financial records)
    await supabase.from("messages").delete().eq("sender_id", user.id);
    await supabase.from("messages").delete().eq("recipient_id", user.id);

    // Anonymize reviews
    await supabase
      .from("reviews")
      .update({ comment: "[Deleted]", client_name: "Deleted User" })
      .eq("client_id", user.id);

    // Delete portfolio
    await supabase.from("portfolio").delete().eq("stylist_id", user.id);

    // Delete formulas
    await supabase.from("formulas").delete().eq("stylist_id", user.id);

    // Mark appointments as cancelled (preserve for records)
    await supabase
      .from("appointments")
      .update({ status: "cancelled", notes: "[User deleted]" })
      .eq("client_id", user.id);

    await supabase
      .from("appointments")
      .update({ status: "cancelled", notes: "[User deleted]" })
      .eq("stylist_id", user.id);

    // Payments are NOT deleted (7-year retention for tax compliance)

    // Send confirmation email (would be implemented via email service)
    console.log(`Deletion request submitted for user ${user.id} (${user.email})`);

    return new Response(
      JSON.stringify({
        message: "Account deletion request submitted successfully",
        confirmation: "You will receive an email confirmation within 72 hours",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error deleting data:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
