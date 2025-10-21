import { useEffect } from 'react';
import { useEnhancedAuth } from '@/contexts/EnhancedAuthContext';
import { setUser, clearUser } from '@/lib/monitoring';

/**
 * Automatically sync authenticated user with Sentry
 */
export const useSentryUser = () => {
  const { user } = useEnhancedAuth();

  useEffect(() => {
    if (user) {
      setUser(
        user.id,
        user.email,
        user.user_metadata?.full_name || user.email?.split('@')[0]
      );
    } else {
      clearUser();
    }
  }, [user]);
};
