# Role-Based Access Control Guide

## Overview

This app supports multiple user roles: **Stylist**, **Client**, and **Admin**. Users can have multiple roles simultaneously (e.g., both stylist and client).

## Key Components

### 1. useUserRole Hook (`src/hooks/useUserRole.ts`)

The primary hook for checking user roles.

```typescript
const { isStylist, isClient, isAdmin, roles, loading } = useUserRole(userId);
```

**Returns:**

- `roles`: Array of all user roles
- `isStylist`: Boolean indicating if user has stylist role
- `isClient`: Boolean indicating if user has client role
- `isAdmin`: Boolean indicating if user has admin role
- `loading`: Boolean indicating if roles are being fetched
- `refetch`: Function to manually refresh roles

### 2. Role Checking Best Practices

#### ❌ WRONG - Using .single() fails with multiple roles:

```typescript
const { data: roleData } = await supabase
  .from('user_roles')
  .select('role')
  .eq('user_id', userId)
  .single(); // This fails if user has multiple roles!
```

#### ✅ CORRECT - Fetch all roles:

```typescript
const { data: rolesData } = await supabase
  .from('user_roles')
  .select('role')
  .eq('user_id', userId);

const roles = rolesData?.map(r => r.role) || [];
const isStylist = roles.includes('stylist');
```

#### ✅ BETTER - Use the hook:

```typescript
import { useUserRole } from '@/hooks/useUserRole';

const { isStylist, isClient } = useUserRole(user?.id);

if (isStylist) {
  // Show stylist features
}
```

### 3. Protected Pages

All role-specific pages should:

1. Import `useUserRole` hook
2. Check loading state
3. Verify appropriate role
4. Redirect if unauthorized

**Example:**

```typescript
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';

const StylistOnlyPage = () => {
  const { user } = useAuth();
  const { isStylist, loading } = useUserRole(user?.id);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isStylist) {
      toast.error("Only stylists can access this page");
      navigate("/dashboard");
    }
  }, [loading, isStylist]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    // Page content
  );
};
```

### 4. Dual-Role Users

Users with both stylist and client roles can access features from both sides:

- Stylist features: Client Discovery, Services, Portfolio, Schedule
- Client features: Find Stylists, My Requests, Appointments

The DashboardLayout prioritizes stylist role for UI display but maintains access to both.

### 5. Role Assignment

Roles are stored in the `user_roles` table with:

- `user_id`: UUID reference to auth.users
- `role`: Enum of 'admin', 'stylist', 'client'
- Unique constraint on (user_id, role) to prevent duplicates

**Assigning roles:**

```typescript
await supabase.rpc('assign_user_role', {
  _user_id: userId,
  _role: 'stylist',
});
```

### 6. Profile Tables

Each role has a corresponding profile table:

- `stylist_profiles`: Business info, schedule, services
- `client_profiles`: Personal info, preferences, allergies

The `useProfile` hook fetches both profile types if user has multiple roles.

## Mobile Considerations

All role checks are optimized for mobile:

- Fast loading states
- Proper error handling
- Touch-optimized navigation
- Responsive layouts for all devices

## Security Notes

- **Never** check roles client-side only for sensitive operations
- Always verify roles on the backend (RLS policies)
- Use security definer functions for role checks in RLS
- Roles are immutable by regular users (only admins can assign)

## Troubleshooting

### "Only stylists can access this page" error

**Cause:** User doesn't have stylist role OR role check is using `.single()`
**Solution:**

1. Check user has stylist role in `user_roles` table
2. Verify page uses `useUserRole` hook correctly
3. Check for `.single()` calls that should fetch multiple rows

### Role not updating after assignment

**Cause:** Stale data in React state
**Solution:** Call `refetch()` from `useUserRole` or refresh the page

### Multiple roles causing errors

**Cause:** Old code using `.single()` instead of fetching all roles
**Solution:** Update to use `useUserRole` hook or fetch all roles without `.single()`
