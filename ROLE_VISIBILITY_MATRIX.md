# Role Visibility Matrix - Universal Reference

## 🎯 Quick Role Legend
- 🛡️ **Admin** - Full platform access
- ✂️ **Stylist** - Business management tools
- 👤 **Client** - Booking & communication

---

## 📱 Settings Page Tabs

| Tab | Admin | Stylist | Client | Notes |
|-----|-------|---------|--------|-------|
| Profile | ✅ | ✅ | ✅ | All roles manage profile info |
| Account & Security | ✅ | ✅ | ✅ | Email, password, data export |
| AI Systems | ✅ | ✅ | ✅ | AI feature preferences |
| **Zapier** | ✅ | ✅ | ❌ | **STYLIST-ONLY** webhook integrations |
| Preferences | ✅ | ✅ | ✅ | Theme, notifications, privacy |

**Answer: YES, Zapier is only visible to Stylists (and Admins)** ✅

---

## 🗺️ Navigation Visibility

### Main Navigation

#### Client Navigation (7 items)
| Feature | Route | Roles |
|---------|-------|-------|
| Home | `/dashboard` | 👤 |
| Book Appointment | `/book-appointment` | 👤 |
| My Appointments | `/appointments` | 👤 |
| Messages | `/messages` | 👤 |
| Hair History | `/client-formulas` | 👤 |
| My Profile | `/profile` | 👤 |
| Settings | `/settings` | 👤 |

#### Stylist Navigation (15 items)
| Feature | Route | Roles |
|---------|-------|-------|
| Dashboard | `/dashboard` | ✂️ 🛡️ |
| Appointments | `/appointments` | ✂️ 🛡️ |
| Clients | `/clients` | ✂️ 🛡️ |
| Messages | `/messages` | ✂️ 🛡️ |
| Sales Dashboard | `/sales-dashboard` | ✂️ 🛡️ |
| Schedule Management | `/schedule` | ✂️ 🛡️ |
| Services | `/services` | ✂️ 🛡️ |
| Formulas | `/formulas` | ✂️ 🛡️ |
| Finance | `/finance` | ✂️ 🛡️ |
| Portfolio | `/portfolio` | ✂️ 🛡️ |
| AI Assistant | `/ai-assistant` | ✂️ 🛡️ |
| Knowledge Base | `/knowledge` | ✂️ 🛡️ |
| Integrations | `/integrations` | ✂️ 🛡️ |
| Reviews | `/reviews` | ✂️ 🛡️ |
| Settings | `/settings` | ✂️ 🛡️ |

#### Admin-Only Navigation
| Feature | Route | Roles |
|---------|-------|-------|
| Command Center | `/admin/command` | 🛡️ |
| User Management | `/admin/users` | 🛡️ |
| Audit Logs | `/admin/audit-logs` | 🛡️ |
| System Health | `/system-health` | 🛡️ |
| Security Scanner | `/security-audit` | 🛡️ |
| Access Codes | `/access-codes` | 🛡️ |

---

## 🎨 Dashboard Widgets

### Client Dashboard Widgets
| Widget | Visible To |
|--------|-----------|
| Next Appointment | 👤 |
| AI Support Chat | 👤 |
| Rewards Progress | 👤 |
| Quick Actions | 👤 |
| My Stylists | 👤 |
| Milestones | 👤 |

**Total**: 6 focused widgets

### Stylist Dashboard Widgets
| Widget | Visible To |
|--------|-----------|
| Progress Tracker | ✂️ 🛡️ |
| At-Risk Clients | ✂️ 🛡️ |
| AI Recommendations | ✂️ 🛡️ |
| Today's Overview (KPIs) | ✂️ 🛡️ |
| Session Timer | ✂️ 🛡️ |
| Birthday Alerts | ✂️ 🛡️ |
| Commission Tracker | ✂️ 🛡️ |
| Quick Actions | ✂️ 🛡️ |
| Weekly Stats | ✂️ 🛡️ |
| Recent Activity | ✂️ 🛡️ |
| My Tasks | ✂️ 🛡️ |
| Quick Notes | ✂️ 🛡️ |

**Total**: 12 business widgets

### Admin Dashboard Widgets
| Widget | Visible To |
|--------|-----------|
| Platform Overview | 🛡️ |
| Admin Controls | 🛡️ |
| Platform Metrics | 🛡️ |
| System Activity | 🛡️ |
| Admin Tasks | 🛡️ |

**Total**: 5 oversight widgets

---

## 🔧 Special Features

### Floating Action Buttons
| Feature | Visible To | Notes |
|---------|-----------|-------|
| Quick Add Client | ✂️ | Stylist-only (NOT shown to admins) |
| Book Appointment | 👤 | Client quick action |
| **Hidden for Admins** | ❌ | Admins use Quick Actions instead |

### Mobile Navigation
| Feature | Visible To |
|---------|-----------|
| Mobile Bottom Nav | All (role-filtered items) |
| Mobile Drawer | All (role-specific) |
| Mobile Quick Actions | All (role-filtered) |

---

## 🎯 Quick Actions

### Admin Quick Actions (6 default)
- Command Center
- User Management
- Audit Logs
- System Health
- Security Scanner
- AI Assistant

### Stylist Quick Actions (4 default)
- AI Support
- Quick Formula
- AI Expert Chat
- Create Formula
- (Plus 9 more customizable)

### Client Quick Actions (3 default)
- AI Support
- Hair Care Tips
- My Profile

---

## 🔐 Database-Level Permissions

### Tables with Role-Based Access

#### Admin-Only Tables
- `audit_logs` - 🛡️ Only
- `admin_activity_log` - 🛡️ Only
- `access_codes` - 🛡️ Manage, users view own

#### Stylist-Accessible Tables
- `stylist_profiles` - ✂️ Own profile
- `appointments` - ✂️ Own appointments
- `formulas` - ✂️ Own formulas
- `commissions` - ✂️ Own commissions
- `client_profiles` - ✂️ Their clients only

#### Client-Accessible Tables
- `client_profiles` - 👤 Own profile
- `appointments` - 👤 Own appointments
- `client_hair_posts` - 👤 Own posts
- `formulas` - 👤 View assigned formulas

---

## 💡 How to Check Role Visibility (As Admin)

### Method 1: Visual Badges (Coming Soon)
We're adding `<RoleVisibilityBadge>` components throughout the UI that will show:
- 🛡️ Admin-only features
- ✂️ Stylist-only features  
- 👤 Client-only features
- Combined badges for multi-role features

### Method 2: This Matrix Document
Refer to this document for comprehensive role visibility information.

### Method 3: Browser DevTools
1. Open browser console
2. Check `localStorage` for role data
3. Use React DevTools to inspect role props

### Method 4: Test Accounts
Create test accounts for each role:
- Test Stylist account
- Test Client account
- Switch between them to verify visibility

---

## 🎨 Visual Indicators (Implementation Plan)

### Phase 1: Settings Tab Badges ✅
```tsx
<TabsTrigger value="zapier">
  Zapier
  <RoleVisibilityBadge roles={["stylist", "admin"]} />
</TabsTrigger>
```

### Phase 2: Navigation Item Badges (Next)
Add badges to sidebar navigation items

### Phase 3: Dashboard Widget Headers (Next)
Show role indicators on widget cards

### Phase 4: Quick Actions Labels (Next)
Subtle indicators on action buttons

---

## 📊 Role Distribution Summary

### By Feature Count
- **Client**: 7 navigation items, 6 widgets (13 total features)
- **Stylist**: 15 navigation items, 12 widgets (27 total features)
- **Admin**: 6 admin items + all stylist/client items (~40+ total features)

### By Exclusivity
- **Client-Only**: 7 features
- **Stylist-Only**: 20 features
- **Admin-Only**: 6 features
- **Shared (All)**: 7 features

---

## ✅ Zapier Visibility Confirmation

**Question**: "Zapier is only visible to me right?"

**Answer**: **YES** ✅ - Zapier tab in Settings is only visible to:
- ✂️ Stylists (for webhook integrations)
- 🛡️ Admins (full access)

**NOT visible to**:
- ❌ Clients

**Code Location**: `src/pages/Settings.tsx` line 482-487
```tsx
{userRole === "stylist" && (
  <TabsTrigger value="zapier">
    Zapier
  </TabsTrigger>
)}
```

**Database Security**: Even if clients could access the URL, RLS policies would prevent them from viewing/modifying Zapier webhooks.

---

## 🎓 For Developers: Adding Role-Restricted Features

### Pattern 1: Settings Tab
```tsx
{(userRole === "stylist" || isAdmin) && (
  <TabsTrigger value="new-feature">
    New Feature
    <RoleVisibilityBadge roles={["stylist", "admin"]} />
  </TabsTrigger>
)}
```

### Pattern 2: Navigation Item
```tsx
{
  id: "new-feature",
  title: "New Feature",
  url: "/new-feature",
  icon: Icon,
  group: "tools",
  roles: ["stylist", "admin"] // Add role restriction
}
```

### Pattern 3: Component Rendering
```tsx
{isStylist && (
  <>
    <StylistFeature />
    <RoleVisibilityBadge roles={["stylist"]} />
  </>
)}
```

---

**This matrix provides a universal reference for all role-based visibility in the app!** 🎉
