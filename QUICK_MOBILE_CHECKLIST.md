# ✅ QUICK MOBILE APP CHECKLIST

**Copy-paste commands for fast deployment**

---

## 🚀 STEP-BY-STEP DEPLOYMENT (30 mins)

### 1️⃣ Export & Clone (2 mins)

```bash
# In Lovable: Click "Export to GitHub"
# Then on your computer:
git clone [your-repo-url]
cd [your-project]
npm install
```

### 2️⃣ Build Project (1 min)

```bash
npm run build
```

### 3️⃣ Add iOS Platform (Mac only, 5 mins)

```bash
npx cap add ios
npx cap update ios
npx cap sync ios
npx cap open ios
```

**Then in Xcode:**

- Select your Apple Developer Team
- Archive → Upload to App Store Connect

### 4️⃣ Add Android Platform (10 mins)

```bash
npx cap add android
npx cap update android
npx cap sync android
npx cap open android
```

**Then in Android Studio:**

- Build → Generate Signed Bundle
- Upload AAB to Play Console

---

## 📱 TEST ON DEVICE (5 mins)

### Hot Reload Testing (Before Production Build)

Your app loads from web - instant updates!

**iOS:**

```bash
npx cap add ios
npx cap open ios
# Press "Run" in Xcode with device connected
```

**Android:**

```bash
npx cap add android
npx cap open android
# Press "Run" in Android Studio with device connected
```

---

## 🎨 ASSETS NEEDED

### App Icons

- **iOS**: 1024x1024px (1 file, Xcode generates rest)
- **Android**: 512x512px (1 file)

### Screenshots (Take from your device)

- **iPhone**: 3-10 screenshots per size
- **Android**: 3-10 screenshots for phone and tablet

### Text

- **App Name**: hA.I.r (already set)
- **Subtitle**: "AI-Powered Salon Assistant"
- **Description**: See MOBILE_DEPLOYMENT_GUIDE.md
- **Keywords**: hair,salon,stylist,color,formula,booking

---

## ⚡ FAST TRACK COMMANDS

### For iOS Developers

```bash
npm install && npm run build
npx cap add ios && npx cap sync ios
npx cap open ios
# Then: Xcode → Product → Archive → Upload
```

### For Android Developers

```bash
npm install && npm run build
npx cap add android && npx cap sync android
npx cap open android
# Then: Build → Generate Signed Bundle → Upload
```

---

## 🐛 QUICK FIXES

**"npx: command not found"**

```bash
npm install -g npm@latest
```

**"capacitor: command not found"**

```bash
npm install -g @capacitor/cli
```

**White screen on device**

```bash
npm run build
npx cap sync
# Then rebuild in IDE
```

**Plugins not working**

```bash
npx cap sync
# Then rebuild in IDE
```

---

## 📞 SUPPORT

Need help? Check:

1. `MOBILE_DEPLOYMENT_GUIDE.md` (full details)
2. [Capacitor Docs](https://capacitorjs.com/docs)
3. Your error message + Google

---

**⏱️ Total Time: ~30 minutes for first deployment**
**🎯 Your app is 100% ready for app stores!**
