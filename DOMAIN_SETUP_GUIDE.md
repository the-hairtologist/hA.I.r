# 🌐 Custom Domain Setup Guide for hA.I.r

## Overview

This guide will help you set up a custom domain for your hA.I.r application. You can use a domain like `hair-ai.com` or `yoursalon.com` instead of the default Lovable subdomain.

---

## 📋 Prerequisites

Before starting, you'll need:

- [ ] A domain name purchased from a registrar (GoDaddy, Namecheap, Google Domains, etc.)
- [ ] Access to your domain's DNS settings
- [ ] A Lovable paid plan (required for custom domains)

**Recommended Domains for hA.I.r:**

- `hair-ai.com`
- `myhair-ai.com`
- `hair-assistant.com`
- `salon-ai.com`
- Or your own branded domain!

---

## 🚀 Step-by-Step Setup

### Step 1: Purchase Your Domain

If you don't have a domain yet, purchase one from:

- **Namecheap** - Affordable, easy to use (recommended)
- **Google Domains** - Clean interface, good integration
- **GoDaddy** - Popular, lots of features
- **Cloudflare** - Best for advanced users

**Pricing:** $10-15/year for most domains

---

### Step 2: Connect Domain in Lovable

1. Open your hA.I.r project in Lovable
2. Click **Settings** (top right gear icon)
3. Navigate to **Domains** tab
4. Click **Connect Domain**
5. Enter your domain name (e.g., `hair-ai.com`)
6. Click **Continue**

Lovable will provide DNS records to add at your registrar.

---

### Step 3: Configure DNS Records

You'll need to add these DNS records at your domain registrar:

#### For Root Domain (e.g., hair-ai.com)

**A Record:**

```
Type: A
Name: @ (or leave blank)
Value: 185.158.133.1
TTL: 3600 (or automatic)
```

#### For WWW Subdomain (e.g., www.hair-ai.com)

**A Record:**

```
Type: A
Name: www
Value: 185.158.133.1
TTL: 3600 (or automatic)
```

**Important:** Remove any existing A records for @ and www before adding these!

---

### Step 4: Wait for DNS Propagation

- DNS changes take **10 minutes to 48 hours** to propagate worldwide
- Most changes are live within **1-2 hours**
- Use [DNSChecker.org](https://dnschecker.org) to verify propagation
- Check if your A record points to `185.158.133.1` globally

---

### Step 5: SSL Certificate (Automatic)

Lovable automatically provisions a **free SSL certificate** (HTTPS) using Let's Encrypt:

- ✅ Usually ready within 10-30 minutes after DNS propagates
- ✅ Auto-renews every 90 days
- ✅ No configuration needed

**Verify SSL:**

- Visit `https://yourdomain.com` in browser
- Look for 🔒 padlock icon in address bar
- Certificate should show "Issued to: yourdomain.com"

---

## 🔧 Domain Registrar-Specific Guides

### Namecheap

1. Log into Namecheap account
2. Go to **Domain List** → Select your domain
3. Click **Advanced DNS**
4. Add A records:
   - Host: `@` → Value: `185.158.133.1`
   - Host: `www` → Value: `185.158.133.1`
5. Remove any existing A records or CNAME redirects
6. Save changes

**DNS Propagation:** Usually 10-30 minutes

---

### GoDaddy

1. Log into GoDaddy account
2. Go to **My Products** → **Domains**
3. Click **DNS** next to your domain
4. Add A records:
   - Name: `@` → Value: `185.158.133.1`
   - Name: `www` → Value: `185.158.133.1`
5. Delete any conflicting A or CNAME records
6. Save

**DNS Propagation:** Usually 1 hour

---

### Google Domains

1. Log into Google Domains
2. Select your domain
3. Click **DNS** in left sidebar
4. Scroll to **Custom resource records**
5. Add A records:
   - Name: `@` → Type: A → Data: `185.158.133.1`
   - Name: `www` → Type: A → Data: `185.158.133.1`
6. Remove old records if present
7. Save

**DNS Propagation:** Usually 10-30 minutes

---

### Cloudflare

1. Log into Cloudflare
2. Select your domain
3. Go to **DNS** → **Records**
4. Add A records:
   - Type: A → Name: `@` → Content: `185.158.133.1` → Proxy status: **Proxied** (orange cloud)
   - Type: A → Name: `www` → Content: `185.158.133.1` → Proxy status: **Proxied** (orange cloud)
5. Delete conflicting records
6. Save

**Important:** Cloudflare's proxy provides extra security + CDN automatically!

**DNS Propagation:** Usually instant to 5 minutes

---

## 🎯 Adding a Subdomain

Want to use `app.hair-ai.com` or `booking.yoursalon.com`?

### In Lovable:

1. First, add your root domain (hair-ai.com)
2. Check the box "I want to add a subdomain"
3. Enter your subdomain (e.g., `app`)

### In Your DNS:

Add another A record:

```
Type: A
Name: app (or your subdomain)
Value: 185.158.133.1
TTL: 3600
```

**Use Cases for Subdomains:**

- `app.hair-ai.com` - Main application
- `booking.yoursalon.com` - Public booking page
- `stylists.hair-ai.com` - Stylist directory
- `blog.hair-ai.com` - Marketing blog

---

## 🚨 Troubleshooting

### Domain Not Verifying

**Problem:** "Domain verification failed" message in Lovable

**Solutions:**

- ✅ Wait 24-48 hours for DNS propagation
- ✅ Check DNS records at [DNSChecker.org](https://dnschecker.org)
- ✅ Ensure A record points to `185.158.133.1`
- ✅ Remove conflicting records (old A records, CNAME redirects)
- ✅ Clear your browser cache
- ✅ Try incognito/private browsing mode

---

### SSL Certificate Not Working

**Problem:** "Your connection is not private" or "NET::ERR_CERT_COMMON_NAME_INVALID"

**Solutions:**

- ✅ Wait 30 minutes after DNS propagation
- ✅ Check that DNS is fully propagated worldwide
- ✅ Verify no CAA records block Let's Encrypt
- ✅ Try force refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
- ✅ Clear SSL state in browser settings

**Check CAA Records:**
If you have CAA records, ensure they allow Let's Encrypt:

```
CAA record: 0 issue "letsencrypt.org"
```

---

### Site Shows "ERR_NAME_NOT_RESOLVED"

**Problem:** Domain doesn't load at all

**Solutions:**

- ✅ DNS hasn't propagated yet - wait 24-48 hours
- ✅ A record is incorrect - should be `185.158.133.1`
- ✅ DNS server cached old records - flush DNS:
  - Windows: `ipconfig /flushdns`
  - Mac: `sudo dscacheutil -flushcache`
  - Linux: `sudo systemd-resolve --flush-caches`

---

### "This site can't be reached" Error

**Problem:** Browser can't connect to domain

**Solutions:**

- ✅ Check DNS propagation status
- ✅ Verify A record is correct
- ✅ Check if domain is active (not expired)
- ✅ Try different network (mobile data vs WiFi)
- ✅ Test with [IsItDownRightNow.com](https://www.isitdownrightnow.com)

---

### Domain Was Previously Connected to Another Project

**Problem:** "Domain already in use" error

**Solutions:**

1. Go to old Lovable project
2. Navigate to Settings → Domains
3. Click **Remove** on the domain
4. Wait 5 minutes
5. Add domain to new project

**Note:** A domain can only be connected to ONE Lovable project at a time.

---

## 📧 Email Configuration (Optional)

Want to use email@yourdomain.com?

### Option 1: Google Workspace (Recommended)

- Cost: $6/user/month
- Professional email with Gmail interface
- Setup: [Google Workspace](https://workspace.google.com)
- Add MX records provided by Google

### Option 2: Outlook/Microsoft 365

- Cost: $5/user/month
- Professional email with Outlook
- Setup: [Microsoft 365](https://www.microsoft.com/microsoft-365)

### Option 3: Zoho Mail (Budget-Friendly)

- Cost: Free for 1 user, $1/user/month for more
- Professional email hosting
- Setup: [Zoho Mail](https://www.zoho.com/mail/)

### Option 4: Domain Registrar Email

- Most registrars offer email hosting
- Usually $2-5/month per mailbox
- Check your registrar's email offerings

**Important:** Email uses different DNS records (MX records) and won't interfere with your app!

---

## ✅ Verification Checklist

Once everything is set up, verify:

- [ ] Visit `yourdomain.com` → redirects to your app
- [ ] Visit `www.yourdomain.com` → works correctly
- [ ] See 🔒 padlock in browser (HTTPS enabled)
- [ ] No certificate warnings
- [ ] All app features work on custom domain
- [ ] Domain shows correctly in browser title bar
- [ ] Links within app use custom domain
- [ ] Test on mobile devices

---

## 🌟 Branding Best Practices

### Update These After Domain Setup:

1. **Social Media Links**
   - Update Facebook, Instagram, LinkedIn
   - Use custom domain in bio links

2. **Marketing Materials**
   - Business cards
   - Flyers
   - Email signatures
   - Presentation decks

3. **App Store Listings**
   - Update "Website" field in App Store Connect
   - Update "Website" in Google Play Console
   - Update privacy policy URL
   - Update support URL

4. **Third-Party Integrations**
   - Update Stripe account settings
   - Update Google Analytics property
   - Update any API callback URLs

---

## 🎯 SEO Configuration

After domain setup, improve SEO:

### 1. Update Meta Tags

Already done in your app! ✅

- Title tags
- Meta descriptions
- OG tags for social sharing

### 2. Submit Sitemap

```
Your sitemap: https://yourdomain.com/sitemap.xml
Submit to: Google Search Console
```

### 3. Set Up Google Search Console

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Add property: `yourdomain.com`
3. Verify ownership (DNS method recommended)
4. Submit sitemap

### 4. Set Up Google Analytics (Optional)

1. Create GA4 property
2. Add tracking code (already in app if configured)
3. Link to Search Console

---

## 💰 Cost Summary

**One-Time Costs:**

- Domain registration: $10-15/year
- Lovable paid plan: $20-100/month (required for custom domain)

**Optional Ongoing:**

- Email hosting: $0-6/user/month
- CDN (Cloudflare): Free-$200/month

**Total First Year:** ~$130-500 (depending on plan)

---

## 🆘 Still Need Help?

### Lovable Support

- Email: support@lovable.dev
- Include: Your domain name and screenshot of DNS settings

### DNS Verification Tools

- [DNSChecker.org](https://dnschecker.org) - Check DNS propagation
- [WhatIsMyDNS.net](https://www.whatismydns.net) - Global DNS lookup
- [MXToolbox.com](https://mxtoolbox.com) - Comprehensive DNS tools
- [SSL Shopper](https://www.sslshopper.com/ssl-checker.html) - Verify SSL certificate

---

## 📅 Typical Timeline

**Day 1:**

- Purchase domain (5 minutes)
- Connect in Lovable (2 minutes)
- Configure DNS (5 minutes)

**Day 1-2:**

- Wait for DNS propagation (1-48 hours, usually ~2 hours)

**Day 2:**

- SSL certificate auto-provisions (10-30 minutes after DNS)
- Domain is live! 🎉

**Total Time:** Usually 2-4 hours, max 48 hours

---

**Status:** Ready for domain configuration
**Next Step:** Purchase domain or connect existing one
**Priority:** Medium (Can launch on Lovable subdomain first, add custom domain later)
