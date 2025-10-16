# Email Automation Setup Guide

## 🎯 Overview

Your app now has **5 automated email features** ready to deploy:

1. **Birthday/Milestone Emails** - Auto-send 7 days before birthdays with discount codes
2. **Review Request Emails** - Auto-send 24h after appointments
3. **Cancellation Follow-Up** - Auto-send 3 days after cancellations
4. **Aftercare Instructions** - Auto-send when appointments marked complete
5. **Client Intake Forms** - Digital forms with auto-population

---

## 📋 Quick Setup Checklist

- [ ] **Resend API Key** - Already configured ✅
- [ ] **Cron Job** - Schedule automated emails (see below)
- [ ] **Test Emails** - Send test previews to verify
- [ ] **Navigation** - New menu items added ✅
- [ ] **Webhooks** (Optional) - Track opens/clicks

---

## 1. Schedule Automated Emails (REQUIRED)

### Create Cron Job in Supabase

Go to your Supabase Dashboard → Database → Cron Jobs and add:

```sql
-- Run automated emails daily at 9 AM
SELECT cron.schedule(
  'send-automated-emails',
  '0 9 * * *',
  $$
  SELECT net.http_post(
    url:='https://iyotklwiwyljospfqnoy.supabase.co/functions/v1/send-automated-emails',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5b3RrbHdpd3lsam9zcGZxbm95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzNTU0NDAsImV4cCI6MjA3NDkzMTQ0MH0.X1bkOZPuNuGeUHYfiN1p8_z8jtRWnfi2T9WlzGOb_jA"}'::jsonb,
    body:=concat('{"time": "', now(), '"}')::jsonb
  ) as request_id;
  $$
);
```

**What this does:**
- Checks for birthdays in next 7 days → sends birthday emails with discounts
- Finds appointments completed 24h ago → sends review requests
- Finds cancellations from 3 days ago → sends follow-up emails

---

## 2. Test Your Automated Emails

### In-App Testing (EASIEST)

1. Navigate to **Email Sequences** → **Test** tab
2. Select email type (Birthday, Review, Cancellation, or Aftercare)
3. Enter your email address
4. Click "Send Test Email"
5. Check your inbox for the preview (with yellow test banner)

### Manual Testing via Supabase

```sql
-- Manually trigger automated email processing
SELECT net.http_post(
  url:='https://iyotklwiwyljospfqnoy.supabase.co/functions/v1/send-automated-emails',
  headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb,
  body:='{}'::jsonb
);
```

---

## 3. Aftercare Auto-Send Setup

### Database Trigger (Recommended)

Create a trigger to automatically send aftercare when appointments are completed:

```sql
CREATE OR REPLACE FUNCTION send_aftercare_on_completion()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    PERFORM net.http_post(
      url:='https://iyotklwiwyljospfqnoy.supabase.co/functions/v1/auto-send-aftercare',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5b3RrbHdpd3lsam9zcGZxbm95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzNTU0NDAsImV4cCI6MjA3NDkzMTQ0MH0.X1bkOZPuNuGeUHYfiN1p8_z8jtRWnfi2T9WlzGOb_jA"}'::jsonb,
      body:=json_build_object('appointment_id', NEW.id)::jsonb
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER aftercare_on_appointment_complete
AFTER UPDATE ON appointments
FOR EACH ROW
EXECUTE FUNCTION send_aftercare_on_completion();
```

---

## 4. Email Open/Click Tracking (OPTIONAL)

### Setup Resend Webhooks

1. Go to [Resend Dashboard](https://resend.com/webhooks)
2. Add webhook URL: `https://iyotklwiwyljospfqnoy.supabase.co/functions/v1/resend-webhook`
3. Select events:
   - `email.opened`
   - `email.clicked`
   - `email.bounced`
   - `email.complained`

This will automatically update your `email_sequence_logs` table with open/click data.

---

## 5. Access New Features

### Navigation Added ✅

- **Email Sequences** → Test Tab (new!)
- **Client Forms** → Build intake forms
- **Care Guides** → Aftercare templates

All accessible from the sidebar under "Growth" section.

---

## 📊 Monitoring & Analytics

### View Email Performance

1. Navigate to **Email Sequences** → **Analytics**
2. Monitor:
   - Total emails sent
   - Open rates (after webhook setup)
   - Click rates (after webhook setup)
   - Active enrollments

### Check Logs

```sql
-- View recent automated emails
SELECT * FROM email_sequence_logs
ORDER BY sent_at DESC
LIMIT 20;

-- Check for errors
SELECT * FROM email_sequence_logs
WHERE bounced = true OR unsubscribed = true
ORDER BY sent_at DESC;
```

---

## 🎨 Customization

### Modify Email Templates

1. Go to **Email Sequences** → **Templates**
2. Click on any template to edit
3. Update:
   - Subject line
   - Email body (HTML supported)
   - Variables (e.g., `{{client_name}}`, `{{stylist_name}}`)

### Add New Aftercare Guides

1. Go to **Care Guides**
2. View existing templates for:
   - Color treatments
   - Keratin
   - Highlights/Balayage
   - Cut & Style
3. Click to preview and customize

---

## 🚨 Troubleshooting

### Emails Not Sending?

1. **Check Resend API Key**: Verify it's set in Supabase secrets
2. **Check Cron Job**: Make sure it's running (see logs in Supabase)
3. **Check Client Emails**: Ensure clients have valid email addresses
4. **Test Manually**: Use the Test tab to send a preview

### Test Email Not Arriving?

1. Check spam/junk folder
2. Verify recipient email is correct
3. Check Resend dashboard for delivery status
4. Look at Edge Function logs in Supabase

### Aftercare Not Auto-Sending?

1. Verify the database trigger is created (see step 3)
2. Check that `service_type` matches template names exactly
3. Test manually by marking an appointment complete

---

## 📝 Best Practices

✅ **DO:**
- Test each email type before going live
- Monitor open/click rates to improve content
- Customize templates with your branding
- Update client email preferences regularly

❌ **DON'T:**
- Send emails without testing first
- Ignore bounce notifications
- Use generic content (personalize!)
- Forget to check spam compliance

---

## 🎯 Success Metrics to Track

After 30 days, measure:

1. **Birthday Emails:**
   - Redemption rate of discount codes
   - Appointments booked within 30 days

2. **Review Requests:**
   - Review submission rate
   - Average star rating

3. **Cancellation Follow-Ups:**
   - Rebooking rate
   - Time to rebook

4. **Aftercare:**
   - Email open rate
   - Client satisfaction scores

---

## 🆘 Need Help?

If you encounter issues:

1. Check Edge Function logs in Supabase Dashboard
2. Test individual components using the Test tab
3. Verify all cron jobs are running
4. Check Resend dashboard for email delivery status

**Common Issues:**
- Missing API keys → Add in Supabase Secrets
- Wrong timing → Adjust cron schedule
- Template errors → Use Test tab to preview
- Email bounces → Verify client email addresses

---

## 🚀 Next Steps

Once basic automation is working:

1. **Add More Triggers**: Create custom sequences for:
   - New client onboarding
   - Inactive client reactivation
   - Pre-appointment reminders
   - Post-service upsells

2. **A/B Testing**: Test different:
   - Subject lines
   - Send times
   - Discount amounts
   - Call-to-action wording

3. **Segmentation**: Create targeted sequences for:
   - VIP clients
   - First-time clients
   - Seasonal promotions
   - Service-specific care

---

**🎉 You're all set! Your automated email system is production-ready.**
