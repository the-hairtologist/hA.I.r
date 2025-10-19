/**
 * User Role Hook
 * Provides role checking and management with automatic retry logic
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { log } from '@/lib/logger';
import { withRetry } from '@/lib/errorHandling/retryLogic';

export type UserRole = 'admin' | 'stylist' | 'client';

interface UseUserRoleReturn {
  roles: UserRole[];
  isStylist: boolean;
  isClient: boolean;
  isAdmin: boolean;
  loading: boolean;
  refetch: () => Promise<void>;
}

export function useUserRole(userId?: string): UseUserRoleReturn {
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRoles = async () => {
    if (!userId) {
      setRoles([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      log.debug('Fetching user roles', 'useUserRole', { userId });

      const data = await withRetry(
        async () => {
          const { data, error } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', userId);

          if (error) throw error;
          return data;
        },
        {
          maxRetries: 3,
          baseDelay: 1000,
          onRetry: (attempt, error) => {
            log.warn('Retrying role fetch', 'useUserRole', {
              attempt,
              error: error?.message,
            });
          },
        }
      );

      const userRoles = (data || []).map(r => r.role as UserRole);
      setRoles(userRoles);

      log.info('User roles loaded', 'useUserRole', { userId, roles: userRoles });
    } catch (error) {
      log.error('Failed to fetch roles', 'useUserRole', { error });
      setRoles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      setLoading(true);
    }
    fetchRoles();
  }, [userId]);

  return {
    roles,
    isStylist: roles.includes('stylist'),
    isClient: roles.includes('client'),
    isAdmin: roles.includes('admin'),
    loading,
    refetch: fetchRoles,
  };
}
