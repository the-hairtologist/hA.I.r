# 🚀 Integration Quick Start Guide

**Hair A.I. - Essential Integrations Setup**

This guide walks you through setting up the **3 most critical integrations** for your salon app in the first week.

---

## 📋 Prerequisites

Before starting, have these ready:

- [ ] Admin access to your Hair A.I. project
- [ ] Credit card for paid services (most have free tiers)
- [ ] Email for receiving alerts
- [ ] Phone number for SMS alerts (optional)

**Time Required:** 4-6 hours total  
**Cost:** $0-50/month to start

---

## 🎯 Phase 1: Google Analytics 4 (1-2 hours)

**Why:** You can't improve what you don't measure. GA4 tracks every user action.

### Step 1: Create GA4 Property

1. Go to [analytics.google.com](https://analytics.google.com)
2. Click **Admin** (gear icon, bottom left)
3. Click **Create Property**
4. Enter details:
   - **Property name:** Hair A.I.
   - **Reporting time zone:** Your timezone
   - **Currency:** USD (or your currency)
5. Click **Next** → Select **Small** business size
6. Select **Get baseline reports** for business objective
7. Click **Create** and accept terms

### Step 2: Get Measurement ID

1. In **Admin** → **Data Streams**
2. Click **Add stream** → **Web**
3. Enter:
   - **Website URL:** https://yourdomain.com
   - **Stream name:** Hair A.I. Production
4. Click **Create stream**
5. **Copy the Measurement ID** (format: `G-XXXXXXXXXX`)

### Step 3: Install in Your App

```bash
# Install GA4 package
npm install react-ga4
```

Create `src/lib/analytics.ts`:

```typescript
import ReactGA from 'react-ga4';

const MEASUREMENT_ID = 'G-XXXXXXXXXX'; // Replace with your ID

export const initGA = () => {
  ReactGA.initialize(MEASUREMENT_ID, {
    gaOptions: {
      siteSpeedSampleRate: 100,
    },
  });
};

export const trackPageView = (path: string) => {
  ReactGA.send({ hitType: 'pageview', page: path });
};

export const trackEvent = (
  category: string,
  action: string,
  label?: string
) => {
  ReactGA.event({
    category,
    action,
    label,
  });
};

// Key events for Hair A.I.
export const analytics = {
  signUp: () => trackEvent('Auth', 'sign_up'),
  login: () => trackEvent('Auth', 'login'),

  appointmentBooked: (serviceType: string) =>
    trackEvent('Appointment', 'booked', serviceType),

  appointmentCancelled: () => trackEvent('Appointment', 'cancelled'),

  paymentCompleted: (amount: number) =>
    trackEvent('Payment', 'completed', `$${amount}`),

  formulaGenerated: () => trackEvent('AI', 'formula_generated'),

  stylistClaimed: () => trackEvent('Discovery', 'stylist_claimed'),

  reviewSubmitted: (rating: number) =>
    trackEvent('Review', 'submitted', `${rating}_stars`),
};
```

Update `src/main.tsx`:

```typescript
import { initGA } from './lib/analytics';

// Initialize GA4
if (import.meta.env.PROD) {
  initGA();
}

// ... rest of your code
```

Add to `src/App.tsx`:

```typescript
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from './lib/analytics';

function App() {
  const location = useLocation();

  useEffect(() => {
    if (import.meta.env.PROD) {
      trackPageView(location.pathname + location.search);
    }
  }, [location]);

  // ... rest of your component
}
```

### Step 4: Track Key Events

Add tracking to important actions:

**In Auth.tsx:**

```typescript
import { analytics } from '@/lib/analytics';

const handleSignUp = async () => {
  // ... existing code
  analytics.signUp();
};

const handleLogin = async () => {
  // ... existing code
  analytics.login();
};
```

**In BookAppointment.tsx:**

```typescript
const handleBooking = async () => {
  // ... existing code
  analytics.appointmentBooked(selectedService);
};
```

**In Stripe payment success:**

```typescript
analytics.paymentCompleted(amount);
```

### Step 5: Verify Setup

1. Visit your app in a browser
2. Navigate to different pages
3. In GA4 dashboard, go to **Reports** → **Realtime**
4. You should see your visit within 60 seconds
5. Install **Google Analytics Debugger** extension to troubleshoot

### Step 6: Set Up Conversion Goals

1. In GA4, go to **Admin** → **Events**
2. Click **Create event** for each goal:
   - `appointment_booked`
   - `payment_completed`
   - `sign_up`
3. Mark each as a **conversion** (toggle switch)

✅ **GA4 Setup Complete!**

---

## 🐛 Phase 2: Sentry Error Tracking (1-2 hours)

**Why:** Catch bugs before users complain. See exactly what went wrong.

### Step 1: Create Sentry Project

1. Go to [sentry.io](https://sentry.io) and sign up (free tier: 5,000 errors/month)
2. Click **Create Project**
3. Select **React** as platform
4. Name it **Hair A.I. Production**
5. Click **Create Project**
6. **Copy the DSN** (looks like: `https://xxx@xxx.ingest.sentry.io/xxx`)

### Step 2: Install Sentry

```bash
npm install @sentry/react
```

### Step 3: Initialize Sentry

Update `src/main.tsx`:

```typescript
import * as Sentry from '@sentry/react';

// Initialize Sentry before everything else
if (import.meta.env.PROD) {
  Sentry.init({
    dsn: 'YOUR_SENTRY_DSN_HERE',
    environment: 'production',
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration(),
    ],
    // Performance Monitoring
    tracesSampleRate: 1.0, // Capture 100% of transactions
    // Session Replay
    replaysSessionSampleRate: 0.1, // 10% of sessions
    replaysOnErrorSampleRate: 1.0, // 100% of errors
  });
}

// ... rest of your code
```

### Step 4: Add Error Boundary

Update `src/App.tsx`:

```typescript
import * as Sentry from '@sentry/react';

function App() {
  return (
    <Sentry.ErrorBoundary
      fallback={({ error, resetError }) => (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
            <p className="text-muted-foreground mb-6">
              We've been notified and are working on a fix.
            </p>
            <button
              onClick={resetError}
              className="bg-primary text-primary-foreground px-6 py-2 rounded-md"
            >
              Try Again
            </button>
          </div>
        </div>
      )}
    >
      {/* Your existing app content */}
    </Sentry.ErrorBoundary>
  );
}
```

### Step 5: Add User Context

In your auth hook (`src/hooks/useAuth.ts`), add:

```typescript
import * as Sentry from '@sentry/react';

// When user logs in
Sentry.setUser({
  id: user.id,
  email: user.email,
  username: user.full_name,
});

// When user logs out
Sentry.setUser(null);
```

### Step 6: Test Sentry

Add a test error button (remove after testing):

```typescript
<button onClick={() => {
  throw new Error('Test Sentry Error');
}}>
  Test Error
</button>
```

Click it, then check Sentry dashboard → **Issues**. You should see the error.

### Step 7: Configure Alerts

1. In Sentry, go to **Alerts** → **Create Alert**
2. Set up:
   - **Alert name:** Critical Production Errors
   - **When:** An issue is first seen
   - **Filter:** level:error OR level:fatal
   - **Then:** Send email to your address
3. Click **Save Rule**

✅ **Sentry Setup Complete!**

---

## ⏰ Phase 3: UptimeRobot Monitoring (30 minutes)

**Why:** Know immediately if your app goes down. 5-minute checks.

### Step 1: Create UptimeRobot Account

1. Go to [uptimerobot.com](https://uptimerobot.com)
2. Sign up (free: 50 monitors, 5-minute intervals)
3. Verify email

### Step 2: Add Monitors

Click **Add New Monitor** for each:

#### Monitor 1: Main Website

- **Monitor Type:** HTTP(s)
- **Friendly Name:** Hair A.I. - Main App
- **URL:** https://yourdomain.com
- **Monitoring Interval:** 5 minutes
- **Monitor Timeout:** 30 seconds
- Click **Create Monitor**

#### Monitor 2: Supabase API

- **Monitor Type:** HTTP(s)
- **Friendly Name:** Hair A.I. - Database API
- **URL:** https://iyotklwiwyljospfqnoy.supabase.co/rest/v1/
- **Monitoring Interval:** 5 minutes
- Click **Create Monitor**

#### Monitor 3: Booking Function

- **Monitor Type:** HTTP(s)
- **Friendly Name:** Hair A.I. - Booking API
- **URL:** https://iyotklwiwyljospfqnoy.supabase.co/functions/v1/create-appointment-checkout
- **Monitoring Interval:** 5 minutes
- **Expected Status Code:** 401 (function requires auth, but 401 means it's up)
- Click **Create Monitor**

### Step 3: Configure Alert Contacts

1. Go to **My Settings** → **Alert Contacts**
2. Add your email (already verified)
3. Add SMS (optional, costs $0.0015/SMS):
   - Click **Add Alert Contact**
   - Select **SMS**
   - Enter phone number
   - Verify with code
4. Choose which monitors send to which contacts

### Step 4: Set Up Status Page (Optional)

1. Click **Status Pages** → **Add Status Page**
2. Name: **Hair A.I. Status**
3. Select all monitors
4. Choose **Friendly URL** (e.g., `hair-ai-status`)
5. Click **Create Status Page**
6. Share URL: `https://stats.uptimerobot.com/YOUR_ID`

✅ **UptimeRobot Setup Complete!**

---

## 🎉 You're Done!

You now have the 3 most critical integrations:

✅ **Google Analytics 4** - Track user behavior  
✅ **Sentry** - Catch and fix errors  
✅ **UptimeRobot** - Monitor uptime

### What to Check Daily (5 minutes)

1. **GA4 Realtime Report** - Are users active?
2. **Sentry Issues** - Any new errors?
3. **UptimeRobot Dashboard** - All green?

### What to Review Weekly (30 minutes)

1. **GA4 Engagement Report:**
   - Which pages have highest bounce rate?
   - What's the appointment conversion rate?
   - Where do users drop off?

2. **Sentry Issues:**
   - Resolve or ignore each error
   - Look for patterns (browser, device, page)

3. **UptimeRobot Logs:**
   - Any downtime events?
   - Average response times trending up?

---

## 🚀 Next Steps

After these 3 are stable (1-2 weeks), add:

1. **Zapier** - Automate workflows ([Setup Guide](https://zapier.com/learn/getting-started-guide/))
2. **Mixpanel** - Deeper user behavior ([Setup Guide](https://docs.mixpanel.com/docs/quickstart))
3. **SendGrid** - Better email deliverability ([Migration Guide](https://docs.sendgrid.com/for-developers))

See `ECOSYSTEM_REPORT.md` and `RECOMMENDED_INTEGRATIONS.json` for full roadmap.

---

## ❓ Troubleshooting

### GA4 Not Tracking

**Problem:** No data in Realtime report  
**Solutions:**

1. Check console for errors: `Failed to load resource: net::ERR_BLOCKED_BY_CLIENT` → Disable ad blocker
2. Verify Measurement ID is correct
3. Check `import.meta.env.PROD` is `true` in production
4. Wait 24-48 hours for full data processing

### Sentry Not Catching Errors

**Problem:** Test error doesn't appear in Sentry  
**Solutions:**

1. Check DSN is correct
2. Verify `import.meta.env.PROD` is `true`
3. Check browser console for Sentry errors
4. Try throwing error in `setTimeout(() => { throw new Error('test'); }, 100)`

### UptimeRobot False Alarms

**Problem:** Getting down alerts but site is up  
**Solutions:**

1. Increase **Monitor Timeout** to 60 seconds
2. Check **Expected Status Code** (for API monitors, 401 is OK)
3. Whitelist UptimeRobot IPs if you have firewall
4. Contact UptimeRobot support if persistent

---

## 📞 Need Help?

- **Lovable Discord:** [discord.lovable.dev](https://discord.lovable.dev)
- **Email:** support@lovable.dev
- **Documentation:** [docs.lovable.dev](https://docs.lovable.dev)

For service-specific help:

- **GA4:** [support.google.com/analytics](https://support.google.com/analytics)
- **Sentry:** [docs.sentry.io](https://docs.sentry.io)
- **UptimeRobot:** [uptimerobot.com/kb](https://uptimerobot.com/kb)
