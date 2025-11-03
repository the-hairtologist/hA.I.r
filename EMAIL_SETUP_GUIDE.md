# Email Configuration Guide for hA.I.r

## Current Status ✅

**Code Updated!** All 11 edge functions now support custom domain configuration via the `FROM_EMAIL` environment variable.

**What works now:**

- ✅ Automatic fallback to sandbox domain (`onboarding@resend.dev`) for testing
- ✅ Production-ready custom domain support
- ✅ Consistent sender address across all email types

**What you need:** Configure your custom domain in Resend and add the FROM_EMAIL variable to use production email.

---

## Why Use a Custom Domain?

Using Resend's sandbox domain has limitations:

- **Limited deliverability** - May be flagged as spam
- **No branding** - Emails come from "onboarding@resend.dev" instead of your domain
- **Rate limits** - Sandbox has sending restrictions

---

## Production Email Setup (Recommended)

### Step 1: Add Your Custom Domain to Resend

1. Go to [Resend Domains Dashboard](https://resend.com/domains)
2. Click **"Add Domain"**
3. Enter your domain (e.g., `yoursalon.com` or subdomain like `mail.yoursalon.com`)
4. Click **"Add"**

### Step 2: Configure DNS Records

Resend will provide you with DNS records to add at your domain registrar:

**SPF Record** (Sender Policy Framework)

```
Type: TXT
Name: @ (or your subdomain)
Value: v=spf1 include:sendgrid.resend.com ~all
```

**DKIM Record** (DomainKeys Identified Mail)

```
Type: TXT
Name: resend._domainkey
Value: [Provided by Resend - unique to your domain]
```

**DMARC Record** (Optional but recommended)

```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none; rua=mailto:dmarc@yourdomain.com
```

### Step 3: Wait for Verification

- DNS propagation can take **24-48 hours**
- Check status at [Resend Domains](https://resend.com/domains)
- Status should show **"Verified"** when ready

### Step 4: Configure FROM_EMAIL in Lovable Cloud

Once your domain is verified in Resend:

1. Go to **Project Settings** in Lovable Cloud
2. Navigate to **Environment Variables** or **Secrets**
3. Add new variable:
   - **Name:** `FROM_EMAIL`
   - **Value:** `Your Brand <noreply@yourdomain.com>`

**Example values:**

```
Salon Name <appointments@yoursalon.com>
hA.I.r Notifications <notify@yourdomain.com>
Team at [Business] <hello@yourdomain.com>
```

4. **Redeploy your edge functions** (they will automatically pick up the new value)

---

## Quick Setup for Testing (Current Configuration)

If you're still in development and want to keep using the sandbox:

✅ **No action needed** - The app defaults to `onboarding@resend.dev`

⚠️ **Limitations:**

- Lower deliverability rates
- May end up in spam folders
- Not suitable for customer-facing production use

---

## DNS Configuration Tips

### Where to Add DNS Records?

**Popular Domain Registrars:**

- **Namecheap**: Advanced DNS → Add New Record
- **GoDaddy**: DNS Management → Add Record
- **Cloudflare**: DNS → Add Record
- **Google Domains**: DNS → Custom records

### Verify DNS Propagation

Use these tools to check if DNS records are live:

- [DNSChecker.org](https://dnschecker.org)
- [MXToolbox](https://mxtoolbox.com/dmarc.aspx)
- `dig` command: `dig TXT yourdomain.com`

---

## Troubleshooting

### Domain Not Verifying?

**Check these common issues:**

1. **Wrong DNS record format**
   - Ensure no extra spaces in values
   - Use exact values provided by Resend
   - Some registrars add domain automatically (use `@` not `yourdomain.com`)

2. **DNS not propagated yet**
   - Wait 24-48 hours
   - Check with DNS lookup tools

3. **Existing conflicting records**
   - Remove old SPF/DKIM records
   - Only one SPF record allowed per domain

4. **CNAME vs A record confusion**
   - Resend uses TXT records for verification
   - Don't add CNAME records unless specifically instructed

### Emails Going to Spam?

**Improve deliverability:**

1. ✅ **Add DMARC record** (see Step 2 above)
2. ✅ **Configure SPF properly** - Must include Resend's servers
3. ✅ **Warm up your domain** - Start with low volume, gradually increase
4. ✅ **Monitor bounces** - Check Resend dashboard for issues
5. ✅ **Use realistic "from" names** - Avoid generic names like "noreply"

---

## Best Practices

### Email Sender Address Format

**Good Examples:**

```
Your Salon Name <appointments@yoursalon.com>
Sarah's Hair Studio <bookings@sarahshair.com>
Team at [Business] <hello@yourdomain.com>
```

**Avoid:**

```
noreply@yourdomain.com (customers can't reply)
admin@yourdomain.com (too generic)
notification@gmail.com (use your domain, not Gmail)
```

### Multiple Email Types

Consider using different addresses for different purposes:

- **Appointments:** `appointments@yourdomain.com`
- **Marketing:** `newsletter@yourdomain.com`
- **Support:** `support@yourdomain.com`
- **Reminders:** `reminders@yourdomain.com`

Update the `FROM_EMAIL` variable to match your preferred sender.

---

## Code Changes Summary

**Updated Functions (11 total):**

1. auto-send-aftercare
2. automated-appointment-followup
3. automated-reminders
4. process-email-sequences
5. send-appointment-confirmation
6. send-appointment-email
7. send-appointment-reminder
8. send-automated-emails
9. send-rebooking-reminder
10. test-automated-email
11. waitlist-notifications

**Implementation:**

```typescript
// Each function now uses:
const FROM_EMAIL =
  Deno.env.get('FROM_EMAIL') || 'hA.I.r <onboarding@resend.dev>';

// Then in email sending:
await resend.emails.send({
  from: FROM_EMAIL,
  to: [recipientEmail],
  // ...
});
```

---

## Security & Compliance

### DMARC Policy Levels

Start with `p=none` to monitor, then increase strictness:

```
p=none       → Monitor only (recommended for setup)
p=quarantine → Send suspicious emails to spam
p=reject     → Block suspicious emails entirely
```

### GDPR Compliance

If serving EU customers:

- Enable region selection in Resend (choose EU region)
- Add unsubscribe links to marketing emails (already handled)
- Store consent records (client_profiles.medical_info_consent)

---

## Cost Considerations

**Resend Pricing (as of 2025):**

- Free tier: 3,000 emails/month
- Pro plan: $20/month (50,000 emails)
- Scale plan: Custom pricing

**Current Usage Estimate:**

- Appointment reminders: ~100-500/month per stylist
- Aftercare emails: ~50-200/month per stylist
- Marketing campaigns: Variable

Monitor usage at [Resend Dashboard](https://resend.com/dashboard)

---

## Support Resources

- **Resend Docs:** [resend.com/docs](https://resend.com/docs)
- **Domain Setup:** [resend.com/docs/dashboard/domains](https://resend.com/docs/dashboard/domains)
- **DNS Troubleshooting:** [resend.com/docs/knowledge-base](https://resend.com/docs/knowledge-base)
- **Resend Support:** support@resend.com

---

## Next Steps

1. ✅ **Code updated** - All functions support custom domains
2. ⏳ **Add your domain to Resend** ([Resend Domains](https://resend.com/domains))
3. ⏳ **Configure DNS records** at your registrar
4. ⏳ **Wait for verification** (24-48 hours)
5. ⏳ **Add FROM_EMAIL variable** in Project Settings
6. ⏳ **Test email sending** with your custom domain

**Questions?** Contact your development team or Resend support.
