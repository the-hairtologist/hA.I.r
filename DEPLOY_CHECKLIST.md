# Pre-Deployment Checklist

Use this checklist before every production deployment to ensure nothing is missed.

---

## 📋 Pre-Flight Checks

### 1. Code Quality

- [ ] **All tests passing** (`npm test`)
  ```bash
  npm test -- --run --reporter=verbose
  ```
- [ ] **E2E tests passing** (`npm run test:e2e`)
  ```bash
  npm run test:e2e
  ```
- [ ] **No TypeScript errors** (`npm run build`)
  ```bash
  npm run build
  ```
- [ ] **No console errors** (check browser DevTools)
- [ ] **Linting passed** (ESLint warnings addressed)
- [ ] **Bundle size acceptable** (<1.5MB total)
  ```bash
  npm run build
  # Check dist/ folder size
  ```

### 2. Security

- [ ] **RLS policies enabled** on all new tables
  ```sql
  -- Verify in Lovable Cloud backend:
  SELECT tablename
  FROM pg_tables
  WHERE schemaname = 'public'
  AND NOT rowsecurity;
  -- Should return 0 rows
  ```
- [ ] **No secrets in code** (check git diff)
  ```bash
  git diff main | grep -i "api_key\|secret\|password"
  # Should return nothing
  ```
- [ ] **Input validation** on all forms (Zod schemas)
- [ ] **Rate limiting** enabled on edge functions
- [ ] **Security scan passed** (run in Lovable)

### 3. Database

- [ ] **Migrations applied** (check Lovable Cloud backend)
- [ ] **Indexes added** for new queries
  ```sql
  -- Check missing indexes:
  SELECT schemaname, tablename, attname
  FROM pg_stats
  WHERE schemaname = 'public'
  AND n_distinct > 100
  AND correlation < 0.1;
  ```
- [ ] **Backup confirmed** (automatic in Lovable Cloud)
- [ ] **Test queries perform well** (<200ms for p95)
  ```sql
  EXPLAIN ANALYZE
  SELECT * FROM appointments
  WHERE stylist_id = 'xxx' AND date >= CURRENT_DATE
  ORDER BY date LIMIT 20;
  ```

---

## 🔧 Backend Verification

### 1. Edge Functions

- [ ] **All functions deployed** (automatic in Lovable Cloud)
- [ ] **Function logs clean** (no errors in last 24h)
  ```bash
  # Check in Lovable Cloud backend → Functions → Logs
  ```
- [ ] **Timeouts configured** (increase if needed in config.toml)
- [ ] **Error handling implemented** (try/catch blocks)

### 2. Secrets Management

- [ ] **Required secrets configured:**

  ```bash
  # Run verification script:
  node scripts/verify-env.ts

  # Should show:
  # ✅ RESEND_API_KEY
  # ✅ STRIPE_SECRET_KEY
  # ✅ STRIPE_WEBHOOK_SECRET
  ```

- [ ] **Optional secrets (recommended):**
  - [ ] SENTRY_DSN (error tracking)
  - [ ] VITE_GA_MEASUREMENT_ID (analytics)

### 3. External Integrations

- [ ] **Stripe webhook configured**
  - Endpoint: `https://iyotklwiwyljospfqnoy.supabase.co/functions/v1/stripe-webhook`
  - Events: payment_intent.succeeded, subscription.\*
- [ ] **Resend webhook configured**
  - Endpoint: `https://iyotklwiwyljospfqnoy.supabase.co/functions/v1/resend-webhook`
  - Events: email.delivered, email.bounced
- [ ] **Test webhooks** (trigger test events in Stripe/Resend dashboard)

---

## 🎨 Frontend Verification

### 1. Build Quality

- [ ] **Bundle analysis reviewed** (no unexpectedly large chunks)
  ```bash
  npm run build
  # Check dist/stats.html (if enabled)
  ```
- [ ] **Images optimized** (WebP/AVIF format, <500KB each)
- [ ] **Lazy loading implemented** (below-fold content)
- [ ] **Service worker active** (PWA installable)

### 2. Performance

- [ ] **Core Web Vitals pass:**
  - LCP (Largest Contentful Paint) <2.5s
  - CLS (Cumulative Layout Shift) <0.1
  - INP (Interaction to Next Paint) <200ms
  ```bash
  # Test on PageSpeed Insights:
  # https://pagespeed.web.dev/
  ```
- [ ] **Mobile performance acceptable** (Lighthouse score >70)

### 3. Accessibility

- [ ] **WCAG 2.2 AA compliance** (use A11yTester component)
  - Color contrast ≥4.5:1 for text
  - Tap targets ≥44px
  - Keyboard navigation works
  - Screen reader compatible
- [ ] **Skip links added** (for keyboard users)
- [ ] **Focus indicators visible** (test with Tab key)

---

## 📱 Mobile (If Deploying Native Apps)

### iOS

- [ ] **Xcode build successful** (no warnings)
- [ ] **App icon uploaded** (1024x1024px)
- [ ] **Screenshots prepared** (5.5", 6.5", 12.9")
- [ ] **Privacy policy URL** (in App Store Connect)
- [ ] **TestFlight beta tested** (by at least 3 users)
- [ ] **App Store submission** (in review or approved)

### Android

- [ ] **Android Studio build successful** (AAB generated)
- [ ] **Feature graphic uploaded** (1024x500px)
- [ ] **Screenshots prepared** (min 2, max 8)
- [ ] **Content rating completed** (Play Console)
- [ ] **Internal testing completed** (by at least 3 users)
- [ ] **Play Store submission** (in review or approved)

---

## 🚀 Deployment

### 1. Staging Deploy

- [ ] **Deploy to staging** (click "Publish" in Lovable)
- [ ] **Verify staging URL** (yourapp.lovable.app)
- [ ] **Smoke test critical flows:**
  - [ ] User signup/login
  - [ ] Dashboard loads (< 2s)
  - [ ] Appointment booking works
  - [ ] AI features functional
  - [ ] Payments process correctly
  - [ ] Emails send successfully

### 2. Production Deploy

- [ ] **Custom domain configured** (if applicable)
  - DNS CNAME record added
  - SSL certificate issued (automatic)
- [ ] **Notify team** (deployment starting)
- [ ] **Deploy to production** (click "Publish")
- [ ] **Monitor build logs** (check for errors)
- [ ] **Verify production URL** (yourdomain.com)

### 3. Post-Deployment

- [ ] **Database indexes added** (run SQL from Database section)

  ```sql
  -- Critical indexes (run if not already present):
  CREATE INDEX IF NOT EXISTS appointments_stylist_date_idx
  ON appointments(stylist_id, date);

  CREATE INDEX IF NOT EXISTS ai_chat_messages_user_created_idx
  ON ai_chat_messages(user_id, created_at DESC);
  ```

- [ ] **Cron jobs active** (check Lovable Cloud backend)
  - smart-reminder (daily 9am)
  - post-appointment-followup (daily 6pm)
  - no-show-prevention (twice daily)
  - client-retention-campaign (weekly Monday 10am)
- [ ] **Error tracking active** (Sentry receiving events)
- [ ] **Analytics tracking** (GA4 showing real-time users)

---

## 📊 Monitoring (First 24 Hours)

### Health Checks

- [ ] **Hour 1:** Check error rates (Sentry dashboard)
- [ ] **Hour 3:** Verify user signups working
- [ ] **Hour 6:** Check performance metrics (Web Vitals)
- [ ] **Hour 12:** Review database query times
- [ ] **Hour 24:** Full system health audit

### Key Metrics to Monitor

- **Error rate:** <0.1% of requests
- **Response time:** p95 <500ms
- **Database queries:** p95 <200ms
- **User signups:** >0 (verify auth working)
- **Payments:** >0 processed (if applicable)

### Alert Thresholds

- 🔴 **Critical:** >10 errors/minute → Investigate immediately
- 🟡 **Warning:** Response time >1s → Check database
- 🟢 **Normal:** All metrics within expected range

---

## 🔄 Rollback Plan

### If Issues Detected

1. **Minor issues** (visual glitches):
   - Document for hotfix
   - Continue monitoring
2. **Major issues** (functionality broken):
   - Click project name → Version History
   - Restore previous version
   - Redeploy immediately
3. **Critical issues** (data loss, security breach):
   - Restore database from backup (Lovable Cloud)
   - Revert to previous version
   - Investigate root cause before redeploying

### Database Rollback

```sql
-- If migration caused issues, create rollback migration:
-- supabase/migrations/YYYYMMDDHHMMSS_rollback.sql

-- Example: Remove new table
DROP TABLE IF EXISTS new_feature;

-- Example: Restore old column
ALTER TABLE existing_table ADD COLUMN old_column TEXT;
```

---

## ✅ Final Sign-Off

### Deployment Lead

- [ ] **All checks passed** (green checkmarks above)
- [ ] **Team notified** (deployment complete message)
- [ ] **Monitoring active** (Sentry, GA4, Web Vitals)
- [ ] **Documentation updated** (CHANGELOG.md)

### Stakeholders

- [ ] **Product Owner approval** (features work as expected)
- [ ] **QA approval** (no critical bugs)
- [ ] **DevOps approval** (infrastructure stable)

---

## 📝 Deployment Notes

**Date:** ******\_\_\_******  
**Deployed By:** ******\_\_\_******  
**Version:** ******\_\_\_******

**Changes in This Release:**

-
-
-

**Known Issues (Non-blocking):**

-
-

**Post-Deployment Actions Required:**

-
-

---

## 🎉 Deployment Complete!

**Next Steps:**

1. Monitor for 24 hours
2. Collect user feedback
3. Plan next sprint
4. Update roadmap

**Celebration:** 🚀🎊🎉

---

**References:**

- [Deployment Guide](./docs/DEPLOYMENT.md)
- [Architecture](./docs/ARCHITECTURE.md)
- [Troubleshooting](./docs/TESTING.md#troubleshooting)
- [Environment Variables](./scripts/verify-env.ts)
