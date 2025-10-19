import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || 'hA.I.r <onboarding@resend.dev>';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email_type, recipient_email } = await req.json();

    if (!recipient_email) {
      throw new Error("Recipient email is required");
    }

    let emailContent = {
      from: FROM_EMAIL,
      to: [recipient_email],
      subject: "",
      html: "",
    };

    switch (email_type) {
      case "birthday":
        emailContent.subject = "🎂 Happy Birthday Test - Special Gift Inside";
        emailContent.html = generateBirthdayTestEmail();
        break;
      case "review":
        emailContent.subject = "⭐ Review Request Test";
        emailContent.html = generateReviewTestEmail();
        break;
      case "cancellation":
        emailContent.subject = "💕 We Missed You Test - Let's Reschedule";
        emailContent.html = generateCancellationTestEmail();
        break;
      case "aftercare":
        emailContent.subject = "✨ Aftercare Guide Test";
        emailContent.html = generateAftercareTestEmail();
        break;
      default:
        throw new Error("Invalid email type");
    }

    const result = await resend.emails.send(emailContent);

    console.log(`✅ Test email sent:`, result);

    return new Response(
      JSON.stringify({
        success: true,
        message: `${email_type} test email sent to ${recipient_email}`,
        email_id: result.data?.id,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error sending test email:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function generateBirthdayTestEmail(): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #fff3cd; border: 2px solid #ffc107; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
        <p style="margin: 0; color: #856404; font-weight: bold;">🧪 TEST EMAIL - This is a preview of your automated birthday email</p>
      </div>
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #FF6B9D; font-size: 32px; margin: 0;">🎂 Happy Birthday!</h1>
      </div>
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 15px; text-align: center; margin-bottom: 30px;">
        <h2 style="margin: 0 0 10px 0; font-size: 28px;">Jessica Smith</h2>
        <p style="font-size: 18px; margin: 0;">Wishing you a fabulous year ahead! 🎉</p>
      </div>
      <div style="background: #f9fafb; padding: 25px; border-radius: 10px; margin-bottom: 30px;">
        <h3 style="color: #333; margin-top: 0;">Your Birthday Gift 🎁</h3>
        <p style="color: #555; line-height: 1.6;">As a special birthday treat, we're giving you <strong style="color: #FF6B9D; font-size: 20px;">$20 OFF</strong> your next appointment!</p>
        <div style="background: white; border: 2px dashed #FF6B9D; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <p style="margin: 0; color: #666; font-size: 14px;">Your Birthday Code:</p>
          <p style="margin: 5px 0 0 0; font-size: 24px; font-weight: bold; color: #667eea; letter-spacing: 2px;">BIRTHDAY20</p>
        </div>
      </div>
      <div style="text-align: center; margin: 30px 0;">
        <a href="#" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">Book Your Birthday Appointment</a>
      </div>
      <p style="color: #999; font-size: 13px; text-align: center; margin-top: 20px;">With love,<br>Sarah Johnson & Team</p>
    </div>
  `;
}

function generateReviewTestEmail(): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #fff3cd; border: 2px solid #ffc107; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
        <p style="margin: 0; color: #856404; font-weight: bold;">🧪 TEST EMAIL - This is a preview of your automated review request</p>
      </div>
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #667eea; font-size: 28px; margin: 0;">How Did We Do? ⭐</h1>
      </div>
      <p style="color: #333; font-size: 16px;">Hi Jessica,</p>
      <p style="color: #555; line-height: 1.6;">Thank you for visiting us! We hope you're loving your new look.</p>
      <div style="background: #f9fafb; padding: 25px; border-radius: 10px; margin: 30px 0; text-align: center;">
        <h3 style="color: #333; margin-top: 0;">Share Your Experience</h3>
        <div style="margin: 20px 0;">
          <a href="#" style="background: #4285F4; color: white; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; margin: 5px;">Review on Google</a>
          <a href="#" style="background: #FF1A1A; color: white; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; margin: 5px;">Review on Yelp</a>
        </div>
      </div>
      <p style="color: #999; font-size: 13px; text-align: center;">See you soon,<br>Sarah Johnson</p>
    </div>
  `;
}

function generateCancellationTestEmail(): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #fff3cd; border: 2px solid #ffc107; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
        <p style="margin: 0; color: #856404; font-weight: bold;">🧪 TEST EMAIL - This is a preview of your cancellation follow-up</p>
      </div>
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #FF6B9D; font-size: 28px; margin: 0;">We Missed You! 💕</h1>
      </div>
      <p style="color: #333; font-size: 16px;">Hi Jessica,</p>
      <p style="color: #555; line-height: 1.6;">We noticed you had to cancel your recent appointment. Life happens - we totally understand!</p>
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 25px; border-radius: 15px; margin: 30px 0; text-align: center;">
        <h3 style="margin: 0 0 15px 0;">Your Spot is Waiting ✨</h3>
        <p style="margin: 0; opacity: 0.95;">Sarah has openings this week and would love to see you!</p>
      </div>
      <div style="text-align: center; margin: 30px 0;">
        <a href="#" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">Book Your Appointment</a>
      </div>
      <p style="color: #999; font-size: 13px; text-align: center;">Looking forward to seeing you soon!<br>Sarah Johnson</p>
    </div>
  `;
}

function generateAftercareTestEmail(): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #fff3cd; border: 2px solid #ffc107; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
        <p style="margin: 0; color: #856404; font-weight: bold;">🧪 TEST EMAIL - This is a preview of your automated aftercare email</p>
      </div>
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #667eea; font-size: 28px; margin: 0;">✨ Color Care Instructions</h1>
      </div>
      <p style="color: #333; font-size: 16px;">Hi Jessica,</p>
      <p style="color: #555; line-height: 1.6;">Your new color looks amazing! Here's how to keep it vibrant and healthy.</p>
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 25px; border-radius: 15px; margin: 30px 0;">
        <h3 style="margin: 0 0 15px 0;">💎 Essential Care Instructions</h3>
        <ul style="margin: 0; padding-left: 20px; line-height: 1.8;">
          <li>Wait 24-48 hours before shampooing</li>
          <li>Use sulfate-free products</li>
          <li>Wash in cool/lukewarm water</li>
        </ul>
      </div>
      <p style="color: #999; font-size: 13px; text-align: center;">With care,<br>Sarah Johnson</p>
    </div>
  `;
}
