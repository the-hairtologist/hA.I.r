# GitHub Actions Workflows

## 🎯 Workflow Strategy

This project uses a **tiered testing approach** to balance speed, thoroughness, and resource usage.

### Workflow Tiers

#### 1️⃣ **Fast CI Pipeline** (`ci-fast.yml`)
**Runs on:** Every push & PR  
**Duration:** ~3 minutes  
**Purpose:** Quick feedback loop

- ✅ Lint & Type Check
- ✅ Build verification
- ✅ Smoke tests (auth + home page only)
- ✅ Quick security scan

**Why?** Fast feedback is critical. This catches 80% of issues in 20% of the time.

---

#### 2️⃣ **Deep Testing Suite** (`deep-tests.yml`)
**Runs on:** PRs + Daily at 2 AM UTC  
**Duration:** ~30-45 minutes  
**Purpose:** Comprehensive coverage

- 🧪 Full E2E tests (Chrome, Firefox, Safari)
- ♿ Accessibility tests
- 📱 Mobile device matrix (iPhone, Pixel, Galaxy)
- 💻 Tablet & desktop testing

**Why?** Thorough testing without slowing down every commit.

---

#### 3️⃣ **Performance Analysis** (`performance-analysis.yml`)
**Runs on:** PRs only  
**Duration:** ~10-15 minutes  
**Purpose:** Prevent performance regressions

- 🔦 Lighthouse CI
- 📦 Bundle size analysis
- 📈 Core Web Vitals monitoring

**Why?** Catch performance issues before they reach production.

---

#### 4️⃣ **Security Scan** (`security-scan.yml`)
**Runs on:** Weekly (Sundays) + Main branch pushes  
**Duration:** ~5 minutes  
**Purpose:** Proactive security monitoring

- 🔐 Dependency audits
- 🛡️ Code security checks
- 🔍 Secret scanning

**Why?** Regular security checks without CI noise.

---

## 🔧 Configuration

All workflows use **centralized environment variables**:

```yaml
env:
  VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
  VITE_SUPABASE_PUBLISHABLE_KEY: ${{ secrets.VITE_SUPABASE_PUBLISHABLE_KEY }}
  VITE_SUPABASE_PROJECT_ID: ${{ secrets.VITE_SUPABASE_PROJECT_ID }}
```

### Required GitHub Secrets

1. `VITE_SUPABASE_URL`
2. `VITE_SUPABASE_PUBLISHABLE_KEY`
3. `VITE_SUPABASE_PROJECT_ID`

---

## 📊 Optimization Benefits

### Before Optimization:
- ❌ Duplicate Playwright runs in every workflow
- ❌ 9+ places defining env vars
- ❌ Heavy tests running on every commit
- ⏱️ ~45 minutes per push

### After Optimization:
- ✅ No duplicate test runs
- ✅ DRY env var configuration
- ✅ Tiered testing strategy
- ⏱️ ~3 minutes for fast feedback
- ⏱️ Deep tests only when needed

---

## 🚀 Manual Triggers

All workflows support manual triggering via `workflow_dispatch`.

**To manually run a workflow:**
1. Go to Actions tab
2. Select workflow
3. Click "Run workflow"

---

## 📈 Monitoring

Check workflow status:
- **Fast CI**: Every commit - should always be green ✅
- **Deep Tests**: Daily + PRs - comprehensive coverage
- **Performance**: PRs only - prevent regressions
- **Security**: Weekly - stay secure 🔒

---

## 🗑️ Deprecated Workflows

The following workflows are **disabled** (replaced by optimized versions):

- ❌ `ci.yml` → Replaced by `ci-fast.yml`
- ❌ `e2e-tests.yml` → Consolidated into `deep-tests.yml`
- ❌ `device-tests.yml` → Consolidated into `deep-tests.yml`
- ❌ `performance.yml` → Replaced by `performance-analysis.yml`
- ❌ `deploy-preview.yml` → Using Lovable's built-in system
- ❌ `production-deploy.yml` → Using Lovable's Publish button

---

## 💡 Best Practices

1. **Fast feedback first** - Quick checks on every commit
2. **Deep testing strategically** - Comprehensive coverage on PRs
3. **No redundancy** - Each test runs once, in the right place
4. **Security regularly** - Weekly scans, not blocking CI
5. **Performance monitoring** - Catch regressions before merge
