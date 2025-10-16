# 🏗️ Production Build Guide

Complete guide for building and deploying hA.I.r Pro to iOS App Store and Google Play Store.

---

## 📋 Prerequisites

### Required Accounts

1. **Apple Developer Account** (iOS)
   - Cost: $99/year
   - Sign up: https://developer.apple.com/programs/enroll/
   - Allow 24-48 hours for approval

2. **Google Play Console** (Android)
   - One-time fee: $25
   - Sign up: https://play.google.com/console/signup
   - Instant approval

3. **Development Tools**
   - **Mac required for iOS** (Xcode only runs on macOS)
   - **Windows/Mac/Linux for Android** (Android Studio)
   - Git installed
   - Node.js 18+ installed

---

## ⚙️ Initial Setup

### 1. Clone Your Repository

```bash
# Clone from GitHub
git clone https://github.com/your-username/your-repo.git
cd your-repo

# Install dependencies
npm install

# Verify installation
npm run build
```

### 2. Configure Environment

The app uses these environment variables (already configured in Lovable):
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_PROJECT_ID`

**Optional** (add for enhanced features):
- `VITE_GA4_MEASUREMENT_ID` - Google Analytics
- `VITE_SENTRY_DSN` - Crash reporting

---

## 🍎 iOS Build Process

### Step 1: Install Xcode

1. Download Xcode from Mac App Store (free, ~15 GB)
2. Open Xcode → Preferences → Accounts
3. Add your Apple ID
4. Download simulators (iOS 15+)

### Step 2: Configure Capacitor for iOS

```bash
# Add iOS platform (only first time)
npx cap add ios

# Build web assets
npm run build

# Copy web assets to iOS
npx cap sync ios

# Open in Xcode
npx cap open ios
```

### Step 3: Configure in Xcode

**CRITICAL: Before opening Xcode, ensure `capacitor.config.ts` has server block commented out!**

In Xcode:

1. **Select Target** → "App" (not "App-Debug")

2. **General Tab:**
   - Display Name: `hA.I.r Pro`
   - Bundle Identifier: `app.lovable.a1a18f9db2f94d81aa8ce28408bee3a2`
   - Version: `1.0.0`
   - Build: `1`
   - Deployment Target: iOS 15.0
   - Device: iPhone

3. **Signing & Capabilities:**
   - Team: Select your Apple Developer team
   - Signing: Automatic
   - Capabilities:
     - ✅ Push Notifications
     - ✅ Background Modes (Remote notifications)
     - ✅ In-App Purchase

4. **Info.plist:**
   Add these privacy descriptions (required):
   ```xml
   <key>NSCameraUsageDescription</key>
   <string>Take photos of hairstyles and color results</string>
   
   <key>NSPhotoLibraryUsageDescription</key>
   <string>Save and access hairstyle photos</string>
   
   <key>NSPhotoLibraryAddUsageDescription</key>
   <string>Save photos to your library</string>
   
   <key>NSUserTrackingUsageDescription</key>
   <string>This helps us provide personalized experiences</string>
   ```

### Step 4: Test on Simulator

```bash
# Or in Xcode: Product → Run (Cmd+R)
# Select iPhone 15 Pro simulator

# Test core features:
# ✓ Login/Signup
# ✓ Formula generator
# ✓ Camera access
# ✓ Subscription flow
```

### Step 5: Build for TestFlight

1. In Xcode: Product → Archive
2. Wait for build (5-10 minutes)
3. Window → Organizer
4. Select your archive
5. Click "Distribute App"
6. Choose "App Store Connect"
7. Upload (10-20 minutes depending on connection)

### Step 6: Configure App Store Connect

1. Go to https://appstoreconnect.apple.com
2. My Apps → + → New App
3. Fill metadata using `STORE_METADATA_TEMPLATES.md`
4. Upload screenshots (1290x2796px for iPhone 15 Pro Max)
5. Select build from TestFlight
6. Set pricing: Free (with in-app purchases)
7. Add IAP products:
   - `hair_pro_monthly_subscription` - $14.99/month
   - `hair_pro_yearly_subscription` - $143.99/year

### Step 7: Submit for Review

1. Fill out all required fields
2. Answer App Store questions honestly
3. Submit for review
4. Review typically takes 24-48 hours

---

## 🤖 Android Build Process

### Step 1: Install Android Studio

1. Download from https://developer.android.com/studio
2. Install Android SDK 34+ (API Level 34)
3. Set up virtual device (Pixel 5 or similar)

### Step 2: Configure Capacitor for Android

```bash
# Add Android platform (only first time)
npx cap add android

# Build web assets
npm run build

# Copy web assets to Android
npx cap sync android

# Open in Android Studio
npx cap open android
```

### Step 3: Configure in Android Studio

**CRITICAL: Before opening Android Studio, ensure `capacitor.config.ts` has server block commented out!**

1. **Open** `android/app/build.gradle`

2. **Update version info:**
   ```gradle
   android {
       defaultConfig {
           applicationId "app.lovable.a1a18f9db2f94d81aa8ce28408bee3a2"
           minSdkVersion 22
           targetSdkVersion 34
           versionCode 1
           versionName "1.0.0"
       }
   }
   ```

3. **Configure signing:**
   
   Generate keystore:
   ```bash
   keytool -genkey -v -keystore hair-ai-release.keystore \
     -alias hair-ai-key -keyalg RSA -keysize 2048 -validity 10000
   ```
   
   Create `android/key.properties`:
   ```properties
   storeFile=../hair-ai-release.keystore
   storePassword=YOUR_STORE_PASSWORD
   keyAlias=hair-ai-key
   keyPassword=YOUR_KEY_PASSWORD
   ```
   
   Update `android/app/build.gradle`:
   ```gradle
   def keystorePropertiesFile = rootProject.file("key.properties")
   def keystoreProperties = new Properties()
   keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
   
   android {
       signingConfigs {
           release {
               storeFile file(keystoreProperties['storeFile'])
               storePassword keystoreProperties['storePassword']
               keyAlias keystoreProperties['keyAlias']
               keyPassword keystoreProperties['keyPassword']
           }
       }
       buildTypes {
           release {
               signingConfig signingConfigs.release
               minifyEnabled false
               proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
           }
       }
   }
   ```

### Step 4: Test on Emulator

1. In Android Studio: Run → Run 'app'
2. Select emulator (Pixel 5 recommended)
3. Test core features

### Step 5: Build Release AAB

```bash
# From project root
cd android
./gradlew bundleRelease

# Find AAB at:
# android/app/build/outputs/bundle/release/app-release.aab
```

### Step 6: Upload to Google Play Console

1. Go to https://play.google.com/console
2. Create App → Fill basic info
3. Production → Create new release
4. Upload `app-release.aab`
5. Add release notes:
   ```
   Initial release - hA.I.r Pro v1.0.0
   
   Features:
   • AI-powered hair color formula generator
   • Client management system
   • Appointment scheduling
   • Business analytics
   • Professional portfolio
   ```

6. Save and move to "Store Listing"
7. Fill metadata using `STORE_METADATA_TEMPLATES.md`
8. Upload screenshots (1080x1920px minimum)
9. Upload feature graphic (1024x500px)
10. Set content rating (complete questionnaire)
11. Set pricing: Free
12. Complete Data Safety form

### Step 7: Submit for Review

1. Review all sections for completeness
2. Submit to production
3. Review typically takes 1-7 days

---

## 🔄 Update Process

When releasing updates:

### Version Numbering

```
MAJOR.MINOR.PATCH (e.g., 1.2.3)

MAJOR: Breaking changes or major new features
MINOR: New features, backward compatible
PATCH: Bug fixes, small improvements
```

### iOS Update Steps

1. Update version in `package.json`: `"version": "1.0.1"`
2. Update in Xcode:
   - Version: `1.0.1`
   - Build: Increment (2, 3, 4...)
3. Make code changes
4. Test thoroughly
5. Archive and upload
6. Update "What's New" in App Store Connect
7. Submit for review

### Android Update Steps

1. Update version in `package.json`
2. Update `android/app/build.gradle`:
   ```gradle
   versionCode 2  // Increment by 1
   versionName "1.0.1"
   ```
3. Make code changes
4. Test thoroughly
5. Build new AAB: `./gradlew bundleRelease`
6. Upload to Play Console (Production track)
7. Add release notes
8. Submit for review

---

## 🧪 Testing Checklist

Before submitting each build:

### Functionality Tests
- [ ] Login/signup works
- [ ] AI formula generator works
- [ ] Camera access works
- [ ] Appointments can be created
- [ ] Messages send/receive
- [ ] Subscription purchase works (sandbox/test mode)
- [ ] Profile updates save
- [ ] Navigation works smoothly
- [ ] Offline mode functions

### Platform-Specific Tests
**iOS:**
- [ ] Apple IAP flows correctly to Apple payment
- [ ] Restore purchases works
- [ ] Face ID/Touch ID (if implemented)
- [ ] Dark mode works
- [ ] iPad layout responsive

**Android:**
- [ ] Stripe flows correctly to web checkout
- [ ] Back button navigation correct
- [ ] Material Design components render
- [ ] Different screen sizes tested
- [ ] Dark mode works

### Performance Tests
- [ ] App loads in < 3 seconds
- [ ] No memory leaks
- [ ] Smooth scrolling
- [ ] Images load properly
- [ ] No crashes during 10-minute usage

---

## 🐛 Common Issues & Solutions

### iOS Issues

**Issue:** "No signing certificate found"
- **Fix:** Xcode → Preferences → Accounts → Manage Certificates → + → iOS Distribution

**Issue:** "Bundle identifier already exists"
- **Fix:** You must use your own unique bundle ID, not the default Lovable one

**Issue:** "Provisioning profile doesn't include signing certificate"
- **Fix:** Select "Automatically manage signing" in Xcode

**Issue:** "App crashes on launch"
- **Fix:** Check `capacitor.config.ts` - server block should be commented out for production

### Android Issues

**Issue:** "Keystore not found"
- **Fix:** Verify `key.properties` path is correct relative to `android/` folder

**Issue:** "INSTALL_FAILED_UPDATE_INCOMPATIBLE"
- **Fix:** Uninstall old version first: `adb uninstall app.lovable.a1a18f9db2f94d81aa8ce28408bee3a2`

**Issue:** "App opens then closes immediately"
- **Fix:** Check logcat for errors: `adb logcat *:E`

**Issue:** "Build fails with 'minSdkVersion' error"
- **Fix:** Ensure `minSdkVersion 22` in `build.gradle`

---

## 📊 Post-Launch Monitoring

### Week 1
- [ ] Monitor crash reports (if Sentry configured)
- [ ] Check user reviews daily
- [ ] Respond to 1-star reviews within 24 hours
- [ ] Track download numbers
- [ ] Monitor subscription conversion rate

### Week 2-4
- [ ] Analyze user feedback patterns
- [ ] Plan first update based on feedback
- [ ] Optimize app store listing (keywords, screenshots)
- [ ] Consider A/B testing icon designs

---

## 📞 Support

**Build Issues:** ThehA.I.rtologist@gmail.com

**Apple Developer Support:** https://developer.apple.com/support/

**Google Play Support:** https://support.google.com/googleplay/android-developer

---

## ✅ Final Pre-Submission Checklist

### Both Platforms
- [ ] `capacitor.config.ts` server block commented out
- [ ] Version updated to `1.0.0`
- [ ] All icons present (512x512, 192x192, 1024x1024)
- [ ] Privacy policy URL added
- [ ] Terms of service URL added
- [ ] Support email configured
- [ ] Test builds verified on real devices
- [ ] Screenshots captured (4-8 per platform)

### iOS Specific
- [ ] Bundle ID registered in Apple Developer
- [ ] IAP products created in App Store Connect
- [ ] Shared secret generated and saved
- [ ] Privacy descriptions in Info.plist
- [ ] All capabilities enabled
- [ ] TestFlight tested with sandbox user

### Android Specific
- [ ] Release keystore generated and backed up
- [ ] key.properties configured
- [ ] Data Safety form completed
- [ ] Content rating questionnaire completed
- [ ] Feature graphic uploaded (1024x500px)
- [ ] Store listing complete

---

**Ready to Build?** Follow this guide step-by-step and you'll have your app in both stores within a week! 🚀
