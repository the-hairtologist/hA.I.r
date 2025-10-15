/**
 * Waitlist Notifications Edge Function
 * Automated notifications for waitlist updates
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WaitlistNotification {
  type: "new_waitlist" | "waitlist_available" | "waitlist_cancelled";
  waitlistId: string;
  clientName?: string;
  stylistName?: string;
  stylistEmail?: string;
  serviceType?: string;
  preferredDate?: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const resend = new Resend(Deno.env.get("RESEND_API_KEY") ?? "");

    const { type, waitlistId, clientName, stylistName, stylistEmail, serviceType, preferredDate }: WaitlistNotification = await req.json();

    console.log("Processing waitlist notification:", { type, waitlistId });

    // Get waitlist entry details if not provided
    let notificationData = {
      clientName: clientName || "",
      stylistName: stylistName || "",
      stylistEmail: stylistEmail || "",
      serviceType: serviceType || "",
      preferredDate: preferredDate || "",
    };

    if (!clientName || !stylistEmail) {
      const { data: waitlistEntry, error } = await supabase
        .from("waitlist")
        .select(`
          *,
          client:client_profiles(
            full_name,
            user:profiles(email)
          ),
          stylist:stylist_profiles(
            business_name,
            user:profiles(full_name, email)
          )
        `)
        .eq("id", waitlistId)
        .single();

      if (error) {
        console.error("Error fetching waitlist:", error);
        throw error;
      }

      notificationData = {
        clientName: waitlistEntry.client?.full_name || "Client",
        stylistName: waitlistEntry.stylist?.business_name || waitlistEntry.stylist?.user?.full_name || "Stylist",
        stylistEmail: waitlistEntry.stylist?.user?.email || "",
        serviceType: waitlistEntry.service_type || "Service",
        preferredDate: waitlistEntry.preferred_date || "",
      };
    }

    // Send appropriate notification based on type
    if (type === "new_waitlist") {
      // Notify stylist of new waitlist entry
      if (!notificationData.stylistEmail) {
        throw new Error("Stylist email is required for new waitlist notifications");
      }

      await resend.emails.send({
        from: "hA.I.r Notifications <notifications@hair-ai.app>",
        to: [notificationData.stylistEmail],
        subject: `🔔 New Waitlist Request from ${notificationData.clientName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #6366f1;">New Waitlist Request</h2>
            <p>You have a new appointment request on your waitlist!</p>
            
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Client:</strong> ${notificationData.clientName}</p>
              <p style="margin: 5px 0;"><strong>Service:</strong> ${notificationData.serviceType}</p>
              ${notificationData.preferredDate ? `<p style="margin: 5px 0;"><strong>Preferred Date:</strong> ${notificationData.preferredDate}</p>` : ""}
            </div>
            
            <p>Log in to your dashboard to review this request and contact the client.</p>
            
            <a href="https://your-app-url.com/dashboard" style="display: inline-block; background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 10px;">View Dashboard</a>
            
            <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
              This is an automated notification from hA.I.r salon management.
            </p>
          </div>
        `,
      });

      console.log("New waitlist notification sent to:", notificationData.stylistEmail);
    } else if (type === "waitlist_available") {
      // Notify client that a slot is available
      // This would be triggered manually by stylist or automatically when slot opens
      console.log("Waitlist available notification (manual trigger):", waitlistId);
    } else if (type === "waitlist_cancelled") {
      // Notify stylist of cancelled waitlist entry
      if (!notificationData.stylistEmail) {
        throw new Error("Stylist email is required for cancellation notifications");
      }

      await resend.emails.send({
        from: "hA.I.r Notifications <notifications@hair-ai.app>",
        to: [notificationData.stylistEmail],
        subject: `ℹ️ Waitlist Request Cancelled - ${notificationData.clientName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #ef4444;">Waitlist Request Cancelled</h2>
            <p>${notificationData.clientName} has cancelled their waitlist request.</p>
            
            <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
              <p style="margin: 5px 0;"><strong>Client:</strong> ${notificationData.clientName}</p>
              <p style="margin: 5px 0;"><strong>Service:</strong> ${notificationData.serviceType}</p>
            </div>
            
            <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
              This is an automated notification from hA.I.r salon management.
            </p>
          </div>
        `,
      });

      console.log("Cancellation notification sent to:", notificationData.stylistEmail);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Waitlist notification sent: ${type}`,
        data: notificationData 
      }),
      {
        status: 200,
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders 
        },
      }
    );
  } catch (error: any) {
    console.error("Error in waitlist-notifications:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders 
        },
      }
    );
  }
});
