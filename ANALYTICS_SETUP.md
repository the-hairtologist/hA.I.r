# 📊 Analytics Setup Guide

## Google Analytics 4 (GA4) Setup

### Step 1: Create GA4 Property
1. Go to [Google Analytics](https://analytics.google.com/)
2. Click **Admin** (bottom left gear icon)
3. In the **Property** column, click **Create Property**
4. Enter property name: **hA.I.r App**
5. Select timezone and currency
6. Click **Next** and complete setup

### Step 2: Get Measurement ID
1. In your GA4 property, go to **Admin** → **Data Streams**
2. Click **Add stream** → **Web**
3. Enter website URL: `https://your-domain.com`
4. Enter stream name: **hA.I.r Web App**
5. Click **Create stream**
6. Copy the **Measurement ID** (format: `G-XXXXXXXXXX`)

### Step 3: Add to Lovable Project
1. Open your Lovable project
2. Go to **Settings** → **Environment Variables**
3. Add new variable:
   - Name: `VITE_GA4_MEASUREMENT_ID`
   - Value: `G-XXXXXXXXXX` (your measurement ID)
4. Click **Save**
5. Redeploy your app

### Step 4: Verify Installation
1. Visit your published app
2. In GA4, go to **Reports** → **Realtime**
3. Navigate around your app
4. You should see your activity in real-time!

---

## What's Already Tracked

The app automatically tracks:

### Page Views
- Every route change
- Initial page load
- Navigation events

### User Events
- **Appointments**: created, updated, completed, cancelled
- **Clients**: added, updated
- **Formulas**: saved, duplicated, deleted
- **Referrals**: code generated, code used
- **Milestones**: celebrations triggered
- **UI Interactions**: button clicks, form submissions

### Performance Metrics
- Core Web Vitals (LCP, FID, CLS)
- Page load times
- API response times

### User Properties
- User ID (when logged in)
- User role (client/stylist/admin)
- Subscription status

---

## Viewing Your Data

### Key Reports to Check

1. **Realtime** - See live activity
2. **Engagement** → **Pages and screens** - Most visited pages
3. **Engagement** → **Events** - All tracked events
4. **User attributes** - User properties
5. **Tech** → **Browser** - Device and browser data

### Custom Reports

Create custom reports for:
- Appointment conversion rate
- Client retention metrics
- Feature adoption rates
- Referral program performance

---

## Privacy & Compliance

### What We Track
- ✅ Anonymous user IDs
- ✅ Page views and navigation
- ✅ Feature usage (no PII)
- ✅ Performance metrics

### What We DON'T Track
- ❌ Personal information (names, emails)
- ❌ Client data
- ❌ Formula details
- ❌ Payment information

### GDPR/CCPA Compliance
- Users can opt-out via browser settings
- No personally identifiable information is collected
- Data retention follows GA4 defaults (14 months)

---

## Troubleshooting

### Analytics Not Working?

1. **Check Measurement ID**: 
   - Verify format is `G-XXXXXXXXXX`
   - Confirm it's added to environment variables

2. **Check Browser Console**:
   - Open DevTools (F12)
   - Look for GA4 errors
   - Verify `gtag` function exists

3. **Check Ad Blockers**:
   - Ad blockers may prevent GA4
   - Test in incognito mode

4. **Verify Deployment**:
   - Environment variables only work after redeployment
   - Redeploy your app after adding GA4 ID

### Still Not Working?

Check the browser console for:
```
GA4 not configured or invalid
```

This means either:
- `VITE_GA4_MEASUREMENT_ID` is not set
- The measurement ID format is invalid

---

## Advanced Configuration

### Custom Events

You can track custom events using:

```typescript
import { trackEvent } from '@/lib/analytics';

trackEvent('custom_event_name', {
  category: 'Custom Category',
  label: 'Custom Label',
  value: 123,
});
```

### User Identification

To identify users (logged-in):

```typescript
import { identifyUser } from '@/lib/analytics';

identifyUser(userId, {
  role: 'stylist',
  subscription: 'premium',
});
```

### Page Tracking

Page views are tracked automatically, but you can manually track:

```typescript
import { trackPageView } from '@/lib/analytics';

trackPageView('/custom-page', 'Custom Page Title');
```

---

## Support

- **GA4 Help**: https://support.google.com/analytics
- **Lovable Docs**: https://docs.lovable.dev/
- **Analytics Library**: `src/lib/analytics.ts`

---

**Your analytics are ready to go! Just add your GA4 Measurement ID and start tracking. 📈**