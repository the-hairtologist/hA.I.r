# 📌 Post-Launch Version Control Strategy

**Application:** hA.I.r Platform  
**Launch Date:** October 19, 2025  
**Purpose:** Maintain stability while enabling rapid iteration post-launch

---

## 🎯 Core Principles

1. **Main branch is always production-ready**
2. **Pin every stable version**
3. **Never push untested changes to production**
4. **Rollback is always an option**
5. **Document every significant change**

---

## 📍 Version Pinning Strategy

### What to Pin

**ALWAYS PIN:**
- ✅ Pre-launch stable version (Oct 16, 2025) - **ALREADY PINNED**
- ✅ Post-launch Day 1 version (after 24 hours stable)
- ✅ Before adding any major feature
- ✅ After fixing any critical bug
- ✅ Weekly stable versions (every Friday 5pm)
- ✅ Before any database migration

**DON'T PIN:**
- ❌ Failed builds or broken versions
- ❌ Mid-development work-in-progress
- ❌ Experimental features not ready for production
- ❌ Every single commit (too noisy)

### How to Pin

**In Lovable:**
1. Navigate to History tab
2. Find the stable version
3. Click "Pin" button
4. Name it descriptively:
   - ✅ Good: "2025-10-20 - Post Launch Day 1 Stable"
   - ✅ Good: "2025-10-25 - Fixed client booking bug"
   - ✅ Good: "2025-11-01 - Added AI formula v2 feature"
   - ❌ Bad: "Pin 1", "Stable", "Good version"

**In GitHub:**
1. Create a Git tag for major milestones:
   ```bash
   git tag -a v1.0.0 -m "Launch version - Oct 19, 2025"
   git push origin v1.0.0
   ```

2. Use semantic versioning:
   - **v1.0.0** - Launch version
   - **v1.0.1** - Bug fixes (non-breaking)
   - **v1.1.0** - New features (non-breaking)
   - **v2.0.0** - Breaking changes (rare)

---

## 🌿 GitHub Branching Strategy

### Branch Types

#### 1. `main` Branch (Production)
- **Purpose:** Always reflects production state
- **Protection:** Require pull request reviews
- **Deployment:** Auto-deploys to production on merge
- **Rules:**
  - No direct commits
  - All changes via pull request
  - Must pass all tests before merge
  - Require at least 1 approval (if team)

#### 2. Feature Branches
- **Naming:** `feature/descriptive-name`
- **Examples:**
  - `feature/ai-formula-v2`
  - `feature/client-portal-dashboard`
  - `feature/sms-reminders`
- **Lifecycle:** Short-lived (1-5 days max)
- **Merge:** Via pull request to `main`

#### 3. Bugfix Branches
- **Naming:** `fix/issue-description`
- **Examples:**
  - `fix/booking-calendar-timezone`
  - `fix/formula-image-upload`
  - `fix/client-search-performance`
- **Priority:** High (merge ASAP after testing)
- **Merge:** Direct to `main` after quick review

#### 4. Hotfix Branches
- **Naming:** `hotfix/critical-issue`
- **Examples:**
  - `hotfix/auth-security-patch`
  - `hotfix/payment-processing-error`
- **Urgency:** Critical (merge within hours)
- **Process:**
  1. Branch from latest pinned stable version
  2. Fix the issue
  3. Test thoroughly
  4. Merge to `main` immediately
  5. Pin the hotfix version

---

## 🔄 Development Workflow (Post-Launch)

### Daily Development Cycle

**Morning (Start of Day):**
```bash
1. Pull latest from main
   git pull origin main

2. Review overnight changes
   - Check History tab in Lovable
   - Review GitHub commits
   - Check for any errors in production

3. Plan day's work
   - Identify features/fixes from backlog
   - Create feature branch if needed
```

**During Development:**
```bash
1. Create feature branch (if not exists)
   git checkout -b feature/my-feature

2. Develop and commit frequently
   git add .
   git commit -m "Add: Feature description"

3. Push to GitHub regularly
   git push origin feature/my-feature

4. Test locally before merging
   - Run E2E tests
   - Test on mobile device
   - Verify no console errors
```

**End of Day:**
```bash
1. If feature complete:
   - Create pull request
   - Self-review changes
   - Request review (if team)
   - Merge when approved

2. If feature incomplete:
   - Push work-in-progress
   - Add TODO comments
   - Document next steps
   - Don't merge to main

3. Pin stable version (Friday only)
   - Name: "2025-10-25 - Weekly Stable"
   - Test thoroughly before pinning
```

---

## 🚨 Emergency Rollback Procedures

### Scenario 1: Minor Bug (Non-Critical)

**Symptoms:**
- Feature broken but app still usable
- Affects <10% of users
- No data loss risk

**Response:**
1. **DON'T PANIC** - Minor bugs happen
2. Create hotfix branch immediately
3. Fix the issue (aim for <2 hours)
4. Test fix thoroughly
5. Deploy fix to production
6. Monitor for 30 minutes
7. Document what went wrong and how to prevent

**Example:**
```bash
# Create hotfix branch
git checkout -b hotfix/booking-calendar-timezone

# Fix the issue in code
# Test locally

# Merge to main
git checkout main
git merge hotfix/booking-calendar-timezone
git push origin main

# Deploy automatically triggers via Lovable
# Monitor production for next 30 minutes
```

---

### Scenario 2: Major Bug (Critical)

**Symptoms:**
- Core feature completely broken
- Affects >50% of users
- Users cannot book appointments
- Data integrity at risk

**Response:**
1. **ROLLBACK IMMEDIATELY** (do not try to fix first)
2. Communicate with users
3. Investigate root cause
4. Fix in safe environment
5. Deploy fix when confident
6. Post-mortem analysis

**Rollback Steps:**

**Option A: Lovable History Rollback (Fastest - 5 minutes)**
```
1. Open Lovable → History tab
2. Find last known stable pinned version
   (e.g., "2025-10-20 - Post Launch Day 1 Stable")
3. Click "Restore to this version"
4. Wait for build to complete (~2 min)
5. Verify production is working
6. Add banner: "We had to roll back. Working on fix."
```

**Option B: Git Revert (If database involved)**
```bash
# Find the bad commit
git log --oneline

# Revert the bad commit (creates new commit)
git revert <bad-commit-hash>

# Push to production
git push origin main

# If multiple bad commits
git revert <hash1> <hash2> <hash3>
```

**Option C: Database Rollback (If schema changed)**
```sql
-- CRITICAL: Only if you have database backup
-- Contact Lovable support immediately
-- Manual database restore required
-- Expected downtime: 15-30 minutes
```

**Communication Template:**
```
🚨 Service Notice 🚨

We've identified an issue affecting booking appointments. 
We've rolled back to a stable version while we fix this.

Expected fix time: [2 hours / 4 hours / tomorrow]

Your data is safe. Apologies for the inconvenience.

- hA.I.r Team
```

---

### Scenario 3: Database Migration Failure

**Symptoms:**
- App crashes on load
- Database errors in console
- RLS policy errors
- Cannot query specific tables

**Response:**
1. **DO NOT ROLLBACK CODE IMMEDIATELY**
2. Check if migration completed
3. If migration incomplete, complete it manually
4. If migration corrupt, revert database
5. Test thoroughly before allowing user access

**Migration Checklist (Before Running):**
- [ ] Backup database (Lovable Cloud automatic)
- [ ] Test migration locally first (if possible)
- [ ] Review migration SQL carefully
- [ ] Run during low-traffic period (late night)
- [ ] Monitor logs for 30 minutes after
- [ ] Have rollback SQL prepared

---

## 📊 Version History Documentation

### Version Naming Convention

**Format:** `vMAJOR.MINOR.PATCH - Description`

**Examples:**
- `v1.0.0 - Launch Version (Oct 19, 2025)`
- `v1.0.1 - Fixed booking timezone bug`
- `v1.1.0 - Added AI formula suggestions v2`
- `v1.1.1 - Fixed client search performance`
- `v2.0.0 - Complete UI redesign (future)`

### Change Log Template

**For Each Significant Change:**
```markdown
## v1.0.1 - Fixed Booking Timezone Bug
**Date:** 2025-10-20  
**Type:** Bugfix  
**Severity:** High  
**Affected Users:** All users booking across timezones

### What Changed
- Fixed timezone conversion in appointment booking
- Ensured all times display in user's local timezone
- Updated confirmation emails to show correct local times

### Why
- Users in different timezones were seeing incorrect appointment times
- Confusion led to missed appointments

### Impact
- All booking times now accurate
- Reduced no-shows by ~15%

### Files Changed
- `src/components/BookingCalendar.tsx`
- `src/utils/timezoneHelpers.ts`
- `supabase/functions/send-confirmation-email/index.ts`

### Testing Done
- Tested across 5 different timezones
- Verified email confirmations show correct times
- Confirmed no regression in existing functionality

### Migration Required
- No database changes
- No action required from users
```

---

## 🔍 Pre-Deployment Checklist

**Before Merging ANY Change to Main:**

### Code Quality
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] No console errors in browser
- [ ] All imports resolve correctly
- [ ] No hardcoded secrets or API keys

### Functionality
- [ ] Feature works as expected
- [ ] Edge cases handled
- [ ] Error states tested
- [ ] Loading states implemented
- [ ] Success feedback provided

### Performance
- [ ] Page loads <2s
- [ ] No layout shift (CLS < 0.1)
- [ ] Images optimized and compressed
- [ ] Lists virtualized if >50 items
- [ ] API calls debounced/throttled

### Mobile
- [ ] Tested on iPhone SE (375px)
- [ ] Tested on Android phone
- [ ] Tap targets ≥44px
- [ ] No horizontal scroll
- [ ] Keyboard doesn't cover inputs

### Accessibility
- [ ] Keyboard navigation works
- [ ] Screen reader friendly (test with VoiceOver)
- [ ] Color contrast ≥4.5:1
- [ ] Focus indicators visible
- [ ] ARIA labels on interactive elements

### Security
- [ ] RLS policies tested
- [ ] No sensitive data exposed
- [ ] Input validation on client AND server
- [ ] No SQL injection risks
- [ ] Rate limiting in place

### Documentation
- [ ] README updated (if needed)
- [ ] Change log entry added
- [ ] Comments added for complex logic
- [ ] Knowledge file updated (if behavior changed)

---

## 📅 Weekly Stability Routine

**Every Friday 5pm (Before Weekend):**

### 1. Create Weekly Stable Version
```
1. Run full test suite
2. Review all changes made this week
3. Test on all supported devices
4. Pin version: "2025-10-25 - Weekly Stable"
5. Deploy to production (if not already)
```

### 2. Review Metrics
```
- Error rate: Should be <0.5%
- Performance: LCP <2.5s, CLS <0.1
- User feedback: Any critical issues?
- Database health: Query performance?
```

### 3. Plan Next Week
```
- Review backlog
- Prioritize features vs. bugs
- Estimate effort for upcoming work
- Identify any blockers
```

### 4. Communication
```
- Update changelog on website
- Email users if major changes
- Post updates to status page
- Thank users for feedback
```

---

## 🎯 Best Practices Summary

### DO:
- ✅ Pin every stable version
- ✅ Test thoroughly before merging
- ✅ Use descriptive branch names
- ✅ Write clear commit messages
- ✅ Review your own PRs before requesting review
- ✅ Monitor production after every deploy
- ✅ Document breaking changes
- ✅ Have rollback plan ready

### DON'T:
- ❌ Commit directly to main
- ❌ Merge untested code
- ❌ Skip mobile testing
- ❌ Ignore TypeScript errors
- ❌ Push during high-traffic hours (10am-2pm)
- ❌ Make database changes without backup
- ❌ Deploy on Friday evening (unless emergency)
- ❌ Merge multiple large features at once

---

## 🆘 When Things Go Wrong

### Decision Tree

```
┌─────────────────────────────────────┐
│ Something is broken in production   │
└───────────┬─────────────────────────┘
            │
    ┌───────┴───────┐
    │ Is it CRITICAL? │
    │ (Users blocked) │
    └───────┬─────────┘
            │
    ┌───────┴───────┐
    │ YES           │ NO
    ↓               ↓
┌──────────────┐   ┌────────────────┐
│ ROLLBACK NOW │   │ Can fix in <1h? │
│ (5 minutes)  │   └────────┬────────┘
└──────────────┘            │
                    ┌───────┴───────┐
                    │ YES           │ NO
                    ↓               ↓
              ┌──────────────┐  ┌──────────────┐
              │ Create hotfix│  │ ROLLBACK    │
              │ branch, fix, │  │ then fix in  │
              │ test, deploy │  │ safe env     │
              └──────────────┘  └──────────────┘
```

### Contact Information

**Lovable Support:**
- Docs: https://docs.lovable.dev
- Discord: https://discord.gg/lovable-dev
- Email: Via Lovable dashboard

**Emergency Escalation:**
1. Rollback to last stable version (self-service)
2. Document the issue in GitHub
3. Contact Lovable support if platform issue
4. Review post-mortem after resolution

---

## 📈 Success Metrics

**Track These Post-Launch:**

### Stability Metrics
- Uptime: Target >99.5%
- Error rate: Target <0.5%
- Rollbacks per week: Target 0 (max 1)
- Time to fix critical bugs: <2 hours

### Development Velocity
- Features shipped per week: Target 2-3
- Bugs fixed per week: All critical, 80% high
- Average PR review time: <4 hours
- Deploy frequency: 1-2x per day

### Quality Metrics
- Test coverage: >80%
- Lighthouse score: All >90
- Accessibility: 100% WCAG 2.2 AA
- Performance: LCP <2.5s, CLS <0.1

---

**Remember:** Stability first, speed second. A slow rollout that works is better than a fast rollout that breaks.

---

**Created:** October 19, 2025  
**Next Review:** After first month post-launch  
**Owner:** Development team lead
