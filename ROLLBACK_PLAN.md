# Rollback & Recovery Plan

**hA.I.r - Emergency Deployment Rollback Procedures**

---

## Overview

This document outlines procedures for rolling back deployments when critical issues are detected in production.

**Rollback Decision Criteria:**

- Complete service outage (SEV-1)
- Critical security vulnerability discovered
- Data corruption or loss detected
- Payment processing failures
- Error rate > 10% for > 5 minutes
- Performance degradation > 50% from baseline

---

## Deployment Architecture

### Current Setup (Lovable/Vercel)

**Deployment Flow:**

```
Code Change → Git Push → Automatic Build → Vercel Deploy → Production
```

**Deployment Characteristics:**

- **Auto-deploy:** Yes (on main branch push)
- **Preview deploys:** Yes (on pull requests)
- **Rollback capability:** Yes (via Vercel dashboard)
- **Zero-downtime:** Yes (atomic deploys)

---

## Rollback Procedures

### 1. Frontend Rollback (Vercel)

#### Method A: Dashboard Rollback (Fastest)

**Time to Complete:** 2-3 minutes

**Steps:**

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select project: `hair-ai-app`
3. Go to **Deployments** tab
4. Find last known good deployment
5. Click **⋯** → **Promote to Production**
6. Confirm promotion

**Verification:**

```bash
# Check current deployment
curl -I https://yourdomain.com

# Should return:
# x-vercel-id: [deployment-id]
```

#### Method B: Git Revert (Safer)

**Time to Complete:** 5-10 minutes

**Steps:**

```bash
# 1. Identify bad commit
git log --oneline -10

# 2. Revert the commit
git revert [commit-hash]

# 3. Push to main
git push origin main

# 4. Vercel will auto-deploy
```

**Verification:**

- Check Vercel deployment status
- Test critical user flows
- Monitor error rates

---

### 2. Database Rollback (Supabase)

#### Scenario A: Bad Migration

**Time to Complete:** 10-20 minutes

**Steps:**

1. **Identify Migration:**

   ```sql
   SELECT * FROM supabase_migrations.schema_migrations
   ORDER BY version DESC
   LIMIT 5;
   ```

2. **Create Rollback Migration:**

   ```sql
   -- Example: Rollback added column
   ALTER TABLE public.profiles DROP COLUMN IF EXISTS new_column;
   ```

3. **Test in Staging First** (if available)

4. **Apply to Production:**
   - Use Lovable migration tool
   - Or run directly in Supabase SQL Editor

5. **Verify Data Integrity:**

   ```sql
   -- Check row counts
   SELECT COUNT(*) FROM affected_table;

   -- Check for null values
   SELECT COUNT(*) FROM affected_table WHERE critical_field IS NULL;
   ```

#### Scenario B: Data Corruption

**Time to Complete:** 30-60 minutes

**Prerequisite:** Daily Supabase backups (automatic)

**Steps:**

1. **Stop Writes:**

   ```sql
   -- Revoke INSERT/UPDATE/DELETE (emergency only)
   REVOKE INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public FROM authenticated;
   ```

2. **Assess Damage:**
   - Identify affected rows
   - Determine time window of corruption

3. **Restore Options:**

   **Option A: Point-in-Time Recovery (PITR)**
   - Available on Supabase Pro plan
   - Can restore to any point in last 7 days
   - Contact Supabase support for PITR restore

   **Option B: Partial Data Restore**

   ```sql
   -- Export affected data first
   COPY affected_table TO '/backup/corrupted_data.csv' CSV HEADER;

   -- Delete corrupted rows
   DELETE FROM affected_table WHERE created_at > '2025-10-04 12:00:00';

   -- Import from backup (if available)
   ```

4. **Re-enable Writes:**
   ```sql
   GRANT INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
   ```

---

### 3. Edge Function Rollback

#### Quick Disable (Emergency)

**Time to Complete:** 1 minute

```typescript
// Add to top of function
export default async (req: Request) => {
  // Emergency kill switch
  return new Response(
    JSON.stringify({
      error: 'Service temporarily unavailable',
    }),
    {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    }
  );
};
```

Push change → Auto-deploys in ~30 seconds

#### Code Rollback

**Time to Complete:** 3-5 minutes

```bash
# 1. Find last working version
git log supabase/functions/[function-name]/

# 2. Checkout that version
git checkout [commit-hash] -- supabase/functions/[function-name]/

# 3. Commit and push
git commit -m "Rollback [function-name] to working version"
git push origin main
```

Edge functions deploy automatically within 1-2 minutes.

---

### 4. Third-Party Service Issues

#### Stripe Payment Issues

**Symptoms:**

- Payments failing
- Webhook errors
- Subscription sync issues

**Rollback Steps:**

1. **Disable Payment Features:**

   ```typescript
   // Temporary flag in code
   const PAYMENTS_ENABLED = false;

   if (!PAYMENTS_ENABLED) {
     return { error: 'Payments temporarily unavailable' };
   }
   ```

2. **Switch to Manual Processing:**
   - Notify affected users
   - Process payments manually via Stripe dashboard
   - Log all manual transactions

3. **Monitor Stripe Status:**
   - https://status.stripe.com

#### Twilio SMS Issues

**Rollback Steps:**

1. **Disable SMS Notifications:**

   ```typescript
   const SMS_ENABLED = false;
   ```

2. **Fallback to Email:**
   ```typescript
   if (!SMS_ENABLED) {
     await sendEmailNotification(user, message);
   }
   ```

---

## Rollback Decision Tree

```
Issue Detected
    │
    ├─ Affects All Users? ─YES→ ROLLBACK IMMEDIATELY
    │                              (SEV-1)
    │
    ├─ Affects Payments? ─YES→ ROLLBACK + NOTIFY STRIPE
    │                           (SEV-1)
    │
    ├─ Data Loss Risk? ─YES→ STOP WRITES + RESTORE
    │                         (SEV-1)
    │
    ├─ Performance Issue? ─YES→ Investigate (10 min)
    │                             │
    │                             └─ Worsening? ─YES→ ROLLBACK
    │                                              (SEV-2)
    │
    └─ Minor Bug? ─YES→ Hot Fix (if < 30 min)
                         │
                         └─ Can't Fix Fast? → ROLLBACK
                                               (SEV-3)
```

---

## Testing Rollback Procedures

### Quarterly Rollback Drill

**Purpose:** Ensure team can execute rollback under pressure

**Drill Steps:**

1. **Prepare:**
   - Schedule 1-hour maintenance window
   - Notify team members
   - Prepare test deployment

2. **Execute:**
   - Deploy intentional "bug" to staging
   - Time the rollback process
   - Document issues encountered

3. **Review:**
   - Actual time vs. target time
   - What went well
   - What to improve
   - Update runbooks

**Target Times:**

- Frontend rollback: < 5 minutes
- Database rollback: < 20 minutes
- Edge function rollback: < 5 minutes
- Full system restore: < 60 minutes

---

## Communication Plan

### Internal Communication (Slack)

**Incident Channel:** `#incidents`

**Message Template:**

```
🚨 INCIDENT DETECTED
Severity: SEV-X
Impact: [Brief description]
Status: Investigating / Rolling Back / Resolved
ETA: X minutes
Runbook: ROLLBACK_PLAN.md
Lead: @engineer-name
```

### External Communication (Status Page)

**Users Should Know:**

- What's affected
- Estimated resolution time
- Workarounds (if any)

**Don't Include:**

- Technical details
- Root cause (until resolved)
- Finger-pointing

**Status Page Update Template:**

```
🔧 Service Disruption

We're experiencing issues with [feature]. Our team is
working on a fix. Estimated resolution: X minutes.

Affected: [List features]
Workaround: [If applicable]

Updates: Every 15 minutes
```

---

## Post-Rollback Actions

### Immediate (Within 1 hour)

- [ ] Verify all systems operational
- [ ] Monitor error rates return to baseline
- [ ] Check user reports
- [ ] Update status page: "Resolved"
- [ ] Notify team: "All Clear"

### Short-Term (Within 24 hours)

- [ ] Root cause analysis
- [ ] Document incident in `INCIDENTS.md`
- [ ] Identify preventive measures
- [ ] Update monitoring/alerts
- [ ] Schedule post-mortem meeting

### Long-Term (Within 1 week)

- [ ] Write post-mortem (for SEV-1/2)
- [ ] Implement fixes
- [ ] Update rollback procedures if needed
- [ ] Share learnings with team
- [ ] Improve testing coverage

---

## Rollback Automation (Future)

### Feature Flags

**Implementation:**

```typescript
// lib/featureFlags.ts
export const features = {
  PAYMENTS_ENABLED: true,
  SMS_ENABLED: true,
  AI_CHAT_ENABLED: true,
  NEW_DASHBOARD: false
};

// Usage
if (features.NEW_DASHBOARD) {
  return <NewDashboard />;
} else {
  return <OldDashboard />;
}
```

**Benefits:**

- Instant rollback without deployment
- A/B testing capability
- Gradual rollouts

### Canary Deployments (Advanced)

**Setup:**

1. Deploy to 5% of traffic
2. Monitor for 15 minutes
3. If error rate normal → 25%
4. If error rate normal → 50%
5. If error rate normal → 100%

**Abort if:**

- Error rate > 2x baseline
- Latency > 1.5x baseline
- Any crash detected

---

## Emergency Contacts

### On-Call Rotation

- **Primary:** [Engineer 1] - [Phone]
- **Secondary:** [Engineer 2] - [Phone]
- **Escalation:** [Tech Lead] - [Phone]

### External Vendors

- **Supabase Support:** support@supabase.com
- **Stripe Support:** https://support.stripe.com
- **Vercel Support:** support@vercel.com
- **Twilio Support:** help.twilio.com

### Critical Access

- **Vercel Dashboard:** [Login URL]
- **Supabase Dashboard:** [Login URL]
- **Stripe Dashboard:** [Login URL]
- **GitHub Repository:** [Repo URL]

---

## Rollback Checklist

### Before Rollback

- [ ] Confirm issue severity (SEV-1 or SEV-2)
- [ ] Identify last known good version
- [ ] Notify team in #incidents
- [ ] Update status page
- [ ] Document start time

### During Rollback

- [ ] Execute rollback procedure
- [ ] Monitor deployment progress
- [ ] Test critical paths
- [ ] Check error rates
- [ ] Verify database integrity

### After Rollback

- [ ] Confirm systems operational
- [ ] Update status page: "Resolved"
- [ ] Notify stakeholders
- [ ] Schedule post-mortem
- [ ] Document lessons learned

---

## Metrics & Targets

### Rollback Performance Metrics

**Current Baseline:**

- Mean Time to Detect (MTTD): < 5 minutes
- Mean Time to Acknowledge (MTTA): < 2 minutes
- Mean Time to Rollback (MTTR): < 10 minutes
- Mean Time to Recovery (MTTR): < 30 minutes

**Targets:**

- MTTD: < 3 minutes (improve monitoring)
- MTTA: < 1 minute (better alerting)
- Mean Rollback Time: < 5 minutes (automation)
- MTTR: < 15 minutes (faster procedures)

---

## Resources

### Documentation

- [Vercel Deployments](https://vercel.com/docs/concepts/deployments)
- [Supabase Backups](https://supabase.com/docs/guides/platform/backups)
- [Git Revert Guide](https://git-scm.com/docs/git-revert)

### Tools

- [Vercel Dashboard](https://vercel.com/dashboard)
- [Supabase Dashboard](https://supabase.com/dashboard)
- [Git History Viewer](https://github.com/yourusername/hair-ai-app/commits/main)

---

**Last Updated:** 2025-10-04  
**Next Drill:** 2026-01-04  
**Version:** 1.0.0

---

## Quick Reference Commands

```bash
# Frontend Rollback
git revert [commit-hash]
git push origin main

# Check Deployment Status
curl -I https://yourdomain.com

# View Recent Deployments
# (Vercel Dashboard → Deployments)

# Edge Function Logs
supabase functions logs [name] --tail

# Database Backup Status
# (Supabase Dashboard → Database → Backups)
```
