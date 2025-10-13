-- =====================================================
-- STARTER EMAIL TEMPLATES & CRON JOB SETUP
-- =====================================================

-- Insert starter global email templates
INSERT INTO public.email_templates (
  name, 
  category, 
  description, 
  subject_template, 
  html_content, 
  variables, 
  preview_text, 
  is_global,
  created_by
) VALUES 
(
  'Welcome New Client',
  'welcome',
  'Warm welcome email for new clients',
  'Welcome to {{stylist_name}}''s Salon! 💇',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h1 style="color: #333;">Hi {{client_name}}! 👋</h1>
    <p style="font-size: 16px; line-height: 1.6; color: #555;">
      Thank you for choosing me as your stylist! I''m thrilled to be part of your hair journey.
    </p>
    <p style="font-size: 16px; line-height: 1.6; color: #555;">
      Looking forward to seeing you at your appointment!
    </p>
    <p style="font-size: 16px; line-height: 1.6; color: #555;">
      Best,<br>
      {{stylist_name}}
    </p>
    <hr style="border: 1px solid #eee; margin: 20px 0;">
    <p style="font-size: 12px; color: #999;">
      <a href="{{unsubscribe_url}}" style="color: #999;">Unsubscribe</a> from these emails
    </p>
  </div>',
  '["client_name", "stylist_name", "unsubscribe_url"]',
  'Welcome to your new salon experience!',
  true,
  NULL
),
(
  'Appointment Reminder',
  'appointment',
  'Remind clients about upcoming appointments',
  '⏰ Appointment Reminder - {{appointment_date}}',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h1 style="color: #333;">Hi {{client_name}}! 👋</h1>
    <p style="font-size: 16px; line-height: 1.6; color: #555;">
      This is a friendly reminder about your appointment with {{stylist_name}}.
    </p>
    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <p style="margin: 5px 0;"><strong>Date:</strong> {{appointment_date}}</p>
      <p style="margin: 5px 0;"><strong>Time:</strong> {{appointment_time}}</p>
      <p style="margin: 5px 0;"><strong>Service:</strong> {{service_type}}</p>
    </div>
    <p style="font-size: 16px; line-height: 1.6; color: #555;">
      Can''t wait to see you!
    </p>
    <p style="font-size: 16px; line-height: 1.6; color: #555;">
      {{stylist_name}}
    </p>
    <hr style="border: 1px solid #eee; margin: 20px 0;">
    <p style="font-size: 12px; color: #999;">
      <a href="{{unsubscribe_url}}" style="color: #999;">Unsubscribe</a>
    </p>
  </div>',
  '["client_name", "stylist_name", "appointment_date", "appointment_time", "service_type", "unsubscribe_url"]',
  'Your appointment is coming up!',
  true,
  NULL
),
(
  'Post-Appointment Thank You',
  'follow_up',
  'Thank clients after their appointment',
  'Thank you for visiting! 💕',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h1 style="color: #333;">Thank you, {{client_name}}! ✨</h1>
    <p style="font-size: 16px; line-height: 1.6; color: #555;">
      I hope you love your new look! It was wonderful seeing you.
    </p>
    <p style="font-size: 16px; line-height: 1.6; color: #555;">
      <strong>Hair Care Tips:</strong>
    </p>
    <ul style="font-size: 16px; line-height: 1.8; color: #555;">
      <li>Use sulfate-free shampoo</li>
      <li>Apply heat protectant before styling</li>
      <li>Deep condition weekly</li>
    </ul>
    <p style="font-size: 16px; line-height: 1.6; color: #555;">
      See you at your next appointment!
    </p>
    <p style="font-size: 16px; line-height: 1.6; color: #555;">
      {{stylist_name}}
    </p>
    <hr style="border: 1px solid #eee; margin: 20px 0;">
    <p style="font-size: 12px; color: #999;">
      <a href="{{unsubscribe_url}}" style="color: #999;">Unsubscribe</a>
    </p>
  </div>',
  '["client_name", "stylist_name", "unsubscribe_url"]',
  'Hope you love your new look!',
  true,
  NULL
),
(
  'Rebook Reminder',
  'promotional',
  'Encourage clients to book their next appointment',
  'Time for a touch-up? 💇',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h1 style="color: #333;">Hi {{client_name}}! 💇</h1>
    <p style="font-size: 16px; line-height: 1.6; color: #555;">
      It''s been about 6 weeks since your last visit. Your hair is probably ready for some love!
    </p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{booking_link}}" style="background: #8B5CF6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
        Book Your Next Appointment
      </a>
    </div>
    <p style="font-size: 16px; line-height: 1.6; color: #555;">
      Looking forward to seeing you again!
    </p>
    <p style="font-size: 16px; line-height: 1.6; color: #555;">
      {{stylist_name}}
    </p>
    <hr style="border: 1px solid #eee; margin: 20px 0;">
    <p style="font-size: 12px; color: #999;">
      <a href="{{unsubscribe_url}}" style="color: #999;">Unsubscribe</a>
    </p>
  </div>',
  '["client_name", "stylist_name", "booking_link", "unsubscribe_url"]',
  'Time to book your next appointment!',
  true,
  NULL
);

-- Set up cron job to process email sequences every 15 minutes
SELECT cron.schedule(
  'process-email-sequences',
  '*/15 * * * *', -- Every 15 minutes
  $$
  SELECT net.http_post(
    url := 'https://iyotklwiwyljospfqnoy.supabase.co/functions/v1/process-email-sequences',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5b3RrbHdpd3lsam9zcGZxbm95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzNTU0NDAsImV4cCI6MjA3NDkzMTQ0MH0.X1bkOZPuNuGeUHYfiN1p8_z8jtRWnfi2T9WlzGOb_jA"}'::jsonb,
    body := concat('{"time": "', now(), '"}')::jsonb
  ) AS request_id;
  $$
);