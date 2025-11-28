# Analytics & Error Monitoring Setup Guide

This guide will help you complete the final setup steps for Google Analytics 4 (GA4) and Sentry error monitoring.

## ✅ Already Completed

- ✅ **robots.txt** - Updated to allow search engine crawlers
- ✅ **sitemap.xml** - Updated with correct domain URLs
- ✅ **PWA Icons** - Generated professional app icons (192px and 512px)
- ✅ **Analytics Code** - Already integrated in the application
- ✅ **Error Tracking Code** - Already integrated in the application

## 🔧 Remaining Setup (Requires External Accounts)

### 1. Google Analytics 4 Setup

**Why:** Track user behavior, page views, conversions, and marketing performance.

**Steps:**

1. **Create GA4 Account** (if you don't have one):
   - Go to [https://analytics.google.com](https://analytics.google.com)
   - Sign in with your Google account
   - Click "Start measuring" or "Admin" → "Create Account"

2. **Create a GA4 Property**:
   - In Admin, click "Create Property"
   - Property name: `hA.I.r - Hair Salon Platform`
   - Select your timezone and currency
   - Click "Next"

3. **Get Your Measurement ID**:
   - After creating the property, you'll see a "Measurement ID" like `G-XXXXXXXXXX`
   - Copy this ID

4. **Add to Your Project**:
   - Open your project settings in Lovable
   - Add a new secret called `VITE_GA4_MEASUREMENT_ID`
   - Paste your Measurement ID (e.g., `G-XXXXXXXXXX`)
   - Save the secret

5. **Verify Installation**:
   - After deploying, visit your live site
   - In GA4, go to Reports → Realtime
   - You should see yourself as an active user within 30 seconds

**Free Tier:** GA4 is completely free with no usage limits for standard websites.

---

### 2. Sentry Error Monitoring Setup

**Why:** Automatically capture and track errors, crashes, and performance issues in production.

**Steps:**

1. **Create Sentry Account**:
   - Go to [https://sentry.io/signup](https://sentry.io/signup)
   - Sign up for a free account

2. **Create a New Project**:
   - Click "Create Project"
   - Platform: Select **"React"**
   - Alert frequency: Choose your preference (default is fine)
   - Project name: `hair-ai-platform`
   - Click "Create Project"

3. **Get Your DSN**:
   - After creating the project, you'll see installation instructions
   - Look for the **DSN (Data Source Name)** - it looks like:
     ```
     https://xxxxxxxxxxxxx@o1234567.ingest.sentry.io/1234567
     ```
   - Copy this entire URL

4. **Add to Your Project**:
   - Open your project settings in Lovable
   - Add a new secret called `VITE_SENTRY_DSN`
   - Paste your DSN URL
   - Save the secret

5. **Verify Installation**:
   - After deploying, you can trigger a test error
   - In Sentry, go to Issues
   - You should see errors appear within seconds

**Free Tier:**

- 5,000 errors per month
- 10,000 performance units per month
- Unlimited projects
- 1 user

**Paid Plans:** Start at $26/month for 50,000 errors

---

## 📊 What Gets Tracked Automatically

Once you add these keys, the following will be tracked automatically:

### Google Analytics 4:

- ✅ Page views on all routes
- ✅ User signups and logins
- ✅ Appointment bookings
- ✅ Formula generation
- ✅ Feature usage
- ✅ Search queries
- ✅ Purchase conversions
- ✅ User engagement time

### Sentry Error Monitoring:

- ✅ JavaScript errors
- ✅ Unhandled promise rejections
- ✅ React component errors
- ✅ API call failures
- ✅ Performance issues
- ✅ User session replays

---

## 🎯 Optional: Enhanced Tracking

### Mixpanel (Advanced User Analytics)

If you want more detailed user behavior tracking beyond GA4:

1. Sign up at [https://mixpanel.com](https://mixpanel.com)
2. Create a project
3. Get your Project Token
4. Add secret: `VITE_MIXPANEL_TOKEN`

**Free Tier:** 20M events/month

---

## ⚙️ Current Status

| Feature            | Status   | Action Required               |
| ------------------ | -------- | ----------------------------- |
| SEO (robots.txt)   | ✅ Fixed | None                          |
| Sitemap            | ✅ Fixed | None                          |
| PWA Icons          | ✅ Fixed | None                          |
| GA4 Integration    | ⚠️ Ready | Add `VITE_GA4_MEASUREMENT_ID` |
| Sentry Integration | ⚠️ Ready | Add `VITE_SENTRY_DSN`         |

---

## 📝 Quick Setup Checklist

- [ ] Create GA4 account and property
- [ ] Add `VITE_GA4_MEASUREMENT_ID` secret in Lovable project settings
- [ ] Create Sentry account and project
- [ ] Add `VITE_SENTRY_DSN` secret in Lovable project settings
- [ ] Deploy your application
- [ ] Verify GA4 is receiving data (check Realtime report)
- [ ] Verify Sentry is receiving errors (trigger a test error)

---

## 🚀 Ready to Launch!

Once you add the GA4 Measurement ID and Sentry DSN:

1. Your site will be **fully SEO-optimized** ✅
2. All **analytics will be tracked** ✅
3. **Errors will be monitored** ✅
4. **PWA icons will display correctly** ✅

You can skip these steps and launch now if you want - you can always add tracking later without affecting functionality!

---

## Need Help?

- **GA4 Help:** [https://support.google.com/analytics](https://support.google.com/analytics)
- **Sentry Help:** [https://docs.sentry.io](https://docs.sentry.io)
- **Lovable Secrets:** Project Settings → Secrets
