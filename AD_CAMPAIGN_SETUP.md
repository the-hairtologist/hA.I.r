# 🎯 Advertising Campaign Setup Guide

**Complete guide for running paid ads and tracking conversions for hA.I.r beta launch**

---

## 📊 Analytics & Tracking Setup

### 1. Google Analytics 4 Setup (REQUIRED)

**Step 1: Create GA4 Property**
1. Go to https://analytics.google.com
2. Create new property: "hA.I.r Production"
3. Copy your Measurement ID (format: `G-XXXXXXXXXX`)

**Step 2: Add to Project**
Add to your `.env` file:
```bash
VITE_GA4_MEASUREMENT_ID=G-XXXXXXXXXX
```

**Step 3: Verify Installation**
- The app will automatically inject GA4 scripts
- Check browser console for "Analytics initialized successfully"
- Test events in GA4 Realtime view

### 2. Conversion Tracking Events

**Already Implemented & Tracking:**
```javascript
// User Acquisition
analytics.signup('email', 'stylist')          // When user signs up
analytics.login('email')                       // When user logs in
analytics.profileCompleted('stylist')         // Profile setup complete

// Key Conversions (Monetization)
analytics.subscriptionTrialStarted('dashboard')  // Free trial started
analytics.subscriptionConverted('pro', 29.99)    // Paid subscription
analytics.purchaseCompleted('pro', 29.99)        // Payment success

// Engagement Milestones
analytics.firstServiceCreated({ name, price, duration })
analytics.firstClientAdded()
analytics.appointmentBooked(serviceType, amount, isFirst: true)

// Feature Usage
analytics.formulaGenerated('color')
analytics.aiChatStarted()
analytics.aiFormulaGenerated()
```

### 3. Facebook Pixel Setup (Optional)

**For Facebook/Instagram Ads:**

Add to `index.html` (inside `<head>`):
```html
<!-- Facebook Pixel Code -->
<script>
  !function(f,b,e,v,n,t,s)
  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window, document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', 'YOUR_PIXEL_ID');
  fbq('track', 'PageView');
</script>
<!-- End Facebook Pixel Code -->
```

**Track Custom Conversions:**
```javascript
// Add to src/lib/analytics.ts
export const trackFacebookEvent = (eventName: string, params?: any) => {
  if (typeof window !== 'undefined' && 'fbq' in window) {
    (window as any).fbq('track', eventName, params);
  }
};

// Usage
trackFacebookEvent('CompleteRegistration', { value: 0, currency: 'USD' });
trackFacebookEvent('Purchase', { value: 29.99, currency: 'USD' });
```

---

## 🔗 UTM Campaign Tracking

### Campaign URL Structure

**Base URLs for different ad platforms:**

```bash
# Google Ads
https://hair.app/?utm_source=google&utm_medium=cpc&utm_campaign=beta_launch_stylists&utm_content=ad1&utm_term=salon+management

# Facebook/Instagram Ads
https://hair.app/?utm_source=facebook&utm_medium=paid_social&utm_campaign=beta_launch_stylists&utm_content=carousel_ad

# TikTok Ads
https://hair.app/?utm_source=tiktok&utm_medium=paid_social&utm_campaign=beta_launch_stylists&utm_content=video_ad

# Email Campaign
https://hair.app/?utm_source=newsletter&utm_medium=email&utm_campaign=beta_invite&utm_content=cta_button
```

### UTM Parameter Naming Convention

**utm_source**: Where traffic comes from
- `google`, `facebook`, `instagram`, `tiktok`, `youtube`, `newsletter`

**utm_medium**: Type of marketing
- `cpc` (cost-per-click)
- `paid_social`
- `display`
- `email`
- `referral`

**utm_campaign**: Campaign name
- `beta_launch_stylists`
- `q1_2025_awareness`
- `holiday_promo`

**utm_content**: Ad variation (A/B testing)
- `ad1`, `ad2`, `carousel_ad`, `video_ad`, `cta_button`

**utm_term**: Keyword (for search ads)
- `salon+management`, `hair+stylist+app`

---

## 🎨 Ad Creative Specs

### Google Search Ads
```
Headline 1 (30 chars): "AI Salon Management App"
Headline 2 (30 chars): "Color Formulas in Seconds"
Headline 3 (30 chars): "Free 14-Day Trial"

Description 1 (90 chars): "Generate professional color formulas with AI. Manage bookings, clients & payments."
Description 2 (90 chars): "Join 1000+ stylists using hA.I.r. No credit card required."

Final URL: https://hair.app/?utm_source=google&utm_medium=cpc&utm_campaign=beta_launch
```

### Facebook/Instagram Ads
```
Primary Text (125 chars): 
"Tired of guessing color formulas? Get AI-powered precision in seconds. ✂️ 
Join 1000+ stylists. Free trial, no credit card."

Headline (40 chars): "hA.I.r - AI Salon Assistant"

Description (30 chars): "Professional formulas. Zero guesswork."

Image/Video Specs:
- Square: 1080x1080px
- Portrait: 1080x1920px (Stories)
- Landscape: 1200x628px
```

### TikTok Ads
```
Ad Text (100 chars):
"POV: You're a stylist who just discovered AI color formulas 🤯 Try hA.I.r free"

Video Specs:
- Resolution: 1080x1920px (9:16)
- Duration: 9-15 seconds
- Format: MP4
- Sound: Required
```

---

## 💰 Recommended Ad Budgets (Beta Launch)

### Phase 1: Testing (Week 1-2) - $500-1000/week
```
Google Search Ads:     $300/week  (60%)
Facebook/Instagram:    $150/week  (30%)
TikTok:               $50/week   (10%)
```

### Phase 2: Scaling (Week 3-4) - $1500-2500/week
```
Best performing platform: 70%
Second best: 20%
Testing new creatives: 10%
```

### Target Metrics
```
Cost Per Click (CPC):        $1.50 - $3.00
Cost Per Signup:            $15 - $30
Cost Per Paid Conversion:   $150 - $300
Target ROAS:                3:1 (break-even), 5:1 (profitable)
```

---

## 🎯 Targeting Strategy

### Google Ads Keywords
```
Broad Match:
- salon management software
- hair stylist app
- color formula calculator

Phrase Match:
- "salon booking app"
- "hair color formulas"
- "stylist client management"

Exact Match:
- [salon software for stylists]
- [hair color mixing app]
```

### Facebook/Instagram Targeting
```
Demographics:
- Age: 25-55
- Gender: All
- Location: USA (expand after validation)

Interests:
- Beauty & Wellness
- Hair Styling
- Salon Owner
- Cosmetology
- Paul Mitchell, Redken, Wella (brand interests)

Lookalike Audiences:
- 1% lookalike of signups (after 100+ conversions)
```

### TikTok Targeting
```
Demographics:
- Age: 21-45
- Gender: All

Interests:
- Beauty & Personal Care
- Hair Care
- Salon & Spa
- Small Business

Behaviors:
- Beauty product purchasers
- Service business owners
```

---

## 📱 Landing Page Optimization

**Current landing page is optimized with:**
- ✅ Fast loading (< 2s FCP)
- ✅ Mobile responsive
- ✅ Clear CTA buttons
- ✅ Social proof placeholders
- ✅ PWA install prompt
- ✅ SEO meta tags
- ✅ Conversion tracking

**Recommended A/B Tests:**
1. Headline variations (AI vs. Professional vs. Time-saving)
2. CTA button text ("Start Free Trial" vs. "Get Started Free")
3. Hero image (stylist vs. client vs. formula)
4. Social proof placement (top vs. bottom)

---

## 📈 Success Metrics Dashboard

**Track in Google Analytics 4:**

**Acquisition Metrics:**
- Sessions by source/medium
- New users by campaign
- Bounce rate by landing page
- Time on site by traffic source

**Conversion Metrics:**
- Sign-up conversion rate (goal: >3%)
- Profile completion rate (goal: >60%)
- Trial-to-paid conversion (goal: >20%)
- Average time to conversion

**Engagement Metrics:**
- Pages per session (goal: >3)
- Feature usage rate (formula generator, booking)
- Return visitor rate
- Session duration

**Revenue Metrics:**
- Cost per acquisition (CPA)
- Customer lifetime value (LTV)
- Return on ad spend (ROAS)
- Monthly recurring revenue (MRR)

---

## 🚀 Launch Checklist

**Before Running Ads:**
- [ ] GA4 Measurement ID added to `.env`
- [ ] Test all conversion events in GA4 Realtime
- [ ] Facebook Pixel installed (if using FB ads)
- [ ] UTM parameters added to all ad URLs
- [ ] Landing page loads in < 2 seconds
- [ ] Sign-up flow tested end-to-end
- [ ] Payment processing tested (test mode)
- [ ] Mobile experience verified on iOS/Android
- [ ] Error tracking enabled (Sentry)
- [ ] Support email/chat ready

**Week 1 Monitoring:**
- [ ] Check GA4 dashboard daily
- [ ] Monitor cost per click/signup
- [ ] Review ad quality scores
- [ ] Test new ad variations
- [ ] Respond to user feedback
- [ ] Fix any conversion blockers immediately

---

## 🆘 Troubleshooting

**Analytics not tracking?**
- Check browser console for errors
- Verify GA4 Measurement ID format
- Test in incognito mode
- Check ad blockers disabled

**Low conversion rate?**
- Check mobile experience (60%+ mobile traffic)
- Verify sign-up form works
- Test page speed (< 3s load time)
- Review error logs for issues

**High cost per click?**
- Lower bids temporarily
- Improve quality score (relevance)
- Add negative keywords
- Test different ad copy

---

## 📞 Support Contacts

**For technical issues:**
- Check DEPLOYMENT_GUIDE.md
- Check PRODUCTION_READINESS.md
- Review error logs in monitoring dashboard

**For ad performance:**
- Review GA4 dashboard
- Check ad platform analytics
- Compare week-over-week metrics

---

**Last Updated:** 2025-10-17  
**Status:** Ready for beta launch 🚀
