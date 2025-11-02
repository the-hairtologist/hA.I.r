import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

interface InviteRequest {
  clientEmail: string;
  clientName: string;
  stylistName: string;
  customMessage?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      clientEmail,
      clientName,
      stylistName,
      customMessage,
    }: InviteRequest = await req.json();

    const appUrl =
      Deno.env.get('VITE_SUPABASE_URL')?.replace('/rest/v1', '') ||
      'https://app.example.com';

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
          .custom-message { background: white; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0; font-style: italic; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✨ You're Invited! ✨</h1>
          </div>
          <div class="content">
            <p>Hi ${clientName},</p>
            
            <p><strong>${stylistName}</strong> has invited you to join AI Hair Genius!</p>
            
            ${customMessage ? `<div class="custom-message">"${customMessage}"</div>` : ''}
            
            <p>By creating your account, you'll be able to:</p>
            <ul>
              <li>📱 View your appointment history anytime, anywhere</li>
              <li>🎨 Access your custom hair color formulas forever</li>
              <li>💬 Message directly with ${stylistName}</li>
              <li>📅 Book future appointments online</li>
              <li>💝 Never lose your hair color formula again!</li>
            </ul>
            
            <center>
              <a href="${appUrl}/auth" class="button">Create Your Account →</a>
            </center>
            
            <p>Your stylist has already set up your profile, so all your appointment history and formulas will be waiting for you!</p>
            
            <p style="margin-top: 30px; color: #666; font-size: 14px;">
              If you didn't expect this invitation, you can safely ignore this email.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
      },
      body: JSON.stringify({
        from: 'AI Hair Genius <onboarding@resend.dev>',
        to: [clientEmail],
        subject: `${stylistName} invited you to AI Hair Genius 💇‍♀️`,
        html: emailHtml,
      }),
    });

    if (!emailResponse.ok) {
      const error = await emailResponse.text();
      throw new Error(`Failed to send email: ${error}`);
    }

    const result = await emailResponse.json();
    console.log('Invite email sent successfully:', result);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error('Error sending invite:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
};

serve(handler);
