/**
 * Optimized Dashboard Queries
 * Replaces select("*") with specific field selections for better performance
 */

import { supabase } from '@/integrations/supabase/client';
import { startOfDay, endOfDay, startOfWeek, endOfWeek } from 'date-fns';

// Stylist-specific queries with optimized field selection
export const getStylistDashboardData = async (
  stylistId: string,
  userId: string
) => {
  const today = new Date();
  const weekStart = startOfWeek(today);
  const weekEnd = endOfWeek(today);

  // Parallel queries for maximum performance
  const [
    todayApptsResult,
    weekApptsResult,
    messagesResult,
    appointmentsResult,
  ] = await Promise.all([
    // Today's appointments - only fields needed for count
    supabase
      .from('appointments')
      .select('id, status')
      .eq('stylist_id', stylistId)
      .gte('appointment_date', startOfDay(today).toISOString())
      .lte('appointment_date', endOfDay(today).toISOString())
      .neq('status', 'cancelled'),

    // Week appointments - includes client info for display
    supabase
      .from('appointments')
      .select(
        `
        id,
        appointment_date,
        service_type,
        status,
        client_id,
        notes,
        client:client_profiles(
          id,
          user:profiles(
            full_name,
            email,
            phone
          )
        )
      `
      )
      .eq('stylist_id', stylistId)
      .gte('appointment_date', weekStart.toISOString())
      .lte('appointment_date', weekEnd.toISOString())
      .neq('status', 'cancelled'),

    // Unread messages - only count needed
    supabase
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .eq('recipient_id', userId)
      .eq('is_read', false),

    // All appointments for unique client count - minimal data
    supabase
      .from('appointments')
      .select('client_id')
      .eq('stylist_id', stylistId),
  ]);

  const todayAppts = todayApptsResult.data || [];
  const weekAppts = weekApptsResult.data || [];
  const uniqueClients = new Set(
    appointmentsResult.data?.map(a => a.client_id) || []
  ).size;

  return {
    stats: {
      todayAppointments: todayAppts.length,
      upcomingAppointments: weekAppts.length,
      unreadMessages: messagesResult.count || 0,
      totalClients: uniqueClients,
    },
    weekAppointments: weekAppts,
  };
};

// Recent activity query - optimized fields
export const getRecentActivity = async (
  stylistId: string,
  limit: number = 5
) => {
  const { data } = await supabase
    .from('appointments')
    .select(
      `
      id,
      appointment_date,
      service_type,
      status,
      created_at,
      client:client_profiles(
        id,
        user:profiles(full_name)
      )
    `
    )
    .eq('stylist_id', stylistId)
    .order('created_at', { ascending: false })
    .limit(limit);

  return data || [];
};

// Client dashboard queries
export const getClientDashboardData = async (
  clientId: string,
  userId: string
) => {
  const today = new Date();
  const weekStart = startOfWeek(today);
  const weekEnd = endOfWeek(today);

  const [
    upcomingApptsResult,
    weekApptsResult,
    messagesResult,
    completedApptsResult,
  ] = await Promise.all([
    // Upcoming appointments
    supabase
      .from('appointments')
      .select(
        `
        id,
        appointment_date,
        service_type,
        status,
        notes,
        stylist:stylist_profiles(
          id,
          business_name,
          user:profiles(full_name),
          weekly_schedule
        )
      `
      )
      .eq('client_id', clientId)
      .gte('appointment_date', today.toISOString())
      .neq('status', 'cancelled')
      .order('appointment_date', { ascending: true }),

    // Week appointments for calendar
    supabase
      .from('appointments')
      .select(
        `
        id,
        appointment_date,
        service_type,
        status,
        stylist:stylist_profiles(
          id,
          business_name,
          user:profiles(full_name)
        )
      `
      )
      .eq('client_id', clientId)
      .gte('appointment_date', weekStart.toISOString())
      .lte('appointment_date', weekEnd.toISOString())
      .neq('status', 'cancelled'),

    // Unread messages count
    supabase
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .eq('recipient_id', userId)
      .eq('is_read', false),

    // Completed appointments needing reviews
    supabase
      .from('appointments')
      .select(
        `
        id,
        reviews(id)
      `
      )
      .eq('client_id', clientId)
      .eq('status', 'completed')
      .is('reviews.id', null),
  ]);

  return {
    stats: {
      upcomingAppointments: upcomingApptsResult.data?.length || 0,
      unreadMessages: messagesResult.count || 0,
      pendingReviews: completedApptsResult.data?.length || 0,
    },
    weekAppointments: weekApptsResult.data || [],
  };
};

// Get user profile with role - optimized
export const getUserProfileWithRole = async (userId: string, role: string) => {
  if (role === 'stylist') {
    const { data } = await supabase
      .from('stylist_profiles')
      .select(
        'id, user_id, business_name, color_line, specialty, years_experience, weekly_schedule'
      )
      .eq('user_id', userId)
      .maybeSingle();
    return data;
  } else if (role === 'client') {
    const { data } = await supabase
      .from('client_profiles')
      .select(
        'id, user_id, full_name, email, phone, hair_type, preferred_stylist_id'
      )
      .eq('user_id', userId)
      .maybeSingle();
    return data;
  }
  return null;
};

// Get basic profile data
export const getBasicProfile = async (userId: string) => {
  const { data } = await supabase
    .from('profiles')
    .select('id, full_name, gender, avatar_url')
    .eq('id', userId)
    .maybeSingle();
  return data;
};
