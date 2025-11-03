# Mobile Development Guide

**hA.I.r - Native Mobile App**

---

## Overview

This guide covers everything you need to develop, test, and deploy the hA.I.r mobile application for iOS and Android using Capacitor.

---

## Prerequisites

### Required Software

#### For iOS Development

- **macOS** (Catalina 10.15.4 or later)
- **Xcode** 12.0 or later ([Download](https://apps.apple.com/us/app/xcode/id497799835))
- **CocoaPods** (install via: `sudo gem install cocoapods`)
- **Apple Developer Account** ($99/year for App Store distribution)

#### For Android Development

- **Android Studio** Arctic Fox or later ([Download](https://developer.android.com/studio))
- **JDK** 11 or later
- **Android SDK** (Platform 29+)
- **Google Play Console Account** ($25 one-time fee)

#### For Both Platforms

- **Node.js** 16+ and npm
- **Git**
- **Code editor** (VS Code recommended)

---

## Initial Setup

### 1. Export and Clone Repository

```bash
# Export your project to GitHub using Lovable's "Export to Github" button
# Then clone your repository
git clone https://github.com/yourusername/hair-ai-app.git
cd hair-ai-app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Add Native Platforms

#### iOS

```bash
npx cap add ios
npx cap update ios
```

This creates an `ios/` directory with your Xcode project.

#### Android

```bash
npx cap add android
npx cap update android
```

This creates an `android/` directory with your Android Studio project.

---

## Development Workflow

### Hot Reload Development (Sandbox)

During development, the app is configured to connect to the Lovable sandbox for hot-reload:

```typescript
// capacitor.config.ts
server: {
  url: 'https://a1a18f9d-b2f9-4d81-aa8ce28408bee3a2.lovableproject.com?forceHideBadge=true',
  cleartext: true
}
```

**To use hot-reload:**

1. Make changes in Lovable editor
2. App automatically reloads on device/emulator
3. No need to rebuild native projects

### Local Development (No Hot Reload)

For testing locally without internet:

1. **Build the web assets:**

   ```bash
   npm run build
   ```

2. **Sync to native projects:**

   ```bash
   npx cap sync
   ```

3. **Run on device/emulator:**

   ```bash
   # iOS
   npx cap run ios

   # Android
   npx cap run android
   ```

---

## iOS Development

### Opening the Project

```bash
npx cap open ios
```

This opens the project in Xcode.

### Configuration

#### 1. Bundle Identifier

- In Xcode, select the project root
- Under **General** → **Identity**
- Bundle Identifier: `app.lovable.a1a18f9db2f94d81aa8ce28408bee3a2`

#### 2. Signing & Capabilities

- Under **Signing & Capabilities**
- Check **Automatically manage signing**
- Select your **Team** (requires Apple Developer account)
- Add capabilities:
  - ✅ Push Notifications
  - ✅ Associated Domains (for Universal Links)
  - ✅ Background Modes (if needed)

#### 3. Associated Domains

For Universal Links (deep linking):

```
applinks:yourdomain.com
```

#### 4. Info.plist Additions

Add to `ios/App/App/Info.plist`:

```xml
<!-- Camera permission (for photo uploads) -->
<key>NSCameraUsageDescription</key>
<string>Take photos for your hair portfolio</string>

<!-- Photo Library permission -->
<key>NSPhotoLibraryUsageDescription</key>
<string>Access photos for your portfolio</string>

<!-- Location permission (optional) -->
<key>NSLocationWhenInUseUsageDescription</key>
<string>Find nearby salons</string>

<!-- URL Scheme for deep linking -->
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>hair</string>
    </array>
  </dict>
</array>
```

### Building for iOS

#### Debug Build (Simulator)

```bash
npx cap run ios
```

#### Release Build (Device/TestFlight)

1. In Xcode, select **Product** → **Archive**
2. Once archived, click **Distribute App**
3. Choose distribution method:
   - **TestFlight/App Store:** For beta testing or release
   - **Ad Hoc:** For specific devices
   - **Development:** For local testing

### TestFlight Beta Testing

1. **Create App Store Connect Record:**
   - Go to [App Store Connect](https://appstoreconnect.apple.com)
   - Click **My Apps** → **+** → **New App**
   - Fill in app metadata

2. **Upload Build:**
   - Archive in Xcode
   - Distribute → App Store Connect
   - Wait for processing (~5-20 minutes)

3. **Add Beta Testers:**
   - App Store Connect → TestFlight tab
   - Add internal testers (no review required)
   - Add external testers (requires beta review)

---

## Android Development

### Opening the Project

```bash
npx cap open android
```

This opens the project in Android Studio.

### Configuration

#### 1. Package Name

- In Android Studio, open `android/app/build.gradle`
- Verify `applicationId`:

```gradle
android {
    defaultConfig {
        applicationId "app.lovable.a1a18f9db2f94d81aa8ce28408bee3a2"
    }
}
```

#### 2. Permissions

Add to `android/app/src/main/AndroidManifest.xml`:

```xml
<manifest>
  <!-- Camera permission -->
  <uses-permission android:name="android.permission.CAMERA" />

  <!-- Photo access -->
  <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
  <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE"
                   android:maxSdkVersion="28" />

  <!-- Internet (required) -->
  <uses-permission android:name="android.permission.INTERNET" />

  <!-- Network state -->
  <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

  <!-- Location (optional) -->
  <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />

  <!-- Notifications -->
  <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
</manifest>
```

#### 3. Deep Link Intent Filters

Add to `<activity>` in `AndroidManifest.xml`:

```xml
<intent-filter android:autoVerify="true">
  <action android:name="android.intent.action.VIEW" />
  <category android:name="android.intent.category.DEFAULT" />
  <category android:name="android.intent.category.BROWSABLE" />

  <!-- HTTP/HTTPS links -->
  <data android:scheme="https"
        android:host="yourdomain.com" />

  <!-- Custom scheme -->
  <data android:scheme="hair" />
</intent-filter>
```

### Generating Signing Key

For release builds:

```bash
# Generate keystore
keytool -genkey -v -keystore hair-release-key.keystore \
  -alias hair-key-alias \
  -keyalg RSA -keysize 2048 -validity 10000

# Get SHA-256 fingerprint (for App Links)
keytool -list -v -keystore hair-release-key.keystore
```

**CRITICAL:** Back up your keystore file and passwords securely!

Add to `android/gradle.properties`:

```properties
HAIR_RELEASE_STORE_FILE=../hair-release-key.keystore
HAIR_RELEASE_KEY_ALIAS=hair-key-alias
HAIR_RELEASE_STORE_PASSWORD=YOUR_STORE_PASSWORD
HAIR_RELEASE_KEY_PASSWORD=YOUR_KEY_PASSWORD
```

Update `android/app/build.gradle`:

```gradle
android {
    signingConfigs {
        release {
            storeFile file(HAIR_RELEASE_STORE_FILE)
            storePassword HAIR_RELEASE_STORE_PASSWORD
            keyAlias HAIR_RELEASE_KEY_ALIAS
            keyPassword HAIR_RELEASE_KEY_PASSWORD
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
        }
    }
}
```

### Building for Android

#### Debug Build (Emulator/Device)

```bash
npx cap run android
```

#### Release Build (AAB for Play Store)

```bash
cd android
./gradlew bundleRelease

# Output: android/app/build/outputs/bundle/release/app-release.aab
```

#### Release APK (for manual distribution)

```bash
cd android
./gradlew assembleRelease

# Output: android/app/build/outputs/apk/release/app-release.apk
```

### Google Play Internal Testing

1. **Create Play Console App:**
   - Go to [Google Play Console](https://play.google.com/console)
   - Click **Create app**
   - Fill in app details

2. **Upload AAB:**
   - Go to **Release** → **Testing** → **Internal testing**
   - Create new release
   - Upload `app-release.aab`
   - Add release notes

3. **Add Testers:**
   - Create email list
   - Share internal testing link
   - Testers download via Play Store

---

## Native Features Implementation

### Deep Linking

Handle deep links in your app:

```typescript
// src/App.tsx
import { App as CapacitorApp } from '@capacitor/app';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function App() {
  const navigate = useNavigate();

  useEffect(() => {
    CapacitorApp.addListener('appUrlOpen', (event) => {
      const url = new URL(event.url);

      // Handle hair:// scheme
      if (url.protocol === 'hair:') {
        const path = url.pathname;
        navigate(path);
      }

      // Handle https://yourdomain.com links
      if (url.hostname === 'yourdomain.com') {
        const path = url.pathname;
        navigate(path);
      }
    });

    return () => {
      CapacitorApp.removeAllListeners();
    };
  }, [navigate]);

  return (
    // ... your app
  );
}
```

### Status Bar

```typescript
import { StatusBar, Style } from '@capacitor/status-bar';

// Light background
await StatusBar.setStyle({ style: Style.Dark });

// Dark background
await StatusBar.setStyle({ style: Style.Light });

// Hide status bar
await StatusBar.hide();
```

### Haptic Feedback

```typescript
import { Haptics, ImpactStyle } from '@capacitor/haptics';

// Light tap
await Haptics.impact({ style: ImpactStyle.Light });

// Medium tap
await Haptics.impact({ style: ImpactStyle.Medium });

// Heavy tap
await Haptics.impact({ style: ImpactStyle.Heavy });
```

### Keyboard Management

```typescript
import { Keyboard } from '@capacitor/keyboard';

// Hide keyboard
await Keyboard.hide();

// Listen for keyboard events
Keyboard.addListener('keyboardWillShow', info => {
  console.log('Keyboard height:', info.keyboardHeight);
});
```

---

## Testing

### Unit Testing

```bash
npm test
```

### E2E Testing

```bash
npm run test:e2e
```

### Device Testing

#### iOS Simulator

```bash
# List available simulators
xcrun simctl list devices

# Boot specific simulator
xcrun simctl boot "iPhone 14 Pro"

# Run app
npx cap run ios --target="iPhone 14 Pro"
```

#### Android Emulator

```bash
# List available AVDs
emulator -list-avds

# Start emulator
emulator -avd Pixel_6_API_33

# Run app
npx cap run android
```

---

## Debugging

### iOS Debugging

1. **Safari Web Inspector:**
   - Connect iPhone via USB
   - Safari → Develop → [Your iPhone] → [Your App]
   - Use Console, Network, Elements tabs

2. **Xcode Console:**
   - View → Debug Area → Show Debug Area
   - See native logs and errors

### Android Debugging

1. **Chrome DevTools:**
   - Connect Android device via USB
   - Chrome → `chrome://inspect`
   - Click **inspect** under your app

2. **Android Studio Logcat:**
   - View → Tool Windows → Logcat
   - Filter by package name or tags

### Common Issues

#### iOS Build Failures

```bash
# Clean build folders
cd ios
rm -rf Pods
pod cache clean --all
pod install

# Clean Xcode derived data
rm -rf ~/Library/Developer/Xcode/DerivedData
```

#### Android Build Failures

```bash
# Clean build
cd android
./gradlew clean

# Invalidate caches (Android Studio)
File → Invalidate Caches and Restart
```

---

## Performance Optimization

### Bundle Size Optimization

```bash
# Analyze bundle
npm run build -- --analyze

# Enable compression in vercel.json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Encoding",
          "value": "gzip"
        }
      ]
    }
  ]
}
```

### Image Optimization

- Use WebP format
- Lazy load images
- Implement responsive images

### Code Splitting

```typescript
// Lazy load routes
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Appointments = lazy(() => import('./pages/Appointments'));
```

---

## Release Checklist

### Pre-Release

- [ ] All features tested on real devices
- [ ] Performance benchmarks met
- [ ] Accessibility audit passed
- [ ] Security scan completed
- [ ] Beta testing feedback addressed
- [ ] App store metadata finalized
- [ ] Privacy policy reviewed
- [ ] Support channels ready

### iOS Release

- [ ] App Store Connect app created
- [ ] Screenshots uploaded (all sizes)
- [ ] App preview video (optional)
- [ ] Privacy declarations completed
- [ ] Age rating questionnaire filled
- [ ] Pricing and availability set
- [ ] TestFlight testing completed
- [ ] Submit for review

### Android Release

- [ ] Play Console app created
- [ ] Feature graphic uploaded
- [ ] Screenshots uploaded (all sizes)
- [ ] Short description (80 chars)
- [ ] Full description (4000 chars)
- [ ] Content rating questionnaire
- [ ] Pricing and distribution
- [ ] Internal testing completed
- [ ] Submit for review

---

## Resources

### Official Documentation

- [Capacitor Docs](https://capacitorjs.com/docs)
- [iOS Developer Docs](https://developer.apple.com/documentation/)
- [Android Developer Docs](https://developer.android.com/docs)

### Useful Guides

- [iOS App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play Policy Center](https://play.google.com/about/developer-content-policy/)
- [Capacitor Blog](https://capacitorjs.com/blog)

### Community

- [Capacitor Discord](https://discord.com/invite/UPYYRhtyzp)
- [Ionic Forum](https://forum.ionicframework.com/)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/capacitor)

---

## Support

For technical issues with mobile development:

- **Email:** dev@hair.app
- **GitHub Issues:** [Repository Issues](https://github.com/yourusername/hair-ai-app/issues)

---

**Last Updated:** 2025-10-04  
**Version:** 1.0.0
