# Edge Functions Quick Reference

## Complete Function List (55 Functions)

### AI & Automation (15 functions)
| Function | Purpose | Auth | Model |
|----------|---------|------|-------|
| `ai-assistant` | Multi-purpose AI (chat, formulas, scheduling) | Required | Smart routing |
| `ai-formula-analyzer` | Analyze existing formulas | Required | gemini-2.5-flash |
| `ai-message-generator` | Generate client messages | Required | gemini-2.5-flash-lite |
| `ai-nudge-optimizer` | Optimize communication timing | Required | gemini-2.5-flash |
| `ai-schedule-predictor` | Predict optimal appointment times | Required | gemini-2.5-flash |
| `ai-smart-upsell` | Generate upsell recommendations | Required | gemini-2.5-flash |
| `ai-visual-analysis` | Analyze hair photos (advanced) | Required | gemini-2.5-pro |
| `analyze-hair-photo` | Basic hair photo analysis | Required (stylist/admin) | gemini-2.5-pro |
| `analyze-hair-video` | Analyze hair videos | Optional | gemini-2.5-pro |
| `analyze-portfolio` | Analyze stylist portfolio | Required | gemini-2.5-flash |
| `generate-ad` | Generate marketing ad copy | Optional | gemini-2.5-flash |
| `generate-formula` | Generate hair color formulas | Optional | gemini-2.5-flash |
| `generate-formula-recommendations` | AI formula suggestions | Required | gemini-2.5-flash |
| `generate-hair-image` | Generate inspiration images | Required | gemini-2.5-flash-image |
| `generate-insights` | Generate business insights | Required | gemini-2.5-flash |

### Communication & Messaging (8 functions)
| Function | Purpose | Auth | Notes |
|----------|---------|------|-------|
| `automated-appointment-followup` | Scheduled follow-ups | Internal (cron) | Runs daily |
| `auto-send-aftercare` | Send aftercare instructions | Internal (cron) | Post-appointment |
| `client-retention-campaign` | Re-engagement campaigns | Internal (cron) | Weekly |
| `enroll-in-sequence` | Enroll in email sequences | Required | Email automation |
| `hair-assistant-chat` | Real-time chat assistant | Required | Interactive |
| `no-show-prevention` | Reduce no-shows | Internal (cron) | 2x daily |
| `search-stylists` | AI web search for stylists | Required | Discovery |
| `send-invite` | Send client invitations | Required (stylist) | Email invite |

### Appointment Management (5 functions)
| Function | Purpose | Auth | Notes |
|----------|---------|------|-------|
| `create-appointment-checkout` | Create Stripe checkout for booking | Required | Deposits supported |
| `post-appointment-followup` | Follow-up surveys | Internal (cron) | 24h after |
| `smart-reminder` | Smart appointment reminders | Internal (cron) | Daily 9am |
| `ai-schedule-predictor` | Predict optimal times | Required | AI-powered |
| `automated-appointment-followup` | Multiple followup types | Internal (cron) | Reviews, rebooking |

### Payment & Subscription (6 functions)
| Function | Purpose | Auth | Notes |
|----------|---------|------|-------|
| `check-subscription` | Check Stripe subscription status | Required | Trial detection |
| `create-checkout` | Create subscription checkout | Required | 7-day trial |
| `customer-portal` | Stripe customer portal access | Required | Manage subscription |
| `stripe-webhook` | Handle Stripe events | Webhook signature | payment_intent, subscription |
| `create-appointment-checkout` | Appointment payment | Required | Deposits + full payment |
| `subscription-manager` | Manage subscriptions | Required | Internal tool |

### Calendar Integration (3 functions)
| Function | Purpose | Auth | Notes |
|----------|---------|------|-------|
| `google-calendar-oauth` | OAuth flow handler | Required | Token exchange |
| `google-calendar-sync` | Sync appointments to calendar | Required | Two-way sync |
| `google-client-config` | Get OAuth client ID | Required | Config retrieval |

### User Management (5 functions)
| Function | Purpose | Auth | Notes |
|----------|---------|------|-------|
| `delete-user-data` | GDPR data deletion | Required | Anonymizes data |
| `export-user-data` | GDPR data export | Required | All user data |
| `profile-manager` | Manage user profiles | Required | CRUD operations |
| `role-manager` | Manage user roles | Required (admin) | Admin only |
| `stylist-onboarding` | Onboard new stylists | Required | Setup wizard |

### Analytics & Insights (4 functions)
| Function | Purpose | Auth | Notes |
|----------|---------|------|-------|
| `generate-insights` | Business analytics | Required | AI-powered |
| `track-engagement` | Track user engagement | Required | Metrics |
| `conversion-optimizer` | Optimize conversions | Required (admin) | A/B testing |
| `retention-analyzer` | Analyze retention | Required | Client patterns |

### Internal & Admin (9 functions)
| Function | Purpose | Auth | Notes |
|----------|---------|------|-------|
| `notification-batch` | Bulk notifications | Internal (cron) | SMS/Email |
| `cleanup-old-data` | Database maintenance | Internal (cron) | Nightly |
| `sync-calendar-events` | Bulk calendar sync | Internal | Background |
| `rebooking-reminder-batch` | Batch rebooking reminders | Internal (cron) | Weekly |
| `birthday-reminder-batch` | Birthday messages | Internal (cron) | Daily |
| `review-request-batch` | Request reviews | Internal (cron) | Post-appointment |
| `zapier-webhook-handler` | Zapier integrations | Webhook | External triggers |
| `system-health-check` | Monitor system health | Internal (cron) | Every 15min |
| `backup-manager` | Manage backups | Internal (cron) | Daily |

---

## Quick Command Reference

### Flutter Setup
```dart
// Initialize
await Supabase.initialize(
  url: 'https://iyotklwiwyljospfqnoy.supabase.co',
  anonKey: 'YOUR_ANON_KEY',
);

// Make authenticated request
final response = await ApiClient.post(
  function: 'function-name',
  body: {'key': 'value'},
);
```

### Common Patterns

#### AI Chat
```dart
final response = await ApiClient.post(
  function: 'ai-assistant',
  body: {
    'type': 'chat',
    'messages': [
      {'role': 'user', 'content': 'How do I fix brassy hair?'}
    ],
  },
);
```

#### Generate Formula
```dart
final response = await ApiClient.post(
  function: 'ai-assistant',
  body: {
    'type': 'formula-recommendation',
    'data': {
      'natural_level': '7',
      'current_color': 'medium brown',
      'target_look': 'ash blonde',
    },
    'messages': [
      {'role': 'user', 'content': 'Generate formula'}
    ],
  },
);
```

#### Book Appointment
```dart
final response = await ApiClient.post(
  function: 'create-appointment-checkout',
  body: {
    'appointmentData': {
      'stylist_id': stylistId,
      'service_id': serviceId,
      'appointment_date': date.toIso8601String(),
    },
    'clientEmail': email,
    'clientName': name,
  },
);
// Open response['sessionUrl'] in browser
```

#### Check Subscription
```dart
final response = await ApiClient.post(
  function: 'check-subscription',
  body: {},
);
// response['subscribed'], response['in_trial']
```

---

## Error Codes

| Code | Error | Description | Retry? |
|------|-------|-------------|--------|
| 400 | Bad Request | Invalid input | No |
| 401 | Unauthorized | Missing/invalid auth | No |
| 402 | Payment Required | AI credits exhausted | No |
| 403 | Forbidden | Insufficient permissions | No |
| 404 | Not Found | Resource doesn't exist | No |
| 429 | Rate Limited | Too many requests | Yes (after delay) |
| 500 | Server Error | Internal error | Yes |
| 503 | Service Unavailable | Temporary outage | Yes |

---

## Rate Limits

| Function Type | Limit | Window |
|--------------|-------|--------|
| AI Functions | 10 req | 1 minute |
| Communication | 5 req | 1 minute |
| Payment | 20 req | 1 minute |
| General | 60 req | 1 minute |

---

## Common Request/Response Schemas

### Standard Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed"
}
```

### Standard Error Response
```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": "Additional info"
}
```

### AI Response Format
```json
{
  "response": "AI generated content",
  "model_used": "google/gemini-2.5-flash",
  "confidence": 0.95
}
```

---

## Authentication

### Get JWT Token
```dart
final session = supabase.auth.currentSession;
final token = session?.accessToken;
```

### Add to Headers
```dart
headers: {
  'Authorization': 'Bearer $token',
  'Content-Type': 'application/json',
}
```

### Check Auth Status
```dart
final user = supabase.auth.currentUser;
if (user == null) {
  // Redirect to login
}
```

---

## Cron Job Schedule

| Function | Schedule | Purpose |
|----------|----------|---------|
| `smart-reminder` | Daily 9am | 24h appointment reminders |
| `post-appointment-followup` | Daily 6pm | Review requests |
| `no-show-prevention` | 9am, 3pm | Proactive no-show prevention |
| `client-retention-campaign` | Mon 10am | Re-engagement |
| `birthday-reminder-batch` | Daily 8am | Birthday messages |
| `cleanup-old-data` | Daily 2am | Database maintenance |
| `system-health-check` | Every 15min | Monitor uptime |

---

## Security Best Practices

1. **Never expose secrets** - Always use edge functions for API calls requiring keys
2. **Validate input** - All functions use Zod validation
3. **Use RLS policies** - Database access is restricted
4. **Rate limit clients** - Implement client-side rate limiting
5. **Handle errors gracefully** - Never expose internal errors to users
6. **Log security events** - Monitor for suspicious activity

---

## Testing

### Test AI Functions
```bash
curl -X POST https://iyotklwiwyljospfqnoy.supabase.co/functions/v1/ai-assistant \
  -H "Authorization: Bearer YOUR_JWT" \
  -H "Content-Type: application/json" \
  -d '{"type":"chat","messages":[{"role":"user","content":"Test"}]}'
```

### Test Payment Flow
```bash
curl -X POST https://iyotklwiwyljospfqnoy.supabase.co/functions/v1/check-subscription \
  -H "Authorization: Bearer YOUR_JWT"
```

---

## Environment Variables

Required secrets configured in Supabase:
- `LOVABLE_API_KEY` - AI model access
- `STRIPE_SECRET_KEY` - Payment processing
- `STRIPE_WEBHOOK_SECRET` - Webhook verification
- `RESEND_API_KEY` - Email delivery
- `GOOGLE_CLIENT_ID` - Calendar OAuth
- `GOOGLE_CLIENT_SECRET` - Calendar OAuth
- `OPENAI_API_KEY` - Legacy AI (if needed)

---

## Migration & Deployment

### Deploy Edge Functions
Edge functions deploy automatically with code changes. No manual deployment needed.

### Database Migrations
Use Lovable Cloud UI or Supabase migrations:
```sql
-- Example migration
CREATE TABLE IF NOT EXISTS new_table (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Rollback
Previous versions available in Git history. Contact support for production rollbacks.

---

## Support

- **Documentation**: [Flutter Guide](./FLUTTER_API_GUIDE.md) | [API Docs](./API.md)
- **Backend Access**: Settings → Cloud in Lovable
- **Issues**: Check edge function logs in Cloud UI
- **Community**: Lovable Discord

---

**Last Updated**: 2025-01-07  
**Version**: 1.0.0  
**Total Functions**: 55+
