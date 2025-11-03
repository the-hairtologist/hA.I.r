# ⏰ Cron Job Setup for Smart Reminders

## Overview

The smart-reminder function needs to run daily to send appointment reminders to clients 24 hours before their appointments.

## Setup Instructions

### Option 1: Use Supabase Dashboard (Recommended)

1. Go to your **Supabase Dashboard**
2. Navigate to **Database** → **Extensions**
3. Enable **pg_cron** extension
4. Go to **SQL Editor**
5. Run this SQL:

```sql
-- Schedule smart-reminder to run daily at 9 AM
SELECT cron.schedule(
  'smart-reminder-daily',
  '0 9 * * *', -- Every day at 9 AM
  $$
  SELECT
    net.http_post(
        url:='https://iyotklwiwyljospfqnoy.supabase.co/functions/v1/smart-reminder',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5b3RrbHdpd3lsam9zcGZxbm95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzNTU0NDAsImV4cCI6MjA3NDkzMTQ0MH0.X1bkOZPuNuGeUHYfiN1p8_z8jtRWnfi2T9WlzGOb_jA"}'::jsonb,
        body:=concat('{"time": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);
```

### Option 2: Use External Cron Service

If you can't enable pg_cron, use a free service like:

- **Cron-job.org** (https://cron-job.org)
- **EasyCron** (https://www.easycron.com)
- **Uptime Robot** (https://uptimerobot.com)

**Setup Steps:**

1. Create free account
2. Add new cron job with URL:
   ```
   https://iyotklwiwyljospfqnoy.supabase.co/functions/v1/smart-reminder
   ```
3. Set schedule: Daily at 9:00 AM
4. Add headers:
   - `Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5b3RrbHdpd3lsam9zcGZxbm95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzNTU0NDAsImV4cCI6MjA3NDkzMTQ0MH0.X1bkOZPuNuGeUHYfiN1p8_z8jtRWnfi2T9WlzGOb_jA`
   - `Content-Type: application/json`
5. Save and enable

---

## What the Smart Reminder Does

**Automatically sends reminders 24 hours before appointments:**

- ✅ Personalized SMS/email to client
- ✅ Includes last formula used
- ✅ References previous results
- ✅ Confirms appointment time
- ✅ Marks reminder as sent

**Example Message:**

```
Hi Sarah! ✨ Jane's Hair Studio is ready for your
Balayage tomorrow at 2:00 PM!

💡 Last time we used: Wella Koleston 8/01
Beautiful natural blonde result!

See you soon! 💇‍♀️
```

---

## Testing

### Manual Test (Immediate)

1. Go to **Backend** → **Functions**
2. Find `smart-reminder`
3. Click **Invoke**
4. Check logs for processed appointments

### Verify Cron Job

After setup, check:

- **Supabase Dashboard** → **Database** → **Cron Jobs** (shows last run)
- **Backend** → **Functions** → `smart-reminder` logs
- Check appointments table for `reminder_sent = true`

---

## Monitoring

### Check Cron Status

```sql
-- View all cron jobs
SELECT * FROM cron.job;

-- View cron job run history
SELECT * FROM cron.job_run_details
ORDER BY start_time DESC
LIMIT 10;
```

### Unschedule (if needed)

```sql
SELECT cron.unschedule('smart-reminder-daily');
```

---

## Best Practices

### Timing

- **9 AM** works for most timezones
- Adjust based on your target audience
- Avoid late night / early morning sends

### Frequency

- **Once daily** is optimal
- Too frequent = spam
- Less than daily = missed reminders

### Error Handling

The function includes:

- ✅ Automatic retry logic
- ✅ Error logging
- ✅ Graceful failure handling
- ✅ Detailed console logs

---

## Alternative Schedule Options

```sql
-- Every hour during business hours (9 AM - 6 PM)
'0 9-18 * * *'

-- Twice daily (9 AM and 3 PM)
'0 9,15 * * *'

-- Every 6 hours
'0 */6 * * *'

-- Monday through Friday at 9 AM
'0 9 * * 1-5'
```

---

## Status: ⚠️ Requires Manual Setup

**Why?** The pg_cron extension needs to be enabled in your Supabase dashboard first.

**Time to Complete**: 2 minutes  
**Difficulty**: Easy

---

**Once setup, reminders will run automatically forever! 🎯**
