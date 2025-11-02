# Deployment Guide

## Overview
This guide covers deploying hA.I.r to production, including web hosting, mobile app stores, and post-deployment configuration.

---

## Quick Deploy (Web)

### Prerequisites
- ✅ Lovable Cloud enabled
- ✅ All tests passing (`npm test && npm run test:e2e`)
- ✅ Production secrets configured (see Environment Variables section)
- ✅ Database migrations applied

### Deploy Steps

1. **Click "Publish" button** in Lovable editor (top-right)
2. **Confirm deployment** - Review changes summary
3. **Wait for build** - Usually ~2 minutes
4. **Verify deployment** - Check staging URL (yourapp.lovable.app)

**That's it!** Your app is live with:
- ✅ Global CDN (fast worldwide)
- ✅ Automatic SSL certificate
- ✅ Backend integrated (Lovable Cloud)

---

## Post-Deployment Checklist

### 1. Database Indexes (CRITICAL - Do this first!)

**Run these SQL commands in Lovable Cloud backend:**

```sql
-- Appointments table (most queried)
CREATE INDEX IF NOT EXISTS appointments_stylist_date_idx 
ON appointments(stylist_id, date);

CREATE INDEX IF NOT EXISTS appointments_client_date_idx 
ON appointments(client_id, date);

CREATE INDEX IF NOT EXISTS appointments_status_idx 
ON appointments(status);

-- AI chat messages (frequent history queries)
CREATE INDEX IF NOT EXISTS ai_chat_messages_user_created_idx 
ON ai_chat_messages(user_id, created_at DESC);

-- Messages (if using messaging feature)
CREATE INDEX IF NOT EXISTS messages_sender_created_idx 
ON messages(sender_id, created_at DESC);
```

**Why this matters:**
- Without indexes: Dashboard loads in 3-5 seconds ❌
- With indexes: Dashboard loads in <500ms ✅

### 2. Data Retention Policies (Optional but Recommended)

**Automatically clean up old data:**

```sql
-- Delete AI chat messages older than 90 days
CREATE OR REPLACE FUNCTION cleanup_old_ai_messages()
RETURNS void AS $$
BEGIN
  DELETE FROM ai_chat_messages
  WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Schedule cleanup (run monthly)
-- (Set up cron job in Lovable Cloud)
```

### 3. Error Tracking (Highly Recommended)

**Option 1: Sentry (Recommended)**
```bash
# Already installed in project
# Just add your DSN to secrets:
SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
```

**Option 2: Google Analytics 4**
```typescript
// Already configured in src/lib/analytics.ts
// Just add your measurement ID:
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### 4. Webhook Configuration

**Stripe Webhook (for payments):**
1. Go to Stripe Dashboard → Webhooks
2. Add endpoint: `https://iyotklwiwyljospfqnoy.supabase.co/functions/v1/stripe-webhook`
3. Select events: `payment_intent.succeeded`, `subscription.updated`, `subscription.deleted`
4. Copy webhook secret to Lovable secrets (already done if you followed setup)

**Resend Webhook (for email tracking):**
1. Go to Resend Dashboard → Webhooks
2. Add endpoint: `https://iyotklwiwyljospfqnoy.supabase.co/functions/v1/resend-webhook`
3. Select events: `email.delivered`, `email.bounced`, `email.opened`

---

## Custom Domain Setup

### Connecting Your Domain

1. **In Lovable:**
   - Go to Project → Settings → Domains
   - Click "Add Custom Domain"
   - Enter your domain (e.g., `hairai.com` or `app.hairai.com`)

2. **In Your DNS Provider:**
   - Add CNAME record:
     - **Name:** `@` (for root) or `app` (for subdomain)
     - **Value:** `cname.lovable.app`
     - **TTL:** 3600
   - Wait 5-60 minutes for DNS propagation

3. **Verify in Lovable:**
   - Click "Verify DNS" button
   - Once verified, SSL certificate auto-issued (1-5 minutes)

**Result:** Your app now accessible at `https://yourdomain.com` ✅

---

## Mobile App Deployment

### iOS (App Store)

**Prerequisites:**
- Apple Developer Account ($99/year)
- Xcode 15+ (macOS required)
- App Store Connect access

**Build Steps:**
```bash
# 1. Build web assets
npm run build

# 2. Sync to Capacitor
npx cap sync ios

# 3. Open Xcode
npx cap open ios

# 4. In Xcode:
# - Select "Any iOS Device" target
# - Product → Archive
# - Distribute App → App Store Connect
# - Upload for TestFlight

# 5. Submit for review in App Store Connect
```

**App Store Requirements:**
- App icon (1024x1024px)
- Screenshots (5.5", 6.5", 12.9" sizes)
- Privacy policy URL
- App description (4000 chars max)

### Android (Google Play)

**Prerequisites:**
- Google Play Developer Account ($25 one-time)
- Android Studio 2023+

**Build Steps:**
```bash
# 1. Build web assets
npm run build

# 2. Sync to Capacitor
npx cap sync android

# 3. Open Android Studio
npx cap open android

# 4. In Android Studio:
# - Build → Generate Signed Bundle / APK
# - Choose "Android App Bundle" (AAB)
# - Create/select keystore
# - Build release variant

# 5. Upload AAB to Google Play Console
# - Create app in Play Console
# - Upload AAB under "Production"
# - Fill out store listing
# - Submit for review
```

**Play Store Requirements:**
- Feature graphic (1024x500px)
- Screenshots (min 2, max 8)
- App icon (512x512px)
- Privacy policy URL
- Content rating questionnaire

---

## Environment Variables

### Required Secrets (Already Configured in Lovable Cloud)

**Backend (Edge Functions):**
```bash
SUPABASE_URL=https://iyotklwiwyljospfqnoy.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUz...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUz... # (secret)

RESEND_API_KEY=re_xxx # Email delivery
STRIPE_SECRET_KEY=sk_live_xxx # Payments
STRIPE_WEBHOOK_SECRET=whsec_xxx # Webhook verification
```

**Frontend (Vite):**
```bash
VITE_SUPABASE_URL=https://iyotklwiwyljospfqnoy.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUz...
VITE_SUPABASE_PROJECT_ID=iyotklwiwyljospfqnoy
```

### Optional Secrets

```bash
# Error tracking
SENTRY_DSN=https://xxx@sentry.io/xxx

# Analytics
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# AI (not needed - using Lovable AI)
# OPENAI_API_KEY=sk-xxx # NOT REQUIRED
```

---

## Monitoring

### Production Health Checks

**1. Lovable Cloud Backend**
- URL: Click "View Backend" in Lovable
- Check: Edge function logs, database queries, storage usage

**2. Error Tracking (Sentry)**
- URL: https://sentry.io/organizations/{your-org}/projects/
- Alerts: Configure for >10 errors/minute

**3. Analytics (Google Analytics)**
- URL: https://analytics.google.com
- Key metrics: Active users, page views, conversions

**4. Uptime Monitoring (Optional)**
- Service: UptimeRobot (free tier)
- Monitor: https://yourdomain.com/api/health

---

## Rollback Strategy

### Web Deployment
**Option 1: Revert in Lovable**
1. Click project name → Version History
2. Find last known good version
3. Click "Restore this version"
4. Redeploy

**Option 2: Git Revert** (if using GitHub integration)
```bash
git revert HEAD
git push origin main
# Lovable auto-deploys
```

### Database Migrations
**Create a down migration:**
```sql
-- supabase/migrations/YYYYMMDDHHMMSS_rollback_feature.sql

-- Reverse previous migration
DROP TABLE IF EXISTS new_feature;

-- Restore old behavior
-- (Add specific rollback SQL)
```

### Mobile Apps
**iOS:** Submit hotfix build to App Store (~24-48 hours review)
**Android:** Submit hotfix AAB to Play Store (~2-4 hours review)

**Emergency:** Use remote config to disable broken features without app update

---

## Performance Optimization

### Target Metrics
- **LCP (Largest Contentful Paint):** <2.5s
- **CLS (Cumulative Layout Shift):** <0.1
- **INP (Interaction to Next Paint):** <200ms
- **FCP (First Contentful Paint):** <1.8s

### Optimization Checklist
- [x] Images optimized (WebP/AVIF format)
- [x] Code splitting enabled (Vite automatic)
- [x] Service worker caching (PWA)
- [x] Database indexes on hot queries
- [ ] CDN for static assets (Lovable handles this)
- [ ] Lazy load below-fold content

### Monitoring Performance
```typescript
// Already implemented in src/lib/webVitals.ts
import { onCLS, onFCP, onINP, onLCP } from 'web-vitals';

onCLS(console.log);
onFCP(console.log);
onINP(console.log);
onLCP(console.log);
```

---

## Security Checklist

### Pre-Launch Verification
- [x] RLS policies enabled on all tables
- [x] Secrets stored in Lovable Cloud (not in code)
- [x] HTTPS enforced (automatic with Lovable)
- [x] Input validation on all forms (Zod schemas)
- [x] Rate limiting on edge functions
- [x] SQL injection prevention (parameterized queries)
- [x] XSS protection (React auto-escaping)
- [ ] CSRF tokens (add if using cookies)
- [ ] Security headers (CSP, X-Frame-Options)

### Post-Launch Monitoring
- **Weekly:** Review Sentry errors for security issues
- **Monthly:** Audit user permissions and RLS policies
- **Quarterly:** Dependency updates (`npm audit fix`)

---

## Troubleshooting

### Issue: Build Fails
**Symptoms:** "Failed to build" error in Lovable
**Solution:**
1. Check console logs for specific error
2. Run `npm run build` locally to reproduce
3. Fix TypeScript errors or missing dependencies
4. Redeploy

### Issue: Database Connection Errors
**Symptoms:** "Unable to connect to database"
**Solution:**
1. Verify Supabase URL and keys in secrets
2. Check RLS policies (ensure user has access)
3. Review edge function logs for specific error
4. Test query in Lovable Cloud backend SQL editor

### Issue: Edge Functions Timing Out
**Symptoms:** "Function execution timed out"
**Solution:**
1. Optimize database queries (add indexes)
2. Reduce AI model complexity (use gemini-2.5-flash instead of pro)
3. Increase timeout in `supabase/config.toml`:
   ```toml
   [functions.my-function]
   timeout = 30  # seconds (default: 10)
   ```

### Issue: Mobile App White Screen
**Symptoms:** Blank screen on iOS/Android
**Solution:**
1. Check Capacitor config (`capacitor.config.ts`):
   ```typescript
   server: {
     url: 'https://yourdomain.com', // Change to production URL
     cleartext: false
   }
   ```
2. Rebuild app (`npx cap sync`)
3. Clear app cache on device

---

## Support

### Getting Help
- **Documentation:** Check `docs/` folder first
- **Backend Issues:** View logs in Lovable Cloud backend
- **Frontend Errors:** Check Sentry dashboard
- **Community:** Lovable Discord server

### Emergency Contacts
- **Critical Outage:** Use Lovable support (in-app chat)
- **Security Issues:** security@yourcompany.com
- **General Questions:** team@yourcompany.com

---

## Deployment Checklist

Use this before every production deployment:

```markdown
## Pre-Deployment
- [ ] All tests passing locally (`npm test && npm run test:e2e`)
- [ ] No console errors or warnings
- [ ] Database migrations applied and tested
- [ ] Secrets configured in Lovable Cloud
- [ ] Staging deploy successful

## Deployment
- [ ] Click "Publish" in Lovable
- [ ] Verify build completes without errors
- [ ] Check staging URL loads correctly

## Post-Deployment
- [ ] Add database indexes (if new tables)
- [ ] Configure webhooks (Stripe, Resend)
- [ ] Smoke test critical flows:
  - [ ] User signup/login
  - [ ] Dashboard loads
  - [ ] Appointment booking
  - [ ] AI features work
  - [ ] Payments process
- [ ] Check error tracking (Sentry)
- [ ] Monitor performance (Web Vitals)
- [ ] Verify mobile app (if applicable)

## Final
- [ ] Notify team of deployment
- [ ] Update changelog/release notes
- [ ] Monitor for 24 hours
```

---

**Deployment complete! 🚀**
