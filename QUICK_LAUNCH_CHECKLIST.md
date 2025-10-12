# 📱 Quick Launch Checklist - Mobile App Store

**Print this and check off as you go!**

---

## MONDAY ☑️

### Morning (2 hours)
- [ ] Sign up for Apple Developer Program ($99) - https://developer.apple.com/programs/
- [ ] Create Google Play Console account ($25) - https://play.google.com/console/signup
- [ ] Wait for Apple approval email (24-48 hrs)

### Afternoon (2 hours)
- [ ] Prepare app icon (1024x1024 PNG)
- [ ] Write app description (see template in MOBILE_APP_STORE_LAUNCH_WEEK.md)
- [ ] Take screenshots on iPhone & Android simulators
- [ ] Set up privacy policy URL (you already have this!)

---

## TUESDAY ☑️

### Setup GitHub & Local (1 hour)
- [ ] Click GitHub button in Lovable (top right)
- [ ] Clone repo to local machine
- [ ] Run `npm install`
- [ ] Run `npx cap add ios`
- [ ] Run `npx cap add android`

### iOS Build (2 hours) - **Requires Mac + Xcode**
- [ ] Run `npx cap open ios`
- [ ] Set Bundle Identifier: `app.lovable.a1a18f9db2f94d81aa8ce28408bee3a2`
- [ ] Set Version: `1.0.0`
- [ ] Add App Icon in Assets.xcassets
- [ ] Configure Signing (select your team)
- [ ] Product → Archive
- [ ] Upload to App Store Connect

### Android Build (1.5 hours) - **Requires Android Studio**
- [ ] Run `npx cap open android`
- [ ] Update `android/app/build.gradle` with version info
- [ ] Add app icon (res → New → Image Asset)
- [ ] Build → Generate Signed Bundle/APK
- [ ] Create keystore (SAVE IT SAFELY!)
- [ ] Generate release AAB

---

## WEDNESDAY ☑️

### App Store Connect - iOS (2 hours)
- [ ] Go to https://appstoreconnect.apple.com
- [ ] Create new app
- [ ] Fill app information (name, description, keywords)
- [ ] Upload screenshots (5-10 images)
- [ ] Select build (wait 10-30 min for it to appear)
- [ ] Add demo account for reviewers
- [ ] Submit for review

### Google Play Console - Android (2 hours)
- [ ] Go to https://play.google.com/console
- [ ] Complete store presence (description, screenshots)
- [ ] Upload AAB file
- [ ] Complete content rating questionnaire
- [ ] Set pricing to Free
- [ ] Add contact details
- [ ] Submit for review

---

## THURSDAY ☑️

### Testing (3 hours)
- [ ] Set up TestFlight (iOS) - invite testers
- [ ] Set up Internal Testing (Android) - invite testers
- [ ] Test on real devices:
  - [ ] Login/signup works
  - [ ] Create appointment
  - [ ] Send message
  - [ ] Create formula
  - [ ] Real-time updates work
  - [ ] Automated reminders work
- [ ] Fix any critical bugs
- [ ] Resubmit if needed

---

## FRIDAY 🚀

### Launch Day!
- [ ] Check App Store Connect for iOS approval status
- [ ] Check Play Console for Android approval status
- [ ] If approved on iOS: Release app (goes live in 24hrs)
- [ ] If approved on Android: Already live!

### Post-Launch
- [ ] Share app store links on social media
- [ ] Email beta testers
- [ ] Monitor reviews and respond
- [ ] Check analytics
- [ ] Celebrate! 🎉

---

## Emergency Contacts

**Apple Support**: https://developer.apple.com/contact/  
**Google Support**: https://support.google.com/googleplay/android-developer/  
**Lovable Docs**: https://docs.lovable.dev/mobile/overview

---

## Quick Command Reference

```bash
# Setup
git clone [repo-url]
npm install
npx cap add ios
npx cap add android

# iOS
npx cap sync ios
npx cap open ios

# Android
npx cap sync android
npx cap open android

# When you make changes
npm run build
npx cap sync
```

---

**You've got this!** Follow the detailed guide in `MOBILE_APP_STORE_LAUNCH_WEEK.md` for complete instructions.
