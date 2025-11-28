# Mobile App Build Guide

## 📱 Building Native Mobile Apps

### Prerequisites

#### For iOS Development (Mac only)

- macOS 11+
- Xcode 13+
- CocoaPods (`sudo gem install cocoapods`)
- Apple Developer Account (for device testing)

#### For Android Development

- Android Studio
- Java Development Kit (JDK) 11+
- Android SDK (API level 28+)

### Initial Setup

1. **Install Dependencies**

```bash
npm install
```

2. **Add Native Platforms** (first time only)

```bash
# Add iOS (Mac only)
npx cap add ios

# Add Android
npx cap add android
```

3. **Build Web Assets**

```bash
npm run build
```

4. **Sync to Native Platforms**

```bash
npx cap sync
```

---

## 🔄 Development Workflow

### Testing on Emulator/Simulator

#### iOS Simulator (Mac only)

```bash
# Open in Xcode
npx cap open ios

# Or run directly
npx cap run ios
```

#### Android Emulator

```bash
# Open in Android Studio
npx cap open android

# Or run directly
npx cap run android
```

### Testing on Physical Device

#### iOS Device

1. Connect iPhone/iPad via USB
2. Open Xcode: `npx cap open ios`
3. Select your device in Xcode
4. Click Run (⌘R)
5. Trust developer certificate on device

#### Android Device

1. Enable Developer Mode on device
2. Enable USB Debugging
3. Connect via USB
4. Run: `npx cap run android --target=<device-id>`

---

## 🚀 Production Build

### iOS App Store

1. **Prepare for Release**

```bash
npm run build
npx cap sync ios
npx cap open ios
```

2. **In Xcode**

- Product → Archive
- Window → Organizer
- Select archive → Distribute App
- Follow App Store Connect upload flow

3. **App Store Connect**

- Create app listing
- Upload screenshots (iPhone, iPad)
- Submit for review

### Android Play Store

1. **Generate Signed APK/Bundle**

```bash
npm run build
npx cap sync android
npx cap open android
```

2. **In Android Studio**

- Build → Generate Signed Bundle/APK
- Create keystore (first time)
- Select "Android App Bundle" (recommended)
- Choose release variant
- Sign with keystore

3. **Play Console**

- Create app listing
- Upload .aab file
- Submit for review

---

## 🎨 App Assets

### Required Assets

#### iOS

Place in `ios/App/App/Assets.xcassets/`:

- App Icon (`AppIcon.appiconset/`)
  - Various sizes: 20x20 to 1024x1024
- Launch Screen (`LaunchScreen.storyboard`)
- Splash Screen images

#### Android

Place in `android/app/src/main/res/`:

- Launcher icons:
  - `mipmap-hdpi/` (72x72)
  - `mipmap-mdpi/` (48x48)
  - `mipmap-xhdpi/` (96x96)
  - `mipmap-xxhdpi/` (144x144)
  - `mipmap-xxxhdpi/` (192x192)
- Splash screen (`drawable/splash.png`)

### App Icon Generator

Use tools like:

- https://www.appicon.co/
- https://icon.kitchen/

---

## ⚙️ Configuration

### App Information

Edit `capacitor.config.ts`:

```typescript
{
  appId: 'com.yourdomain.hairapp',  // Change this
  appName: 'hA.I.r',                 // Your app name
  webDir: 'dist',
}
```

### iOS Specific

Edit `ios/App/App/Info.plist`:

```xml
<key>CFBundleDisplayName</key>
<string>hA.I.r</string>

<key>NSCameraUsageDescription</key>
<string>Take photos for formulas and portfolio</string>

<key>NSPhotoLibraryUsageDescription</key>
<string>Access photos for formulas and portfolio</string>
```

### Android Specific

Edit `android/app/src/main/AndroidManifest.xml`:

```xml
<application
    android:label="hA.I.r"
    android:theme="@style/AppTheme">

    <!-- Permissions -->
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
</application>
```

---

## 🔍 Debugging

### Live Reload (Development)

The app is currently configured for hot reload from the Lovable sandbox:

```typescript
server: {
  url: 'https://a1a18f9d-b2f9-4d81-aa8c-e28408bee3a2.lovableproject.com';
}
```

**For production**, remove the `server` config:

```typescript
const config: CapacitorConfig = {
  appId: 'app.lovable.a1a18f9db2f94d81aa8ce28408bee3a2',
  appName: 'hair-ai-app',
  webDir: 'dist',
  // server config removed for production
};
```

### Remote Debugging

#### iOS (Safari)

1. Enable Web Inspector on device
2. Safari → Develop → [Device Name] → [App]

#### Android (Chrome)

1. `chrome://inspect` in Chrome
2. Select your device/app

### Native Logs

#### iOS

```bash
# View console logs
npx cap run ios --livereload --external

# Or use Xcode console
```

#### Android

```bash
# View Logcat
adb logcat

# Filter for your app
adb logcat | grep Capacitor
```

---

## 📋 Pre-Release Checklist

### Functionality

- [ ] All features work on iOS
- [ ] All features work on Android
- [ ] Camera access works
- [ ] Photo library access works
- [ ] Haptic feedback works
- [ ] Share functionality works
- [ ] Push notifications work (if enabled)
- [ ] Offline functionality works

### UI/UX

- [ ] Layouts render correctly on iPhone SE (smallest)
- [ ] Layouts render correctly on iPhone 14 Pro Max (largest)
- [ ] Layouts render correctly on iPad
- [ ] Layouts render correctly on Android small (360x640)
- [ ] Layouts render correctly on Android large (480x800)
- [ ] Safe areas respected (notch/Dynamic Island)
- [ ] Status bar color appropriate
- [ ] Splash screen displays correctly
- [ ] App icon displays correctly

### Performance

- [ ] App launches quickly (< 3 seconds)
- [ ] Scrolling is smooth (60fps)
- [ ] Transitions are smooth
- [ ] No memory leaks
- [ ] Images load efficiently
- [ ] Network requests optimized

### Security

- [ ] API keys not hardcoded
- [ ] HTTPS enforced
- [ ] Sensitive data encrypted
- [ ] Permissions properly requested

### Compliance

- [ ] Privacy policy included
- [ ] Terms of service included
- [ ] GDPR compliant (if EU users)
- [ ] COPPA compliant (if under 13)
- [ ] App Store guidelines followed
- [ ] Play Store guidelines followed

---

## 🐛 Common Issues

### Build Fails

```bash
# Clean and reinstall
rm -rf node_modules package-lock.json
npm install
npx cap sync
```

### iOS Code Signing

- Ensure valid provisioning profile
- Check bundle identifier matches
- Verify certificate is not expired

### Android Gradle Issues

```bash
# Clean Gradle cache
cd android
./gradlew clean
cd ..
npx cap sync android
```

### White Screen on Launch

- Check that `npm run build` completed
- Verify `dist` folder has content
- Run `npx cap sync` again

---

## 📚 Resources

- [Capacitor Docs](https://capacitorjs.com/docs)
- [iOS Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Android Design Guidelines](https://material.io/design)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Play Store Guidelines](https://play.google.com/console/about/guides/)

---

## 🆘 Getting Help

1. Check the [Capacitor Community](https://forum.ionicframework.com/c/capacitor/)
2. Search [Stack Overflow](https://stackoverflow.com/questions/tagged/capacitor)
3. Review our `MOBILE_DESKTOP_PARITY.md` guide
4. Check platform-specific docs in `src/platform/`

---

**Last Updated**: 2025-10-06
