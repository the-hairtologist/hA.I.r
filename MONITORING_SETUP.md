# Monitoring & Observability Setup
**hA.I.r - System Health & Performance Monitoring**

---

## Monitoring Philosophy

**Goal:** Detect and resolve issues before users report them.

**Key Principles:**
1. **Proactive > Reactive:** Alert before failure
2. **User-Centric:** Monitor what users experience
3. **Actionable:** Every alert should have a runbook
4. **Minimal Noise:** Avoid alert fatigue

---

## Service Level Objectives (SLOs)

### Target SLOs

| Metric | Target | Measurement | Alert Threshold |
|--------|--------|-------------|-----------------|
| **Uptime** | 99.5% | Monthly | < 99.0% |
| **API Latency (p95)** | < 500ms | Real-time | > 1000ms |
| **Database Query Time (p95)** | < 100ms | Real-time | > 300ms |
| **Crash-Free Sessions** | > 99.5% | Daily | < 99.0% |
| **Checkout Success Rate** | > 99% | Real-time | < 95% |
| **Edge Function Errors** | < 1% | Hourly | > 5% |

### Error Budget

- **Monthly downtime allowance:** 216 minutes (99.5% uptime)
- **Weekly downtime allowance:** 50 minutes
- **Daily downtime allowance:** 7 minutes

If error budget exhausted: **Freeze non-critical deployments**

---

## Built-In Monitoring (Lovable/Supabase)

### Supabase Dashboard Metrics

**Access:** https://supabase.com/dashboard/project/[project-id]

#### Database
- Active connections
- Query performance
- Table sizes
- Index usage
- Replication lag

**How to Monitor:**
1. Go to Database → Query Performance
2. Sort by execution time
3. Identify slow queries (> 100ms)
4. Add indexes or optimize queries

#### Edge Functions
- Invocation count
- Error rate
- Execution time
- Memory usage

**How to Check:**
```bash
# View recent logs
supabase functions logs [function-name] --tail

# Search for errors
supabase functions logs [function-name] --search "error"
```

#### Authentication
- Sign-ups per day
- Sign-ins per day
- Failed login attempts
- User growth

---

## Recommended External Monitoring

### 1. Application Performance Monitoring (APM)

#### Sentry (Recommended)

**Setup:**
```bash
npm install @sentry/react @sentry/browser
```

**Configuration:**
```typescript
// src/lib/sentry.ts
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "https://[key]@[org].ingest.sentry.io/[project]",
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0, // 100% of transactions
  replaysSessionSampleRate: 0.1, // 10% of sessions
  replaysOnErrorSampleRate: 1.0, // 100% of errors
});
```

**What to Monitor:**
- JavaScript errors
- React component errors
- API failures
- Performance metrics
- User sessions (Session Replay)

**Cost:** Free for 5K errors/month, then $26/month

---

### 2. Uptime Monitoring

#### UptimeRobot (Free)

**Setup:**
1. Sign up at https://uptimerobot.com
2. Add monitors:
   - Main app: https://yourdomain.com
   - API health: https://yourdomain.com/api/health
   - Supabase: https://[project].supabase.co
3. Configure alerts (email, SMS, Slack)

**Check Interval:** 5 minutes

**Alert Conditions:**
- HTTP status ≠ 200
- Response time > 5 seconds
- 2 consecutive failures

---

### 3. Real User Monitoring (RUM)

#### LogRocket (Optional)

**Features:**
- Session replay
- Network monitoring
- Console logs
- User identification
- Performance metrics

**Setup:**
```typescript
import LogRocket from 'logrocket';

LogRocket.init('[app-id]');

// Identify users
LogRocket.identify(user.id, {
  name: user.full_name,
  email: user.email,
});
```

**Cost:** Free for 1K sessions/month, then $99/month

---

### 4. Analytics & Usage

#### Google Analytics 4 (Free)

**Setup:**
```html
<!-- index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

**Track Key Events:**
```typescript
import { log } from '@/lib/analytics';

// Custom events
log.event('appointment_booked', {
  stylist_id: stylist.id,
  service_type: service.name,
  value: service.price
});

log.event('formula_created', {
  client_id: client.id
});
```

**Key Metrics to Track:**
- Daily/Monthly active users (DAU/MAU)
- Appointment booking rate
- User retention (cohort analysis)
- Feature usage
- Conversion funnel

---

### 5. Database Monitoring

#### Supabase Database Insights (Built-in)

**Access:** Supabase Dashboard → Database → Query Performance

**Metrics to Watch:**
- Slow queries (> 100ms)
- Missing indexes
- Table bloat
- Connection pool saturation

**Alerts:**
```sql
-- Create custom alerts in Supabase
CREATE OR REPLACE FUNCTION notify_slow_query()
RETURNS trigger AS $$
BEGIN
  IF NEW.execution_time > 1000 THEN
    PERFORM pg_notify('slow_query', 
      json_build_object(
        'query', NEW.query,
        'time', NEW.execution_time
      )::text
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

## Edge Function Monitoring

### Built-in Logging

**View Logs:**
```bash
# Real-time logs
supabase functions logs [function-name] --tail

# Filter by level
supabase functions logs [function-name] --level error

# Time range
supabase functions logs [function-name] --since 1h
```

### Custom Metrics

```typescript
// supabase/functions/[function]/index.ts
const startTime = Date.now();

try {
  // Function logic
  const result = await processRequest(body);
  
  // Log success
  console.log(JSON.stringify({
    level: 'info',
    function: 'function-name',
    duration: Date.now() - startTime,
    success: true
  }));
  
  return new Response(JSON.stringify(result), {
    status: 200,
    headers: corsHeaders
  });
  
} catch (error) {
  // Log error
  console.error(JSON.stringify({
    level: 'error',
    function: 'function-name',
    duration: Date.now() - startTime,
    error: error.message,
    stack: error.stack
  }));
  
  return new Response(JSON.stringify({ error: 'Internal error' }), {
    status: 500,
    headers: corsHeaders
  });
}
```

---

## Mobile App Monitoring (Capacitor)

### Crash Reporting

#### Sentry for Mobile

```typescript
// src/main.tsx (mobile)
import * as Sentry from "@sentry/capacitor";

Sentry.init({
  dsn: "https://[key]@[org].ingest.sentry.io/[project]",
  enableNative: true,
  enableNativeCrashHandling: true,
});
```

### Performance Monitoring

```typescript
import { Capacitor } from '@capacitor/core';

if (Capacitor.isNativePlatform()) {
  // Track app launch time
  const launchTime = performance.now();
  
  Sentry.addBreadcrumb({
    category: 'performance',
    message: `App launched in ${launchTime}ms`,
    level: 'info'
  });
}
```

---

## Alert Configuration

### Alert Priorities

**P0 - Critical (Wake Up):**
- Complete system outage
- Payment processing failure
- Database unavailable
- Security breach detected

**P1 - High (Respond Immediately):**
- Error rate > 5%
- Latency > 2 seconds (p95)
- Crash rate > 1%
- Edge function failures

**P2 - Medium (Respond Within Hours):**
- Slow queries (> 1 second)
- Memory usage > 80%
- Disk space > 80%
- Rate limit warnings

**P3 - Low (Review Daily):**
- Warning logs
- Performance degradation
- User-reported issues
- Feature usage anomalies

### Alert Channels

**Email:** For P2/P3 alerts
**SMS:** For P0/P1 alerts
**Slack:** For all alerts + status updates
**PagerDuty:** For on-call rotation (optional)

---

## Dashboards

### Recommended Dashboard Layout

#### Overview Dashboard
- System status (green/yellow/red)
- Active users (last 24h)
- Error rate (last 1h)
- API latency (p50, p95, p99)
- Database health
- Edge function status

#### User Experience Dashboard
- Page load time
- Time to interactive
- Checkout success rate
- Appointment booking rate
- User session duration
- Bounce rate

#### Business Metrics Dashboard
- New signups (daily)
- Active stylists
- Active clients
- Appointments booked (daily)
- Revenue (daily)
- Retention rate (7-day, 30-day)

---

## Health Check Endpoint

**Create Health Check:**

```typescript
// supabase/functions/health-check/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const checks = {
    timestamp: new Date().toISOString(),
    status: "healthy",
    checks: {}
  };

  try {
    // Database check
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    
    const { error } = await supabase.from("profiles").select("id").limit(1);
    checks.checks.database = error ? "unhealthy" : "healthy";
    
    // Overall status
    if (Object.values(checks.checks).some(v => v === "unhealthy")) {
      checks.status = "unhealthy";
    }
    
    return new Response(JSON.stringify(checks), {
      status: checks.status === "healthy" ? 200 : 503,
      headers: { "Content-Type": "application/json" }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({
      status: "unhealthy",
      error: error.message
    }), {
      status: 503,
      headers: { "Content-Type": "application/json" }
    });
  }
});
```

**Monitor Health Endpoint:**
- URL: https://[project].supabase.co/functions/v1/health-check
- Check interval: 1 minute
- Alert if: Status code ≠ 200 for 2 consecutive checks

---

## Incident Management

### Incident Severity Levels

**SEV-1 (Critical):**
- Complete service outage
- Payment processing down
- Data breach
- Response time: Immediate
- Escalation: CEO, CTO, all hands

**SEV-2 (High):**
- Partial service outage
- Performance severely degraded
- Critical feature broken
- Response time: < 1 hour
- Escalation: Tech lead, on-call engineer

**SEV-3 (Medium):**
- Non-critical feature broken
- Slow performance
- High error rate
- Response time: < 4 hours
- Escalation: Assigned engineer

**SEV-4 (Low):**
- Minor bugs
- Cosmetic issues
- User complaints
- Response time: Next business day
- Escalation: Product team

### Incident Response Workflow

1. **Detect:** Monitoring alert triggered
2. **Acknowledge:** Engineer acknowledges within SLA
3. **Investigate:** Review logs, metrics, recent changes
4. **Mitigate:** Apply quick fix or rollback
5. **Resolve:** Verify issue resolved
6. **Document:** Write post-mortem (SEV-1/2 only)
7. **Learn:** Implement preventive measures

---

## Post-Mortem Template

```markdown
# Incident Post-Mortem: [Title]

**Date:** 2025-XX-XX
**Severity:** SEV-X
**Duration:** X hours
**Impact:** X users affected

## Summary
[Brief description of what happened]

## Timeline
- HH:MM - Issue detected
- HH:MM - Team notified
- HH:MM - Root cause identified
- HH:MM - Fix deployed
- HH:MM - Verified resolved

## Root Cause
[Technical explanation]

## Resolution
[What fixed it]

## Impact
- Users affected: X
- Revenue impact: $X
- Reputation impact: [Low/Medium/High]

## Action Items
1. [ ] Preventive measure 1 (Owner: X, Due: DATE)
2. [ ] Preventive measure 2 (Owner: X, Due: DATE)
3. [ ] Improve monitoring (Owner: X, Due: DATE)

## Lessons Learned
[What we learned from this incident]
```

---

## Cost Estimates

### Monitoring Stack (Monthly)

**Free Tier:**
- Supabase monitoring: $0 (included)
- UptimeRobot: $0 (5 monitors)
- Google Analytics 4: $0
- **Total: $0/month**

**Starter Tier:**
- Sentry: $26/month
- UptimeRobot Pro: $0 (sufficient)
- Google Analytics 4: $0
- **Total: $26/month**

**Growth Tier:**
- Sentry Team: $80/month
- LogRocket: $99/month
- UptimeRobot: $0
- Datadog (optional): $15/host/month
- **Total: $179-194/month**

---

## Monitoring Checklist

### Daily
- [ ] Check Supabase dashboard for errors
- [ ] Review Sentry error trends
- [ ] Verify uptime status (UptimeRobot)
- [ ] Check edge function logs

### Weekly
- [ ] Review SLO compliance
- [ ] Analyze slow database queries
- [ ] Check user growth trends
- [ ] Review customer support tickets for patterns

### Monthly
- [ ] Generate uptime report
- [ ] Review and update alerts
- [ ] Analyze performance trends
- [ ] User retention analysis
- [ ] Cost optimization review

---

## Resources

### Documentation
- [Supabase Monitoring](https://supabase.com/docs/guides/platform/performance)
- [Sentry Docs](https://docs.sentry.io/)
- [Google Analytics 4](https://support.google.com/analytics/)

### Tools
- [Supabase Dashboard](https://supabase.com/dashboard)
- [UptimeRobot](https://uptimerobot.com)
- [Security Headers Check](https://securityheaders.com)

---

**Last Updated:** 2025-10-04  
**Next Review:** 2025-11-04  
**Version:** 1.0.0
