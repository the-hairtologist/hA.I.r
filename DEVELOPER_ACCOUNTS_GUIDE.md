# 👨‍💻 Developer Accounts Setup Guide

## Overview

This guide covers setting up all necessary developer accounts and services for launching hA.I.r to production.

---

## 📱 Mobile App Store Accounts

### 1. Apple Developer Program

**Cost:** $99/year  
**Required for:** iOS app distribution, TestFlight

#### Setup Steps:

1. **Create Apple ID** (if you don't have one)
   - Go to [appleid.apple.com](https://appleid.apple.com)
   - Click "Create Your Apple ID"
   - Use a professional email address

2. **Enroll in Apple Developer Program**
   - Visit [developer.apple.com/programs/enroll](https://developer.apple.com/programs/enroll)
   - Click "Start Your Enrollment"
   - Choose account type:
     - **Individual** - Personal developer account (recommended for most)
     - **Organization** - Requires D-U-N-S number and legal entity
   - Complete enrollment form
   - Pay $99 annual fee

3. **Wait for Approval**
   - Approval time: 24-48 hours (usually same day)
   - Check email for confirmation

4. **Access App Store Connect**
   - Go to [appstoreconnect.apple.com](https://appstoreconnect.apple.com)
   - Sign in with Apple ID
   - Accept agreements

#### What You Get:

- ✅ Publish iOS apps to App Store
- ✅ TestFlight for beta testing
- ✅ App Analytics
- ✅ Provisioning profiles & certificates
- ✅ Developer forums & support

---

### 2. Google Play Console

**Cost:** $25 one-time  
**Required for:** Android app distribution

#### Setup Steps:

1. **Create Google Account** (if you don't have one)
   - Go to [accounts.google.com](https://accounts.google.com)
   - Click "Create account"
   - Use professional email

2. **Create Developer Account**
   - Visit [play.google.com/console/signup](https://play.google.com/console/signup)
   - Sign in with Google Account
   - Accept Developer Distribution Agreement
   - Pay $25 one-time registration fee
   - Choose account type:
     - **Personal** - Individual developer
     - **Organization** - Business entity

3. **Complete Account Details**
   - Developer name (public-facing)
   - Email address (for users to contact)
   - Phone number
   - Website URL (optional but recommended)

4. **Verify Identity** (Required)
   - Google may require ID verification
   - Upload government-issued ID
   - Verification takes 1-3 days

#### What You Get:

- ✅ Publish Android apps to Play Store
- ✅ Internal testing tracks
- ✅ Play Console analytics
- ✅ User reviews management
- ✅ In-app billing setup

---

## 💳 Payment Processing

### 3. Stripe Account (Already Integrated! ✅)

**Cost:** Free to set up, 2.9% + 30¢ per transaction  
**Required for:** Payment processing in app

#### Verify Your Stripe Setup:

Your app already has Stripe integration! Just need to:

1. **Activate Stripe Account**
   - Go to [dashboard.stripe.com](https://dashboard.stripe.com)
   - Complete business information
   - Add bank account for payouts
   - Verify identity (takes 1-2 business days)

2. **Enable Payment Methods**
   - Credit/debit cards (already enabled)
   - Apple Pay (recommended for iOS)
   - Google Pay (recommended for Android)

3. **Set Up Webhooks** (Already Configured! ✅)
   - Webhook endpoint already set up in app
   - Handles: payment success, subscription events
   - Location: `/supabase/functions/stripe-webhook`

4. **Configure Subscription Products**
   - Create subscription plans in Stripe Dashboard
   - Set pricing tiers:
     - **Free Tier** - Basic features
     - **Pro Tier** - $29/month - Full features
     - **Enterprise** - Custom pricing

#### What You Get:

- ✅ Accept credit card payments
- ✅ Subscription billing
- ✅ Invoicing
- ✅ Financial reports
- ✅ Fraud protection

---

## 📧 Email Service

### 4. Transactional Email Service

**Required for:** Appointment confirmations, reminders, password resets

#### Option 1: Resend (Recommended)

**Cost:** Free up to 3,000 emails/month, then $20/month  
**Why:** Modern, developer-friendly, great deliverability

**Setup:**

1. Go to [resend.com](https://resend.com)
2. Sign up with email
3. Add domain for sending (e.g., no-reply@hair-ai.com)
4. Verify domain (add DNS records)
5. Get API key
6. Add to Lovable secrets: `RESEND_API_KEY`

**Email Types to Set Up:**

- Appointment confirmations
- Appointment reminders (24h before)
- Password reset
- Welcome email
- Invoice receipts

---

#### Option 2: SendGrid

**Cost:** Free up to 100 emails/day, then $20/month for 40K  
**Why:** Established, reliable, good analytics

**Setup:**

1. Go to [sendgrid.com](https://sendgrid.com)
2. Create account
3. Verify email address
4. Create API key
5. Add sender identity
6. Add to Lovable secrets: `SENDGRID_API_KEY`

---

#### Option 3: AWS SES (Advanced)

**Cost:** $0.10 per 1,000 emails (cheapest)  
**Why:** Scalable, reliable, good if you're already on AWS

**Setup:**

1. Create AWS account
2. Go to Amazon SES console
3. Verify domain
4. Request production access (required)
5. Create SMTP credentials
6. Configure in app

**Note:** Requires more technical setup

---

## 📊 Analytics & Monitoring

### 5. Google Analytics 4 (Optional but Recommended)

**Cost:** Free  
**Use:** Track user behavior, conversions

#### Setup:

1. Go to [analytics.google.com](https://analytics.google.com)
2. Create account
3. Create GA4 property
4. Add data stream (Web)
5. Get Measurement ID (G-XXXXXXXXXX)
6. Add to app environment variables

**Already Configured:** Your app has analytics.ts ready to use!

---

### 6. Sentry (Optional - Error Tracking)

**Cost:** Free up to 5K errors/month  
**Use:** Real-time error tracking and performance monitoring

#### Setup:

1. Go to [sentry.io](https://sentry.io)
2. Sign up
3. Create project (React)
4. Get DSN (Data Source Name)
5. Add to app environment variables
6. Integrate with error boundaries

---

## 🔒 Security & Compliance

### 7. SSL Certificate (Already Included! ✅)

**Cost:** Free (Let's Encrypt via Lovable)  
**Status:** Automatic - no setup needed!

Your app automatically gets:

- ✅ HTTPS enabled
- ✅ Auto-renewal every 90 days
- ✅ A+ SSL rating

---

### 8. Data Protection & Privacy

#### Already Implemented! ✅

- Privacy Policy page: `/privacy`
- Terms of Service: `/terms`
- Cookie Policy: `/cookie-policy`
- Cookie consent banner
- GDPR-compliant data handling

#### Recommended Addition: Privacy Policy Generator

Use these to customize your policies:

- [TermsFeed](https://www.termsfeed.com)
- [Termly](https://termly.io)
- [PrivacyPolicies.com](https://www.privacypolicies.com)

Cost: Free-$300/year for comprehensive policies

---

## 🌐 Domain & Hosting

### 9. Custom Domain (Optional)

**Cost:** $10-15/year  
**Status:** See DOMAIN_SETUP_GUIDE.md

**Already Hosting:** Lovable provides hosting automatically! ✅

---

### 10. CDN (Optional - Advanced)

#### Cloudflare (Recommended)

**Cost:** Free plan available  
**Use:** Speed up global delivery, DDoS protection

**Setup:**

1. Sign up at [cloudflare.com](https://cloudflare.com)
2. Add your domain
3. Update nameservers at registrar
4. Configure DNS records (A record to 185.158.133.1)
5. Enable Cloudflare proxy (orange cloud)

**Benefits:**

- ✅ Faster load times globally
- ✅ DDoS protection
- ✅ Web Application Firewall (WAF)
- ✅ Analytics

---

## 🔑 API Keys & Secrets Management

### Current Secrets to Configure:

Your app already uses these (check Settings → Secrets):

- ✅ `VITE_SUPABASE_URL` (auto-configured)
- ✅ `VITE_SUPABASE_ANON_KEY` (auto-configured)
- ✅ `STRIPE_SECRET_KEY` (needs your Stripe key)

### Additional Secrets You May Need:

#### For Email Service:

```bash
RESEND_API_KEY=re_xxxxxxxxxx
# OR
SENDGRID_API_KEY=SG.xxxxxxxxxx
```

#### For OAuth (When Ready):

```bash
GOOGLE_CLIENT_ID=xxxxxxxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxxxxxxxxx
APPLE_CLIENT_ID=com.yourapp.identifier
APPLE_CLIENT_SECRET=xxxxxxxxxx
```

#### For Analytics:

```bash
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
SENTRY_DSN=https://xxxxxxxxxx@sentry.io/xxxxxxx
```

---

## ✅ Account Setup Checklist

### Essential (Required for Launch):

- [ ] **Apple Developer** ($99/year)
  - [ ] Apple ID created
  - [ ] Enrolled in program
  - [ ] Payment processed
  - [ ] App Store Connect access verified

- [ ] **Google Play Console** ($25 one-time)
  - [ ] Google account created
  - [ ] Developer account registered
  - [ ] Payment processed
  - [ ] Identity verified

- [ ] **Stripe** (Free + transaction fees)
  - [ ] Account created
  - [ ] Business information completed
  - [ ] Bank account added
  - [ ] Identity verified
  - [ ] API keys added to app

- [ ] **Email Service** (Free-$20/month)
  - [ ] Service chosen (Resend recommended)
  - [ ] Account created
  - [ ] Domain verified
  - [ ] API key added to app
  - [ ] Email templates tested

### Recommended (Enhance Experience):

- [ ] **Custom Domain** ($10-15/year)
  - [ ] Domain purchased
  - [ ] DNS configured
  - [ ] SSL verified

- [ ] **Google Analytics** (Free)
  - [ ] Account created
  - [ ] Property set up
  - [ ] Tracking ID added

- [ ] **Cloudflare** (Free)
  - [ ] Account created
  - [ ] Domain added
  - [ ] CDN enabled

### Optional (Advanced):

- [ ] **Sentry** (Free tier available)
  - [ ] Account created
  - [ ] DSN added to app

- [ ] **Google Workspace** ($6/user/month)
  - [ ] Custom email set up (support@yourdomain.com)

---

## 💰 Cost Summary

### Required Costs (Year 1):

| Service             | Cost          | Frequency       |
| ------------------- | ------------- | --------------- |
| Apple Developer     | $99           | Annual          |
| Google Play Console | $25           | One-time        |
| Stripe              | 2.9% + 30¢    | Per transaction |
| Email Service       | $0-20         | Monthly         |
| **Total Year 1**    | **~$124-364** | -               |

### Optional Costs:

| Service                  | Cost   | Frequency       |
| ------------------------ | ------ | --------------- |
| Custom Domain            | $10-15 | Annual          |
| Google Workspace         | $72    | Annual per user |
| Cloudflare Pro           | $20    | Monthly         |
| Privacy Policy Generator | $0-300 | Annual          |

---

## 📅 Setup Timeline

**Week 1:**

- Day 1: Create Apple Developer account → Wait 24-48h for approval
- Day 1: Create Google Play Console account → Wait 1-3 days for verification
- Day 1: Activate Stripe account → Wait 1-2 days for verification
- Day 2: Set up email service (instant)
- Day 3: Configure analytics (instant)

**Week 2:**

- Day 1: All accounts approved! ✅
- Day 1-2: Configure API keys and secrets
- Day 3-7: Upload apps to stores for review

**Total Setup Time:** 1-2 weeks

---

## 🆘 Need Help?

### Apple Developer Support

- **Email:** developer@apple.com
- **Phone:** 1-800-633-2152 (US)
- **Portal:** [developer.apple.com/support](https://developer.apple.com/support)

### Google Play Support

- **Help Center:** [support.google.com/googleplay/android-developer](https://support.google.com/googleplay/android-developer)
- **Email:** Via Play Console
- **Community:** [Android Developers Community](https://developer.android.com/community)

### Stripe Support

- **Email:** support@stripe.com
- **Chat:** Via dashboard (fastest)
- **Docs:** [stripe.com/docs](https://stripe.com/docs)

---

## 🎯 Next Steps

1. **Start with mobile accounts** (Apple + Google)
   - Longest approval time
   - Required for app submission

2. **Set up payment processing** (Stripe)
   - Takes 1-2 days to verify
   - Needed for monetization

3. **Configure email service** (Resend/SendGrid)
   - Quick setup
   - Essential for user communication

4. **Add custom domain** (Optional)
   - Can do anytime
   - Not blocking for launch

5. **Set up analytics** (Optional)
   - Can add post-launch
   - Helpful for growth

---

**Status:** Ready to create accounts  
**Priority:** HIGH - Start ASAP for app store submission  
**Estimated Time:** 1-2 weeks total (mostly waiting for approvals)  
**Estimated Cost:** $124-364 in year 1
