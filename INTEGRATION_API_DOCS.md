# hA.I.r Platform - API Documentation

**Version:** 1.0.0  
**Last Updated:** October 19, 2025

---

## 🔐 Authentication

All API requests require authentication via Supabase Auth tokens.

```typescript
const { data: { session } } = await supabase.auth.getSession();
const authHeader = { Authorization: `Bearer ${session.access_token}` };
```

---

## 📍 Edge Functions API

Base URL: `https://iyotklwiwyljospfqnoy.supabase.co/functions/v1`

### 1. Check Subscription Status

**Endpoint:** `/check-subscription`  
**Method:** POST  
**Auth Required:** Yes

**Description:** Validates if the authenticated user has an active Stripe subscription.

**Request:**
```typescript
await supabase.functions.invoke('check-subscription');
```

**Response:**
```json
{
  "subscribed": true,
  "subscription_end": "2025-11-15T00:00:00Z"
}
```

**Status Codes:**
- `200`: Success
- `401`: Not authenticated
- `500`: Server error

---

### 2. Create Checkout Session

**Endpoint:** `/create-checkout`  
**Method:** POST  
**Auth Required:** Yes

**Description:** Creates a Stripe checkout session for subscription with 7-day trial.

**Request:**
```typescript
const { data, error } = await supabase.functions.invoke('create-checkout');
```

**Response:**
```json
{
  "url": "https://checkout.stripe.com/c/pay/cs_test_..."
}
```

**Flow:**
1. Checks if Stripe customer exists for user email
2. Creates checkout session with trial period
3. Returns checkout URL for redirect

**Status Codes:**
- `200`: Checkout session created
- `401`: Not authenticated  
- `500`: Stripe or server error

---

### 3. Customer Portal

**Endpoint:** `/customer-portal`  
**Method:** POST  
**Auth Required:** Yes

**Description:** Creates Stripe Customer Portal session for subscription management.

**Request:**
```typescript
const { data, error } = await supabase.functions.invoke('customer-portal');
```

**Response:**
```json
{
  "url": "https://billing.stripe.com/p/session/..."
}
```

**Status Codes:**
- `200`: Portal session created
- `401`: Not authenticated
- `404`: No Stripe customer found
- `500`: Server error

---

### 4. Create Appointment Checkout

**Endpoint:** `/create-appointment-checkout`  
**Method:** POST  
**Auth Required:** No (guest booking supported)

**Description:** Creates Stripe checkout for appointment booking with deposit logic.

**Request:**
```typescript
const { data, error } = await supabase.functions.invoke('create-appointment-checkout', {
  body: {
    appointmentData: {
      stylistId: "uuid",
      serviceId: "uuid",
      appointmentDate: "2025-10-25T14:00:00Z",
      notes: "First time client"
    },
    clientEmail: "client@example.com",
    clientName: "Jane Doe"
  }
});
```

**Response:**
```json
{
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/...",
  "depositAmount": 50.00,
  "remainingBalance": 120.00
}
```

**Deposit Logic:**
- If service has `require_deposit = true`
- Deposit type can be 'percentage' or 'fixed'
- Calculates deposit amount based on service price

**Status Codes:**
- `200`: Checkout created
- `400`: Validation error
- `404`: Service not found
- `500`: Server error

---

### 5. Stripe Webhook Handler

**Endpoint:** `/stripe-webhook`  
**Method:** POST  
**Auth Required:** No (webhook signature verification)

**Description:** Processes Stripe webhook events for payment and subscription updates.

**Handled Events:**
- `checkout.session.completed` - Creates appointment after payment
- `customer.subscription.updated` - Updates subscription status
- `customer.subscription.deleted` - Handles subscription cancellation
- `invoice.payment_succeeded` - Confirms payment success

**Security:** Uses `STRIPE_WEBHOOK_SECRET` for signature verification

---

### 6. Google Calendar OAuth

**Endpoint:** `/google-calendar-oauth`  
**Method:** POST  
**Auth Required:** Yes

**Description:** Exchanges OAuth code for Google Calendar tokens.

**Request:**
```typescript
const { data, error } = await supabase.functions.invoke('google-calendar-oauth', {
  body: { code: "oauth_code_from_google" }
});
```

**Response:**
```json
{
  "success": true,
  "connectionId": "uuid"
}
```

**Security:** Tokens stored encrypted in Supabase Vault

**Status Codes:**
- `200`: Connection successful
- `401`: Not authenticated
- `400`: Invalid OAuth code
- `500`: Server error

---

### 7. Sync Calendar Event

**Endpoint:** `/sync-calendar-event`  
**Method:** POST  
**Auth Required:** Yes

**Description:** Syncs appointment to connected Google Calendar.

**Request:**
```typescript
const { data, error } = await supabase.functions.invoke('sync-calendar-event', {
  body: {
    appointmentId: "uuid",
    action: "create" // or "update" or "delete"
  }
});
```

**Response:**
```json
{
  "success": true,
  "eventId": "google_event_id"
}
```

**Status Codes:**
- `200`: Sync successful
- `401`: Not authenticated
- `404`: Appointment or calendar connection not found
- `500`: Google API or server error

---

### 8. Resend Webhook

**Endpoint:** `/resend-webhook`  
**Method:** POST  
**Auth Required:** No (webhook signature verification)

**Description:** Tracks email delivery events from Resend.

**Handled Events:**
- `email.sent` - Email delivered
- `email.delivered` - Email reached inbox
- `email.bounced` - Email bounced
- `email.opened` - Email opened by recipient
- `email.clicked` - Link clicked in email

**Tracked in:** `email_tracking` table

---

## 📊 Database Tables

### Core Tables

#### appointments
- Stores all salon appointments
- **Key Fields:** `stylist_id`, `client_id`, `appointment_date`, `status`, `service_type`
- **Statuses:** `scheduled`, `confirmed`, `in_progress`, `completed`, `cancelled`, `no_show`
- **RLS:** Client can view own, Stylist can view their appointments

#### client_profiles
- Client information and preferences
- **Key Fields:** `user_id`, `full_name`, `email`, `preferred_stylist_id`, `hair_type`
- **RLS:** Users can view/edit own profile, Stylists can view their clients

#### stylist_profiles
- Stylist business information
- **Key Fields:** `user_id`, `business_name`, `specialty`, `is_public_listing`, `booking_link`
- **RLS:** Stylists can edit own, public profiles viewable by all

#### formulas
- Hair color formulas with ingredients
- **Key Fields:** `stylist_id`, `client_id`, `formula_text`, `color_line`, `developer_volume`
- **RLS:** Stylist owns formula or has client relationship

#### stylist_services
- Services offered by stylists
- **Key Fields:** `stylist_id`, `service_name`, `price`, `duration_minutes`, `require_deposit`
- **RLS:** Public readable, stylist can edit own

#### calendar_connections
- OAuth calendar integrations
- **Key Fields:** `user_id`, `provider`, `access_token_vault_id`, `is_active`
- **Security:** Tokens stored in Supabase Vault (encrypted)
- **RLS:** User can only access own connections

---

## 🔒 Security

### Row Level Security (RLS)

All tables have RLS enabled with policies for:
- **User Isolation:** Users can only access their own data
- **Relationship-Based Access:** Stylists can access client data only if relationship exists
- **Admin Override:** Admin role can access all data

### Secret Management

All sensitive credentials stored as Supabase secrets:
- `STRIPE_SECRET_KEY` - Stripe API key
- `STRIPE_WEBHOOK_SECRET` - Webhook signature verification
- `RESEND_API_KEY` - Email sending
- `GOOGLE_CLIENT_ID` - OAuth client ID
- `GOOGLE_CLIENT_SECRET` - OAuth client secret
- `LOVABLE_API_KEY` - AI gateway access
- `OPENAI_API_KEY` - OpenAI API access

### Token Storage

Calendar OAuth tokens stored in Supabase Vault:
- Encrypted at rest
- Accessible only via security definer function
- Access logged in `calendar_token_access_log`

---

## 🎯 Common Integration Patterns

### Pattern 1: Stripe Payment Flow

```typescript
// 1. Create checkout session
const { data: checkoutData } = await supabase.functions.invoke('create-checkout');

// 2. Redirect to Stripe
window.open(checkoutData.url, '_blank');

// 3. After payment, Stripe redirects to success_url
// 4. Check subscription status
const { data: subData } = await supabase.functions.invoke('check-subscription');
```

### Pattern 2: Calendar Sync Flow

```typescript
// 1. Initiate OAuth
const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?...`;
window.location.href = authUrl;

// 2. Handle callback with code
const { data } = await supabase.functions.invoke('google-calendar-oauth', {
  body: { code: oauthCode }
});

// 3. Sync appointments
const { data: syncData } = await supabase.functions.invoke('sync-calendar-event', {
  body: { appointmentId, action: 'create' }
});
```

### Pattern 3: Real-time Appointment Updates

```typescript
const channel = supabase
  .channel('appointments')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'appointments',
    filter: `stylist_id=eq.${stylistId}`
  }, (payload) => {
    // Handle real-time updates
    console.log('Appointment updated:', payload);
  })
  .subscribe();
```

---

## ⚡ Rate Limits & Quotas

### Lovable AI Gateway
- **Rate Limit:** Per workspace
- **Error Codes:**
  - `429`: Too many requests - back off and retry
  - `402`: Payment required - add credits to workspace

### Stripe API
- **Rate Limit:** 100 requests/second
- **Recommended:** Implement exponential backoff

### Google Calendar API
- **Rate Limit:** 1M requests/day
- **Quota:** 10 queries per second per user

---

## 🐛 Error Handling

### Standard Error Response

```json
{
  "error": "Human readable error message",
  "code": "ERROR_CODE",
  "timestamp": "2025-10-19T12:00:00Z"
}
```

### Common Error Codes

- `AUTH_REQUIRED`: Missing or invalid authentication
- `INSUFFICIENT_PERMISSIONS`: User lacks required permissions
- `NOT_FOUND`: Resource not found
- `VALIDATION_ERROR`: Invalid request data
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `EXTERNAL_API_ERROR`: Third-party service error (Stripe, Google, etc.)

---

## 📱 Mobile Considerations

### Capacitor Integration

```typescript
import { App } from '@capacitor/app';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

// Check if running in native app
const isNative = Capacitor.isNativePlatform();

// Use native features when available
if (isNative) {
  await Haptics.impact({ style: ImpactStyle.Light });
}
```

### PWA Support

- Service worker enabled
- Offline queue for failed requests
- Background sync for calendar events

---

## 📚 Additional Resources

- [Lovable Cloud Documentation](https://docs.lovable.dev/features/cloud)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Google Calendar API](https://developers.google.com/calendar/api)
- [Supabase Documentation](https://supabase.com/docs)

---

## 🔄 Changelog

### v1.0.0 (October 2025)
- Initial API documentation
- All core endpoints documented
- Security patterns established
- Mobile integration notes added
