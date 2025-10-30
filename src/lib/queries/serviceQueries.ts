/**
 * Optimized Service Queries
 * Provides typed responses for stylist services.
 */

import { supabase } from '@/integrations/supabase/client';
import { requestDeduplicator } from '@/lib/api/requestDeduplicator';
import type { StylistService } from '@/types/common';

type DepositType = 'fixed' | 'percentage';

type StylistServiceRow = Pick<
  StylistService,
  | 'id'
  | 'service_name'
  | 'description'
  | 'duration_minutes'
  | 'price'
  | 'is_active'
  | 'require_deposit'
  | 'deposit_amount'
  | 'deposit_type'
  | 'buffer_time_minutes'
  | 'created_at'
>;

const normalizeDepositType = (
  depositType: string | null
): DepositType | null => {
  if (depositType === 'fixed' || depositType === 'percentage') {
    return depositType;
  }
  return null;
};

export interface StylistServiceSummary {
  id: string;
  service_name: string;
  description: string | null;
  duration_minutes: number;
  price: number;
  is_active: boolean;
  require_deposit: boolean;
  deposit_amount: number | null;
  deposit_type: DepositType | null;
  buffer_time_minutes: number | null;
  created_at: string;
}

export type ActiveStylistServiceSummary = Pick<
  StylistServiceSummary,
  | 'id'
  | 'service_name'
  | 'description'
  | 'duration_minutes'
  | 'price'
  | 'require_deposit'
  | 'deposit_amount'
  | 'deposit_type'
>;

const SERVICE_SUMMARY_COLUMNS =
  'id, service_name, description, duration_minutes, price, is_active, require_deposit, deposit_amount, deposit_type, buffer_time_minutes, created_at';

const ACTIVE_SERVICE_COLUMNS =
  'id, service_name, description, duration_minutes, price, require_deposit, deposit_amount, deposit_type';

const mapToServiceSummary = (
  service: StylistServiceRow
): StylistServiceSummary => ({
  id: service.id,
  service_name: service.service_name,
  description: service.description,
  duration_minutes: service.duration_minutes,
  price: service.price,
  is_active: service.is_active ?? true,
  require_deposit: service.require_deposit ?? false,
  deposit_amount: service.deposit_amount,
  deposit_type: normalizeDepositType(service.deposit_type),
  buffer_time_minutes: service.buffer_time_minutes,
  created_at: service.created_at,
});

const mapToActiveServiceSummary = (
  service: Pick<StylistServiceRow, keyof ActiveStylistServiceSummary>
): ActiveStylistServiceSummary => ({
  id: service.id,
  service_name: service.service_name,
  description: service.description,
  duration_minutes: service.duration_minutes,
  price: service.price,
  require_deposit: service.require_deposit ?? false,
  deposit_amount: service.deposit_amount,
  deposit_type: normalizeDepositType(service.deposit_type),
});

/**
 * Get services for a stylist with consistent typing.
 */
export const getServicesByStylist = async (
  stylistId: string
): Promise<StylistServiceSummary[]> => {
  return requestDeduplicator.deduplicate(
    'services-stylist-' + stylistId,
    async () => {
      const { data, error } = await supabase
        .from('stylist_services')
        .select(SERVICE_SUMMARY_COLUMNS)
        .eq('stylist_id', stylistId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data ?? []).map(mapToServiceSummary);
    }
  );
};

/**
 * Get only active bookable services for a stylist.
 */
export const getActiveServicesByStylist = async (
  stylistId: string
): Promise<ActiveStylistServiceSummary[]> => {
  return requestDeduplicator.deduplicate(
    'active-services-' + stylistId,
    async () => {
      const { data, error } = await supabase
        .from('stylist_services')
        .select(ACTIVE_SERVICE_COLUMNS)
        .eq('stylist_id', stylistId)
        .eq('is_active', true)
        .order('service_name', { ascending: true });

      if (error) throw error;
      return (data ?? []).map(mapToActiveServiceSummary);
    }
  );
};
