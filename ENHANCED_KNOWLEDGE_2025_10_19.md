# 🧠 Enhanced Knowledge File - hA.I.r Platform

**Version:** 2.0  
**Date:** October 19, 2025  
**Purpose:** Complete AI context for development, featuring user journeys, edge cases, and mobile-first design system

---

## 🎯 Product Vision (PRD Summary)

**What:** AI-powered hair salon management platform that reduces admin time by 40%  
**Who:** Professional hair stylists, salon clients, and salon administrators  
**Why:** Simplify appointment booking, formula management, and client relationships with intelligent automation  
**How:** React + Supabase + AI integration with mobile-first progressive web app architecture

---

## 👥 User Personas & Roles

### 1. **Stylist (Primary User)**

**Profile:**
- Professional hairstylist managing 20-50 active clients
- Needs to track custom formulas, book appointments, and maintain client relationships
- Works on mobile device 60% of the time (between clients, at supply stores)
- Values speed, simplicity, and having client history at fingertips

**Goals:**
- Reduce admin time spent on scheduling and formula tracking
- Build stronger client relationships through personalized service
- Never lose a formula or forget client preferences
- Get paid faster with streamlined booking and payments

**Pain Points:**
- Paper formula cards get lost or damaged
- Juggling multiple apps (calendar, notes, payments)
- Forgetting client allergies or sensitivities
- No-shows and last-minute cancellations

**Success Metrics:**
- Books 15+ appointments per week through app
- Creates 5+ formulas per week
- 90% client retention rate
- <2 minutes to find any client's history

---

### 2. **Client (Secondary User)**

**Profile:**
- Regular salon visitor who values their hairstylist's expertise
- Wants to book appointments easily and track their hair journey
- Uses mobile device almost exclusively
- Appreciates transparency and communication

**Goals:**
- Book appointments without phone tag
- View past formulas and results
- Remember when next appointment is due
- Feel confident their stylist knows their preferences

**Pain Points:**
- Forgetting to book next appointment
- Not knowing what products/formulas were used last time
- Difficulty scheduling around busy work schedule
- Lack of transparency in salon processes

**Success Metrics:**
- Books appointments within 2 taps
- Views appointment history and formulas easily
- Receives timely reminders and updates
- Never misses an appointment

---

### 3. **Admin (Power User)**

**Profile:**
- Salon owner or manager overseeing multiple stylists
- Needs financial visibility and operational control
- Uses desktop and mobile equally
- Values data-driven decision making

**Goals:**
- Monitor salon performance and revenue
- Manage stylist access and permissions
- Ensure compliance and security
- Identify growth opportunities

**Pain Points:**
- Lack of real-time visibility into bookings and revenue
- Manual tracking of stylist performance
- Security concerns with client data
- Difficulty scaling operations

**Success Metrics:**
- Real-time dashboard access to all metrics
- Full audit trail of all system changes
- Zero security incidents
- 100% stylist adoption rate

---

## 🗺️ User Journeys (Complete Flows)

### Journey 1: Stylist Creates Formula for New Client

**Context:** First-time client appointment, needs custom color formula

**Steps:**
1. **Before Appointment** (Mobile)
   - Stylist opens app → Clients → Add New Client
   - Enters: Name, Phone, Email
   - Notes: Hair type, allergies, goals
   - Saves client profile

2. **During Consultation** (Mobile)
   - Opens AI Assistant → "Suggest formula for level 7 brassy hair, needs ash tone"
   - AI suggests formula with ratios
   - Stylist adjusts based on client's hair texture
   - Takes photo of hair (before)

3. **During Service** (Mobile, Glance View)
   - Mixes formula following saved recipe
   - Sets timer for processing time
   - App sends notification when time is up

4. **After Service** (Mobile)
   - Takes photo of results (after)
   - Saves formula to client profile
   - Books next appointment (6 weeks)
   - Client receives confirmation via SMS

5. **Follow-Up** (Mobile, 3 days later)
   - AI suggests sending follow-up message
   - Stylist reviews message, sends with 1 tap
   - Client responds positively
   - Relationship strengthened

**Edge Cases:**
- Client has severe allergies → AI flags and requires explicit acknowledgment
- Formula doesn't turn out as expected → Easy to note and adjust for next time
- Client no-shows → Automatic SMS reminder system reduces this by 40%
- Client wants to rebook → Self-service booking link in confirmation

**Success Criteria:**
- Total time: <5 minutes spread across appointment
- Zero formulas lost or forgotten
- Client feels pampered and informed
- Stylist has complete record for future visits

---

### Journey 2: Client Books Appointment (Self-Service)

**Context:** Client needs haircut + color, browsing on phone during lunch break

**Steps:**
1. **Discovery** (Mobile)
   - Receives SMS from stylist with booking link
   - Clicks link → Opens booking page (PWA)
   - Sees stylist's availability for next 2 weeks

2. **Selection** (Mobile, Touch-Optimized)
   - Selects service: "Color + Cut (2.5 hours)"
   - Calendar shows only available slots (green)
   - Picks Tuesday 10am (fits work schedule)
   - Adds optional note: "Want to go slightly darker"

3. **Confirmation** (Mobile, <60 seconds)
   - Reviews details
   - Confirms with 1 tap
   - Receives SMS + Email confirmation immediately
   - Appointment appears in phone calendar automatically

4. **Reminders** (Automated)
   - Day before: SMS reminder with directions
   - 2 hours before: "See you soon!" message
   - After appointment: "Thank you!" + rebook option

**Edge Cases:**
- Stylist not available for 3 weeks → AI suggests nearby available stylist OR waitlist
- Client wants to reschedule → 1-tap reschedule up to 24 hours before
- Client forgets → Automatic reminders reduce no-shows by 40%
- Client wants recurring appointments → Option to book series of appointments

**Success Criteria:**
- Booking completed in <2 minutes
- Zero phone calls needed
- Client feels in control
- 40% reduction in no-shows

---

### Journey 3: Admin Monitors Salon Performance

**Context:** Monday morning, salon owner reviewing weekend performance

**Steps:**
1. **Dashboard Access** (Desktop/Tablet)
   - Signs in → Admin dashboard loads
   - Sees weekend summary:
     - 28 appointments completed
     - $4,200 revenue
     - 2 new clients
     - 92% client retention

2. **Drill-Down Analysis** (Desktop)
   - Clicks "Revenue" → Sees breakdown by stylist
   - Identifies top performer (Sarah: $1,800)
   - Identifies opportunity (Mike: only $800, had 2 cancellations)
   - Reviews audit logs for any issues

3. **Action Items** (Desktop/Mobile)
   - Sends congratulations message to Sarah
   - Checks Mike's calendar → Sees gaps
   - Creates promotion to fill gaps
   - Reviews security audit → All clear

4. **Planning** (Desktop)
   - Exports financial report for accountant
   - Reviews inventory alerts
   - Plans staff meeting topics
   - Sets goals for next week

**Edge Cases:**
- Revenue drops suddenly → Dashboard flags anomaly, suggests investigation
- Security alert triggered → Immediate notification, locked accounts pending review
- Stylist needs help → Admin can view their bookings and assist
- Financial discrepancy → Full audit trail available for review

**Success Criteria:**
- Full visibility in <5 minutes
- Data-driven decisions
- Proactive problem solving
- Zero surprises

---

## 🎨 Design System & UI Guidance

### Core Design Philosophy

**"Brutal, Bold, LEGO-Pixel Vibes"**
- Inspired by: 1990s video games, LEGO instruction manuals, brutalist web design
- Colors: High contrast, bold primaries
- Typography: Pixel fonts for headings, clean sans-serif for body
- Interactions: Immediate feedback, playful animations

### Mobile-First Design Tokens

**CRITICAL:** All designs start mobile, scale up to desktop. Never desktop-first.

#### Color System (HSL Format)
```css
/* Core Brand Colors */
--primary: 210 100% 50%;           /* Bold blue (#0080FF) */
--secondary: 45 100% 50%;          /* Vibrant yellow (#FFCC00) */
--accent: 330 100% 45%;            /* Hot pink (#E6007A) */

/* Semantic Colors */
--success: 120 60% 45%;            /* Green for confirmations */
--warning: 40 100% 50%;            /* Orange for cautions */
--error: 0 85% 55%;                /* Red for errors */

/* Neutral Palette */
--background: 0 0% 100%;           /* Pure white */
--foreground: 0 0% 5%;             /* Near black */
--muted: 210 10% 95%;              /* Soft gray for disabled states */

/* Gradients */
--gradient-bg-main: linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--accent)) 100%);
--gradient-card: linear-gradient(180deg, hsl(var(--background)) 0%, hsl(var(--muted)) 100%);
```

#### Typography Scale (Mobile-First)
```css
/* Headings - Pixel Font */
--font-heading: 'Press Start 2P', 'Courier New', monospace;
--text-xs: 10px;    /* 320px width minimum */
--text-sm: 12px;    /* 360px width minimum */
--text-base: 14px;  /* 390px+ width */
--text-lg: 16px;    /* 768px+ width */
--text-xl: 20px;    /* 1024px+ width */
--text-2xl: 24px;   /* 1440px+ width */

/* Body - Clean Sans */
--font-body: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
```

#### Spacing Scale (Touch-Optimized)
```css
/* Minimum tap targets: 44x44px (WCAG 2.2 AA) */
--space-1: 4px;     /* Micro spacing */
--space-2: 8px;     /* Small spacing */
--space-3: 12px;    /* Base spacing */
--space-4: 16px;    /* Medium spacing */
--space-5: 24px;    /* Large spacing */
--space-6: 32px;    /* XL spacing */

/* Component Heights */
--height-button: 44px;        /* Minimum tappable */
--height-input: 48px;         /* Comfortable typing */
--height-header: 56px;        /* Standard mobile header */
--height-bottom-nav: 64px;    /* Bottom navigation bar */
```

#### Shadow System (Brutal Borders)
```css
/* All shadows are solid, no blur - LEGO brick style */
--shadow-brutal-sm: 2px 2px 0px 0px hsl(var(--foreground));
--shadow-brutal-md: 4px 4px 0px 0px hsl(var(--foreground));
--shadow-brutal-lg: 6px 6px 0px 0px hsl(var(--foreground));
--shadow-brutal-xl: 8px 8px 0px 0px hsl(var(--foreground));

/* Borders: Always 2-4px thick */
--border-width: 3px;
```

#### Animation Tokens
```css
/* Snappy, game-like animations */
--duration-fast: 150ms;       /* Hover states */
--duration-base: 300ms;       /* Standard transitions */
--duration-slow: 500ms;       /* Page transitions */

/* Easing */
--ease-elastic: cubic-bezier(0.68, -0.55, 0.265, 1.55);  /* Bouncy */
--ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);             /* Standard */
```

---

### Component Variants by Role

**Stylist Components:**
- Primary actions: Large, bold buttons (accent color)
- Quick actions: Floating action button (bottom right)
- Lists: Card-based with swipe actions
- Forms: Multi-step with progress indicators

**Client Components:**
- Simple, minimal UI with clear CTAs
- Calendar-first booking interface
- Read-only views with "Request Change" options
- Large, tappable elements (elderly-friendly)

**Admin Components:**
- Dense information tables (desktop)
- Data visualizations (charts, graphs)
- Expandable detail panels
- Batch action toolbars

---

## 🚨 Edge Cases & Constraints

### Technical Constraints

1. **Offline Mode (PWA)**
   - Must cache: Last 10 clients, today's appointments, saved formulas
   - Must sync: When connection restored
   - Must notify: User when offline, when sync completes
   - Must handle: Conflict resolution (last-write-wins)

2. **Mobile Performance**
   - Target: <2s page load on 3G connection
   - Images: Lazy-loaded, compressed, WebP format
   - Lists: Virtualized for 100+ items
   - Forms: Debounced auto-save every 3 seconds

3. **Browser Support**
   - Modern browsers only (last 2 versions)
   - iOS Safari 14+
   - Android Chrome 90+
   - No IE11 support

4. **Database Limits**
   - Max 10,000 clients per stylist
   - Max 50,000 formulas per salon
   - Max 100MB photo storage per stylist (auto-compress)

### Business Rules

1. **Appointment Booking**
   - Minimum notice: 2 hours for new bookings
   - Maximum advance: 90 days
   - Cancellation window: 24 hours (or fee applies)
   - Buffer time: 15 minutes between appointments (automatic)

2. **Formula Privacy**
   - Formulas are ALWAYS private to stylist + client
   - Formulas can be shared only with explicit permission
   - Deleted formulas are soft-deleted (30-day recovery)
   - Formula export requires password confirmation

3. **Payment Processing**
   - Stripe integration required
   - 2.9% + $0.30 per transaction
   - Automatic receipts via email
   - Refunds: Manual, admin-approved only

4. **User Roles & Permissions**
   - Stylist: Create/edit own clients, formulas, appointments
   - Client: View own data, book appointments, request changes
   - Admin: Full access, audit logs, user management
   - **Critical:** Admin cannot edit formulas (stylist ownership)

### Security Constraints

1. **Authentication**
   - Password: Minimum 8 characters, mix of types
   - 2FA: Optional but recommended for admin
   - Session: 7 days, refresh tokens used
   - Sign-out: Clear all local storage

2. **Data Privacy**
   - HIPAA-lite compliance (no PHI stored)
   - Client data encrypted at rest (Supabase default)
   - Photos: Compressed, stripped of EXIF data
   - Audit logs: 90-day retention, admin-only access

3. **Rate Limiting**
   - API: 100 requests per minute per user
   - Auth: 5 failed login attempts = 15-minute lockout
   - SMS: 10 messages per hour per stylist
   - AI: 50 requests per day per stylist (free tier)

---

## 🎭 Role-Specific Behaviors

### Stylist-Only Features
- Create/edit formulas
- Manage client notes and photos
- AI formula suggestions
- Schedule optimization
- Client retention insights
- Keyboard shortcuts (desktop)

### Client-Only Features
- Self-service booking
- View own appointment history
- Request appointment changes
- View own formulas (read-only)
- Provide feedback/reviews

### Admin-Only Features
- Financial dashboard
- User management (add/remove stylists)
- Audit logs review
- System health monitoring
- Backup/export data
- Security settings

### Cross-Role Restrictions
- Stylist CANNOT view other stylists' clients (unless shared)
- Client CANNOT view other clients' data
- Admin CANNOT impersonate users (audit trail only)

---

## 📱 Mobile-Specific Requirements

### Touch Interactions
- Tap targets: Minimum 44x44px (WCAG 2.2 AA)
- Swipe gestures: Left = delete, Right = edit (stylist lists)
- Pull to refresh: All list views
- Long press: Context menus (desktop-replacement)

### Keyboard Handling
- Auto-focus first input field
- "Next" button advances through form
- "Done" button submits form
- Virtual keyboard: Never covers input fields

### Camera Integration
- Before/after photos: Direct camera access
- Photo upload: Max 5MB per photo, auto-compress
- Photo preview: Show immediately, upload in background
- Offline photos: Stored locally, uploaded when online

### Notifications
- Push notifications: Appointment reminders (opt-in)
- SMS fallback: If push not enabled
- In-app notifications: Badge count on bell icon
- Sound: Optional, user-controlled

---

## 🔄 State Management Rules

### Loading States
- Skeleton screens: For initial page load
- Spinners: For in-page actions (<3 seconds)
- Progress bars: For uploads/downloads
- Optimistic updates: For instant feedback (undo available)

### Error States
- Inline errors: Form validation (red text below field)
- Toast notifications: API errors (5-second auto-dismiss)
- Full-page errors: Network down (retry button)
- Fallback content: If data fails to load

### Empty States
- First-time user: Onboarding tutorial
- No data: Illustration + clear CTA
- No search results: "Try different keywords" + clear filters
- No network: Cached data shown with "Offline" badge

### Success States
- Confirmation toast: Action completed (green, 3 seconds)
- Page transition: Smooth animation to next screen
- Checkmark animation: Satisfying visual feedback
- Success page: For critical actions (booking confirmed)

---

## 🎯 Performance Targets

### Core Web Vitals
- **LCP (Largest Contentful Paint):** <2.5s
- **FID (First Input Delay):** <100ms
- **CLS (Cumulative Layout Shift):** <0.1
- **INP (Interaction to Next Paint):** <200ms

### App-Specific Metrics
- Page load time: <2s on 3G
- Time to interactive: <3s
- Formula search: <200ms
- Client list render (100 items): <100ms
- Image upload: <5s on 4G

### Bundle Size Targets
- Initial bundle: <200KB (gzipped)
- Route chunks: <50KB each
- Total bundle: <500KB
- Image assets: <100KB per image (compressed)

---

## 🧪 Testing Requirements

### Manual Testing Checklist
- [ ] Test on iPhone SE (smallest modern screen)
- [ ] Test on Android 5.5" phone
- [ ] Test on iPad
- [ ] Test on 1080p desktop
- [ ] Test with screen reader
- [ ] Test with keyboard only
- [ ] Test offline mode
- [ ] Test slow 3G connection

### Automated Testing
- E2E tests: 72 tests covering all user flows
- Unit tests: Critical business logic functions
- Visual regression: Screenshot comparison
- Performance: Lighthouse CI on every deploy

---

## 🔒 Compliance & Accessibility

### WCAG 2.2 AA Requirements
- ✅ Color contrast: Minimum 4.5:1 for text
- ✅ Tap targets: Minimum 44x44px
- ✅ Keyboard navigation: All features accessible
- ✅ Screen reader: Semantic HTML, ARIA labels
- ✅ Focus indicators: Clear visible focus states
- ✅ Error identification: Clear error messages
- ✅ Form labels: All inputs properly labeled

### SEO Requirements
- Title tags: Unique, <60 characters
- Meta descriptions: <160 characters
- Semantic HTML: Proper heading hierarchy
- Alt text: Descriptive for all images
- Structured data: JSON-LD for services
- Canonical URLs: Prevent duplicate content
- Mobile-first indexing: Mobile version is primary

---

## 📝 Copy & Messaging Guidelines

### Voice & Tone
- **Personality:** Friendly, confident, efficient
- **Level:** Professional but approachable
- **Avoid:** Jargon, corporate-speak, overly casual slang

### Error Messages
- ❌ Bad: "Error 500: Internal server error"
- ✅ Good: "Something went wrong. We're looking into it. Try again in a few minutes?"

### Success Messages
- ❌ Bad: "Operation completed successfully"
- ✅ Good: "Done! Your appointment is confirmed for Tuesday at 10am"

### Loading Messages
- ❌ Bad: "Loading..."
- ✅ Good: "Finding your clients..." or "Preparing your formulas..."

---

## 🚀 Future Enhancements (Not Blocking Launch)

1. **AI Receptionist** - Voice-activated booking via phone
2. **Inventory Management** - Track product usage and reorder
3. **Social Media Integration** - Auto-post before/after photos
4. **Multi-salon Support** - Franchise management features
5. **Advanced Analytics** - Predictive booking patterns
6. **Client Portal App** - Dedicated mobile app for clients
7. **Stripe Payments V2** - Subscription management for stylists

---

## 🎓 Development Guidelines for AI

When building features, always:

1. **Check this knowledge file first** - Don't assume, verify
2. **Ask role-specific questions** - "Is this for stylist, client, or admin?"
3. **Consider mobile first** - Design for 375px width, scale up
4. **Think edge cases** - What if offline? What if photo fails?
5. **Use semantic tokens** - Never hardcode colors like `bg-white`
6. **Follow design system** - Brutal borders, bold colors, pixel fonts
7. **Test accessibility** - Keyboard nav, screen reader, color contrast
8. **Optimize performance** - Lazy load, virtualize lists, compress images

---

**Last Updated:** October 19, 2025  
**Next Review:** After first 100 users onboarded  
**Maintained By:** Development team + Product owner
