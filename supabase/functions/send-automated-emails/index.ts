import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@4.0.0";

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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("🎂 Processing automated emails...");

    const results = {
      birthdays: 0,
      reviews: 0,
      cancellations: 0,
      errors: [] as string[],
    };

    // 1. BIRTHDAY EMAILS - Check for birthdays in next 7 days
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    const { data: upcomingBirthdays } = await supabase
      .from("client_profiles")
      .select(`
        id,
        full_name,
        email,
        birthday,
        preferred_stylist_id,
        stylist_profiles!preferred_stylist_id(user_id, full_name)
      `)
      .not("birthday", "is", null)
      .not("email", "is", null);

    if (upcomingBirthdays) {
      for (const client of upcomingBirthdays) {
        if (!client.birthday || !client.email) continue;

        const birthDate = new Date(client.birthday);
        const nextBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
        
        if (nextBirthday < today) {
          nextBirthday.setFullYear(today.getFullYear() + 1);
        }

        const daysUntil = Math.floor((nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        // Send email 7 days before birthday
        if (daysUntil === 7) {
          // Check for milestone discount
          const { data: milestones } = await supabase
            .from("client_milestones")
            .select("*")
            .eq("client_id", client.id)
            .eq("celebrated", false)
            .order("created_at", { ascending: false })
            .limit(1);

          const milestone = milestones?.[0];
          const discountAmount = milestone?.discount_amount || 20;
          const discountCode = milestone?.discount_code || "BIRTHDAY20";

          try {
            // Check email preferences
            const { data: prefs } = await supabase
              .from("email_preferences")
              .select("*")
              .eq("email", client.email)
              .maybeSingle();

            if (prefs && !prefs.marketing_emails_enabled) {
              console.log(`⏭️ Skipping birthday email - user unsubscribed: ${client.email}`);
              continue;
            }

            const emailResult = await resend.emails.send({
              from: "hA.I.r <onboarding@resend.dev>",
              to: [client.email],
              subject: `Happy Birthday ${client.full_name}! 🎂 Special Gift Inside`,
              html: generateBirthdayEmail(
                client.full_name,
                client.stylist_profiles?.full_name || "Your Stylist",
                discountAmount.toString(),
                discountCode
              ),
            });

            // Log to email_sequence_logs
            await supabase.from("email_sequence_logs").insert({
              client_id: client.id,
              stylist_id: client.preferred_stylist_id,
              enrollment_id: null,
              step_id: null,
              email_address: client.email,
              subject: `Happy Birthday ${client.full_name}! 🎂 Special Gift Inside`,
              resend_email_id: emailResult.data?.id,
            });

            // Mark milestone as celebrated if exists
            if (milestone) {
              await supabase
                .from("client_milestones")
                .update({ celebrated: true })
                .eq("id", milestone.id);
            }

            results.birthdays++;
            console.log(`✅ Birthday email sent to ${client.full_name}`);
          } catch (error) {
            console.error(`❌ Failed to send birthday email:`, error);
            results.errors.push(`Birthday email failed for ${client.full_name}`);
          }
        }
      }
    }

    // 2. REVIEW REQUESTS - 24 hours after completed appointments
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    const yesterdayEnd = new Date(yesterday);
    yesterdayEnd.setHours(23, 59, 59, 999);

    const { data: recentAppointments } = await supabase
      .from("appointments")
      .select(`
        id,
        client_id,
        stylist_id,
        client_profiles!client_id(full_name, email),
        stylist_profiles!stylist_id(full_name)
      `)
      .eq("status", "completed")
      .gte("appointment_date", yesterday.toISOString())
      .lte("appointment_date", yesterdayEnd.toISOString());

    if (recentAppointments) {
      for (const apt of recentAppointments) {
        if (!apt.client_profiles?.email) continue;

        try {
          // Check email preferences
          const { data: prefs } = await supabase
            .from("email_preferences")
            .select("*")
            .eq("email", apt.client_profiles.email)
            .maybeSingle();

          if (prefs && !prefs.appointment_reminders_enabled) {
            console.log(`⏭️ Skipping review email - user opted out: ${apt.client_profiles.email}`);
            continue;
          }

          const emailResult = await resend.emails.send({
            from: "hA.I.r <onboarding@resend.dev>",
            to: [apt.client_profiles.email],
            subject: `How was your visit with ${apt.stylist_profiles?.full_name}? ⭐`,
            html: generateReviewEmail(
              apt.client_profiles.full_name,
              apt.stylist_profiles?.full_name || "your stylist"
            ),
          });

          // Log to email_sequence_logs
          await supabase.from("email_sequence_logs").insert({
            client_id: apt.client_id,
            stylist_id: apt.stylist_id,
            enrollment_id: null,
            step_id: null,
            email_address: apt.client_profiles.email,
            subject: `How was your visit with ${apt.stylist_profiles?.full_name}? ⭐`,
            resend_email_id: emailResult.data?.id,
          });

          results.reviews++;
          console.log(`✅ Review request sent to ${apt.client_profiles.full_name}`);
        } catch (error) {
          console.error(`❌ Failed to send review email:`, error);
          results.errors.push(`Review email failed for ${apt.client_profiles.full_name}`);
        }
      }
    }

    // 3. CANCELLATION FOLLOW-UPS - 3 days after cancelled appointments
    const threeDaysAgo = new Date(today);
    threeDaysAgo.setDate(today.getDate() - 3);
    threeDaysAgo.setHours(0, 0, 0, 0);
    const threeDaysAgoEnd = new Date(threeDaysAgo);
    threeDaysAgoEnd.setHours(23, 59, 59, 999);

    const { data: cancelledAppointments } = await supabase
      .from("appointments")
      .select(`
        id,
        client_id,
        stylist_id,
        client_profiles!client_id(full_name, email),
        stylist_profiles!stylist_id(full_name)
      `)
      .eq("status", "cancelled")
      .gte("cancelled_at", threeDaysAgo.toISOString())
      .lte("cancelled_at", threeDaysAgoEnd.toISOString());

    if (cancelledAppointments) {
      for (const apt of cancelledAppointments) {
        if (!apt.client_profiles?.email) continue;

        try {
          // Check email preferences
          const { data: prefs } = await supabase
            .from("email_preferences")
            .select("*")
            .eq("email", apt.client_profiles.email)
            .maybeSingle();

          if (prefs && !prefs.marketing_emails_enabled) {
            console.log(`⏭️ Skipping cancellation email - user unsubscribed: ${apt.client_profiles.email}`);
            continue;
          }

          const emailResult = await resend.emails.send({
            from: "hA.I.r <onboarding@resend.dev>",
            to: [apt.client_profiles.email],
            subject: `We missed you, ${apt.client_profiles.full_name} - Let's reschedule! 💇`,
            html: generateCancellationEmail(
              apt.client_profiles.full_name,
              apt.stylist_profiles?.full_name || "Your Stylist"
            ),
          });

          // Log to email_sequence_logs
          await supabase.from("email_sequence_logs").insert({
            client_id: apt.client_id,
            stylist_id: apt.stylist_id,
            enrollment_id: null,
            step_id: null,
            email_address: apt.client_profiles.email,
            subject: `We missed you, ${apt.client_profiles.full_name} - Let's reschedule! 💇`,
            resend_email_id: emailResult.data?.id,
          });

          results.cancellations++;
          console.log(`✅ Cancellation follow-up sent to ${apt.client_profiles.full_name}`);
        } catch (error) {
          console.error(`❌ Failed to send cancellation email:`, error);
          results.errors.push(`Cancellation email failed for ${apt.client_profiles.full_name}`);
        }
      }
        } catch (error) {
          console.error(`❌ Failed to send cancellation email:`, error);
          results.errors.push(`Cancellation email failed for ${apt.client_profiles.full_name}`);
        }
      }
    }

    console.log("✅ Email processing complete:", results);

    return new Response(
      JSON.stringify({
        success: true,
        ...results,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in automated emails function:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

function generateBirthdayEmail(clientName: string, stylistName: string, discountAmount: string, discountCode: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #FF6B9D; font-size: 32px; margin: 0;">🎂 Happy Birthday!</h1>
      </div>
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 15px; text-align: center; margin-bottom: 30px;">
        <h2 style="margin: 0 0 10px 0; font-size: 28px;">${clientName}</h2>
        <p style="font-size: 18px; margin: 0;">Wishing you a fabulous year ahead! 🎉</p>
      </div>
      <div style="background: #f9fafb; padding: 25px; border-radius: 10px; margin-bottom: 30px;">
        <h3 style="color: #333; margin-top: 0;">Your Birthday Gift 🎁</h3>
        <p style="color: #555; line-height: 1.6;">As a special birthday treat, we're giving you <strong style="color: #FF6B9D; font-size: 20px;">$${discountAmount} OFF</strong> your next appointment!</p>
        <div style="background: white; border: 2px dashed #FF6B9D; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <p style="margin: 0; color: #666; font-size: 14px;">Your Birthday Code:</p>
          <p style="margin: 5px 0 0 0; font-size: 24px; font-weight: bold; color: #667eea; letter-spacing: 2px;">${discountCode}</p>
        </div>
        <p style="color: #999; font-size: 13px; margin-top: 15px;">Valid for 30 days from your birthday</p>
      </div>
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://app.hair.com/book" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">Book Your Birthday Appointment</a>
      </div>
      <p style="color: #666; text-align: center; margin-top: 30px;">Thank you for being such an amazing client! We can't wait to see you soon.</p>
      <p style="color: #999; font-size: 13px; text-align: center; margin-top: 20px;">With love,<br>${stylistName} & Team</p>
    </div>
  `;
}

function generateReviewEmail(clientName: string, stylistName: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #667eea; font-size: 28px; margin: 0;">How Did We Do? ⭐</h1>
      </div>
      <p style="color: #333; font-size: 16px; line-height: 1.6;">Hi ${clientName},</p>
      <p style="color: #555; line-height: 1.6;">Thank you for visiting us! We hope you're loving your new look. Your feedback means the world to us and helps other clients find the perfect stylist.</p>
      <div style="background: #f9fafb; padding: 25px; border-radius: 10px; margin: 30px 0; text-align: center;">
        <h3 style="color: #333; margin-top: 0;">Share Your Experience</h3>
        <p style="color: #666; margin-bottom: 25px;">It takes just 2 minutes and makes a huge difference!</p>
        <div style="margin: 20px 0;">
          <a href="https://g.page/r/YOUR_GOOGLE_REVIEW_LINK" style="background: #4285F4; color: white; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; margin: 5px;">Review on Google</a>
          <a href="https://www.yelp.com/writeareview/YOUR_YELP_LINK" style="background: #FF1A1A; color: white; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; margin: 5px;">Review on Yelp</a>
        </div>
      </div>
      <div style="border-left: 4px solid #667eea; padding-left: 20px; margin: 30px 0;">
        <p style="color: #666; font-style: italic; margin: 0;">"Your reviews help small businesses like ours thrive and help other clients make confident decisions. Thank you for your support! 💜"</p>
      </div>
      <p style="color: #666; margin-top: 30px;">If you had any concerns during your visit, please reply to this email - we're always here to make things right.</p>
      <p style="color: #999; font-size: 13px; text-align: center; margin-top: 30px;">See you soon,<br>${stylistName}</p>
    </div>
  `;
}

function generateCancellationEmail(clientName: string, stylistName: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #FF6B9D; font-size: 28px; margin: 0;">We Missed You! 💕</h1>
      </div>
      <p style="color: #333; font-size: 16px; line-height: 1.6;">Hi ${clientName},</p>
      <p style="color: #555; line-height: 1.6;">We noticed you had to cancel your recent appointment. Life happens - we totally understand! We wanted to reach out and make it easy for you to reschedule when you're ready.</p>
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 25px; border-radius: 15px; margin: 30px 0; text-align: center;">
        <h3 style="margin: 0 0 15px 0;">Your Spot is Waiting ✨</h3>
        <p style="margin: 0; font-size: 15px; opacity: 0.95;">${stylistName} has openings this week and would love to see you!</p>
      </div>
      <div style="background: #f9fafb; padding: 20px; border-radius: 10px; margin: 30px 0;">
        <h4 style="color: #333; margin-top: 0;">Why reschedule now?</h4>
        <ul style="color: #555; line-height: 1.8; padding-left: 20px;">
          <li>Keep your hair looking its best 💁‍♀️</li>
          <li>Convenient booking - pick your perfect time 📅</li>
          <li>Avoid the last-minute rush 🏃‍♀️</li>
          <li>Your favorite stylist is ready for you! ✨</li>
        </ul>
      </div>
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://app.hair.com/book" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">Book Your Appointment</a>
      </div>
      <p style="color: #666; text-align: center; font-size: 14px; margin-top: 30px;">Need help finding the perfect time? Just reply to this email and we'll help you out! 💬</p>
      <p style="color: #999; font-size: 13px; text-align: center; margin-top: 20px;">Looking forward to seeing you soon!<br>${stylistName}</p>
    </div>
  `;
}
