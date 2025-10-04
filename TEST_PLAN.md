# QA Test Plan - hA.I.r Platform

## Executive Summary
This test plan covers critical user journeys, edge cases, device compatibility, accessibility, and performance targets for the hA.I.r hair stylist/client management platform.

---

## 1. User Journeys (P0/P1 Flows)

| Journey ID | User Type | Flow | Steps | Expected Outcome | Error States |
|-----------|-----------|------|-------|------------------|--------------|
| UJ-001 | Client | **Sign Up & Profile Setup** | 1. Navigate to /auth<br>2. Click "Sign Up" tab<br>3. Enter full name, email, password<br>4. Select "Client (Free)"<br>5. Submit form | - Account created<br>- Redirected to dashboard<br>- Profile completion dialog appears | - Invalid email format<br>- Password < 6 chars<br>- Email already exists<br>- Network timeout |
| UJ-002 | Stylist | **Sign Up & Trial Start** | 1. Navigate to /auth<br>2. Click "Sign Up" tab<br>3. Enter credentials<br>4. Select "Stylist ($15/mo)"<br>5. Submit form | - Account created<br>- 7-day trial starts<br>- Subscription prompt shown<br>- Profile completion required | - Payment processing fails<br>- Email already exists<br>- Profile creation fails |
| UJ-003 | Client | **Post Hair Goal** | 1. Sign in<br>2. Navigate to "My Requests"<br>3. Click "Create New Request"<br>4. Fill title, description, service type<br>5. Add budget, location, date<br>6. Upload photos<br>7. Submit | - Post created with status "open"<br>- Visible to stylists in "Find Clients"<br>- Toast confirmation | - Missing required fields<br>- Image upload fails<br>- Invalid date selection<br>- Budget validation fails |
| UJ-004 | Stylist | **Browse & Claim Client Request** | 1. Sign in as stylist<br>2. Navigate to "Find Clients"<br>3. View open client posts<br>4. Search/filter by location<br>5. Click "Contact Client"<br>6. Initiate conversation | - Client posts displayed<br>- Search filters work<br>- Contact initiated<br>- Post status updates | - No posts available<br>- Search returns empty<br>- Message sending fails<br>- RLS policy blocks access |
| UJ-005 | Stylist | **Book Appointment** | 1. Navigate to Appointments<br>2. Select date/time<br>3. Choose client<br>4. Select service<br>5. Add notes<br>6. Confirm booking | - Appointment created<br>- Client notified via SMS/email<br>- Calendar updated<br>- Payment captured (if deposit) | - Time slot conflict<br>- Client not found<br>- SMS delivery fails<br>- Payment processing error<br>- Timezone mismatch |
| UJ-006 | Stylist | **AI Formula Generation** | 1. Navigate to "AI Assistant"<br>2. Enter client hair details<br>3. Specify desired outcome<br>4. Upload reference photos<br>5. Generate formula<br>6. Save to client profile | - Formula generated<br>- Saved with client link<br>- Accessible in Formulas page<br>- AI response < 5s | - AI service unavailable<br>- Invalid input format<br>- Timeout after 30s<br>- Save fails (network) |
| UJ-007 | Stylist | **Schedule Management** | 1. Navigate to Schedule<br>2. Set weekly hours<br>3. Add vacation dates<br>4. Configure buffer times<br>5. Toggle availability<br>6. Save changes | - Schedule updated<br>- Conflicts detected<br>- Bookings respect schedule<br>- Changes reflected instantly | - Overlapping time slots<br>- Invalid date range<br>- Existing appointments conflict<br>- Save fails |
| UJ-008 | Client | **Search & Book Stylist** | 1. Navigate to "Find Stylists"<br>2. Enter location/specialty<br>3. View stylist profiles<br>4. Check portfolio<br>5. Select service<br>6. Choose time slot<br>7. Complete booking | - Search results accurate<br>- Portfolio photos load<br>- Available times shown<br>- Booking confirmed<br>- Payment processed | - No stylists in area<br>- All slots unavailable<br>- Payment declined<br>- Double-booking |
| UJ-009 | Stylist | **AI Color Correction** | 1. Navigate to Knowledge<br>2. Open "AI Corrections"<br>3. Describe problem<br>4. Upload photos<br>5. Get AI analysis<br>6. Follow steps | - Problem analyzed<br>- Correction steps provided<br>- Can save notes<br>- Response < 5s | - Image analysis fails<br>- Unclear problem description<br>- AI timeout<br>- Save fails |
| UJ-010 | Both | **Messaging System** | 1. Navigate to Messages<br>2. Select conversation<br>3. Type message<br>4. Send<br>5. Receive reply | - Messages delivered instantly<br>- Realtime updates<br>- Unread count accurate<br>- Media uploads work | - Message fails to send<br>- Not received by recipient<br>- Realtime connection drops<br>- Media upload timeout |

---

## 2. Edge & Abuse Cases

| Case ID | Scenario | Test Steps | Expected Behavior |
|---------|----------|------------|-------------------|
| EC-001 | **Empty Inputs** | Submit forms with no data | - Clear validation messages<br>- Required fields highlighted<br>- Form not submitted |
| EC-002 | **Extremely Long Inputs** | Enter 10,000+ character strings in text fields | - Input truncated at reasonable limit<br>- UI doesn't break<br>- Warning shown |
| EC-003 | **Special Characters** | Input SQL injection patterns: `'; DROP TABLE--`, XSS: `<script>alert(1)</script>` | - Input sanitized<br>- No script execution<br>- Data safely stored |
| EC-004 | **Slow Network (2G)** | Throttle to 50kbps | - Loading indicators shown<br>- Requests timeout after 30s<br>- Retry prompts appear<br>- Offline mode gracefully handled |
| EC-005 | **Offline/Airplane Mode** | Disable network mid-operation | - "You're offline" message<br>- Changes queued locally<br>- Sync on reconnection<br>- No data loss |
| EC-006 | **Expired Auth Token** | Wait for token expiration (1hr), then perform action | - Silent token refresh<br>- Action completes<br>- User not logged out |
| EC-007 | **API 4xx Errors** | Mock 400, 401, 403, 404 responses | - User-friendly error messages<br>- No raw error codes shown<br>- Actionable guidance |
| EC-008 | **API 5xx Errors** | Mock 500, 502, 503 responses | - Retry with exponential backoff<br>- "Try again" button<br>- Error logged with correlation ID |
| EC-009 | **Rate Limits** | Make 100 requests/second | - 429 response handled<br>- "Slow down" message<br>- Automatic retry after delay |
| EC-010 | **Duplicate Submissions** | Double-click "Submit" button rapidly | - Button disabled after first click<br>- Loading state shown<br>- Only one request sent |
| EC-011 | **Back Button Loops** | Navigate forward/back repeatedly | - State preserved correctly<br>- No infinite loops<br>- Form data cached |
| EC-012 | **Concurrent Edits** | Edit same appointment in 2 tabs | - Last write wins with warning<br>- Or: real-time conflict resolution<br>- No data corruption |
| EC-013 | **Large Image Uploads** | Upload 50MB+ images | - File size validation<br>- Max 10MB enforced<br>- Clear error message |
| EC-014 | **Emoji & Unicode** | Use emoji, Chinese, Arabic, RTL text | - All characters display correctly<br>- DB stores UTF-8<br>- No truncation |
| EC-015 | **Timezone Confusion** | Book appointment from different timezone | - Times converted correctly<br>- Timezone displayed<br>- UTC stored in DB |

---

## 3. Data Matrix

### Test Users

| User ID | Role | Email | Profile Completeness | Subscription Status |
|---------|------|-------|---------------------|---------------------|
| TU-001 | Client | client1@test.com | Complete | N/A |
| TU-002 | Client | client2@test.com | Incomplete | N/A |
| TU-003 | Stylist | stylist1@test.com | Complete | Active subscription |
| TU-004 | Stylist | stylist2@test.com | Complete | In trial (day 3) |
| TU-005 | Stylist | stylist3@test.com | Incomplete | Trial expired |

### Seed Data Requirements

| Entity | Quantity | Notes |
|--------|----------|-------|
| Client Posts | 50 | Mix of open, claimed, closed status |
| Appointments | 100 | Past, today, future; all statuses |
| Formulas | 30 | Linked to clients, various color lines |
| Messages | 200 | Read/unread, media attachments |
| Reviews | 25 | Ratings 1-5 stars |
| Services | 20 per stylist | Various prices, durations |

### Boundary Values

| Field | Min | Max | Test Values |
|-------|-----|-----|-------------|
| Password length | 6 | 128 | 5 (fail), 6, 50, 128, 129 (fail) |
| Full name | 1 | 100 | Empty (fail), "A", 100 chars, 101 (fail) |
| Appointment notes | 0 | 500 | Empty, 500 chars, 501 (fail) |
| Service price | 0 | 10000 | -1 (fail), 0, 0.01, 9999.99, 10000.01 (fail) |
| Appointment duration | 15 | 480 | 14 (fail), 15, 90 (default), 480, 481 (fail) |

### i18n Testing

- **Long strings**: German compound words, Welsh place names
- **RTL languages**: Arabic, Hebrew (test text alignment)
- **CJK characters**: Chinese, Japanese, Korean (test character width)
- **Emoji**: Test in names, messages, notes
- **Timezone**: UTC-12 to UTC+14

---

## 4. Device & Viewport Matrix

### Phones

| Device | Screen Size | OS | Browser | Priority |
|--------|-------------|----|---------| ---------|
| iPhone 12 | 390×844 | iOS 16+ | Safari | P0 |
| iPhone SE (2022) | 375×667 | iOS 15+ | Safari | P1 |
| Pixel 6 | 412×915 | Android 12+ | Chrome | P0 |
| Samsung Galaxy S21 | 360×800 | Android 11+ | Samsung Internet | P1 |

### Tablets

| Device | Screen Size | OS | Browser | Priority |
|--------|-------------|----|---------| ---------|
| iPad Pro 11" | 834×1194 | iPadOS 16+ | Safari | P0 |
| iPad Mini | 768×1024 | iPadOS 15+ | Safari | P1 |
| Samsung Tab S8 | 1024×768 | Android 12+ | Chrome | P1 |

### Desktops

| Resolution | Browser | Priority |
|------------|---------|----------|
| 1280×800 | Chrome, Edge | P0 |
| 1440×900 | Chrome, Firefox, Safari | P0 |
| 1920×1080 | Chrome, Edge, Firefox | P0 |
| 2560×1440 | Chrome, Safari | P1 |

---

## 5. OS & Browser Support

### Required Support

| Platform | Version | Notes |
|----------|---------|-------|
| **iOS Safari** | 15.0+ | Primary mobile browser |
| **Android Chrome** | Last 2 versions | Primary Android browser |
| **Desktop Chrome** | Last 2 versions | Primary desktop |
| **Desktop Edge** | Last 2 versions | Chromium-based |
| **Desktop Firefox** | Last 2 versions | Test Gecko engine |
| **Desktop Safari** | 15.0+ | macOS users |

### Not Supported (graceful degradation)

- IE 11
- Opera Mini
- UC Browser

---

## 6. Accessibility Matrix

### Keyboard Navigation

| Test | Expected Behavior | Priority |
|------|-------------------|----------|
| Tab through all interactive elements | Logical focus order, visible focus ring | P0 |
| Shift+Tab to reverse | Moves backwards correctly | P0 |
| Enter/Space to activate buttons | All buttons respond | P0 |
| Escape to close modals | Dialogs close, focus returns | P0 |
| Arrow keys in dropdowns | Navigate options | P1 |
| Slash key (/) for search | Focus search input | P1 |
| No keyboard traps | Can escape all components | P0 |

### Screen Reader Testing

| Tool | Platform | Priority | Test Coverage |
|------|----------|----------|---------------|
| VoiceOver | iOS Safari | P0 | All P0 journeys |
| TalkBack | Android Chrome | P0 | All P0 journeys |
| NVDA | Windows Chrome | P1 | Auth, Dashboard, Appointments |
| JAWS | Windows Edge | P2 | Auth, Appointments |

### Accessibility Checklist

- [ ] All images have alt text
- [ ] Form inputs have associated labels
- [ ] Buttons have descriptive text or aria-labels
- [ ] Color contrast ≥ 4.5:1 for body text
- [ ] Color contrast ≥ 3:1 for large text (18px+)
- [ ] Focus indicators visible
- [ ] Skip to main content link present
- [ ] Page landmarks (header, nav, main, footer)
- [ ] Heading hierarchy (h1 > h2 > h3)
- [ ] Error messages announced to screen readers
- [ ] Loading states announced
- [ ] Modal focus management (trap & restore)

### OS Accessibility Settings

| Setting | Test Scenario | Expected Behavior |
|---------|---------------|-------------------|
| **iOS Dynamic Type** | Set text size to max (Accessibility > Display) | - All text scales proportionally<br>- No text truncation<br>- Buttons remain tappable |
| **Android Font Scale** | Set to 1.3x (Settings > Display > Font size) | - Text scales correctly<br>- UI doesn't break |
| **Reduced Motion** | Enable on iOS/Android/macOS | - Animations disabled<br>- Transitions instant<br>- Still functional |
| **High Contrast** | Windows High Contrast Mode | - Colors adjust<br>- Borders visible<br>- Icons clear |
| **Dark Mode** | Enable system dark mode | - Dark theme applied<br>- Contrast maintained<br>- No pure black/white |

---

## 7. Performance Targets

### Core Web Vitals (Mobile - 4G)

| Metric | Target | Max Acceptable | Measurement Tool |
|--------|--------|----------------|------------------|
| **FCP** (First Contentful Paint) | < 1.8s | < 3.0s | Lighthouse |
| **LCP** (Largest Contentful Paint) | < 2.5s | < 4.0s | Lighthouse |
| **TTI** (Time to Interactive) | < 4.0s | < 7.0s | Lighthouse |
| **CLS** (Cumulative Layout Shift) | < 0.1 | < 0.25 | Lighthouse |
| **FID** (First Input Delay) | < 100ms | < 300ms | Real User Monitoring |

### Bundle Size Budgets

| Asset Type | Budget | Current | Status |
|------------|--------|---------|--------|
| Initial JS bundle | < 250 KB | TBD | 🟡 |
| CSS bundle | < 50 KB | TBD | 🟡 |
| Images (per page) | < 500 KB total | TBD | 🟡 |
| Fonts (total) | < 100 KB | TBD | 🟡 |

### API Latency Budgets

| Endpoint | Target (p50) | Max (p95) | Timeout |
|----------|--------------|-----------|---------|
| Auth (sign in) | < 300ms | < 1s | 10s |
| Load appointments | < 500ms | < 2s | 10s |
| AI formula generation | < 3s | < 10s | 30s |
| Image upload | < 2s | < 5s | 30s |
| Search stylists | < 200ms | < 1s | 10s |
| Realtime message | < 100ms | < 500ms | 5s |

### Image Optimization

- All images < 200 KB
- WebP format with JPEG fallback
- Lazy loading for below-fold images
- Responsive srcset for different viewports
- Blurred placeholder while loading

---

## 8. Acceptance Criteria

### Pass/Fail Criteria Per Test Case

| Result | Criteria |
|--------|----------|
| **PASS** | - All steps complete as expected<br>- Error states handled gracefully<br>- UI remains functional<br>- No console errors<br>- Performance targets met |
| **FAIL** | - Critical functionality broken<br>- Data loss or corruption<br>- Security vulnerability<br>- Accessibility blocker<br>- Performance exceeds 2x target |
| **PARTIAL** | - Core functionality works<br>- Minor UI issues<br>- Edge cases fail<br>- Performance slightly over target |

### Error Message Quality Rubric

| Score | Description | Example |
|-------|-------------|---------|
| **5** | User-friendly, actionable, suggests fix | "Email already registered. Try signing in or use a different email." |
| **4** | Clear but lacks actionable steps | "Invalid email format. Please check your input." |
| **3** | Technical but understandable | "Authentication failed: Invalid credentials" |
| **2** | Vague, confusing | "Error occurred. Please try again." |
| **1** | Raw error, no context | "Error: 500 INTERNAL_SERVER_ERROR" |

**Target**: All errors score ≥ 4

### Recovery Path Requirements

Every error state must provide at least one of:

1. **Retry** button (for transient failures)
2. **Alternative action** (e.g., "Reset password" when login fails)
3. **Contact support** (for unrecoverable errors)
4. **Go back** (to escape error state)

---

## 9. Test Execution Phases

### Phase 1: Smoke Tests (30 min)
- Auth (sign up, sign in, sign out)
- Dashboard loads
- Critical navigation works
- No console errors

### Phase 2: Functional Tests (4 hours)
- All P0 user journeys
- CRUD operations
- Search & filters
- Payments
- File uploads

### Phase 3: Accessibility (2 hours)
- Keyboard navigation
- Screen reader spot checks
- Color contrast audit
- Focus management

### Phase 4: Responsive (2 hours)
- Test on each viewport
- Layout integrity
- Touch targets
- Mobile navigation

### Phase 5: Performance (1 hour)
- Lighthouse audits
- Bundle analysis
- API latency checks
- Image optimization

### Phase 6: Edge Cases (2 hours)
- All EC-* scenarios
- Stress testing
- Concurrency
- Recovery

---

## 10. Exit Criteria

**Ready to Ship** when:

- ✅ All P0 tests PASS
- ✅ ≥ 95% P1 tests PASS
- ✅ No P0 bugs open
- ✅ ≤ 3 P1 bugs open (with workarounds)
- ✅ Accessibility audit score > 90
- ✅ Performance targets met on ≥ 80% of pages
- ✅ All error messages score ≥ 4
- ✅ No data loss scenarios
- ✅ No security vulnerabilities

**Block Shipment** if:

- ❌ Any P0 test fails
- ❌ Data loss possible
- ❌ Security vulnerability (SQL injection, XSS, CSRF)
- ❌ Authentication bypass
- ❌ Payment processing fails
- ❌ Accessibility blocker (no keyboard access)

---

## Document Version

- **Version**: 1.0
- **Last Updated**: 2025-01-04
- **Owner**: QA Team
- **Next Review**: After each major release
