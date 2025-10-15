# Quick Start Guide - Running QA Tests

## 🚀 Prerequisites

Before running tests, ensure you have:

1. **Node.js** installed (v18 or higher)
2. **npm** or **bun** package manager
3. **Dev server running** on `http://localhost:5173`
4. **Test credentials active** (see below)

## 📋 Test Credentials Setup

Ensure these users exist in your database with correct roles:

```javascript
// Admin User
Email: theha.i.rtologist@gmail.com
Password: TestAdmin123!
Role: admin (in user_roles table)

// Stylist User  
Email: tomtocutit@gmail.com
Password: TestStylist123!
Role: stylist (in user_roles table)

// Client User
Email: chhiasmu@gmail.com
Password: TestClient123!
Role: client (in user_roles table)
```

### Verify Users in Database:

```sql
-- Check users exist
SELECT email FROM auth.users 
WHERE email IN (
  'theha.i.rtologist@gmail.com',
  'tomtocutit@gmail.com', 
  'chhiasmu@gmail.com'
);

-- Check roles assigned
SELECT u.email, ur.role 
FROM auth.users u
JOIN user_roles ur ON ur.user_id = u.id
WHERE u.email IN (
  'theha.i.rtologist@gmail.com',
  'tomtocutit@gmail.com',
  'chhiasmu@gmail.com'
);
```

## 🛠️ Installation

### 1. Install Playwright (if not already installed)

```bash
npm install -D @playwright/test
```

### 2. Install Playwright Browsers

```bash
npx playwright install
```

This downloads Chromium, Firefox, and WebKit browsers.

## ▶️ Running Tests

### Option 1: Using the Helper Script (Recommended)

```bash
# Navigate to E2E directory
cd E2E

# Make script executable
chmod +x run-tests.sh

# Run script
./run-tests.sh
```

The script will present an interactive menu:
1. Run ALL tests (72 tests)
2. Run Desktop tests only (36 tests)
3. Run Mobile tests only (36 tests)
4. Run Admin role tests
5. Run Stylist role tests
6. Run Client role tests
7. Run in headed mode (visual)
8. Generate report only

### Option 2: Direct Commands

```bash
# Run all tests
npx playwright test

# Run specific test file
npx playwright test comprehensive-role-tests.spec.ts
npx playwright test comprehensive-mobile-tests.spec.ts

# Run tests for specific role
npx playwright test -g "Admin Role"
npx playwright test -g "Stylist Role"
npx playwright test -g "Client Role"

# Run in headed mode (see browser)
npx playwright test --headed

# Run specific test
npx playwright test -g "Authentication & Authorization - Admin"

# Run with specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit

# Run mobile tests only
npx playwright test --project="Mobile Chrome"
npx playwright test --project="Mobile Safari"
```

## 📊 Viewing Results

### HTML Report (Recommended)

```bash
# Generate and open HTML report
npx playwright show-report
```

This opens an interactive HTML report in your browser showing:
- ✅ Passed tests
- ❌ Failed tests
- ⏱️ Test duration
- 📸 Screenshots (on failure)
- 🎥 Videos (if enabled)
- 📝 Console logs

### Command Line Output

Test results appear directly in terminal:
- Green ✓ = Passed
- Red ✗ = Failed
- Yellow - = Skipped

## 🔧 Troubleshooting

### Issue: "Dev server not running"

**Solution**: Start your dev server first:
```bash
npm run dev
# or
bun dev
```

### Issue: "Login failed" or "401 Unauthorized"

**Causes**:
1. Test user doesn't exist
2. Password is incorrect
3. User doesn't have correct role assigned

**Solution**: 
1. Create test users manually via auth UI
2. Assign roles in `user_roles` table
3. Verify credentials match test files

### Issue: "Element not found" errors

**Causes**:
1. Page not fully loaded
2. Element selector changed
3. Component refactored

**Solution**:
1. Increase timeout in test
2. Update selectors in test files
3. Add `waitForLoadState('networkidle')`

### Issue: "RLS policy violation"

**Causes**:
1. User doesn't have permission for data
2. RLS policies not configured correctly
3. Role not assigned properly

**Solution**:
1. Check `user_roles` table
2. Verify RLS policies in Supabase
3. Check row ownership in tables

### Issue: Tests timeout

**Solution**: Increase timeout in `playwright.config.ts`:
```typescript
use: {
  timeout: 60000, // 60 seconds per test
}
```

## 📁 Test File Structure

```
E2E/
├── playwright.config.ts           # Playwright configuration
├── run-tests.sh                   # Test runner script
├── QUICK_START_GUIDE.md          # This file
├── TEST_RESULTS_REPORT.md        # Comprehensive documentation
└── tests/
    ├── comprehensive-role-tests.spec.ts    # Desktop tests (36)
    ├── comprehensive-mobile-tests.spec.ts  # Mobile tests (36)
    ├── mobile.spec.ts                      # Additional mobile tests
    ├── new-features-mobile.spec.ts         # Feature-specific tests
    └── system-health.spec.ts               # System monitoring
```

## 🎯 Test Coverage

### Desktop Tests (36 tests)
- Admin Role: 12 tests
- Stylist Role: 12 tests
- Client Role: 12 tests

### Mobile Tests (36 tests)
- Admin Role (iPhone 12 Pro): 12 tests
- Stylist Role (Pixel 5): 12 tests
- Client Role (iPhone 12 Pro): 12 tests

### Test Categories (12 per role)
1. Authentication & Authorization
2. Navigation & Routing
3. Data CRUD Operations
4. UI/UX Responsiveness
5. Performance Metrics
6. Security & RLS Policies
7. Error Handling
8. Form Validation
9. Real-time Updates
10. Accessibility
11. State Management
12. Integration Points

## 🚨 Pre-Test Checklist

Before running tests, verify:

- [ ] Dev server is running (`npm run dev`)
- [ ] Database is accessible
- [ ] Test users exist with correct passwords
- [ ] Roles assigned in `user_roles` table
- [ ] No console errors on manual test
- [ ] All environment variables set
- [ ] Playwright browsers installed

## 📈 Success Criteria

Tests should achieve:
- ✅ 100% pass rate
- ✅ Desktop load time < 3s
- ✅ Mobile load time < 4s
- ✅ No console errors
- ✅ No RLS violations
- ✅ All role-based access working

## 🔄 Continuous Testing

### Run on Every:
- Code deployment
- Database migration
- Role/permission changes
- Weekly maintenance

### CI/CD Integration

Create `.github/workflows/e2e-tests.yml`:

```yaml
name: E2E Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install
      - run: npx playwright install --with-deps
      - run: npm run dev &
      - run: npx playwright test
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

## 📞 Need Help?

If tests fail:
1. Check HTML report: `npx playwright show-report`
2. Review console logs in report
3. Check screenshots of failures
4. Verify test credentials
5. Check database RLS policies
6. Review `TEST_RESULTS_REPORT.md`

## 🎉 Next Steps

After successful test run:
1. Review HTML report
2. Fix any failures
3. Update documentation if needed
4. Deploy with confidence! 🚀

---

**Last Updated**: 2025-10-15  
**Test Suite Version**: 1.0.0  
**Playwright Version**: 1.55.1
