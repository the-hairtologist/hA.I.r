# 🧪 Complete Testing Command Reference
## Run These Commands to Test Everything

**Date:** 2025-10-19  
**Status:** Ready to execute

---

## 🚀 Quick Start (2 Minutes)

### Step 1: Start Development Server
```bash
# Terminal 1
npm run dev
```

**Wait for:** "Local: http://localhost:5173/"

---

### Step 2: Run Full Test Suite
```bash
# Terminal 2
npx playwright test --reporter=html,json
```

**Duration:** 10-14 hours (unattended)  
**Tests:** 219+ automated tests

---

### Step 3: View Results (After Tests Complete)
```bash
npx playwright show-report
```

Opens interactive HTML report in your browser

---

## 🎯 Test Individual Features

### Performance Tests Only (45 mins)
```bash
npx playwright test tests/performance-comprehensive.spec.ts --reporter=html
```

**Tests:**
- Load times (<3s target)
- Button responsiveness (<200ms)
- Memory leak detection
- Network efficiency
- Core Web Vitals

---

### Accessibility Tests Only (30 mins)
```bash
npx playwright test tests/accessibility/a11y.spec.ts --reporter=html
```

**Tests:**
- WCAG 2.2 AA compliance
- Keyboard navigation
- Screen reader compatibility
- Color contrast
- Focus indicators

---

### Mobile Tests Only (1-2 hours)
```bash
npx playwright test tests/mobile-comprehensive.spec.ts --project="Mobile Chrome" --project="Mobile Safari" --reporter=html
```

**Devices tested:**
- iPhone 12 (390×844)
- iPhone SE (375×667)
- Pixel 5 (393×851)
- iPad Air (820×1180)
- Galaxy S20 (360×800)
- 320px width (small phones)

---

### Responsive Design Tests (45 mins)
```bash
npx playwright test tests/devices/responsive.spec.ts --reporter=html
```

**Breakpoints:**
- 320px, 360px, 390px, 768px, 1024px, 1920px

---

### Network/Offline Tests (20 mins)
```bash
npx playwright test tests/network/offline.spec.ts --reporter=html
```

**Tests:**
- Offline functionality
- Slow 3G handling
- Request retry logic

---

### Stress Tests (NEW - 30 mins)
```bash
npx playwright test tests/stress-testing.spec.ts --reporter=html
```

**Tests:**
- 100 rapid CRUD operations
- 10 concurrent users
- 20 rapid page navigations
- Memory leak detection
- Input boundary testing
- Multiple tabs same user

---

## 🔥 Advanced Test Configurations

### Run Specific Browser
```bash
# Chrome only
npx playwright test --project=chromium

# Firefox only
npx playwright test --project=firefox

# Safari only
npx playwright test --project=webkit

# Mobile Safari only
npx playwright test --project="Mobile Safari"
```

---

### Run Tests in Headed Mode (Visual)
```bash
npx playwright test --headed
```

Shows browser window while tests run (useful for debugging)

---

### Run Tests with Debug Info
```bash
npx playwright test --debug
```

Pauses at each step, allows inspection

---

### Run Single Test File
```bash
npx playwright test tests/performance-comprehensive.spec.ts
```

---

### Run Tests Matching Pattern
```bash
# All tests with "mobile" in name
npx playwright test -g "mobile"

# All tests with "performance" in name
npx playwright test -g "performance"

# All accessibility tests
npx playwright test -g "accessibility"
```

---

## 🌙 Overnight Continuous Testing

### Option 1: Run Tests Every 30 Minutes
```bash
# Create and run overnight script
cat > overnight-test.sh << 'EOF'
#!/bin/bash
iteration=1
while true; do
  echo "========================================"
  echo "Test Run #$iteration - $(date)"
  echo "========================================"
  
  npx playwright test --reporter=json > "test-results-$(date +%s).json"
  
  if [ $? -eq 0 ]; then
    echo "✅ All tests passed"
  else
    echo "❌ Some tests failed - check report"
    npx playwright show-report
  fi
  
  echo "Waiting 30 minutes before next run..."
  sleep 1800
  
  ((iteration++))
done
EOF

chmod +x overnight-test.sh
./overnight-test.sh &
```

---

### Option 2: Run Tests on Loop (Continuous)
```bash
while true; do
  npx playwright test
  sleep 1800
done
```

---

### Option 3: Background Testing
```bash
# Run in background, log to file
npx playwright test &> test-output.log &

# Check progress
tail -f test-output.log

# View results when done
npx playwright show-report
```

---

## 📊 Generate Performance Reports

### Lighthouse Audit (All Pages)
```bash
# Install lighthouse CLI
npm install -g lighthouse

# Audit homepage
lighthouse http://localhost:5173 --output html --output-path ./reports/home.html

# Audit dashboard
lighthouse http://localhost:5173/dashboard --output html --output-path ./reports/dashboard.html

# Audit formulas
lighthouse http://localhost:5173/formulas --output html --output-path ./reports/formulas.html
```

**Target Scores:** All ≥90

---

### Bundle Analysis
```bash
# Build with stats
npm run build

# Analyze bundle
npx vite-bundle-visualizer dist/stats.html
```

Opens visualization of bundle sizes

---

## 🧪 Test AI Features Manually

### Test Hair Photo Analysis
```bash
# 1. Start server
npm run dev

# 2. In browser:
# - Login as stylist
# - Go to Clients
# - Click any client
# - Go to "AI Analysis" tab
# - Upload a hair photo
# - Verify analysis appears
```

**Test Photos:**
- Use clear, well-lit photos
- Try different hair colors (blonde, brown, black, red)
- Try different conditions (healthy, damaged)
- Test with/without previous color

---

### Test Formula Recommendations
```bash
# 1. Ensure client has history (create 2-3 formulas first)

# 2. In browser:
# - Login as stylist
# - Go to Clients
# - Click client with history
# - Go to "AI Analysis" tab
# - Click "Generate New"
# - Verify recommendations appear
```

**Test Scenarios:**
- Client with 0 formulas (should handle gracefully)
- Client with 1 formula (limited context)
- Client with 5+ formulas (rich context)
- Client with good reviews (positive feedback)
- Client with mixed reviews (learn from failures)

---

## 🐛 Debug Failing Tests

### View Last Test Run Details
```bash
npx playwright show-report
```

---

### Run Failed Tests Only
```bash
npx playwright test --last-failed
```

---

### Run Specific Test with Trace
```bash
npx playwright test --trace on tests/performance-comprehensive.spec.ts
```

View trace in report for detailed debugging

---

### Check Test Screenshots
```bash
# Screenshots saved to:
ls -lah test-results/
```

View failed test screenshots

---

## 📈 Monitor During Testing

### Check System Health
```bash
# CPU & Memory
top

# Network connections
netstat -an | grep ESTABLISHED | wc -l

# Disk usage
df -h

# Check if dev server is running
curl http://localhost:5173
```

---

### Monitor Database
```bash
# Check Supabase logs in:
# Lovable Cloud → Database → Logs

# Or query directly:
# See postgres-logs in useful context
```

---

### Monitor Edge Functions
```bash
# Check function logs:
# Lovable Cloud → Functions → Select function → Logs

# Look for:
# - Error patterns
# - Response times
# - Rate limit hits
```

---

## ✅ Success Criteria Checklist

### Automated Tests
- [ ] Performance tests: ≥95% pass rate
- [ ] Accessibility tests: 100% pass rate
- [ ] Mobile tests: ≥95% pass rate
- [ ] Responsive tests: 100% pass rate
- [ ] Network tests: 100% pass rate
- [ ] Stress tests: ≥90% pass rate

### Manual Tests
- [ ] Hair photo analysis works
- [ ] Formula recommendations work
- [ ] All browsers tested (Chrome, Firefox, Safari, Edge)
- [ ] Mobile devices tested (iOS, Android)
- [ ] Tablets tested (iPad)

### Performance Benchmarks
- [ ] All pages load <3s
- [ ] LCP <2.5s
- [ ] CLS <0.1
- [ ] FCP <1.8s
- [ ] No console errors

### AI Features
- [ ] Hair analysis accuracy validated
- [ ] Recommendations quality verified
- [ ] Error handling works (rate limits, credits)
- [ ] Results saved to database
- [ ] UI displays results correctly

---

## 🎬 Complete Test Sequence

### Full System Test (One Command)
```bash
# Run everything
npm run dev & \
npx playwright test --reporter=html,json && \
npx playwright show-report
```

---

### Comprehensive Manual Test
```bash
# 1. Start server
npm run dev

# 2. Test as stylist:
# - Login
# - View dashboard
# - Create client
# - Upload hair photo
# - Generate recommendations
# - Create formula
# - Book appointment
# - Complete appointment

# 3. Test as client:
# - Login
# - View formulas
# - View appointments
# - Book appointment
# - Leave review

# 4. Test as admin:
# - View all users
# - Check audit logs
# - Review security reports
# - Monitor system health
```

---

## 📝 After Testing

### Review Results
```bash
# Open HTML report
npx playwright show-report

# Check JSON results
cat test-results.json | jq .

# View failed test screenshots
open test-results/
```

---

### Fix Issues
```bash
# Re-run specific failed test
npx playwright test tests/specific-test.spec.ts

# Run with more detail
npx playwright test --debug
```

---

### Generate Final Report
```bash
# Combine all results
cat test-results-*.json > combined-results.json

# Generate summary
echo "Test Summary - $(date)" > FINAL_TEST_REPORT.md
echo "Total Runs: $(ls test-results-*.json | wc -l)" >> FINAL_TEST_REPORT.md
```

---

**Ready to test?** Pick a command and run it! 🚀

**Recommended Order:**
1. `npm run dev` (start server)
2. `npx playwright test` (run all tests)
3. Test AI features manually while waiting
4. `npx playwright show-report` (view results)
