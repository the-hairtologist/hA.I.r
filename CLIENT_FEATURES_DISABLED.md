# Client-Facing Features - Coming Soon

## Current Status: Stylist-Only Platform

hA.I.r is currently in **stylist-only mode** to focus on perfecting the professional tools before expanding to client features.

## Disabled Client Features

The following features have been set to "Coming Soon" status:

### 1. **Client Self-Signup**
- ❌ Clients cannot create accounts independently
- ✅ Stylists can manually add clients to their roster
- **Location**: `/auth` - Removed "Client (Free)" option

### 2. **Public Stylist Discovery**
- ❌ `/stylists` - Public browse/search for stylists
- ❌ `/stylist/:id` - Public stylist profile pages
- ❌ `/s/:username` - Custom URL stylist profiles
- **Redirect**: All routes redirect to `/coming-soon`

### 3. **Client Request Board**
- ❌ `/client-requests` - Clients posting hair requests
- **Redirect**: Redirects to `/coming-soon`

### 4. **Client Discovery** (for stylists)
- ❌ `/client-discovery` - Stylists browsing client requests
- **Redirect**: Redirects to `/coming-soon`

### 5. **Online Booking**
- ❌ `/book-appointment` - Client-initiated booking
- **Redirect**: Redirects to `/coming-soon`

### 6. **UI Elements Removed**
- ❌ "Find Stylists" from client sidebar
- ❌ "Find Stylist" from client floating action button
- ❌ "Find Stylists" from client quick actions
- ❌ Client onboarding wizard references to finding stylists

## What Still Works

### ✅ Stylist Features (Fully Functional)
- Complete dashboard with all business tools
- AI formula generation & chat assistant
- Manual client management (add/edit/delete clients)
- Manual appointment booking (stylist creates appointments for clients)
- Portfolio management
- Service management
- Schedule management
- Financial tracking
- Analytics & insights
- All AI-powered features

### ✅ Stylist Can Manage Clients
Stylists retain full ability to:
1. **Add clients manually** via the Clients page
2. **Book appointments for clients** via Appointments page
3. **View and manage client profiles**
4. **Track client history and formulas**
5. **Invite clients** to join (when client features launch)

## Authentication Flow

### Current Behavior:
```
/auth → Sign In / Sign Up (Stylists Only)
└─ Sign Up shows: "Professional Stylist Account"
   └─ Creates stylist role only
   └─ $15/month subscription
```

### What Happens to Existing Clients?
- Existing client accounts remain functional
- Can still view their appointments
- Can access their dashboard
- Cannot discover or book new appointments
- Will see "Coming Soon" for booking features

## Implementation Details

### Routes Updated:
```typescript
// src/App.tsx
<Route path="/coming-soon" element={<ComingSoon />} />
<Route path="/stylists" element={<ComingSoon />} />
<Route path="/stylist/:id" element={<ComingSoon />} />
<Route path="/s/:username" element={<ComingSoon />} />
<Route path="/client-requests" element={<ClientRequests />} /> // redirects
<Route path="/book-appointment" element={<BookAppointment />} /> // redirects
<Route path="/client-discovery" element={<ClientDiscovery />} /> // redirects
```

### Files Modified:
1. **src/pages/Auth.tsx** - Removed client signup option
2. **src/pages/ComingSoon.tsx** - New landing page for disabled features
3. **src/pages/ClientRequests.tsx** - Redirects to coming soon
4. **src/pages/BookAppointment.tsx** - Redirects to coming soon
5. **src/pages/ClientDiscovery.tsx** - Redirects to coming soon
6. **src/pages/StylistDiscovery.tsx** - Redirects to coming soon
7. **src/components/AppSidebar.tsx** - Removed client nav items
8. **src/components/FloatingActionButton.tsx** - Removed client actions
9. **src/components/dashboard/QuickActions.tsx** - Removed client quick actions
10. **src/components/OnboardingWizard.tsx** - Updated client onboarding
11. **src/components/BookingPageBranding.tsx** - Updated message
12. **src/components/ClientPortalPreview.tsx** - Shows coming soon

## Timeline for Client Features

Client-facing features will be enabled **after launch** once the platform is stable and stylist tools are perfected.

### Planned Client Features (Phase 2):
- [ ] Public stylist discovery with search/filters
- [ ] Online booking system
- [ ] Client self-registration
- [ ] Client request board
- [ ] Portfolio browsing
- [ ] Review system
- [ ] Payment integration
- [ ] Automated appointment reminders
- [ ] Client portal with history

## How to Re-Enable (Future)

When ready to launch client features:

1. **Restore Auth signup options**
   - Add back "Client (Free)" option in Auth.tsx
   - Enable client profile creation

2. **Un-comment/restore routes**
   - Replace `<ComingSoon />` with actual components
   - Enable public access to stylist discovery

3. **Restore UI elements**
   - Add back navigation items for clients
   - Restore quick actions and FAB buttons

4. **Update database policies**
   - Ensure RLS policies support client access
   - Test all client flows thoroughly

## Security Considerations

✅ **Current Setup is Secure:**
- Only stylists can create accounts
- Client tables have proper RLS policies (ready for future)
- Manual client addition by stylists is secure
- No unauthorized access to stylist tools

---

**Last Updated**: January 2025
**Status**: Stylist-Only Mode Active
**Next Review**: Post-Launch
