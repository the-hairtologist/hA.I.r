import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

serve(async req => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const url = new URL(req.url);
    const enrollmentId = url.searchParams.get('enrollment_id');

    if (!enrollmentId) {
      return new Response(
        generateHtmlResponse(
          'Invalid Link',
          'This unsubscribe link is invalid or has expired.'
        ),
        { status: 400, headers: { 'Content-Type': 'text/html' } }
      );
    }

    // Validate UUID format
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(enrollmentId)) {
      return new Response(
        generateHtmlResponse(
          'Invalid Link',
          'This unsubscribe link format is invalid.'
        ),
        { status: 400, headers: { 'Content-Type': 'text/html' } }
      );
    }

    // Update enrollment status
    const { error } = await supabase
      .from('email_sequence_enrollments')
      .update({
        status: 'unsubscribed',
        unenrolled_at: new Date().toISOString(),
        unenrolled_reason: 'User unsubscribed',
      })
      .eq('id', enrollmentId);

    if (error) throw error;

    console.log(`✅ Client unsubscribed from enrollment ${enrollmentId}`);

    return new Response(
      generateHtmlResponse(
        'Successfully Unsubscribed',
        'You have been successfully unsubscribed from this email sequence. You will no longer receive emails from this campaign.'
      ),
      { headers: { 'Content-Type': 'text/html' } }
    );
  } catch (error) {
    console.error('Error in unsubscribe-email:', error);
    return new Response(
      generateHtmlResponse(
        'Error',
        'An error occurred while processing your request. Please try again later.'
      ),
      { status: 500, headers: { 'Content-Type': 'text/html' } }
    );
  }
});

function generateHtmlResponse(title: string, message: string): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          margin: 0;
          background: linear-gradient(135deg, hsl(270, 85%, 50%) 0%, hsl(340, 90%, 55%) 100%);
        }
        .container {
          background: white;
          padding: 3rem;
          border-radius: 1rem;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          max-width: 500px;
          text-align: center;
        }
        h1 {
          color: hsl(270, 85%, 50%);
          margin-bottom: 1rem;
        }
        p {
          color: #666;
          line-height: 1.6;
        }
        .icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="icon">✓</div>
        <h1>${title}</h1>
        <p>${message}</p>
      </div>
    </body>
    </html>
  `;
}
