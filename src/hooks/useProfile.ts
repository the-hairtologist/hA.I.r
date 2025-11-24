/**
 * Profile Management Hook
 * Handles fetching and updating user profiles
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { handleError } from '@/lib/errorHandler';
import { log } from '@/lib/logger';

interface ProfileData {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  avatar_url?: string;
  gender?: string;
}

interface StylistProfile {
  id: string;
  user_id: string;
  business_name?: string;
  bio?: string;
  specialty?: string;
  location?: string;
  years_experience?: number;
  color_line?: string;
  is_available?: boolean;
  weekly_schedule?: any;
  buffer_time_minutes?: number;
}

interface ClientProfile {
  id: string;
  user_id: string;
  full_name?: string;
  email?: string;
  phone?: string;
  hair_type?: string;
  allergies?: string;
  notes?: string;
  preferred_stylist_id?: string;
}

interface UseProfileReturn {
  profile: ProfileData | null;
  stylistProfile: StylistProfile | null;
  clientProfile: ClientProfile | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  updateProfile: (data: Partial<ProfileData>) => Promise<void>;
  updateStylistProfile: (data: Partial<StylistProfile>) => Promise<void>;
  updateClientProfile: (data: Partial<ClientProfile>) => Promise<void>;
}

export function useProfile(userId?: string): UseProfileReturn {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [stylistProfile, setStylistProfile] = useState<StylistProfile | null>(
    null
  );
  const [clientProfile, setClientProfile] = useState<ClientProfile | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      log.debug('Fetching profile', 'useProfile', { userId });

      // Fetch base profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (profileError) throw profileError;
      
      // Map nullable fields to undefined
      setProfile(profileData ? {
        ...profileData,
        full_name: profileData.full_name ?? undefined,
        phone: profileData.phone ?? undefined,
        avatar_url: profileData.avatar_url ?? undefined,
        gender: profileData.gender ?? undefined,
      } : null);

      // Fetch ALL user roles (not just one)
      const { data: rolesData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      const roles = rolesData?.map(r => r.role) || [];

      // Fetch role-specific profiles
      // Check for stylist role
      if (roles.includes('stylist')) {
        const { data: stylistData, error: stylistError } = await supabase
          .from('stylist_profiles')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();

        if (stylistError && stylistError.code !== 'PGRST116') {
          log.warn('Stylist profile not found', 'useProfile', stylistError as any);
        }
        setStylistProfile(stylistData ? {
          ...stylistData,
          business_name: stylistData.business_name ?? undefined,
          bio: stylistData.bio ?? undefined,
          specialty: stylistData.specialty ?? undefined,
          location: stylistData.location ?? undefined,
          years_experience: stylistData.years_experience ?? undefined,
          color_line: stylistData.color_line ?? undefined,
          is_available: stylistData.is_available ?? undefined,
          weekly_schedule: stylistData.weekly_schedule ?? undefined,
          buffer_time_minutes: stylistData.buffer_time_minutes ?? undefined,
        } : null);
      }

      // Check for client role
      if (roles.includes('client')) {
        const { data: clientData, error: clientError } = await supabase
          .from('client_profiles')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();

        if (clientError && clientError.code !== 'PGRST116') {
          log.warn('Client profile not found', 'useProfile', clientError as any);
        }
        setClientProfile(clientData ? {
          ...clientData,
          user_id: clientData.user_id ?? userId,
          full_name: clientData.full_name ?? undefined,
          email: clientData.email ?? undefined,
          phone: clientData.phone ?? undefined,
          hair_type: clientData.hair_type ?? undefined,
          allergies: clientData.allergies ?? undefined,
          notes: clientData.notes ?? undefined,
          preferred_stylist_id: clientData.preferred_stylist_id ?? undefined,
        } : null);
      }

      log.info('Profile loaded successfully', 'useProfile', { userId, roles });
    } catch (err) {
      const error = err as Error;
      setError(error);
      handleError(error, 'Load Profile', { showToast: false });
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateProfile = useCallback(
    async (data: Partial<ProfileData>) => {
      if (!userId) throw new Error('No user ID provided');

      try {
        log.debug('Updating profile', 'useProfile', { userId, data });

        const { error } = await supabase
          .from('profiles')
          .update(data)
          .eq('id', userId);

        if (error) throw error;

        // Optimistically update local state
        setProfile(prev => (prev ? { ...prev, ...data } : null));

        log.info('Profile updated successfully', 'useProfile', { userId });
      } catch (error) {
        handleError(error, 'Update Profile');
        throw error;
      }
    },
    [userId]
  );

  const updateStylistProfile = useCallback(
    async (data: Partial<StylistProfile>) => {
      if (!stylistProfile?.id) throw new Error('No stylist profile found');

      try {
        log.debug('Updating stylist profile', 'useProfile', { data });

        const { error } = await supabase
          .from('stylist_profiles')
          .update(data)
          .eq('id', stylistProfile.id);

        if (error) throw error;

        // Optimistically update local state
        setStylistProfile(prev => (prev ? { ...prev, ...data } : null));

        log.info('Stylist profile updated successfully', 'useProfile');
      } catch (error) {
        handleError(error, 'Update Stylist Profile');
        throw error;
      }
    },
    [stylistProfile?.id]
  );

  const updateClientProfile = useCallback(
    async (data: Partial<ClientProfile>) => {
      if (!clientProfile?.id) throw new Error('No client profile found');

      try {
        log.debug('Updating client profile', 'useProfile', { data });

        const { error } = await supabase
          .from('client_profiles')
          .update(data)
          .eq('id', clientProfile.id);

        if (error) throw error;

        // Optimistically update local state
        setClientProfile(prev => (prev ? { ...prev, ...data } : null));

        log.info('Client profile updated successfully', 'useProfile');
      } catch (error) {
        handleError(error, 'Update Client Profile');
        throw error;
      }
    },
    [clientProfile?.id]
  );

  return {
    profile,
    stylistProfile,
    clientProfile,
    loading,
    error,
    refetch: fetchProfile,
    updateProfile,
    updateStylistProfile,
    updateClientProfile,
  };
}
