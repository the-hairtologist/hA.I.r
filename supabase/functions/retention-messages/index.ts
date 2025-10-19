import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || 'hA.I.r <onboarding@resend.dev>';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Automated Client Retention Messages
 * Runs weekly to send personalized messages to at-risk clients
 */

interface ClientRiskScore {
  clientId: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  score: number;
  reasons: string[];
  daysSinceLastVisit: number;
  totalVisits: number;
  avgGap: number;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("🤖 Starting automated retention messages service");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    let totalSent = 0;
    let totalSkipped = 0;

    // Get all stylists
    const { data: stylists } = await supabase
      .from("stylist_profiles")
      .select("id, business_name, user_id");

    if (!stylists || stylists.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: "No stylists found", totalSent: 0 }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Process each stylist
    for (const stylist of stylists) {
      try {
        // Get all appointments for this stylist
        const { data: appointments } = await supabase
          .from("appointments")
          .select("client_id, appointment_date, status")
          .eq("stylist_id", stylist.id)
          .order("appointment_date", { ascending: false });

        if (!appointments || appointments.length === 0) continue;

        // Calculate risk scores
        const clientScores = calculateClientRiskScores(appointments);
        
        // Filter for high-risk clients (only send to critical/high risk)
        const atRiskClients = clientScores.filter(
          c => c.riskLevel === 'critical' || c.riskLevel === 'high'
        ).slice(0, 5); // Limit to 5 per stylist per week

        console.log(`📊 Stylist ${stylist.business_name}: ${atRiskClients.length} at-risk clients`);

        // Send retention messages
        for (const client of atRiskClients) {
          try {
            // Get client profile
            const { data: profile } = await supabase
              .from("client_profiles")
              .select(`
                id,
                full_name,
                email,
                phone,
                user_id,
                communication_preference
              `)
              .eq("id", client.clientId)
              .maybeSingle();

            if (!profile || !profile.email) {
              console.log(`⚠️ No profile/email for client ${client.clientId}`);
              continue;
            }

            // Check email preferences
            const { data: emailPrefs } = await supabase
              .from("email_preferences")
              .select("rebooking_reminders_enabled")
              .eq("email", profile.email)
              .maybeSingle();

            if (emailPrefs && emailPrefs.rebooking_reminders_enabled === false) {
              console.log(`⏭️ Skipping - user opted out: ${profile.email}`);
              totalSkipped++;
              continue;
            }

            // Generate personalized message
            const message = generateRetentionMessage(client, profile, stylist);
            
            // Send email
            const emailHtml = `
              <!DOCTYPE html>
              <html>
                <head>
                  <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #9333ea, #ec4899); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
                    .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 12px 12px; }
                    .button { display: inline-block; background: linear-gradient(135deg, #9333ea, #ec4899); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: 600; }
                    .highlight { background: #fff; padding: 15px; border-left: 4px solid #9333ea; margin: 20px 0; border-radius: 4px; }
                  </style>
                </head>
                <body>
                  <div class="container">
                    <div class="header">
                      <h1>✨ We Miss You!</h1>
                    </div>
                    <div class="content">
                      <p>${message}</p>
                      
                      <div class="highlight">
                        <p style="margin: 0;"><strong>🎁 Special Offer Just for You!</strong></p>
                        <p style="margin: 5px 0 0 0;">Book within the next 7 days and receive 15% off your next service!</p>
                      </div>

                      <div style="text-align: center; margin: 30px 0;">
                        <a href="https://your-app.com/book/${stylist.id}" class="button">
                          Book Your Appointment
                        </a>
                      </div>

                      <p style="font-size: 14px; color: #6c757d; margin-top: 30px;">
                        Questions? Reply to this email or give us a call!
                      </p>
                    </div>
                  </div>
                </body>
              </html>
            `;

            await resend.emails.send({
              from: FROM_EMAIL,
              to: [profile.email],
              subject: client.riskLevel === 'critical' 
                ? `${profile.full_name}, we miss you! 💜`
                : `Time for your next appointment? 💇‍♀️`,
              html: emailHtml,
            });

            totalSent++;
            console.log(`✅ Sent retention message to ${profile.email}`);
          } catch (clientError) {
            console.error(`❌ Error processing client ${client.clientId}:`, clientError);
          }
        }
      } catch (stylistError) {
        console.error(`❌ Error processing stylist ${stylist.id}:`, stylistError);
      }
    }

    console.log(`📧 Retention messages complete: ${totalSent} sent, ${totalSkipped} skipped`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        totalSent,
        totalSkipped,
        processedStylists: stylists.length
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("❌ Error in retention-messages:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

/**
 * Calculate risk scores for all clients based on appointment history
 */
function calculateClientRiskScores(appointments: any[]): ClientRiskScore[] {
  const clientMap = new Map<string, any[]>();
  
  // Group appointments by client
  appointments.forEach(apt => {
    if (!clientMap.has(apt.client_id)) {
      clientMap.set(apt.client_id, []);
    }
    clientMap.get(apt.client_id)?.push(apt);
  });

  const riskScores: ClientRiskScore[] = [];

  // Analyze each client
  for (const [clientId, clientAppointments] of clientMap.entries()) {
    const now = new Date();
    const lastAppointment = clientAppointments[0] ? new Date(clientAppointments[0].appointment_date) : null;
    const totalVisits = clientAppointments.length;
    
    const daysSinceLastVisit = lastAppointment 
      ? Math.floor((now.getTime() - lastAppointment.getTime()) / (1000 * 60 * 60 * 24))
      : 999;

    // Calculate average gap
    let avgGap = 0;
    if (clientAppointments.length > 1) {
      const gaps = [];
      for (let i = 0; i < clientAppointments.length - 1; i++) {
        const date1 = new Date(clientAppointments[i].appointment_date);
        const date2 = new Date(clientAppointments[i + 1].appointment_date);
        gaps.push((date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24));
      }
      avgGap = gaps.reduce((a, b) => a + b, 0) / gaps.length;
    }

    // Calculate risk score (0-100)
    let score = 0;
    const reasons: string[] = [];

    // Days since last visit (0-40 points)
    if (daysSinceLastVisit > 90) {
      score += 40;
      reasons.push(`${daysSinceLastVisit} days since last visit`);
    } else if (daysSinceLastVisit > 60) {
      score += 25;
      reasons.push(`${daysSinceLastVisit} days since last visit`);
    } else if (daysSinceLastVisit > 45) {
      score += 15;
      reasons.push('Approaching typical visit window');
    }

    // Gap longer than average (0-30 points)
    if (avgGap > 0 && daysSinceLastVisit > avgGap * 1.5) {
      score += 30;
      reasons.push('Visit gap longer than usual');
    }

    // New client (0-20 points)
    if (totalVisits <= 2) {
      score += 20;
      reasons.push('New client - building relationship');
    }

    // Determine risk level
    let riskLevel: 'low' | 'medium' | 'high' | 'critical';
    if (score >= 70) riskLevel = 'critical';
    else if (score >= 50) riskLevel = 'high';
    else if (score >= 30) riskLevel = 'medium';
    else riskLevel = 'low';

    riskScores.push({
      clientId,
      riskLevel,
      score,
      reasons,
      daysSinceLastVisit,
      totalVisits,
      avgGap
    });
  }

  return riskScores.sort((a, b) => b.score - a.score);
}

/**
 * Generate personalized retention message
 */
function generateRetentionMessage(
  client: ClientRiskScore, 
  profile: any, 
  stylist: any
): string {
  const name = profile.full_name?.split(' ')[0] || 'there';
  const daysSince = client.daysSinceLastVisit;

  if (client.riskLevel === 'critical') {
    return `Hi ${name}! 👋 We've really missed you at ${stylist.business_name}! It's been ${daysSince} days since your last visit, and we'd absolutely love to see you again. I have some exciting new techniques and services I think you'd be thrilled about! ✨💇‍♀️`;
  } else if (client.riskLevel === 'high') {
    return `Hey ${name}! 🌟 Hope you're doing amazing! Just wanted to reach out - it's been a while since I've had the pleasure of working with you. Your hair must be ready for some professional TLC! When works best for you to come in? 💕`;
  }

  return `Hi ${name}! Just a friendly check-in from ${stylist.business_name} - it's been about ${daysSince} days since your last visit. We'd love to have you back! Ready to book your next appointment? 😊`;
}

serve(handler);
