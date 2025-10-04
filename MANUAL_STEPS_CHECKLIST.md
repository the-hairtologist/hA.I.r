# Manual Steps Checklist
## Hair A.I. - Tasks Requiring External Setup

**Version:** 1.0.0  
**Date:** 2025-10-04  
**Status:** Reference Document

---

## Overview

This document lists all manual steps that require external accounts, services, or configuration that cannot be automated through code. Complete these when ready to launch.

---

## 1. App Store Submission (iOS)

### Prerequisites
- ❌ Apple Developer Account ($99/year)
- ❌ Xcode installed on Mac
- ❌ Valid Apple ID

### Steps
1. **Enroll in Apple Developer Program**
   - Go to: https://developer.apple.com/programs/enroll/
   - Complete enrollment ($99 USD annual fee)
   - Wait for approval (1-2 days)

2. **Create App Store Connect Record**
   - Go to: https://appstoreconnect.apple.com/
   - Click "+ New App"
   - Fill in app information:
     - Name: Hair A.I.
     - Primary language: English
     - Bundle ID: app.lovable.a1a18f9db2f94d81aa8ce28408bee3a2
     - SKU: HAIRAI001

3. **Prepare App Store Listing**
   - App screenshots (required sizes):
     - 6.7" iPhone: 1290x2796
     - 6.5" iPhone: 1242x2688
     - 5.5" iPhone: 1242x2208
   - App icon (1024x1024px, no transparency)
   - App description (max 4000 chars)
   - Keywords (max 100 chars)
   - Privacy policy URL
   - Support URL

4. **Submit for Review**
   - Build and archive app in Xcode
   - Upload to App Store Connect
   - Complete export compliance info
   - Submit for review (typical review time: 24-48 hours)

**Estimated Time:** 4-6 hours  
**Cost:** $99/year

---

## 2. Google Play Store Submission (Android)

### Prerequisites
- ❌ Google Play Console Account ($25 one-time fee)
- ❌ Android Studio installed

### Steps
1. **Create Google Play Developer Account**
   - Go to: https://play.google.com/console/signup
   - Pay $25 registration fee
   - Complete account setup

2. **Create App Listing**
   - Click "Create app"
   - Fill in app details:
     - App name: Hair A.I.
     - Default language: English
     - App type: App
     - Category: Beauty
     - Package name: app.lovable.a1a18f9db2f94d81aa8ce28408bee3a2

3. **Prepare Store Listing**
   - App screenshots (at least 2):
     - Phone: 1080x1920 to 7680x4320
     - Tablet (optional): 1920x1080 to 7680x4320
   - Feature graphic: 1024x500
   - App icon: 512x512
   - Short description (max 80 chars)
   - Full description (max 4000 chars)
   - Privacy policy URL

4. **Generate Signed APK/AAB**
   - Create upload keystore in Android Studio
   - Build signed bundle
   - Upload to internal testing track first
   - Promote to production after testing

5. **Submit for Review**
   - Complete content rating questionnaire
   - Set pricing (free)
   - Select countries
   - Submit for review (typical review time: 1-7 days)

**Estimated Time:** 3-5 hours  
**Cost:** $25 one-time

---

## 3. Custom Domain Setup

### Prerequisites
- ❌ Domain name purchased (e.g., hair-ai.app)
- ❌ Access to domain DNS settings

### Steps
1. **Purchase Domain**
   - Recommended: Namecheap, Google Domains, or Cloudflare
   - Search for: hair-ai.app or similar
   - Cost: ~$12-20/year

2. **Configure DNS**
   - Log in to domain registrar
   - Add A records or CNAME:
     ```
     Type: A
     Name: @
     Value: [Vercel IP]
     
     Type: CNAME
     Name: www
     Value: [Your Vercel domain]
     ```

3. **Set Up SSL Certificate**
   - Vercel automatically provisions SSL
   - Wait for DNS propagation (up to 48 hours)

4. **Update App Links**
   - Update deep link configuration files
   - Update all URLs in code from staging to production

**Estimated Time:** 1 hour (+ 48h DNS propagation)  
**Cost:** $12-20/year

---

## 4. Stripe Production Mode

### Prerequisites
- ❌ Verified Stripe account

### Steps
1. **Complete Stripe Account Verification**
   - Go to: https://dashboard.stripe.com/
   - Click "Activate your account"
   - Provide business information:
     - Business type
     - Tax ID (EIN or SSN)
     - Bank account details
     - Identity verification

2. **Switch to Live Mode**
   - Toggle from "Test mode" to "Live mode"
   - Get production API keys
   - Update environment variables:
     ```
     STRIPE_SECRET_KEY=[live key]
     STRIPE_PUBLISHABLE_KEY=[live key]
     ```

3. **Configure Webhooks**
   - Add production webhook endpoint
   - Update webhook secret

4. **Set Up Payout Schedule**
   - Choose daily, weekly, or monthly payouts
   - Verify bank account

**Estimated Time:** 2-3 hours  
**Cost:** Free (Stripe fees apply to transactions)

---

## 5. Email Service Setup (Resend/SendGrid)

### Prerequisites
- ❌ Domain ownership for sending emails

### Steps
1. **Create Resend Account**
   - Go to: https://resend.com/
   - Sign up for free tier (100 emails/day)

2. **Verify Domain**
   - Add domain to Resend
   - Add DNS records provided:
     - SPF record
     - DKIM records (3 records)
     - DMARC record
   - Wait for verification (15 minutes - 24 hours)

3. **Generate API Key**
   - Create API key in dashboard
   - Add to Supabase secrets:
     ```
     RESEND_API_KEY=[your key]
     ```

4. **Test Email Delivery**
   - Send test email from app
   - Check spam folder if not received
   - Monitor delivery rates

**Estimated Time:** 1-2 hours (+ DNS verification)  
**Cost:** Free tier: 100/day, Paid: $20/month for 50k emails

---

## 6. SMS Service Setup (Twilio)

### Prerequisites
- ❌ Phone number for verification

### Steps
1. **Create Twilio Account**
   - Go to: https://www.twilio.com/
   - Sign up and verify phone

2. **Purchase Phone Number**
   - Buy a phone number ($1-2/month)
   - Verify it can send SMS

3. **Get Credentials**
   - Copy Account SID
   - Copy Auth Token
   - Add to Supabase secrets:
     ```
     TWILIO_ACCOUNT_SID=[sid]
     TWILIO_AUTH_TOKEN=[token]
     TWILIO_PHONE_NUMBER=[+1234567890]
     ```

4. **Upgrade Account**
   - Verify business for higher limits
   - Add credit ($20+ recommended)

**Estimated Time:** 1 hour  
**Cost:** $1-2/month + SMS fees (~$0.0075/message)

---

## 7. Analytics Setup

### Google Analytics 4
- ❌ Create GA4 property
- ❌ Get Measurement ID
- ❌ Add to environment variables

**See:** `ANALYTICS_SETUP.md` for detailed instructions

**Estimated Time:** 30 minutes  
**Cost:** Free

### Sentry Error Monitoring
- ❌ Create Sentry account
- ❌ Create project
- ❌ Get DSN
- ❌ Add to environment variables

**Estimated Time:** 20 minutes  
**Cost:** Free tier: 5k errors/month

---

## 8. Push Notifications

### Firebase Cloud Messaging
1. **Create Firebase Project**
   - Go to: https://console.firebase.google.com/
   - Create new project: Hair A.I.

2. **Add iOS App**
   - Register bundle ID
   - Download GoogleService-Info.plist
   - Upload APNs certificate

3. **Add Android App**
   - Register package name
   - Download google-services.json

4. **Get Server Key**
   - Copy Server Key from Project Settings
   - Add to Supabase secrets

**Estimated Time:** 1-2 hours  
**Cost:** Free

---

## 9. Monitoring Setup

### UptimeRobot
- ❌ Create account: https://uptimerobot.com/
- ❌ Add monitors for:
  - Web app
  - API endpoints
  - Database
- ❌ Set up email/SMS alerts

**Estimated Time:** 30 minutes  
**Cost:** Free tier: 50 monitors

---

## 10. Backup & Disaster Recovery

### Supabase Backups
1. **Enable Point-in-Time Recovery**
   - Go to Supabase Dashboard > Settings > Database
   - Enable PITR (paid feature)
   - Cost: ~$100/month additional

2. **Set Up Automated Exports**
   - Create edge function for nightly exports
   - Store in separate storage bucket
   - Implement retention policy

3. **Document Recovery Procedures**
   - Create runbook for database restore
   - Test recovery process quarterly

**Estimated Time:** 2-3 hours  
**Cost:** Varies based on backup strategy

---

## 11. Legal Documents

### Privacy Policy
- ✅ Template provided in project
- ❌ Review and customize for your business
- ❌ Get legal review (recommended)

### Terms of Service
- ✅ Template provided in project
- ❌ Review and customize for your business
- ❌ Get legal review (recommended)

### Cookie Policy
- ✅ Template provided in project
- ❌ Verify compliance with GDPR/CCPA

**Estimated Time:** 2-4 hours (without lawyer)  
**Cost:** $0-500 (if hiring lawyer for review)

---

## 12. Marketing Setup

### Social Media Accounts
- ❌ Create Instagram: @hairai_app
- ❌ Create TikTok: @hairai_app
- ❌ Create Facebook Page
- ❌ Create Twitter/X: @hairai_app

### Meta Ads Account
- ❌ Create Facebook Business Manager
- ❌ Add payment method
- ❌ Create initial campaigns

### Google Ads
- ❌ Create Google Ads account
- ❌ Link to GA4
- ❌ Set up conversion tracking

**Estimated Time:** 3-4 hours  
**Cost:** Variable (ad spend)

---

## 13. CI/CD Pipeline

### GitHub Actions
- ✅ Basic workflow exists
- ❌ Configure secrets in GitHub
- ❌ Set up branch protection rules
- ❌ Configure deployment environments

### Fastlane (Mobile)
- ❌ Install Fastlane
- ❌ Configure Matchfile for code signing
- ❌ Set up automated screenshots
- ❌ Create beta distribution lanes

**Estimated Time:** 4-6 hours  
**Cost:** Free

---

## 14. Customer Support Setup

### Support Email
- ❌ Create support@hair-ai.app
- ❌ Set up email forwarding
- ❌ Create response templates

### Help Center
- ❌ Choose platform (Intercom, Zendesk, or custom)
- ❌ Write FAQs
- ❌ Create troubleshooting guides

**Estimated Time:** 3-4 hours  
**Cost:** $0-79/month (depending on platform)

---

## 15. Security Audits

### Pre-Launch Security Review
- ❌ Run OWASP security scan
- ❌ Review all RLS policies
- ❌ Test authentication flows
- ❌ Verify data encryption

### Penetration Testing (Optional)
- ❌ Hire security firm
- ❌ Fix identified vulnerabilities
- ❌ Get security certificate

**Estimated Time:** 8-16 hours  
**Cost:** $0-5,000 (if hiring external firm)

---

## Priority Matrix

### Must Complete Before Launch
1. ✅ Legal documents reviewed
2. ❌ App Store accounts created
3. ❌ Stripe production mode activated
4. ❌ Custom domain configured
5. ❌ Analytics set up
6. ❌ Error monitoring configured

### Should Complete Within First Month
1. ❌ Push notifications enabled
2. ❌ Email service configured
3. ❌ SMS service set up
4. ❌ Social media accounts created
5. ❌ Customer support system

### Can Complete Later
1. ❌ Marketing automation
2. ❌ Advanced monitoring
3. ❌ Automated backups
4. ❌ CI/CD optimization
5. ❌ Penetration testing

---

## Total Cost Estimate

### One-Time Costs
- Apple Developer: $99
- Google Play: $25
- Domain: $15
- Legal review (optional): $0-500
- **Total:** $139-639

### Monthly Costs
- Twilio: $5-20
- Email service: $0-20
- Monitoring: $0
- Analytics: $0
- **Total:** $5-40/month

### Optional Costs
- Push notifications: Free
- Ads: Variable
- Customer support: $0-79/month
- Security audit: $5,000 one-time

---

## Next Steps

1. Review this checklist weekly
2. Prioritize items based on launch timeline
3. Assign owners for each task
4. Track completion status
5. Update estimated costs as needed

---

**Last Updated:** 2025-10-04  
**Maintained By:** Hair A.I. Team

**Questions?** Review individual setup guides in project documentation or contact your development team.
