# Stylist License Verification System

## Overview

hA.I.r now includes a comprehensive license verification system to ensure only legitimate, licensed professionals can use the platform. This maintains quality standards and protects both stylists and clients.

## How It Works

### 1. **Stylist Signup Flow**

When a stylist signs up, they must provide:
- ✅ Full Name
- ✅ Email Address  
- ✅ Password
- ✅ **License Number** (e.g., CA-12345678)
- ✅ **Issuing State/Province** (e.g., California, Ontario)

### 2. **Initial Status**

- New stylists are created with `verification_status: 'pending'`
- They receive a toast: "Account created! Pending license verification (24-48 hrs)"
- They can log in and explore the platform with limited features

### 3. **Pending Verification Experience**

When pending stylists log in, they see:
- ⚠️ **Yellow banner** at top of dashboard
- Message: "Your professional license is currently being reviewed. This typically takes 24-48 hours."
- They can explore but some features may be restricted

### 4. **Admin Verification Process**

Admins access the verification dashboard at `/stylist-verification`:

**View Pending Stylists:**
- All stylists with `status: 'pending'`
- Shows: Name, email, business name, license info, location, join date
- Sortable grid view

**Review Each Stylist:**
- Click "Review" to open detailed view
- See all submitted information
- Add internal notes (optional)
- **Approve** → Grants full access immediately
- **Reject** → Requires rejection reason (sent to stylist)

### 5. **Verification Actions**

**✅ Approve (Verify):**
```typescript
verify_stylist(_stylist_id, 'verified', notes)
```
- Sets `verification_status: 'verified'`
- Records `verified_at` timestamp
- Records `verified_by` (admin user ID)
- Logs action in `audit_logs`
- Stylist gets full platform access

**❌ Reject:**
```typescript
verify_stylist(_stylist_id, 'rejected', notes, rejection_reason)
```
- Sets `verification_status: 'rejected'`
- Records `rejection_reason` (visible to stylist)
- Logs action in `audit_logs`
- Stylist sees red banner with reason

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

## Benefits

### For the Platform:
- ✅ Maintains professional standards
- ✅ Reduces fraud and fake accounts
- ✅ Builds trust with clients
- ✅ Legal protection
- ✅ Quality control

### For Stylists:
- ✅ Professional credibility
- ✅ Competitive advantage (verified badge)
- ✅ Client trust
- ✅ Platform integrity

### For Clients:
- ✅ Peace of mind booking with licensed professionals
- ✅ Legal recourse if issues arise
- ✅ Quality assurance
- ✅ Safety and legitimacy

## Admin Workflow Example

```
1. Admin logs in → Dashboard
2. Sees "3 stylists pending verification" alert
3. Clicks "Stylist Verification" button
4. Reviews first stylist:
   - Name: Jane Smith
   - License: CA-987654321
   - State: California
   - Business: Jane's Hair Studio
5. Verifies license on ca.gov (external)
6. Adds note: "Verified via CA Board - License active until 2026"
7. Clicks "Verify" ✅
8. Stylist immediately gets full access
9. Repeat for remaining stylists
```

## Testing Checklist

- [ ] New stylist signup creates pending status
- [ ] Pending banner shows on dashboard
- [ ] Admin can see pending list
- [ ] Admin can approve stylist
- [ ] Admin can reject with reason
- [ ] Rejected stylist sees red banner with reason
- [ ] Verified stylist sees no banner
- [ ] Audit logs record all actions
- [ ] Non-admins cannot access verification page
- [ ] License fields are required during signup

---

**Status**: ✅ Implemented and Active
**Last Updated**: January 2025
**Responsible**: Admin Team
