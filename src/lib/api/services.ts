/**
 * Services API Layer
 * Centralized stylist service operations
 */

import { supabase } from '@/integrations/supabase/client';
import { log } from '@/lib/logger';

export interface Service {
  id: string;
  stylist_id: string;
  service_name: string;
  description: string | null;
  duration_minutes: number;
  price: number;
  is_active: boolean;
  require_deposit: boolean;
  deposit_amount: number;
  deposit_type: 'fixed' | 'percentage';
  buffer_time_minutes: number | null;
  created_at: string;
  updated_at: string;
}

export interface CreateServiceData {
  stylist_id: string;
  service_name: string;
  description?: string;
  duration_minutes: number;
  price: number;
  is_active?: boolean;
  require_deposit?: boolean;
  deposit_amount?: number;
  deposit_type?: 'fixed' | 'percentage';
  buffer_time_minutes?: number;
}

export interface UpdateServiceData {
  id: string;
  service_name?: string;
  description?: string;
  duration_minutes?: number;
  price?: number;
  is_active?: boolean;
  require_deposit?: boolean;
  deposit_amount?: number;
  deposit_type?: 'fixed' | 'percentage';
  buffer_time_minutes?: number;
}

/**
 * Fetch all services for a stylist
 */
export async function fetchStylistServices(stylistId: string): Promise<Service[]> {
  log.info('Fetching stylist services', 'servicesAPI', { stylistId });
  
  const { data, error } = await supabase
    .from('stylist_services')
    .select('*')
    .eq('stylist_id', stylistId)
    .order('created_at', { ascending: false });

  if (error) {
    log.error('Failed to fetch services', 'servicesAPI', error);
    throw error;
  }

  return (data || []) as Service[];
}

/**
 * Create a new service
 */
export async function createService(serviceData: CreateServiceData): Promise<Service> {
  log.info('Creating service', 'servicesAPI', { name: serviceData.service_name });
  
  const { data, error } = await supabase
    .from('stylist_services')
    .insert({
      stylist_id: serviceData.stylist_id,
      service_name: serviceData.service_name.trim(),
      description: serviceData.description?.trim() || null,
      duration_minutes: serviceData.duration_minutes,
      price: serviceData.price,
      is_active: serviceData.is_active ?? true,
      require_deposit: serviceData.require_deposit || false,
      deposit_amount: serviceData.deposit_amount || 0,
      deposit_type: serviceData.deposit_type || 'fixed',
      buffer_time_minutes: serviceData.buffer_time_minutes || null,
    })
    .select()
    .single();

  if (error) {
    log.error('Failed to create service', 'servicesAPI', error);
    throw error;
  }

  return data as Service;
}

/**
 * Update a service
 */
export async function updateService(updateData: UpdateServiceData): Promise<Service> {
  log.info('Updating service', 'servicesAPI', { id: updateData.id });
  
  const { id, ...updates } = updateData;
  
  const { data, error } = await supabase
    .from('stylist_services')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    log.error('Failed to update service', 'servicesAPI', error);
    throw error;
  }

  return data as Service;
}

/**
 * Delete a service
 */
export async function deleteService(serviceId: string): Promise<void> {
  log.info('Deleting service', 'servicesAPI', { serviceId });
  
  const { error } = await supabase
    .from('stylist_services')
    .delete()
    .eq('id', serviceId);

  if (error) {
    log.error('Failed to delete service', 'servicesAPI', error);
    throw error;
  }
}
