# Edge Functions API Reference

## Overview
This document provides a comprehensive reference for all Lovable Cloud edge functions in the hA.I.r application.

## AI & Automation Functions

### `ai-chat`
**Purpose:** AI assistant interactions for stylists and clients  
**Auth:** Required  
**Model:** google/gemini-2.5-flash

**Request:**
```typescript
{
  messages: Array<{ role: 'user' | 'assistant', content: string }>,
  context?: string
}
```

**Response:**
```typescript
{
  message: string,
  confidence: number
}
```

### `ai-formula-generator`
**Purpose:** Generate hair color formulas using AI  
**Auth:** Required (stylist only)  
**Model:** google/gemini-2.5-pro

**Request:**
```typescript
{
  currentColor: string,
  desiredColor: string,
  hairCondition: string,
  clientPhoto?: File
}
```

**Response:**
```typescript
{
  formula: string,
  steps: string[],
  processingTime: string,
  warnings: string[]
}
```

## Communication Functions

### `send-invite`
**Purpose:** Send client invitation emails  
**Auth:** Required (stylist only)

**Request:**
```typescript
{
  clientEmail: string,
  stylistName: string,
  message?: string
}
```

### `notification-batch`
**Purpose:** Send bulk notifications (SMS/Email)  
**Auth:** Internal (cron only)

**Request:**
```typescript
{
  notifications: Array<{
    userId: string,
    type: 'email' | 'sms',
    template: string,
    data: Record<string, any>
  }>
}
```

## Payment Functions

### `stripe-webhook`
**Purpose:** Handle Stripe payment events  
**Auth:** Webhook signature verification  
**Events:** payment_intent.succeeded, subscription.updated, etc.

## Scheduled Functions (Cron)

### `smart-reminder`
**Purpose:** Send appointment reminders  
**Schedule:** Daily at 9am  
**Logic:** 24h before appointment

### `post-appointment-followup`
**Purpose:** Send followup surveys  
**Schedule:** Daily at 6pm  
**Logic:** 24h after appointment

### `no-show-prevention`
**Purpose:** Reduce no-shows with proactive reminders  
**Schedule:** Twice daily (9am, 3pm)

### `client-retention-campaign`
**Purpose:** Re-engage inactive clients  
**Schedule:** Weekly on Monday 10am

## Authentication

All edge functions (except webhooks) require authentication via Supabase JWT:

```typescript
const response = await fetch(FUNCTION_URL, {
  headers: {
    'Authorization': `Bearer ${session.access_token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(requestData)
});
```

## Rate Limiting

- **AI Functions:** 10 requests/minute per user
- **Communication:** 5 requests/minute per user
- **General:** 60 requests/minute per user

## Error Handling

Standard error response:
```typescript
{
  error: string,
  code: 'AUTH_ERROR' | 'RATE_LIMIT' | 'VALIDATION_ERROR' | 'INTERNAL_ERROR',
  details?: any
}
```

## Environment Variables Required

- `RESEND_API_KEY` - Email delivery
- `STRIPE_SECRET_KEY` - Payment processing
- `STRIPE_WEBHOOK_SECRET` - Webhook verification
