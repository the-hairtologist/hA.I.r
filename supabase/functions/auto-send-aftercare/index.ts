import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { appointment_id } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get appointment details
    const { data: appointment, error: aptError } = await supabase
      .from("appointments")
      .select(`
        id,
        service_type,
        client_id,
        stylist_id,
        client_profiles!client_id(full_name, email),
        stylist_profiles!stylist_id(full_name)
      `)
      .eq("id", appointment_id)
      .single();

    if (aptError || !appointment) {
      throw new Error("Appointment not found");
    }

    const clientProfile = Array.isArray(appointment.client_profiles) 
      ? appointment.client_profiles[0] 
      : appointment.client_profiles;
    
    const stylistProfile = Array.isArray(appointment.stylist_profiles) 
      ? appointment.stylist_profiles[0] 
      : appointment.stylist_profiles;

    if (!clientProfile?.email) {
      throw new Error("Client email not found");
    }

    // Get matching aftercare template
    const { data: template } = await supabase
      .from("aftercare_templates")
      .select("*")
      .eq("service_type", appointment.service_type)
      .eq("is_global", true)
      .maybeSingle();

    if (!template) {
      console.log(`No aftercare template found for service type: ${appointment.service_type}`);
      return new Response(
        JSON.stringify({ success: false, message: "No template found" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate email HTML
    const emailHtml = generateAftercareEmail(
      clientProfile.full_name,
      stylistProfile?.full_name || "Your Stylist",
      template.title,
      template.content,
      template.tips as string[],
      template.products as string[]
    );

    // Check email preferences
    const { data: prefs } = await supabase
      .from("email_preferences")
      .select("*")
      .eq("email", clientProfile.email)
      .maybeSingle();

    if (prefs && !prefs.appointment_reminders_enabled) {
      console.log(`⏭️ Skipping aftercare email - user opted out: ${clientProfile.email}`);
      return new Response(
        JSON.stringify({ success: true, message: "User opted out of emails" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Send email
    const emailResult = await resend.emails.send({
      from: "hA.I.r Aftercare <onboarding@resend.dev>",
      to: [clientProfile.email],
      subject: `${template.title} - Your Care Guide`,
      html: emailHtml,
    });

    // Log to email_sequence_logs
    await supabase.from("email_sequence_logs").insert({
      client_id: appointment.client_id,
      stylist_id: appointment.stylist_id,
      enrollment_id: null,
      step_id: null,
      email_address: clientProfile.email,
      subject: `${template.title} - Your Care Guide`,
      resend_email_id: emailResult.data?.id,
    });

    console.log(`✅ Aftercare email sent for appointment ${appointment_id}`);

    return new Response(
      JSON.stringify({ success: true, message: "Aftercare email sent" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error sending aftercare:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function generateAftercareEmail(
  clientName: string,
  stylistName: string,
  title: string,
  content: string,
  tips: string[],
  products: string[]
): string {
  const tipsHtml = tips.map(tip => `<li style="margin-bottom: 10px;">${tip}</li>`).join("");
  const productsHtml = products.map(product => `<li style="margin-bottom: 8px;">✓ ${product}</li>`).join("");

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #667eea; font-size: 28px; margin: 0;">✨ ${title}</h1>
      </div>
      
      <p style="color: #333; font-size: 16px; line-height: 1.6;">Hi ${clientName},</p>
      <p style="color: #555; line-height: 1.6;">${content}</p>
      
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 25px; border-radius: 15px; margin: 30px 0;">
        <h3 style="margin: 0 0 15px 0; font-size: 20px;">💎 Essential Care Instructions</h3>
        <ul style="margin: 0; padding-left: 20px; line-height: 1.8;">
          ${tipsHtml}
        </ul>
      </div>
      
      ${products.length > 0 ? `
        <div style="background: #f9fafb; padding: 20px; border-radius: 10px; margin: 30px 0;">
          <h4 style="color: #333; margin-top: 0; display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 20px;">🛍️</span> Recommended Products
          </h4>
          <ul style="color: #555; margin: 0; padding-left: 20px; line-height: 1.8;">
            ${productsHtml}
          </ul>
        </div>
      ` : ''}
      
      <div style="border-left: 4px solid #667eea; padding-left: 20px; margin: 30px 0; background: #f0f4ff; padding: 15px; border-radius-right: 8px;">
        <p style="color: #666; font-style: italic; margin: 0; font-size: 14px;">
          💡 <strong>Pro Tip:</strong> Following these aftercare instructions will help you maintain your beautiful results and keep your hair healthy between visits!
        </p>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <p style="color: #666; margin-bottom: 15px;">Questions about your care routine?</p>
        <a href="mailto:reply@hair.com" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">Contact ${stylistName}</a>
      </div>
      
      <p style="color: #999; font-size: 13px; text-align: center; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
        With care,<br>
        <strong>${stylistName}</strong><br>
        hA.I.r Team
      </p>
    </div>
  `;
}
