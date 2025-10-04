# Analytics Setup Guide
## Hair A.I. - Google Analytics 4 & Monitoring

**Version:** 1.0.0  
**Date:** 2025-10-04

---

## Overview

This guide walks through setting up analytics and monitoring for Hair A.I. across web and mobile platforms.

---

## 1. Google Analytics 4 (GA4) Setup

### Step 1: Create GA4 Property
1. Go to [Google Analytics](https://analytics.google.com/)
2. Click **Admin** (gear icon in bottom left)
3. Click **Create Property**
4. Enter property details:
   - Property name: **Hair A.I.**
   - Reporting time zone: Your timezone
   - Currency: Your currency
5. Click **Next** and complete business details
6. Click **Create**

### Step 2: Get Measurement ID
1. In your new property, go to **Admin > Data Streams**
2. Click **Add stream** > **Web**
3. Enter website URL: `https://your-domain.com`
4. Stream name: **Hair A.I. Web**
5. Click **Create stream**
6. Copy the **Measurement ID** (format: `G-XXXXXXXXXX`)

### Step 3: Add Measurement ID to Project
1. Go to your project **Settings**
2. Add environment variable:
   ```
   VITE_GA4_MEASUREMENT_ID=G-XXXXXXXXXX
   ```
3. Redeploy your app

### Step 4: Initialize Analytics
Analytics is already integrated in `src/lib/analytics.ts`. Initialize it in your `App.tsx`:

```typescript
import { initAnalytics } from '@/lib/analytics';
import { useEffect } from 'react';

function App() {
  useEffect(() => {
    initAnalytics();
  }, []);
  
  // ... rest of your app
}
```

### Step 5: Verify Data Collection
1. Open your site
2. Go to GA4 > **Reports** > **Realtime**
3. You should see your visit appear within 30 seconds

---

## 2. Custom Events Tracking

### Already Implemented Events

The following events are ready to use:

**Authentication:**
```typescript
import { analytics } from '@/lib/analytics';

analytics.signUp('email');
analytics.login('google');
analytics.logout();
```

**Appointments:**
```typescript
analytics.appointmentBooked(stylistId, serviceId);
analytics.appointmentCanceled(appointmentId);
analytics.appointmentRescheduled(appointmentId);
```

**Formulas:**
```typescript
analytics.formulaCreated(formulaId);
analytics.formulaViewed(formulaId);
analytics.formulaShared(formulaId);
```

**AI Features:**
```typescript
analytics.aiChatStarted();
analytics.aiFormulaGenerated();
```

**Payments:**
```typescript
analytics.subscriptionStarted('premium');
analytics.paymentCompleted(29.99, 'USD');
```

**Discovery:**
```typescript
analytics.stylistSearched('blonde specialist');
analytics.stylistViewed(stylistId);
```

**Engagement:**
```typescript
analytics.messagesSent(conversationId);
analytics.reviewWritten(5);
analytics.portfolioImageUploaded();
```

**Errors:**
```typescript
analytics.error('payment_failed', 'Stripe checkout error');
```

### Page View Tracking

Track navigation automatically:

```typescript
import { trackPageView } from '@/lib/analytics';
import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';

function App() {
  const location = useLocation();
  
  useEffect(() => {
    trackPageView(location.pathname, document.title);
  }, [location]);
}
```

---

## 3. Sentry Error Monitoring Setup

### Step 1: Create Sentry Account
1. Go to [sentry.io](https://sentry.io/)
2. Sign up for free account
3. Click **Create Project**
4. Select **React** as platform
5. Name it **Hair A.I.**
6. Click **Create Project**

### Step 2: Get DSN
1. After project creation, copy the **DSN** (Data Source Name)
2. Format: `https://xxxxx@xxxxx.ingest.sentry.io/xxxxx`

### Step 3: Install Sentry (Optional - Already Configured)
If not already installed:
```bash
npm install @sentry/react @sentry/browser
```

### Step 4: Add DSN to Project
1. Go to project **Settings**
2. Add environment variable:
   ```
   VITE_SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
   ```
3. Redeploy your app

### Step 5: Initialize Sentry
Update `src/main.tsx` or `src/App.tsx`:

```typescript
import * as Sentry from "@sentry/react";

if (import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration(),
    ],
    tracesSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    environment: import.meta.env.DEV ? 'development' : 'production',
  });
}
```

### Step 6: Wrap Your App with Error Boundary
```typescript
import * as Sentry from "@sentry/react";

const SentryRoutes = Sentry.withSentryRouting(Routes);

function App() {
  return (
    <Sentry.ErrorBoundary fallback={<ErrorFallback />}>
      <SentryRoutes>
        {/* Your routes */}
      </SentryRoutes>
    </Sentry.ErrorBoundary>
  );
}
```

---

## 4. Mixpanel Setup (Optional)

### Step 1: Create Mixpanel Account
1. Go to [mixpanel.com](https://mixpanel.com/)
2. Sign up for free
3. Create a new project: **Hair A.I.**
4. Copy the **Project Token**

### Step 2: Add Token to Project
```
VITE_MIXPANEL_TOKEN=your_token_here
```

### Step 3: Initialize Mixpanel
Add to `src/lib/analytics.ts`:

```typescript
import mixpanel from 'mixpanel-browser';

if (MIXPANEL_TOKEN) {
  mixpanel.init(MIXPANEL_TOKEN, {
    debug: import.meta.env.DEV,
    track_pageview: true,
  });
}
```

---

## 5. UptimeRobot Monitoring Setup

### Step 1: Create UptimeRobot Account
1. Go to [uptimerobot.com](https://uptimerobot.com/)
2. Sign up for free (50 monitors included)
3. Click **Add New Monitor**

### Step 2: Configure Web Monitor
1. **Monitor Type:** HTTP(s)
2. **Friendly Name:** Hair A.I. Web App
3. **URL:** `https://your-domain.com`
4. **Monitoring Interval:** 5 minutes (free tier)
5. Click **Create Monitor**

### Step 3: Configure API Monitor
1. Click **Add New Monitor**
2. **Monitor Type:** HTTP(s)
3. **Friendly Name:** Hair A.I. API
4. **URL:** `https://your-supabase-url.supabase.co/rest/v1/`
5. Add **Authorization** header with anon key
6. Click **Create Monitor**

### Step 4: Set Up Alerts
1. Click **My Settings** > **Alert Contacts**
2. Add your email or phone
3. Each monitor will now alert you if downtime detected

### Step 5: Create Status Page (Optional)
1. Go to **Public Status Pages**
2. Click **Add New Status Page**
3. Name: **Hair A.I. Status**
4. Select your monitors
5. Customize design
6. Copy public URL: `https://stats.uptimerobot.com/xxxxx`

---

## 6. Key Metrics to Track

### User Acquisition
- Sign-ups per day/week/month
- Sign-up source (organic, paid ads, referral)
- Sign-up conversion rate

### User Engagement
- Daily Active Users (DAU)
- Monthly Active Users (MAU)
- Session duration
- Pages per session
- Feature usage (appointments, formulas, AI chat)

### Business Metrics
- Appointments booked per day
- Average appointment value
- Subscription conversion rate
- Monthly Recurring Revenue (MRR)
- Churn rate

### Performance Metrics
- Page load time
- API response time
- Error rate
- Crash-free rate (mobile)

### Funnel Analysis
1. **Sign-up funnel:**
   - Landing page → Sign up → Complete profile → First action
2. **Booking funnel:**
   - Search stylist → View profile → Select service → Book → Payment
3. **Subscription funnel:**
   - View pricing → Click subscribe → Checkout → Success

---

## 7. Creating Custom Dashboards

### GA4 Dashboard
1. Go to **Explore** in GA4
2. Click **Blank**
3. Add segments:
   - All Users
   - Mobile Users
   - Stylists
   - Clients
4. Add visualizations:
   - Line chart: Daily active users
   - Bar chart: Top pages
   - Table: Event counts

### Setting Up Conversion Goals
1. Go to **Admin** > **Events**
2. Mark these as conversions:
   - `appointment_booked`
   - `subscription_started`
   - `sign_up`
   - `purchase`

---

## 8. Mobile Analytics (iOS & Android)

### Firebase Analytics (Recommended for Mobile)
1. Create Firebase project
2. Add iOS and Android apps
3. Download `google-services.json` (Android) and `GoogleService-Info.plist` (iOS)
4. Place files in respective native directories
5. Firebase will automatically collect mobile-specific metrics

### Mobile-Specific Events
- App opens
- Screen views
- Crash-free sessions
- App version adoption
- Device types and OS versions

---

## 9. Cost Estimates

### Free Tier Limits
- **GA4:** Unlimited (free forever)
- **Sentry:** 5,000 errors/month (free)
- **Mixpanel:** 100,000 events/month (free)
- **UptimeRobot:** 50 monitors, 5-min checks (free)

### Paid Tiers (If Needed)
- **Sentry:** $26/month for 50K errors
- **Mixpanel:** $25/month for 100M events
- **UptimeRobot:** $7/month for 1-min checks

---

## 10. Privacy Compliance

### GDPR Compliance
1. Add analytics consent in cookie banner
2. Enable GA4 anonymization:
   ```typescript
   gtag('config', GA4_MEASUREMENT_ID, {
     anonymize_ip: true,
   });
   ```
3. Add data retention settings in GA4
4. Provide opt-out mechanism

### User Data Deletion
Add script to delete user data from analytics:
```typescript
const deleteUserData = async (userId: string) => {
  // GA4 user deletion API call
  // Mixpanel user deletion API call
  // Clear from Supabase
};
```

---

## 11. Testing Analytics

### Development Testing
1. Open browser DevTools > Console
2. Look for `[Analytics]` logs
3. Trigger events (sign up, book appointment)
4. Verify events appear in GA4 Realtime view

### Production Testing
1. Use GA4 DebugView:
   - Install [Google Analytics Debugger](https://chrome.google.com/webstore/detail/google-analytics-debugger/jnkmfdileelhofjcijamephohjechhna)
   - Open your site
   - Check DebugView in GA4
2. Check Sentry for any initialization errors

---

## 12. Automation & Alerts

### Weekly Reports
Set up automated weekly reports:
1. GA4: **Admin** > **Custom Reports**
2. Schedule email delivery
3. Include key metrics

### Anomaly Detection
1. GA4: **Admin** > **Insights**
2. Enable automatic insights
3. Get alerts for unusual activity

### Slack Notifications (Optional)
Integrate Sentry and UptimeRobot with Slack:
1. Create Slack webhook
2. Add webhook to Sentry alerts
3. Add webhook to UptimeRobot notifications

---

## Summary

**Immediate Setup (Free):**
1. ✅ GA4 property created
2. ✅ Measurement ID added to project
3. ✅ Custom events implemented
4. ✅ Sentry account created
5. ✅ UptimeRobot monitors configured

**Total Setup Time:** ~2 hours  
**Monthly Cost:** $0 (free tier)  
**Next Review:** Track metrics weekly for first month

---

**Last Updated:** 2025-10-04  
**Maintained By:** Hair A.I. Team
