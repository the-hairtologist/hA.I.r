# 🚀 Deployment Guide - hA.I.r Platform

## Current Deployment Strategy: Lovable Built-in

This project uses **Lovable's built-in deployment** for the simplest, fastest path to production.

---

## 📦 How to Deploy

### Production Deployment

1. **Open your project** in Lovable dashboard
2. **Click "Publish"** button (top-right on desktop, bottom-right on mobile in Preview mode)
3. **Your app is live!** 🎉

Your production URL: `https://[your-project].lovable.app`

### Automatic Deployment

- Every time you click "Publish" in Lovable, your latest code is deployed
- Changes are live within seconds
- No manual configuration needed
- Environment variables are handled automatically

---

## 🔧 Environment Variables

### Required (Already Configured)
✅ `VITE_SUPABASE_URL` - Lovable Cloud backend URL  
✅ `VITE_SUPABASE_PUBLISHABLE_KEY` - Lovable Cloud API key

### Optional (For Monitoring - Not Required)
⚠️ `VITE_GA4_MEASUREMENT_ID` - Google Analytics 4 tracking  
⚠️ `VITE_SENTRY_DSN` - Sentry error monitoring

To add optional monitoring secrets:
1. Go to **Project Settings → Secrets** in Lovable
2. Add `VITE_GA4_MEASUREMENT_ID` and/or `VITE_SENTRY_DSN`
3. Redeploy by clicking "Publish"

---

## 🎯 CI/CD Workflows

### Active Workflows

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| **E2E Tests** | Push/PR to main, hA.I.r, develop | Runs Playwright end-to-end tests |
| **Performance Tests** | PR to main, hA.I.r, develop | Lighthouse CI performance audits |
| **Deploy Preview** | PR to main, hA.I.r, develop | Creates preview environment |

### Disabled Workflows

| Workflow | Status | Reason |
|----------|--------|--------|
| **Production Deploy** | ⏸️ Disabled | Using Lovable's built-in deployment |

---

## 🌐 Custom Domains

To connect a custom domain (e.g., `yourdomain.com`):

1. Navigate to **Project → Settings → Domains** in Lovable
2. Add your custom domain
3. Follow DNS configuration instructions
4. Wait for SSL certificate provisioning (~5 minutes)

**Note:** Custom domains require a paid Lovable plan.

---

## 📊 Monitoring Setup (Optional)

### Google Analytics 4

1. Create GA4 property at https://analytics.google.com
2. Copy Measurement ID (format: `G-XXXXXXXXXX`)
3. Add to Lovable Project Settings → Secrets:
   - Key: `VITE_GA4_MEASUREMENT_ID`
   - Value: Your measurement ID
4. Redeploy

**Features automatically tracked:**
- Page views
- User navigation
- Feature usage
- Performance metrics

### Sentry Error Monitoring

1. Create free account at https://sentry.io
2. Create React project
3. Copy DSN (format: `https://xxxxx@xxxxx.ingest.sentry.io/xxxxx`)
4. Add to Lovable Project Settings → Secrets:
   - Key: `VITE_SENTRY_DSN`
   - Value: Your DSN
5. Redeploy

**Features automatically tracked:**
- Runtime errors
- Unhandled promise rejections
- Component crashes
- Performance bottlenecks
- User breadcrumbs

---

## ✅ Pre-Deployment Checklist

Before deploying to production:

- [ ] All E2E tests passing
- [ ] Performance audits passing (Lighthouse CI)
- [ ] No console errors in dev preview
- [ ] Authentication flows tested
- [ ] Mobile responsiveness verified (320px - 1024px)
- [ ] Accessibility checked (WCAG 2.2 AA)
- [ ] Core Web Vitals optimized (LCP < 2.5s, CLS < 0.1, INP < 200ms)

---

## 🔒 Security

### Automatic Security Features
✅ HTTPS enforced  
✅ Environment variables encrypted  
✅ Supabase RLS policies active  
✅ CORS configured  
✅ CSP headers set

### Manual Security Checks
- Review Supabase RLS policies regularly
- Rotate secrets if compromised
- Monitor Sentry for security-related errors
- Keep dependencies updated

---

## 🐛 Troubleshooting

### Deployment Failed
- Check if Lovable Cloud is enabled
- Verify environment variables are set
- Review build logs in Lovable dashboard

### App Not Loading After Deploy
- Clear browser cache
- Check browser console for errors
- Verify Supabase connection

### Performance Issues
- Review Lighthouse CI reports in GitHub Actions
- Check Core Web Vitals in Google Analytics
- Monitor Sentry performance metrics

---

## 📚 Additional Resources

- [Lovable Deployment Docs](https://docs.lovable.dev/features/deployment)
- [Custom Domain Setup](https://docs.lovable.dev/faq#how-do-i-connect-a-custom-domain)
- [Environment Variables](https://docs.lovable.dev/features/cloud#secrets-management)
- [Performance Optimization](https://docs.lovable.dev/tips-tricks/performance)

---

## 🚨 Emergency Rollback

If you need to revert to a previous version:

1. Click project name (top-left) in Lovable
2. Select "History"
3. Find the last working version
4. Click "Restore"
5. Click "Publish" to deploy the restored version

---

**Last Updated:** November 2025  
**Deployment Method:** Lovable Built-in  
**Status:** ✅ Production Ready
