# 🧪 Integration Test Flow Guide

## Prerequisites

### 1. Clean Up Duplicate Secret

⚠️ **Action Required**: Remove duplicate secret from Lovable Cloud

1. Go to Backend (Cloud dashboard)
2. Navigate to Secrets
3. **DELETE**: `Stripe_webhook_secret` (mixed case)
4. **KEEP**: `STRIPE_WEBHOOK_SECRET` (all caps)

### 2. Connect Google Calendar (One-Time Setup)

1. Go to `/integrations`
2. Find **Google Calendar** card
3. Click **"Connect"** button
4. You'll be redirected to `/integrations/calendar`
5. Click **"Connect"** again
6. Authorize with Google
7. Verify you see "Connected" badge

---

## 🎯 Test Flow 1: Create Appointment (All Integrations)

### Step 1: Navigate to Appointments

```
Go to: /appointments
Click: "New Appointment" or "+" button
```

### Step 2: Fill Out Appointment Form

- **Client**: Select existing client or create new
- **Service**: Choose service type (e.g., "Color & Highlights")
- **Date & Time**: Pick future date/time
- **Duration**: 2 hours
- **Notes**: "Integration test - checking all systems"

### Step 3: Save Appointment

Click **"Create Appointment"** or **"Save"**

### Step 4: Verify Integrations ✅

#### What Should Happen Automatically:

1. **✅ Email Confirmation (Resend)**
   - Client receives email at their registered address
   - Check: Email subject, content, appointment details
   - Status: "Sent successfully" in logs

2. **✅ Google Calendar Sync**
   - Event appears in your Google Calendar
   - Check: Event title, time, location
   - Status: Event created with correct details

3. **✅ Database Record**
   - Appointment saved in database
   - Check: `/appointments` page shows new appointment
   - Status: Visible in your appointments list

---

## 🎯 Test Flow 2: Payment Integration (Stripe)

### Step 1: Create Paid Appointment

```
Go to: /book-appointment OR /client-discovery
Select: A stylist (if you're a client) or create for client (if you're stylist)
```

### Step 2: Select Service with Payment

- Choose paid service
- Price should display (e.g., "$120")
- Click **"Book with Payment"** or similar

### Step 3: Complete Stripe Checkout

Use Stripe test card:

```
Card Number: 4242 4242 4242 4242
Expiry: Any future date (e.g., 12/25)
CVC: Any 3 digits (e.g., 123)
ZIP: Any 5 digits (e.g., 12345)
```

### Step 4: Verify Payment Flow ✅

#### What Should Happen:

1. **✅ Stripe Webhook**
   - Payment processed successfully
   - Webhook triggers appointment creation
   - Check logs for `[STRIPE-WEBHOOK]` success messages

2. **✅ Appointment Created**
   - New appointment appears in `/appointments`
   - Status: "Confirmed"
   - Payment recorded

3. **✅ Email Sent**
   - Confirmation email triggered by webhook
   - Client receives payment receipt

4. **✅ Calendar Synced**
   - Paid appointment syncs to Google Calendar
   - Event shows payment status

---

## 🎯 Test Flow 3: SMS Reminders (Optional - Twilio)

### When Configured:

- 24 hours before appointment
- Client receives SMS reminder
- Check Twilio logs for delivery status

---

## 📊 Monitoring & Verification

### Check Edge Function Logs:

```
Backend → Edge Functions → View Logs

Functions to monitor:
- send-appointment-confirmation
- google-calendar-sync
- stripe-webhook
```

### Check Database:

```
Backend → Database → Tables

Tables to verify:
- appointments (new record)
- payments (payment record)
- calendar_connections (sync status)
```

### Check Email Delivery:

```
Resend Dashboard → Logs
- View sent emails
- Check open/click rates
- Verify delivery status
```

---

## ✅ Success Checklist

After creating a test appointment, verify:

- [ ] Appointment appears in `/appointments` page
- [ ] Client received confirmation email
- [ ] Event appears in Google Calendar (with correct time)
- [ ] Database has appointment record
- [ ] If paid: Payment recorded in Stripe
- [ ] If paid: Payment shows in `/finance` (for stylists)
- [ ] No errors in Edge Function logs
- [ ] Calendar connection still shows "Connected"

---

## 🐛 Troubleshooting

### Email Not Received

1. Check spam folder
2. Verify RESEND_API_KEY is set
3. Check logs: Backend → Functions → send-appointment-confirmation
4. Verify client email is correct

### Calendar Not Syncing

1. Check connection: `/integrations/calendar`
2. Reconnect if showing "Not Connected"
3. Check logs: Backend → Functions → google-calendar-sync
4. Verify OAuth permissions granted

### Stripe Payment Failed

1. Use test card: 4242 4242 4242 4242
2. Check STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET
3. Verify webhook endpoint is configured in Stripe Dashboard
4. Check logs: Backend → Functions → stripe-webhook

---

## 🎉 All Tests Passing?

If all integrations work:

1. ✅ Resend Email - Confirmed
2. ✅ Google Calendar - Connected & Syncing
3. ✅ Stripe Payments - Processing
4. ✅ Twilio SMS - Configured (optional)

**You're ready for production! 🚀**

---

## 📝 Notes

- Test appointments can be deleted after verification
- Use real email addresses you can check
- Stripe test mode ensures no real charges
- Calendar events can be deleted manually if needed
- All integrations run automatically - no manual triggers needed
