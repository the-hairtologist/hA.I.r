# Deployment Pipeline

## Hair A.I. Multi-Platform CI/CD

**Version:** 1.0.0  
**Date:** 2025-10-04

---

## Current Setup

### Web Deployment

- **Platform:** Vercel
- **Trigger:** Git push to main
- **Build:** `npm run build`
- **Deploy time:** ~2 minutes
- **URL:** https://hair-ai.app

### Mobile Deployment

- **Status:** ⏳ To be configured
- **Recommended:** Fastlane or EAS Build
- **iOS:** App Store Connect
- **Android:** Google Play Console

---

## Unified Build Command

```bash
# Build both platforms
npm run build:all

# Deploy web
npm run deploy:web

# Deploy mobile (future)
npm run deploy:ios
npm run deploy:android
```

---

## GitHub Actions Workflow

```yaml
name: Deploy All Platforms
on:
  push:
    branches: [main]

jobs:
  web:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm install
      - run: npm run build
      - uses: vercel/action@v1

  mobile:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm install
      - run: npm run build:mobile
      - run: npx cap sync
      # Add Fastlane deployment
```

---

## Rollback Strategy

**Web:** Vercel instant rollback to previous deployment
**Mobile:** Submit hotfix build to stores (1-2 day review)

**Database:** See ROLLBACK_PLAN.md for migration reversals

---

**Next Steps:**

1. Configure Fastlane for iOS/Android
2. Set up mobile beta distribution (TestFlight, Internal Testing)
3. Automate version bumping
