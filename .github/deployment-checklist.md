# Pre-Deployment Checklist

## Performance Optimization
- [ ] **Image Compression**: Run all images through [TinyPNG](https://tinypng.com)
  - Hero images should be < 300KB
  - Icons should be SVG or WebP format
  - Background images should be optimized for web
- [ ] **Lazy Loading**: Verify all below-the-fold images have `loading="lazy"` attribute
- [ ] **Bundle Size**: Run `npm run build` and check dist size is < 500KB (gzipped)

## Analytics & Monitoring
- [ ] Add `GA4_MEASUREMENT_ID` to environment variables
- [ ] Test event tracking (signup, appointment_created, ai_analysis_complete)
- [ ] Verify conversion tracking works in production
- [ ] Confirm Sentry error tracking is active

## Accessibility
- [ ] Run Lighthouse audit (target score: 95+)
- [ ] Verify ARIA labels on all interactive elements
- [ ] Test keyboard navigation (Tab, Enter, Escape)
- [ ] Check color contrast ratios meet WCAG AA standards
- [ ] Test with screen reader (VoiceOver/NVDA)

## Mobile Experience
- [ ] Test on iOS (iPhone 12+, Safari)
- [ ] Test on Android (Chrome, Samsung Internet)
- [ ] Verify touch targets are ≥44px
- [ ] Check safe area insets (iOS notch/Dynamic Island)
- [ ] Test haptic feedback on supported devices
- [ ] Verify bottom navigation doesn't conflict with system gestures

## Security
- [ ] Run `supabase db lint` to check RLS policies
- [ ] Verify no exposed API keys in client-side code
- [ ] Check that all sensitive operations require authentication
- [ ] Test rate limiting on AI endpoints
- [ ] Verify CORS settings are correct

## Functionality
- [ ] Test user signup/login flow
- [ ] Create test appointment and verify AI analysis works
- [ ] Test appointment scheduling for all formula types
- [ ] Verify email notifications are sent (if enabled)
- [ ] Test file upload and image analysis
- [ ] Verify all CTAs and buttons work

## Content
- [ ] Check all copy for typos and grammar
- [ ] Verify meta tags (title, description, og:image)
- [ ] Confirm favicon is correct
- [ ] Test social sharing previews (Twitter, Facebook, LinkedIn)

## Post-Deployment Monitoring (First 24 Hours)
- [ ] Monitor error rate in Sentry (target: <0.1%)
- [ ] Check AI response times (target: <3s)
- [ ] Verify user signups are working
- [ ] Monitor page load times (target: <2s)
- [ ] Check for any console errors in production

## Success Criteria
✅ All tests pass  
✅ Lighthouse score: 95+  
✅ Zero critical security issues  
✅ Mobile experience tested on 2+ devices  
✅ Analytics tracking confirmed  
✅ Error monitoring active  

---

**Last Updated**: 2025-10-18  
**Deployed By**: [Your Name]  
**Deployment Date**: [YYYY-MM-DD]
