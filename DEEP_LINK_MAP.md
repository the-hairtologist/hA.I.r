# Deep Link Map
**hA.I.r - Universal Links / App Links Configuration**

---

## Overview

This document maps all supported deep link routes for the hA.I.r application. Deep links allow users to navigate directly to specific screens within the app from external sources (emails, SMS, web links, QR codes, etc.).

---

## Supported Schemes

### Custom Scheme
- **Scheme:** `hair://`
- **Use Case:** Direct app launching
- **Always works:** Yes (no domain verification needed)

### Universal Links (iOS)
- **Scheme:** `https://`
- **Domains:** `yourdomain.com`, `www.yourdomain.com`
- **Fallback:** Opens in browser if app not installed
- **Requires:** `apple-app-site-association` file on domain

### App Links (Android)
- **Scheme:** `https://`
- **Domains:** `yourdomain.com`, `www.yourdomain.com`
- **Fallback:** Opens in browser if app not installed
- **Requires:** `assetlinks.json` file on domain + verified SHA-256 fingerprint

---

## Deep Link Routes

### Public Routes (No Authentication Required)

#### Home / Landing Page
```
Custom:    hair://
Universal: https://yourdomain.com/
App Link:  https://yourdomain.com/

Description: Opens app to landing/home screen
Use Cases: 
  - General app promotion
  - QR codes at salon
  - Marketing materials
```

#### Sign In
```
Custom:    hair://auth
Universal: https://yourdomain.com/auth
App Link:  https://yourdomain.com/auth

Description: Opens authentication screen
Use Cases:
  - Email verification links
  - Password reset flows
  - Welcome emails
```

#### Stylist Profile (Public)
```
Custom:    hair://stylist/:stylistId
Universal: https://yourdomain.com/stylist/:stylistId
App Link:  https://yourdomain.com/stylist/:stylistId

Description: Opens public stylist profile view
Parameters:
  - stylistId (UUID): Unique stylist identifier
Use Cases:
  - Stylist sharing their profile
  - Social media links
  - Business cards / QR codes
  - Referral links

Example:
  hair://stylist/123e4567-e89b-12d3-a456-426614174000
  https://yourdomain.com/stylist/123e4567-e89b-12d3-a456-426614174000
```

#### Stylist Discovery
```
Custom:    hair://stylists
Universal: https://yourdomain.com/stylists
App Link:  https://yourdomain.com/stylists

Description: Opens stylist search/discovery screen
Query Parameters (optional):
  - location (string): Filter by location
  - specialty (string): Filter by specialty
  - rating (number): Minimum rating filter

Examples:
  hair://stylists?location=NYC&specialty=balayage
  https://yourdomain.com/stylists?rating=4.5
```

### Protected Routes (Authentication Required)

#### Dashboard
```
Custom:    hair://dashboard
Universal: https://yourdomain.com/dashboard
App Link:  https://yourdomain.com/dashboard

Description: Opens main dashboard
Behavior:
  - If logged in: Shows personalized dashboard
  - If logged out: Redirects to auth with return path
Use Cases:
  - App notifications
  - Email digests
  - Quick access shortcuts
```

#### Appointments
```
Custom:    hair://appointments
Universal: https://yourdomain.com/appointments
App Link:  https://yourdomain.com/appointments

Description: Opens appointments list
Role-Specific:
  - Stylist: View all appointments
  - Client: View booked appointments
Use Cases:
  - Appointment reminder emails
  - SMS notifications
  - Calendar integration
```

#### Specific Appointment
```
Custom:    hair://appointments/:appointmentId
Universal: https://yourdomain.com/appointments/:appointmentId
App Link:  https://yourdomain.com/appointments/:appointmentId

Description: Opens detailed appointment view
Parameters:
  - appointmentId (UUID): Unique appointment identifier
Actions Available:
  - View details
  - Reschedule
  - Cancel
  - Add notes

Example:
  hair://appointments/abc123-def456-ghi789
  https://yourdomain.com/appointments/abc123-def456-ghi789

Use Cases:
  - Appointment confirmation emails
  - Reminder notifications 24h before
  - Reschedule requests
```

#### Book Appointment
```
Custom:    hair://book-appointment?stylistId=:id
Universal: https://yourdomain.com/book-appointment?stylistId=:id
App Link:  https://yourdomain.com/book-appointment?stylistId=:id

Description: Opens appointment booking flow
Query Parameters:
  - stylistId (UUID, optional): Pre-select stylist
  - serviceId (UUID, optional): Pre-select service
  - date (ISO 8601, optional): Suggested date

Examples:
  hair://book-appointment?stylistId=123abc
  https://yourdomain.com/book-appointment?stylistId=123abc&date=2025-10-15

Use Cases:
  - "Book Now" buttons from stylist profiles
  - Rebook reminders
  - Follow-up emails
```

#### Messages
```
Custom:    hair://messages
Universal: https://yourdomain.com/messages
App Link:  https://yourdomain.com/messages

Description: Opens messages inbox
Use Cases:
  - New message notifications
  - Email digest links
```

#### Specific Conversation
```
Custom:    hair://messages/:conversationId
Universal: https://yourdomain.com/messages/:conversationId
App Link:  https://yourdomain.com/messages/:conversationId

Description: Opens specific conversation thread
Parameters:
  - conversationId (UUID): Conversation identifier
Use Cases:
  - New message notifications
  - Push notifications
```

#### Formulas
```
Custom:    hair://formulas
Universal: https://yourdomain.com/formulas
App Link:  https://yourdomain.com/formulas

Description: Opens formula library (stylists only)
Use Cases:
  - Quick access from notifications
  - Workflow shortcuts
```

#### Specific Formula
```
Custom:    hair://formulas/:formulaId
Universal: https://yourdomain.com/formulas/:formulaId
App Link:  https://yourdomain.com/formulas/:formulaId

Description: Opens specific formula details
Parameters:
  - formulaId (UUID): Formula identifier
Use Cases:
  - Formula sharing between stylists
  - Reference links
```

#### Portfolio
```
Custom:    hair://portfolio/:stylistId
Universal: https://yourdomain.com/portfolio/:stylistId
App Link:  https://yourdomain.com/portfolio/:stylistId

Description: Opens stylist's portfolio gallery
Parameters:
  - stylistId (UUID): Stylist identifier
Use Cases:
  - Sharing work on social media
  - Portfolio links in emails
  - Marketing materials
```

#### Clients (Stylist Only)
```
Custom:    hair://clients
Universal: https://yourdomain.com/clients
App Link:  https://yourdomain.com/clients

Description: Opens client management screen
Role: Stylist only
Use Cases:
  - Quick access shortcuts
  - Workflow notifications
```

#### Specific Client Profile
```
Custom:    hair://clients/:clientId
Universal: https://yourdomain.com/clients/:clientId
App Link:  https://yourdomain.com/clients/:clientId

Description: Opens client profile details
Parameters:
  - clientId (UUID): Client identifier
Role: Stylist only (with access verification)
Use Cases:
  - Pre-appointment review
  - Client history lookup
```

#### Settings
```
Custom:    hair://settings
Universal: https://yourdomain.com/settings
App Link:  https://yourdomain.com/settings

Description: Opens app settings
Query Parameters (optional):
  - tab (string): Pre-select tab (profile, account, preferences)

Examples:
  hair://settings?tab=account
  https://yourdomain.com/settings?tab=preferences

Use Cases:
  - "Update your profile" prompts
  - Account verification reminders
  - Privacy policy update notifications
```

---

## Deferred Deep Linking

### Use Case: Attribution & Onboarding

When a user clicks a deep link but doesn't have the app installed:

1. **User clicks:** `https://yourdomain.com/stylist/123abc`
2. **Redirect to App Store/Play Store**
3. **User installs app**
4. **App launches and navigates to:** `stylist/123abc`

### Implementation

```typescript
// Store intent on web
localStorage.setItem('deferred_link', '/stylist/123abc');

// On app first launch
const deferredLink = localStorage.getItem('deferred_link');
if (deferredLink) {
  navigate(deferredLink);
  localStorage.removeItem('deferred_link');
}
```

---

## QR Code Integration

### Stylist Business Card QR Code
```
Content: https://yourdomain.com/stylist/[STYLIST_ID]
Format: QR Code with logo
Size: 300x300px minimum
Use: Business cards, salon signage
```

### Appointment Reminder QR Code
```
Content: https://yourdomain.com/appointments/[APPOINTMENT_ID]
Format: QR Code
Dynamic: Generated per appointment
Use: Confirmation emails, SMS
```

### Quick Booking QR Code
```
Content: https://yourdomain.com/book-appointment?stylistId=[ID]
Format: QR Code with branding
Use: Salon displays, flyers
```

---

## UTM Parameters for Analytics

Track deep link sources with UTM parameters:

```
https://yourdomain.com/stylists?utm_source=instagram&utm_medium=social&utm_campaign=spring2025

https://yourdomain.com/stylist/123abc?utm_source=email&utm_medium=newsletter&utm_campaign=monthly_digest
```

Supported Parameters:
- `utm_source`: Traffic source (email, instagram, facebook, etc.)
- `utm_medium`: Medium (social, email, cpc, etc.)
- `utm_campaign`: Campaign name
- `utm_content`: A/B test variant
- `utm_term`: Paid search keywords

---

## Testing Deep Links

### iOS Testing

#### Simulator (Terminal)
```bash
# Open custom scheme
xcrun simctl openurl booted hair://dashboard

# Open universal link
xcrun simctl openurl booted https://yourdomain.com/dashboard
```

#### Device (Terminal)
```bash
# Via idevice tools
idevice_id -l  # Get device ID
idevicedebug -u [DEVICE_ID] run hair://dashboard
```

### Android Testing

#### Emulator (adb)
```bash
# Open custom scheme
adb shell am start -W -a android.intent.action.VIEW -d "hair://dashboard"

# Open app link
adb shell am start -W -a android.intent.action.VIEW -d "https://yourdomain.com/dashboard"
```

#### Device (adb)
```bash
# Same commands work for connected physical devices
adb devices  # Verify device connection
adb shell am start -W -a android.intent.action.VIEW -d "hair://dashboard"
```

### Web Testing

Create test HTML page:

```html
<!DOCTYPE html>
<html>
<head>
  <title>hA.I.r Deep Link Tester</title>
</head>
<body>
  <h1>Test Deep Links</h1>
  
  <h2>Custom Scheme</h2>
  <a href="hair://dashboard">Open Dashboard</a><br>
  <a href="hair://appointments">View Appointments</a><br>
  <a href="hair://stylist/123abc">View Stylist Profile</a><br>
  
  <h2>Universal Links</h2>
  <a href="https://yourdomain.com/dashboard">Dashboard</a><br>
  <a href="https://yourdomain.com/appointments">Appointments</a><br>
  <a href="https://yourdomain.com/stylist/123abc">Stylist Profile</a><br>
</body>
</html>
```

---

## Domain Verification Setup

### iOS - apple-app-site-association

1. **Create file:** `public/.well-known/apple-app-site-association`
2. **Content type:** `application/json` (no .json extension!)
3. **Host location:** `https://yourdomain.com/.well-known/apple-app-site-association`
4. **HTTPS required:** Yes
5. **Verify:** https://branch.io/resources/aasa-validator/

**Important Configuration Steps:**
```json
{
  "applinks": {
    "apps": [],
    "details": [{
      "appID": "[TEAM_ID].app.lovable.a1a18f9db2f94d81aa8ce28408bee3a2",
      "paths": ["/dashboard", "/appointments/*", ...]
    }]
  }
}
```

**Get Team ID:**
- Log in to Apple Developer Account
- Go to Membership
- Team ID is listed at the top

### Android - assetlinks.json

1. **Create file:** `public/.well-known/assetlinks.json`
2. **Host location:** `https://yourdomain.com/.well-known/assetlinks.json`
3. **HTTPS required:** Yes
4. **Verify:** https://digitalassetlinks.googleapis.com/v1/statements:list?source.web.site=https://yourdomain.com

**Get SHA-256 Fingerprint:**
```bash
# From keystore
keytool -list -v -keystore release.keystore

# From Play Console (after first upload)
# Release > Setup > App signing
# Copy "SHA-256 certificate fingerprint"
```

---

## Troubleshooting

### Links Open in Browser Instead of App

**iOS:**
- Verify `apple-app-site-association` is accessible
- Check Team ID is correct
- Ensure app is signed with correct provisioning profile
- Verify Associated Domains capability is enabled
- Test on real device (not simulator) for Universal Links

**Android:**
- Verify `assetlinks.json` is accessible
- Check SHA-256 fingerprint matches signed APK
- Enable App Links in Android Studio: Tools → App Links Assistant
- Test verification: `adb shell pm get-app-links app.lovable.a1a18f9db2f94d81aa8ce28408bee3a2`

### Deep Link Not Recognized

- Check URL scheme is registered in `Info.plist` (iOS) or `AndroidManifest.xml` (Android)
- Verify deep link handler is implemented in App.tsx
- Check console for errors
- Test with simpler link first (e.g., `hair://dashboard`)

### Parameters Not Parsed

- Ensure URL parsing handles query parameters
- Check for URL encoding issues
- Log raw URL for debugging:
  ```typescript
  console.log('Deep link received:', event.url);
  ```

---

## Security Considerations

### Validate All Deep Link Parameters

```typescript
// ❌ UNSAFE: Direct navigation without validation
navigate(url.pathname);

// ✅ SAFE: Validate before navigation
const validRoutes = ['/dashboard', '/appointments', '/stylists'];
const path = url.pathname;

if (validRoutes.includes(path) || path.startsWith('/appointments/')) {
  navigate(path);
} else {
  console.warn('Invalid deep link:', path);
  navigate('/dashboard'); // Fallback
}
```

### Sanitize User Input

```typescript
// Extract stylist ID from URL
const stylistId = url.pathname.split('/')[2];

// Validate UUID format
const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(stylistId);

if (isValidUUID) {
  navigate(`/stylist/${stylistId}`);
}
```

### Require Authentication for Protected Routes

```typescript
CapacitorApp.addListener('appUrlOpen', (event) => {
  const url = new URL(event.url);
  const path = url.pathname;
  
  const protectedRoutes = ['/appointments', '/messages', '/clients'];
  const isProtected = protectedRoutes.some(route => path.startsWith(route));
  
  if (isProtected && !user) {
    // Store intended destination
    sessionStorage.setItem('returnTo', path);
    navigate('/auth');
  } else {
    navigate(path);
  }
});
```

---

## Analytics & Tracking

### Track Deep Link Opens

```typescript
import { log } from '@/lib/logger';

CapacitorApp.addListener('appUrlOpen', (event) => {
  log.info('Deep link opened', 'DeepLink', {
    url: event.url,
    source: 'app-open',
    timestamp: new Date().toISOString()
  });
  
  // Send to analytics
  analytics.track('deep_link_opened', {
    url: event.url,
    path: new URL(event.url).pathname
  });
});
```

### Attribution Tracking

Store campaign data for attribution:

```typescript
const url = new URL(event.url);
const utmSource = url.searchParams.get('utm_source');
const utmCampaign = url.searchParams.get('utm_campaign');

if (utmSource || utmCampaign) {
  localStorage.setItem('attribution', JSON.stringify({
    source: utmSource,
    campaign: utmCampaign,
    timestamp: Date.now()
  }));
}
```

---

## Best Practices

### 1. Always Provide Fallbacks
```typescript
// If deep link fails, show user-friendly message
try {
  const path = parseDeepLink(url);
  navigate(path);
} catch (error) {
  toast.error('Link could not be opened. Please try again.');
  navigate('/dashboard');
}
```

### 2. Test on Real Devices
- Universal Links and App Links don't work reliably in simulators
- Always test on physical devices before launch

### 3. Monitor Deep Link Performance
- Track open rates
- Monitor fallback behavior
- A/B test different link formats

### 4. Document All Links
- Maintain this document for all team members
- Update when adding new routes
- Share with marketing team for campaigns

### 5. Version Compatibility
- Plan for backwards compatibility
- Handle deprecated routes gracefully
- Redirect old links to new equivalent routes

---

## Resources

- [iOS Universal Links](https://developer.apple.com/ios/universal-links/)
- [Android App Links](https://developer.android.com/training/app-links)
- [Capacitor Deep Links Plugin](https://capacitorjs.com/docs/apis/app#addlistenerappurlopen-)
- [Branch.io AASA Validator](https://branch.io/resources/aasa-validator/)
- [Google Digital Asset Links](https://developers.google.com/digital-asset-links)

---

**Last Updated:** 2025-10-04  
**Version:** 1.0.0  
**Maintainer:** Technical Team
