# Stylist License Verification System

## Overview

hA.I.r uses an **honor system** for stylist verification. Stylists get immediate access upon signup while license information is collected for records and optional background verification.

## Current Implementation (Honor System)

## How It Works

### 1. **Stylist Signup Flow**

When a stylist signs up, they must provide:
- ✅ Full Name
- ✅ Email Address  
- ✅ Password
- ✅ **License Number** (e.g., CA-12345678)
- ✅ **Issuing State/Province** (e.g., California, Ontario)

### 2. **Initial Status**

- New stylists are created with `verification_status: 'verified'` (immediate access)
- They receive a toast: "Welcome to hA.I.r! Your account is ready."
- They get full platform access immediately

### 3. **User Experience**

- ✅ **Immediate access** to all features
- No waiting period or verification delays
- License info stored for records
- Terms of Service require professional licensing

### 4. **Admin Verification (Optional Background Process)**

Admins can optionally review stylists at `/stylist-verification`:

**Purpose:**
- Background verification for quality control
- Optional audit trail
- Can mark suspicious accounts for review

**Not Used For:**
- ❌ Blocking access (all stylists get immediate access)
- ❌ Approval workflow (everyone auto-approved)

### 5. **Legal Protection**

**Terms of Service Protection:**
- Signup includes affirmation: "By signing up, you affirm that you are a licensed cosmetology professional"
- Legal protection equivalent to manual verification
- If users lie about credentials, that's fraud on their part
- Platform liability is covered by ToS agreement

**Why This Works:**
- Same legal standing as manual verification
- Used by major platforms (Thumbtack, StyleSeat, Rover, TaskRabbit)
- Faster market entry and better UX
- Can still verify in background if needed

## Database Schema

### New Fields in `stylist_profiles`:

```sql
verification_status TEXT DEFAULT 'pending' 
  CHECK (verification_status IN ('pending', 'verified', 'rejected'))
license_number TEXT
license_state TEXT
license_photo_url TEXT (future: for uploading license photo)
verified_at TIMESTAMP WITH TIME ZONE
verified_by UUID (references admin who verified)
verification_notes TEXT (internal admin notes)
rejection_reason TEXT (shown to rejected stylists)
```

### Security Function:

```sql
verify_stylist(
  _stylist_id UUID,
  _status TEXT,
  _notes TEXT,
  _rejection_reason TEXT
)
```
- Only callable by admins
- Validates status ('verified' or 'rejected')
- Updates profile with verification details
- Creates audit log entry

## UI Components

### 1. **VerificationBanner** (`src/components/VerificationBanner.tsx`)
- Shows appropriate alert based on status
- Yellow alert for pending
- Red alert for rejected (with reason)
- Hidden for verified stylists

### 2. **StylistVerification Page** (`src/pages/StylistVerification.tsx`)
- Admin-only page for reviewing pending stylists
- Grid view of all pending verifications
- Modal for detailed review and approval/rejection
- Real-time updates after action

### 3. **Updated Auth Page** (`src/pages/Auth.tsx`)
- Added license number input (required)
- Added license state input (required)
- Blue info box explaining verification process
- Shows "Pending verification (24-48 hrs)" after signup

### 4. **Admin Dashboard Updates** (`src/pages/AdminDashboard.tsx`)
- New quick action button: "Stylist Verification"
- Links directly to verification page
- Prominent placement for easy access

## Access Control

### RLS Policies:

**Stylists:**
- Can view own profile (any status)
- Can update own profile if `pending` or `verified`
- Cannot change verification status themselves

**Admins:**
- Can view ALL stylist profiles
- Can update verification status via `verify_stylist()` function
- All actions logged in `audit_logs`

## Verification Best Practices

### For Admins:

1. **Verify License Numbers:**
   - Cross-check with state licensing boards when possible
   - Look for proper format (varies by state)
   - Watch for obvious fake numbers (all 1s, sequential, etc.)

2. **Check Business Information:**
   - Does business name match license?
   - Is location consistent with license state?
   - Does specialty make sense?

3. **Use Internal Notes:**
   - Document what you verified
   - Note any concerns or follow-ups needed
   - Include URLs to verification sources

4. **Rejection Reasons Should Be:**
   - Clear and specific
   - Professional and helpful
   - Actionable (tell them what's wrong)
   - Examples:
     - ✅ "License number CA-12345 not found in California cosmetology board database. Please verify and resubmit."
     - ❌ "Invalid license"

## Future Enhancements (Optional)

### Phase 2 Features:
- [ ] **Photo Upload**: Allow uploading license photos during signup
- [ ] **Automated Verification**: API integration with state licensing boards
- [ ] **Re-verification**: Annual license renewal reminders
- [ ] **Badge System**: Show "Verified Professional" badge on profiles
- [ ] **Expiration Tracking**: Monitor license expiration dates
- [ ] **Multi-license**: Support stylists licensed in multiple states

### Optional Integrations:
- **State Licensing Board APIs**: Automated verification where available
- **Document Verification Services**: OCR and validation of uploaded licenses
- **Background Checks**: Partner with professional verification services
- **Insurance Verification**: Verify professional liability insurance

## Benefits of Honor System

### For the Platform:
- ✅ Zero friction onboarding
- ✅ Faster growth and market entry
- ✅ Scales without bottlenecks
- ✅ Legal protection via ToS
- ✅ Can verify later if needed

### For Stylists:
- ✅ **Immediate access** - no waiting
- ✅ Better first impression
- ✅ Can start earning right away
- ✅ Professional experience from signup
- ✅ No approval anxiety

### For Clients:
- ✅ More stylist availability
- ✅ Platform backed by ToS requirements
- ✅ Can report issues if they arise
- ✅ Same legal protection

## Admin Workflow Example (Optional Background Verification)

```
1. Admin logs in → Dashboard
2. Sees "Stylist Verification" link (optional)
3. Can review stylists for quality control
4. License verification is for records only
5. All stylists already have full access
6. Can flag suspicious accounts if needed
```

## Testing Checklist

- [x] New stylist signup creates verified status (immediate)
- [x] No verification banner shows on dashboard
- [x] Stylists get full access immediately
- [x] License info is collected and stored
- [x] Terms affirm professional licensing requirement
- [ ] Admin page still accessible for optional background checks
- [x] License fields are required during signup
- [x] Welcome message shows successful immediate access

---

**Status**: ✅ Honor System Active - Immediate Access
**Last Updated**: October 2025
**Approach**: Immediate verification with ToS protection
