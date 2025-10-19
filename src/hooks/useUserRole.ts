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

  const fetchRoles = async (retryCount = 0, maxRetries = 3) => {
    if (!userId) {
      setRoles([]);
      setLoading(false);
      return;
    }

    try {
      // Ensure loading is true when we have a userId
      setLoading(true);

      log.debug('Fetching user roles', 'useUserRole', { userId, attempt: retryCount + 1 });

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (error) {
        // Check if it's a network error and we should retry
        if (retryCount < maxRetries && error.message.includes('Load failed')) {
          const delay = Math.min(1000 * Math.pow(2, retryCount), 5000); // Exponential backoff, max 5s
          log.warn('Network error, retrying...', 'useUserRole', { 
            error, 
            retryCount: retryCount + 1, 
            delay 
          });
          
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, delay));
          return fetchRoles(retryCount + 1, maxRetries);
        }
        
        log.error('Error fetching roles', 'useUserRole', { error });
        setRoles([]);
        return;
      }

      const userRoles = (data || []).map(r => r.role as UserRole);
      setRoles(userRoles);

      log.info('User roles loaded', 'useUserRole', { userId, roles: userRoles });
    } catch (error) {
      // Network exception - retry if we haven't exceeded max retries
      if (retryCount < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, retryCount), 5000);
        log.warn('Exception fetching roles, retrying...', 'useUserRole', { 
          error, 
          retryCount: retryCount + 1,
          delay 
        });
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return fetchRoles(retryCount + 1, maxRetries);
      }
      
      log.error('Exception fetching roles (max retries exceeded)', 'useUserRole', { error });
      setRoles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Set loading to true immediately when userId changes
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
