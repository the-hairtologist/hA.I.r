# Manual Action Items for Hair A.I.

**Last Updated**: October 11, 2025  
**Status**: Action Required

---

## 🚨 Critical Security Items (Do Immediately)

### 1. Enable Leaked Password Protection
- **Priority**: High
- **Time**: 2 minutes
- **Action**: 
  1. <lov-open-backend>Open Backend</lov-open-backend>
  2. Navigate to: Users → Auth Settings
  3. Enable "Leaked Password Protection"
- **Why**: Prevents users from using compromised passwords from data breaches
- **Status**: ❌ Not Enabled

### 2. Review Security Definer Views
- **Priority**: Medium
- **Time**: 15 minutes
- **Action**:
  1. <lov-open-backend>Open Backend</lov-open-backend>
  2. Navigate to: SQL Editor
  3. Review views using `SECURITY DEFINER`
  4. Verify they only expose intended data
- **Why**: Ensures views don't leak sensitive data
- **Status**: ⚠️ Needs Review

---

## 🔑 Required API Keys & Secrets

### Already Configured ✅
- Google Calendar (Client ID & Secret)
- Stripe (Secret Key)
- Twilio (Account SID, Auth Token, Phone Number)
- OpenAI (API Key)
- Lovable AI (Auto-configured)

### Still Needed ❌

#### 3. Resend API Key (High Priority)
- **Purpose**: Send appointment confirmations, reminders, notifications
- **Time**: 15 minutes setup + 1-24 hours DNS verification
- **Steps**:
  1. Sign up at: https://resend.com/
  2. Verify your domain (add DNS records)
  3. Generate API key
  4. <lov-open-backend>Add to Secrets</lov-open-backend> as `RESEND_API_KEY`
- **Cost**: Free (100 emails/day)
- **Status**: ❌ Required for production

#### 4. ElevenLabs API Key (Medium Priority)
- **Purpose**: 24/7 AI phone answering service
- **Time**: 10 minutes
- **Steps**:
  1. Sign up at: https://elevenlabs.io/
  2. Generate API key
  3. <lov-open-backend>Add to Secrets</lov-open-backend> as `ELEVENLABS_API_KEY`
- **Cost**: Free tier available
- **Status**: ❌ Optional but recommended

#### 5. Instagram Access Token (Medium Priority)
- **Purpose**: Portfolio management and client booking via Instagram
- **Time**: 30 minutes
- **Steps**:
  1. Convert Instagram to Business account
  2. Create Facebook Developer account
  3. Generate access token
  4. <lov-open-backend>Add to Secrets</lov-open-backend> as `INSTAGRAM_ACCESS_TOKEN`
- **Cost**: Free
- **Status**: ❌ Core feature for stylists

---

## 📱 App Store Submission (Before Launch)

### 6. Apple App Store Submission
- **Priority**: Critical for iOS users
- **Time**: 4-6 hours + 24-48 hour review
- **Cost**: $99/year
- **Prerequisites**:
  - Apple Developer Account
  - Xcode on Mac
  - App screenshots (1290x2796, 1242x2688, 1242x2208)
  - App icon (1024x1024)
  - Privacy policy URL
- **Steps**: See `APP_STORE_FINAL_PREP.md` for complete guide
- **Status**: ❌ Not Started

### 7. Google Play Store Submission
- **Priority**: Critical for Android users
- **Time**: 3-5 hours + 1-7 day review
- **Cost**: $25 one-time
- **Prerequisites**:
  - Google Play Console Account
  - Android Studio
  - App screenshots (1080x1920+)
  - Feature graphic (1024x500)
  - Privacy policy URL
- **Steps**: See `APP_STORE_FINAL_PREP.md` for complete guide
- **Status**: ❌ Not Started

---

## 🌐 Domain & Infrastructure

### 8. Custom Domain Setup
- **Priority**: High for brand identity
- **Time**: 1 hour + 48 hours DNS propagation
- **Cost**: $12-20/year
- **Steps**:
  1. Purchase domain (e.g., hair-ai.app)
  2. Configure DNS records (A and CNAME)
  3. Wait for SSL certificate provisioning
  4. Update deep link configurations
- **Recommended Registrars**: Namecheap, Google Domains, Cloudflare
- **Status**: ❌ Not Configured

### 9. Stripe Production Mode
- **Priority**: Critical before accepting real payments
- **Time**: 2-3 hours
- **Cost**: Free (transaction fees apply)
- **Steps**:
  1. Complete Stripe account verification
  2. Provide business info, tax ID, bank account
  3. Switch from test mode to live mode
  4. Update `STRIPE_SECRET_KEY` with production key
  5. Configure production webhook endpoint
- **Status**: ❌ Still in Test Mode

---

## 📊 Analytics & Monitoring

### 10. Google Analytics 4
- **Priority**: High for understanding users
- **Time**: 30 minutes
- **Cost**: Free
- **Steps**:
  1. Create GA4 property at: https://analytics.google.com/
  2. Get Measurement ID
  3. Add to environment variables as `GA4_MEASUREMENT_ID`
- **Status**: ❌ Not Configured

### 11. Sentry Error Monitoring
- **Priority**: High for debugging production issues
- **Time**: 20 minutes
- **Cost**: Free (5k errors/month)
- **Steps**:
  1. Create account at: https://sentry.io/
  2. Create project
  3. Get DSN
  4. <lov-open-backend>Add to Secrets</lov-open-backend> as `SENTRY_DSN`
- **Status**: ❌ Recommended

### 12. UptimeRobot Monitoring
- **Priority**: Medium for uptime alerts
- **Time**: 15 minutes
- **Cost**: Free (50 monitors)
- **Steps**:
  1. Create account at: https://uptimerobot.com/
  2. Add monitors for web app, API, database
  3. Set up email/SMS alerts
- **Status**: ❌ Optional

---

## 🔔 Push Notifications

### 13. Firebase Cloud Messaging
- **Priority**: Medium for user engagement
- **Time**: 1-2 hours
- **Cost**: Free
- **Steps**:
  1. Create Firebase project
  2. Add iOS app (register bundle ID, upload APNs cert)
  3. Add Android app (register package name)
  4. Get Server Key
  5. <lov-open-backend>Add to Secrets</lov-open-backend> as `FCM_SERVER_KEY`
- **Status**: ❌ Not Configured

---

## 📧 Email & SMS

### 14. Email Domain Verification (Resend)
- **Priority**: High (required for item #3)
- **Time**: 15 min setup + DNS wait
- **Steps**:
  1. Add domain to Resend
  2. Add DNS records (SPF, DKIM x3, DMARC)
  3. Wait for verification (15 min - 24 hours)
- **Status**: ❌ Waiting on item #3

### 15. Twilio Account Upgrade
- **Priority**: Medium for production SMS
- **Time**: 1 hour
- **Cost**: $1-2/month + $0.0075/SMS
- **Steps**:
  1. Verify business information
  2. Add credit ($20+ recommended)
  3. Verify sending limits increased
- **Status**: ⚠️ Currently on trial (credentials configured)

---

## 🎨 Marketing & Social

### 16. Social Media Accounts
- **Priority**: Low but good for launch
- **Time**: 1 hour total
- **Accounts to Create**:
  - Instagram: @hairai_app
  - TikTok: @hairai_app
  - Facebook Page
  - Twitter/X: @hairai_app
- **Status**: ❌ Not Created

### 17. Meta Ads Account Setup
- **Priority**: Low (when ready for paid marketing)
- **Time**: 1 hour
- **Steps**:
  1. Create Facebook Business Manager
  2. Add payment method
  3. Set up pixel and conversions
- **Status**: ❌ Not Created

---

## 📝 Legal & Compliance

### 18. Legal Document Review
- **Priority**: High before public launch
- **Time**: 2-4 hours (or hire lawyer)
- **Cost**: $0-500
- **Documents**:
  - ✅ Privacy Policy (template exists)
  - ✅ Terms of Service (template exists)
  - ✅ Cookie Policy (template exists)
- **Action Required**:
  - Review and customize for your business
  - Consider legal review
- **Status**: ⚠️ Templates exist, need customization

---

## 🎯 Priority Matrix

### Do Immediately (Before Any Testing)
1. ✅ Security Review (COMPLETED)
2. ❌ Enable Leaked Password Protection (2 min)
3. ❌ Review Security Definer Views (15 min)

### Do Before Launch (Critical)
1. ❌ Resend API Key + Domain Verification
2. ❌ Stripe Production Mode
3. ❌ Google Analytics 4
4. ❌ Custom Domain
5. ❌ Legal document customization
6. ❌ App Store submissions (iOS + Android)

### Do Within First Month (Important)
1. ❌ Sentry error monitoring
2. ❌ ElevenLabs Voice AI
3. ❌ Instagram Integration
4. ❌ Firebase push notifications
5. ❌ UptimeRobot monitoring
6. ❌ Twilio account upgrade

### Do When Ready (Optional)
1. ❌ Social media accounts
2. ❌ Meta Ads account
3. ❌ Advanced backup strategy
4. ❌ Penetration testing

---

## 💰 Cost Summary

### One-Time Costs
- Apple Developer Account: $99/year
- Google Play Console: $25 one-time
- Domain: $15/year
- Legal review (optional): $500
- **Total**: $139-639

### Monthly Costs (Estimated)
- Twilio SMS: $5-20/month
- Email (Resend): $0-20/month (free tier sufficient initially)
- Domain: $1.25/month (annual)
- **Total**: $6-41/month

### Free Tiers
- Google Analytics 4: Free
- Sentry: Free (5k errors/month)
- UptimeRobot: Free (50 monitors)
- Firebase: Free
- Stripe: Free (transaction fees only)

---

## 📋 Completion Checklist

Track your progress:

**Security** (2 items)
- [ ] Leaked password protection enabled
- [ ] Security definer views reviewed

**API Keys** (3 items)
- [ ] Resend API key added
- [ ] ElevenLabs API key added
- [ ] Instagram access token added

**App Stores** (2 items)
- [ ] iOS App Store submitted
- [ ] Google Play Store submitted

**Infrastructure** (2 items)
- [ ] Custom domain configured
- [ ] Stripe production mode activated

**Monitoring** (3 items)
- [ ] Google Analytics 4 set up
- [ ] Sentry error monitoring configured
- [ ] UptimeRobot monitors created

**Communications** (2 items)
- [ ] Email domain verified (Resend)
- [ ] Twilio account upgraded

**Legal** (1 item)
- [ ] Legal documents reviewed & customized

**Marketing** (2 items)
- [ ] Social media accounts created
- [ ] Push notifications configured

---

## 📚 Reference Documents

- `MANUAL_STEPS_CHECKLIST.md` - Detailed setup instructions
- `INTEGRATION_TASKS_TODO.md` - Integration priority list
- `APP_STORE_FINAL_PREP.md` - Complete app store guide
- `TODAY_WORK_SUMMARY.md` - Recent work completed
- `PRODUCTION_READINESS_CHECKLIST.md` - Pre-launch verification
- `LAUNCH_SUMMARY.md` - Complete launch strategy

---

## 🎯 Suggested Timeline

### Week 1 (Immediate)
- Days 1-2: Security items + Resend setup
- Days 3-4: Stripe production + Analytics
- Days 5-7: Custom domain + Testing

### Week 2 (Pre-Launch)
- Days 8-10: App store assets creation
- Days 11-12: iOS submission
- Days 13-14: Android submission

### Week 3 (Launch Prep)
- Days 15-17: Marketing setup + Social accounts
- Days 18-19: Legal review finalization
- Days 20-21: Monitoring & alerts setup

### Week 4 (Launch)
- Day 22+: App store approval + Public launch

---

**Questions?** Review the detailed guides in project documentation or contact support.

**Last Updated**: October 11, 2025  
**Next Review**: Weekly until all critical items complete
