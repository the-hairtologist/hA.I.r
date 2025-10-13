import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { compressedJsonResponse, compressedErrorResponse, corsHeaders } from '../_shared/compression.ts';

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
      return await compressedErrorResponse("Unauthorized", 401);
    }

    // Collect all user data
    const exportData: any = {
      export_date: new Date().toISOString(),
      user_id: user.id,
      email: user.email,
      data: {},
    };

    // Profile data
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    exportData.data.profile = profile;

    // Appointments (as client)
    const { data: clientAppointments } = await supabase
      .from("appointments")
      .select("*")
      .eq("client_id", user.id);
    exportData.data.appointments_as_client = clientAppointments;

    // Appointments (as stylist)
    const { data: stylistAppointments } = await supabase
      .from("appointments")
      .select("*")
      .eq("stylist_id", user.id);
    exportData.data.appointments_as_stylist = stylistAppointments;

    // Formulas
    const { data: formulas } = await supabase
      .from("formulas")
      .select("*")
      .eq("stylist_id", user.id);
    exportData.data.formulas = formulas;

    // Client profiles created by user
    const { data: clients } = await supabase
      .from("client_profiles")
      .select("*")
      .eq("preferred_stylist_id", user.id);
    exportData.data.clients = clients;

    // Messages sent
    const { data: messagesSent } = await supabase
      .from("messages")
      .select("*")
      .eq("sender_id", user.id);
    exportData.data.messages_sent = messagesSent;

    // Messages received
    const { data: messagesReceived } = await supabase
      .from("messages")
      .select("*")
      .eq("recipient_id", user.id);
    exportData.data.messages_received = messagesReceived;

    // Reviews written
    const { data: reviewsWritten } = await supabase
      .from("reviews")
      .select("*")
      .eq("client_id", user.id);
    exportData.data.reviews_written = reviewsWritten;

    // Reviews received
    const { data: reviewsReceived } = await supabase
      .from("reviews")
      .select("*")
      .eq("stylist_id", user.id);
    exportData.data.reviews_received = reviewsReceived;

    // Services
    const { data: services } = await supabase
      .from("services")
      .select("*")
      .eq("stylist_id", user.id);
    exportData.data.services = services;

    // Portfolio
    const { data: portfolio } = await supabase
      .from("portfolio")
      .select("*")
      .eq("stylist_id", user.id);
    exportData.data.portfolio = portfolio;

    // Payments
    const { data: payments } = await supabase
      .from("payments")
      .select("*")
      .eq("client_id", user.id);
    exportData.data.payments = payments;

    // User roles
    const { data: roles } = await supabase
      .from("user_roles")
      .select("*")
      .eq("user_id", user.id);
    exportData.data.roles = roles;

    return await compressedJsonResponse(exportData, 200);
  } catch (error) {
    console.error("Error exporting data:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return await compressedErrorResponse(errorMessage, 500);
  }
});
