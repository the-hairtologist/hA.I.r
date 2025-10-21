/**
 * Optimized Settings/Profile Queries
 * Replaces select("*") with specific field selections
 */

import { supabase } from "@/integrations/supabase/client";

export interface ProfileFields {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  gender?: string;
  created_at: string;
  updated_at: string;
}

export interface StylistProfileFields {
  id: string;
  user_id: string;
  business_name?: string;
  bio?: string;
  specialty?: string;
  color_line?: string;
  location?: string;
  years_experience?: number;
  social_media_instagram?: string;
  social_media_tiktok?: string;
  social_media_facebook?: string;
  business_phone?: string;
  business_email?: string;
  timezone: string;
  preferred_communication: string;
  cancellation_policy?: string;
  deposit_required: boolean;
  deposit_percentage?: number;
  accepts_new_clients: boolean;
  max_clients_per_day?: number;
  parking_instructions?: string;
  special_accommodations?: string;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClientProfileFields {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone?: string;
  birthday?: string;
  hair_goals?: string;
  preferred_time_of_day?: string;
  referral_source?: string;
  sensitivity_notes?: string;
  communication_preference: string;
  special_requests?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Get user profile by ID
 */
export async function getProfileById(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select(`
      id,
      email,
      full_name,
      avatar_url,
      gender,
      created_at,
      updated_at
    `)
    .eq("id", userId)
    .maybeSingle();

  if (error) throw error;
  return data as ProfileFields | null;
}

/**
 * Get stylist profile by user ID
 */
export async function getStylistProfile(userId: string) {
  const { data, error } = await supabase
    .from("stylist_profiles")
    .select(`
      id,
      user_id,
      business_name,
      bio,
      specialty,
      color_line,
      location,
      years_experience,
      social_media_instagram,
      social_media_tiktok,
      social_media_facebook,
      business_phone,
      business_email,
      timezone,
      preferred_communication,
      cancellation_policy,
      deposit_required,
      deposit_percentage,
      accepts_new_clients,
      max_clients_per_day,
      parking_instructions,
      special_accommodations,
      is_available,
      created_at,
      updated_at
    `)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return data as StylistProfileFields | null;
}

/**
 * Get client profile by user ID
 */
export async function getClientProfile(userId: string) {
  const { data, error } = await supabase
    .from("client_profiles")
    .select(`
      id,
      user_id,
      full_name,
      email,
      phone,
      birthday,
      hair_goals,
      preferred_time_of_day,
      referral_source,
      sensitivity_notes,
      communication_preference,
      special_requests,
      created_at,
      updated_at
    `)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return data as ClientProfileFields | null;
}

/**
 * Get user profiles in parallel
 */
export async function getUserProfiles(userId: string) {
  const [profile, stylistProfile, clientProfile] = await Promise.all([
    getProfileById(userId),
    getStylistProfile(userId),
    getClientProfile(userId),
  ]);

  return {
    profile,
    stylistProfile,
    clientProfile,
  };
}
