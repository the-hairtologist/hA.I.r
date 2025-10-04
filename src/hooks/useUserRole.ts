/**
 * User Role Hook
 * Provides role checking and management
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { log } from '@/lib/logger';

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
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      log.debug('Fetching user roles', 'useUserRole', { userId });

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (error) {
        log.error('Error fetching roles', 'useUserRole', { error });
        setRoles([]);
        return;
      }

      const userRoles = (data || []).map(r => r.role as UserRole);
      setRoles(userRoles);

      log.info('User roles loaded', 'useUserRole', { userId, roles: userRoles });
    } catch (error) {
      log.error('Exception fetching roles', 'useUserRole', { error });
      setRoles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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
