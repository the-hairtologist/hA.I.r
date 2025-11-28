# 🚀 Deployment Runbook

**Project**: hA.I.r - Hair Salon Management  
**Version**: 1.0.0  
**Last Updated**: 2025-01-04

---

## Overview

This runbook provides step-by-step instructions for deploying the hA.I.r application to production, including pre-deployment checks, deployment procedures, and rollback plans.

---

## 🎯 Pre-Deployment Checklist

### Code Quality

- [ ] All tests passing (`npm test`)
- [ ] No TypeScript errors (`npm run type-check`)
- [ ] No ESLint errors (`npm run lint`)
- [ ] Bundle size within limits (< 300KB main bundle)
- [ ] No console.log statements in production code

### Security

- [ ] All P0 security issues fixed (see SECURITY_REPORT.md)
- [ ] Environment variables properly configured
- [ ] Secrets stored in Supabase Vault
- [ ] HTTPS enforced
- [ ] Security headers configured
- [ ] RLS policies enabled on all tables

### Performance

- [ ] Lighthouse score > 90
- [ ] Core Web Vitals passing (LCP < 2.5s, INP < 200ms, CLS < 0.1)
- [ ] Images optimized
- [ ] Fonts preloaded

### Accessibility

- [ ] WCAG 2.1 Level AA compliance
- [ ] All images have alt text
- [ ] Keyboard navigation working
- [ ] Screen reader tested
- [ ] Color contrast passing

### SEO

- [ ] Meta tags configured
- [ ] Open Graph image created
- [ ] Sitemap.xml present
- [ ] Robots.txt configured
- [ ] Structured data implemented

### Backend

- [ ] Database migrations tested
- [ ] Edge functions deployed
- [ ] Supabase auth configured
- [ ] Email templates tested
- [ ] SMS integration tested (if applicable)

---

## 🏗️ Deployment Steps

### Step 1: Pre-Deployment Testing

```bash
# Run full test suite
npm test

# Type check
npm run type-check

# Lint
npm run lint

# Build production bundle
npm run build

# Test production build locally
npm run preview
```

### Step 2: Environment Setup

**Verify Environment Variables**:

```bash
# Check .env file (local only, not committed)
VITE_SUPABASE_URL=https://[project-id].supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=[anon-key]

# Production environment (set in hosting platform)
VITE_GA4_MEASUREMENT_ID=[GA4-ID]
```

### Step 3: Database Preparation

**Run Pending Migrations**:

```bash
# Connect to Supabase
npx supabase db push

# Verify migrations
npx supabase db diff
```

**Backup Database** (if applicable):

```bash
# Via Supabase Dashboard > Database > Backups
# Or via CLI
npx supabase db dump > backup-$(date +%Y%m%d).sql
```

### Step 4: Deploy Application

**Via Lovable/Vercel**:

1. Click "Publish" button in Lovable
2. Wait for build to complete (~2 minutes)
3. Verify preview URL works
4. Promote to production domain

**Via CLI** (if configured):

```bash
# Deploy to Vercel
npm run deploy

# Or manual build + upload
npm run build
# Upload dist/ folder to hosting
```

### Step 5: Post-Deployment Verification

**Smoke Tests**:

```bash
# Check homepage loads
curl -I https://hair.app/

# Verify API endpoint
curl https://hair.app/api/health

# Check sitemap
curl https://hair.app/sitemap.xml
```

**Manual Checks**:

- [ ] Homepage loads correctly
- [ ] Sign up flow works
- [ ] Sign in flow works
- [ ] Dashboard loads for both roles
- [ ] Creating appointment works
- [ ] Payment flow functional (if applicable)
- [ ] Mobile view responsive
- [ ] All navigation links work

### Step 6: Monitoring Setup

**Enable Monitoring**:

```bash
# Verify Google Analytics tracking
# Open browser dev tools, check for GA4 requests

# Check error tracking (if Sentry configured)
# Visit error tracking dashboard

# Monitor Supabase
# Check Dashboard > Logs for errors
```

---

## 🔄 Rollback Plan

### Quick Rollback (Vercel)

1. **Via Lovable**:
   - Open project history
   - Click "Revert" on previous working version
   - Confirm rollback

2. **Via Vercel Dashboard**:
   - Open Deployments page
   - Find previous working deployment
   - Click "Promote to Production"
   - Confirm

**Expected Rollback Time**: < 2 minutes

### Manual Rollback (Git)

```bash
# Identify last working commit
git log --oneline

# Revert to previous version
git revert HEAD

# Force deploy previous version
git push origin main --force

# Re-deploy
npm run deploy
```

**Expected Rollback Time**: 5-10 minutes

### Database Rollback

**If migration causes issues**:

```bash
# Revert migration (if possible)
npx supabase db reset --db-url [connection-string]

# Or restore from backup
psql [connection-string] < backup-20250104.sql
```

⚠️ **WARNING**: Database rollbacks can cause data loss. Always backup first.

---

## 🚨 Emergency Procedures

### Site Down

**Symptoms**: Homepage not loading, 500 errors

**Quick Fix**:

1. Check Vercel/hosting status page
2. Roll back to previous deployment
3. Check Supabase status (status.supabase.com)
4. Verify DNS records

### Database Issues

**Symptoms**: "Error connecting to database", timeouts

**Quick Fix**:

1. Check Supabase dashboard for connection limits
2. Restart database (if needed)
3. Check RLS policies for infinite loops
4. Review recent migrations

### Payment Issues

**Symptoms**: Stripe checkout failing, webhook errors

**Quick Fix**:

1. Check Stripe dashboard for errors
2. Verify webhook endpoint URL
3. Check webhook secret is correct
4. Test in Stripe test mode first

### Performance Degradation

**Symptoms**: Slow page loads, timeouts

**Quick Fix**:

1. Check Supabase query performance
2. Review recent database changes
3. Check for memory leaks (monitor RAM usage)
4. Enable caching (if not already)

---

## 📊 Health Checks

### Automated Health Checks

Create `/api/health` endpoint (if not exists):

```typescript
// src/api/health.ts
export default async function handler(req, res) {
  try {
    // Check database
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);

    if (error) throw error;

    // Return healthy status
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      database: 'connected',
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message,
    });
  }
}
```

**Monitor Health**:

```bash
# Set up monitoring (UptimeRobot, Pingdom, etc.)
curl https://hair.app/api/health

# Expected response:
# {"status":"healthy","database":"connected"}
```

---

## 📈 Post-Deployment Monitoring

### First 24 Hours

**Monitor**:

- [ ] Error rate (should be < 1%)
- [ ] Response time (should be < 1s)
- [ ] Sign-up conversions
- [ ] Payment success rate
- [ ] User-reported issues

**Check Logs**:

```bash
# Supabase logs
# Dashboard > Logs > Filter by error

# Vercel logs
# Dashboard > Deployments > View logs
```

### First Week

**Review**:

- [ ] Google Analytics traffic
- [ ] Core Web Vitals
- [ ] User feedback
- [ ] Performance metrics
- [ ] Error patterns

### First Month

**Analyze**:

- [ ] Monthly Active Users (MAU)
- [ ] Retention rate
- [ ] Feature adoption
- [ ] Revenue (if applicable)
- [ ] Churn rate

---

## 🔧 Common Issues & Solutions

### Issue: Build Fails

**Cause**: TypeScript errors, missing dependencies

**Solution**:

```bash
# Clear cache
rm -rf node_modules dist
npm install
npm run build
```

### Issue: Environment Variables Not Loading

**Cause**: Variables not set in hosting platform

**Solution**:

1. Verify variables in hosting dashboard
2. Ensure variables start with `VITE_` for client-side
3. Redeploy after adding variables

### Issue: 404 on Refresh

**Cause**: SPA routing not configured

**Solution**:

```json
// vercel.json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### Issue: CORS Errors

**Cause**: API requests blocked by browser

**Solution**:

```typescript
// Add CORS headers in edge functions
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};
```

---

## 📞 Support & Escalation

### Support Contacts

**Technical Issues**:

- Lovable Support: support@lovable.dev
- Supabase Support: support@supabase.com
- Stripe Support: stripe.com/support

**Escalation Path**:

1. Check documentation & runbooks
2. Review error logs
3. Attempt rollback if critical
4. Contact relevant support team
5. Post in community Slack/Discord

---

## 📚 Related Documentation

- [SECURITY_REPORT.md](./SECURITY_REPORT.md) - Security audit
- [PERF_REPORT.md](./PERF_REPORT.md) - Performance optimization
- [A11Y_AUDIT.md](./A11Y_AUDIT.md) - Accessibility audit
- [ANALYTICS_SETUP.md](./ANALYTICS_SETUP.md) - Analytics guide
- [RLS_POLICIES.md](./RLS_POLICIES.md) - Database security

---

## ✅ Sign-Off

Before deploying to production, all team members must sign off:

- [ ] **Tech Lead**: Code reviewed, security verified
- [ ] **QA**: All critical paths tested
- [ ] **Product**: Features meet requirements
- [ ] **DevOps**: Infrastructure ready, monitoring configured

**Deployment Approved By**: [Name]  
**Date**: [YYYY-MM-DD]  
**Version**: 1.0.0

---

**Remember**: Always backup before deploying. When in doubt, roll back and investigate.

Good luck! 🚀
