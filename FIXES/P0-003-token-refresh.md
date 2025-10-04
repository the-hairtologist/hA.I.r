# Fix P0-003: Token Refresh

## Issue
**Priority**: P0 - Critical  
**Audit Finding**: A-005  
**Location**: src/hooks/useAuth.ts

**Problem**: Users getting logged out unexpectedly due to expired session tokens without automatic refresh.

**User Impact**: 
- Forced re-login interrupting workflows
- Lost form data
- Poor user experience
- Confusion about session state

---

## Root Cause

Supabase sessions expire after 1 hour by default. The app wasn't automatically refreshing tokens before expiration.

---

## Solution Implemented

### Added Automatic Token Refresh

**File**: `src/hooks/useAuth.ts`

**Changes**:
1. Added interval timer to check token expiry
2. Proactive refresh when token expires within 5 minutes
3. Token refresh event logging
4. Cleanup on unmount

```typescript
// Added to useAuth hook
useEffect(() => {
  // ... existing auth state listener

  // Set up automatic token refresh check
  const refreshInterval = setInterval(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      // Check if token is about to expire (within 5 minutes)
      const expiresAt = session.expires_at ? session.expires_at * 1000 : 0;
      const now = Date.now();
      const fiveMinutes = 5 * 60 * 1000;
      
      if (expiresAt - now < fiveMinutes) {
        log.info('Token expiring soon, refreshing...', 'useAuth');
        const { error } = await supabase.auth.refreshSession();
        if (error) {
          log.error('Token refresh failed', 'useAuth', { error });
        }
      }
    }
  }, 60000); // Check every minute

  return () => {
    subscription.unsubscribe();
    clearInterval(refreshInterval);
  };
}, [navigate]);
```

---

## Testing

### Manual Testing
1. Login to app
2. Wait for token to approach expiry (or modify timer for testing)
3. Continue using app
4. Verify no logout occurs
5. Check console logs for refresh messages

### Automated Testing
```typescript
describe('Token Refresh', () => {
  it('should refresh token before expiry', async () => {
    // Mock session with expiry in 4 minutes
    const mockSession = {
      expires_at: (Date.now() / 1000) + 240,
      user: { id: 'test-user' }
    };

    // Wait for refresh check
    await waitFor(() => {
      expect(supabase.auth.refreshSession).toHaveBeenCalled();
    }, { timeout: 65000 });
  });
});
```

---

## Acceptance Criteria

- ✅ Token refreshes automatically before expiry
- ✅ Users remain logged in during long sessions
- ✅ Refresh logged for monitoring
- ✅ Failed refresh handled gracefully
- ✅ Cleanup on component unmount
- ✅ No memory leaks from interval

---

## Status

**COMPLETED** ✅

---

## Related Fixes
- See P0-001-double-submit-prevention.md
- See P0-004-keyboard-traps.md
