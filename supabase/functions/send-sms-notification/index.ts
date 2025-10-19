import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { checkRateLimit, rateLimitErrorResponse, getRateLimitHeaders, RATE_LIMITS } from '../_shared/rateLimiter.ts';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SMSRequest {
  appointmentId: string;
  notificationType: "confirmation" | "reminder" | "cancellation" | "reschedule";
  customMessage?: string;
}

const formatPhoneNumber = (phone: string): string => {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  
  // If it doesn't start with country code, add +1 (US)
  if (cleaned.length === 10) {
    return `+1${cleaned}`;
  } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+${cleaned}`;
  }
  
  // Assume it already has country code
  return `+${cleaned}`;
};

const sendTwilioSMS = async (to: string, message: string) => {
  const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
  const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
  const twilioPhone = Deno.env.get("TWILIO_PHONE_NUMBER") || "+15005550006"; // Default to Twilio test number

  if (!accountSid || !authToken) {
    throw new Error("Twilio credentials not configured");
  }

  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  
  const formData = new URLSearchParams();
  formData.append("To", formatPhoneNumber(to));
  formData.append("From", twilioPhone);
  formData.append("Body", message);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${btoa(`${accountSid}:${authToken}`)}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData.toString(),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("Twilio API error:", error);
    throw new Error(`Twilio API error: ${response.status}`);
  }

  return await response.json();
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limiting
    const identifier = req.headers.get('authorization') || req.headers.get('x-forwarded-for') || 'anonymous';
    const { allowed, remaining, resetAt } = checkRateLimit(identifier, RATE_LIMITS.SMS_NOTIFICATION);
    
    if (!allowed) {
      console.warn(`Rate limit exceeded for SMS: ${identifier}`);
      return rateLimitErrorResponse(resetAt);
    }

    const { appointmentId, notificationType, customMessage }: SMSRequest = await req.json();
    
    console.log(`📱 Sending ${notificationType} SMS for appointment ${appointmentId}`);

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Fetch appointment details with client and stylist info
    const { data: appointment, error } = await supabaseClient
      .from("appointments")
      .select(`
        *,
        client:client_profiles(
          full_name,
          phone,
          user:profiles(full_name)
        ),
        stylist:stylist_profiles(
          business_name,
          user:profiles(full_name, phone)
        )
      `)
      .eq("id", appointmentId)
      .single();

    if (error) throw error;
    if (!appointment) throw new Error("Appointment not found");

    const clientPhone = appointment.client?.phone;
    const clientName = appointment.client?.full_name || appointment.client?.user?.full_name || "Client";
    const stylistName = appointment.stylist?.user?.full_name || appointment.stylist?.business_name || "Your Stylist";
    
    if (!clientPhone) {
      console.log("⚠️ No phone number for client, skipping SMS");
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Client has no phone number" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const appointmentDate = new Date(appointment.appointment_date);
    const formattedDate = appointmentDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const formattedTime = appointmentDate.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });

    let message = "";
    
    // Use custom message if provided, otherwise generate default messages
    if (customMessage && notificationType === "reschedule") {
      message = `Hi ${clientName}, ${stylistName} here. ${customMessage}`;
    } else {
      switch (notificationType) {
        case "confirmation":
          message = `Hi ${clientName}! 🎉 Your appointment with ${stylistName} is confirmed for ${formattedDate} at ${formattedTime}. Service: ${appointment.service_type}. See you soon!`;
          break;
          
        case "reminder":
          message = `Reminder! 📅 You have an appointment tomorrow (${formattedDate}) at ${formattedTime} with ${stylistName} for ${appointment.service_type}. Looking forward to seeing you!`;
          break;
          
        case "cancellation":
          message = `Your appointment with ${stylistName} on ${formattedDate} at ${formattedTime} has been cancelled. ${appointment.cancellation_reason ? `Reason: ${appointment.cancellation_reason}.` : ""} Please contact us to reschedule.`;
          break;
          
        case "reschedule":
          message = `Your appointment with ${stylistName} has been rescheduled to ${formattedDate} at ${formattedTime}. Service: ${appointment.service_type}. Reply to confirm or contact us with questions.`;
          break;
      }
    }

    const twilioResponse = await sendTwilioSMS(clientPhone, message);
    
    console.log(`✅ SMS sent successfully to ${clientPhone}`);
    console.log("Twilio response:", twilioResponse);

    const rateLimitHeaders = getRateLimitHeaders(remaining, resetAt, RATE_LIMITS.SMS_NOTIFICATION.maxRequests);

    return new Response(
      JSON.stringify({ 
        success: true, 
        messageSid: twilioResponse.sid,
        to: clientPhone 
      }),
      {
        headers: { ...corsHeaders, ...rateLimitHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("❌ Error sending SMS:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
