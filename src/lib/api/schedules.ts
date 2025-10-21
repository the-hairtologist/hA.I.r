/**
 * Schedule Management API Layer
 * Centralized schedule and availability operations
 */

import { supabase } from '@/integrations/supabase/client';
import { log } from '@/lib/logger';

export interface DaySchedule {
  enabled: boolean;
  startTime: string;
  endTime: string;
}

export interface WeeklySchedule {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

export interface BlockedDate {
  id: string;
  stylist_id: string;
  blocked_date: string;
  reason: string | null;
  created_at: string;
}

export interface ScheduleOverride {
  id: string;
  stylist_id: string;
  start_date: string;
  end_date: string;
  weekly_schedule: WeeklySchedule;
  label: string | null;
  created_at: string;
}

/**
 * Fetch stylist's weekly schedule
 */
export async function fetchStylistSchedule(stylistId: string) {
  log.info('Fetching stylist schedule', 'schedulesAPI', { stylistId });
  
  const { data, error } = await supabase
    .from('stylist_profiles')
    .select('weekly_schedule, buffer_time_minutes, is_available')
    .eq('id', stylistId)
    .single();

  if (error) {
    log.error('Failed to fetch schedule', 'schedulesAPI', error);
    throw error;
  }

  return {
    weeklySchedule: (data.weekly_schedule as unknown as WeeklySchedule) || null,
    bufferTime: data.buffer_time_minutes || 15,
    isAvailable: data.is_available || false,
  };
}

/**
 * Update stylist's weekly schedule
 */
export async function updateStylistSchedule(
  stylistId: string,
  schedule: WeeklySchedule,
  bufferTime: number
) {
  log.info('Updating stylist schedule', 'schedulesAPI', { stylistId });
  
  const { error } = await supabase
    .from('stylist_profiles')
    .update({
      weekly_schedule: schedule as any,
      buffer_time_minutes: bufferTime,
    })
    .eq('id', stylistId);

  if (error) {
    log.error('Failed to update schedule', 'schedulesAPI', error);
    throw error;
  }
}

/**
 * Fetch blocked dates for a stylist
 */
export async function fetchBlockedDates(stylistId: string): Promise<BlockedDate[]> {
  log.info('Fetching blocked dates', 'schedulesAPI', { stylistId });
  
  const { data, error } = await supabase
    .from('stylist_blocked_dates')
    .select('*')
    .eq('stylist_id', stylistId)
    .order('blocked_date', { ascending: true });

  if (error) {
    log.error('Failed to fetch blocked dates', 'schedulesAPI', error);
    throw error;
  }

  return data || [];
}

/**
 * Add a blocked date
 */
export async function addBlockedDate(stylistId: string, date: string, reason?: string): Promise<BlockedDate> {
  log.info('Adding blocked date', 'schedulesAPI', { stylistId, date });
  
  const { data, error } = await supabase
    .from('stylist_blocked_dates')
    .insert({
      stylist_id: stylistId,
      blocked_date: date,
      reason: reason || null,
    })
    .select()
    .single();

  if (error) {
    log.error('Failed to add blocked date', 'schedulesAPI', error);
    throw error;
  }

  return data;
}

/**
 * Remove a blocked date
 */
export async function removeBlockedDate(id: string): Promise<void> {
  log.info('Removing blocked date', 'schedulesAPI', { id });
  
  const { error } = await supabase
    .from('stylist_blocked_dates')
    .delete()
    .eq('id', id);

  if (error) {
    log.error('Failed to remove blocked date', 'schedulesAPI', error);
    throw error;
  }
}

/**
 * Fetch schedule overrides for a stylist
 */
export async function fetchScheduleOverrides(stylistId: string): Promise<ScheduleOverride[]> {
  log.info('Fetching schedule overrides', 'schedulesAPI', { stylistId });
  
  const { data, error } = await supabase
    .from('stylist_schedule_overrides')
    .select('*')
    .eq('stylist_id', stylistId)
    .order('start_date');

  if (error) {
    log.error('Failed to fetch schedule overrides', 'schedulesAPI', error);
    throw error;
  }

  return (data || []) as unknown as ScheduleOverride[];
}

/**
 * Create a schedule override
 */
export async function createScheduleOverride(
  stylistId: string,
  startDate: string,
  endDate: string,
  schedule: WeeklySchedule,
  label?: string
): Promise<ScheduleOverride> {
  log.info('Creating schedule override', 'schedulesAPI', { stylistId, startDate, endDate });
  
  const { data, error } = await supabase
    .from('stylist_schedule_overrides')
    .insert({
      stylist_id: stylistId,
      start_date: startDate,
      end_date: endDate,
      weekly_schedule: schedule as any,
      label: label || null,
    })
    .select()
    .single();

  if (error) {
    log.error('Failed to create schedule override', 'schedulesAPI', error);
    throw error;
  }

  return data as unknown as ScheduleOverride;
}

/**
 * Update a schedule override
 */
export async function updateScheduleOverride(
  id: string,
  startDate: string,
  endDate: string,
  schedule: WeeklySchedule,
  label?: string
): Promise<void> {
  log.info('Updating schedule override', 'schedulesAPI', { id });
  
  const { error } = await supabase
    .from('stylist_schedule_overrides')
    .update({
      start_date: startDate,
      end_date: endDate,
      weekly_schedule: schedule as any,
      label: label || null,
    })
    .eq('id', id);

  if (error) {
    log.error('Failed to update schedule override', 'schedulesAPI', error);
    throw error;
  }
}

/**
 * Delete a schedule override
 */
export async function deleteScheduleOverride(id: string): Promise<void> {
  log.info('Deleting schedule override', 'schedulesAPI', { id });
  
  const { error } = await supabase
    .from('stylist_schedule_overrides')
    .delete()
    .eq('id', id);

  if (error) {
    log.error('Failed to delete schedule override', 'schedulesAPI', error);
    throw error;
  }
}

/**
 * Toggle stylist availability
 */
export async function toggleStylistAvailability(stylistId: string, isAvailable: boolean): Promise<void> {
  log.info('Toggling stylist availability', 'schedulesAPI', { stylistId, isAvailable });
  
  const { error } = await supabase
    .from('stylist_profiles')
    .update({ is_available: isAvailable })
    .eq('id', stylistId);

  if (error) {
    log.error('Failed to toggle availability', 'schedulesAPI', error);
    throw error;
  }
}
