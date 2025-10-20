/**
 * Query Invalidation Helpers
 * Centralized patterns for React Query cache invalidation
 */

import { QueryClient } from '@tanstack/react-query';
import { logger } from '@/lib/productionLogger';

/**
 * Invalidation patterns for common data relationships
 */
export const invalidationPatterns = {
  // Appointment related
  appointments: (queryClient: QueryClient, appointmentId?: string) => {
    queryClient.invalidateQueries({ queryKey: ['appointments'] });
    queryClient.invalidateQueries({ queryKey: ['calendar'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    if (appointmentId) {
      queryClient.invalidateQueries({ queryKey: ['appointment', appointmentId] });
    }
    logger.debug('Invalidated appointment queries', { context: 'QueryCache' });
  },

  // Client related
  clients: (queryClient: QueryClient, clientId?: string) => {
    queryClient.invalidateQueries({ queryKey: ['clients'] });
    queryClient.invalidateQueries({ queryKey: ['client-stats'] });
    queryClient.invalidateQueries({ queryKey: ['retention-scores'] });
    if (clientId) {
      queryClient.invalidateQueries({ queryKey: ['client', clientId] });
      queryClient.invalidateQueries({ queryKey: ['client-history', clientId] });
      queryClient.invalidateQueries({ queryKey: ['hair-photos', clientId] });
    }
    logger.debug('Invalidated client queries', { context: 'QueryCache' });
  },

  // Formula related
  formulas: (queryClient: QueryClient, formulaId?: string) => {
    queryClient.invalidateQueries({ queryKey: ['formulas'] });
    queryClient.invalidateQueries({ queryKey: ['formula-library'] });
    if (formulaId) {
      queryClient.invalidateQueries({ queryKey: ['formula', formulaId] });
    }
    logger.debug('Invalidated formula queries', { context: 'QueryCache' });
  },

  // AI insights
  aiInsights: (queryClient: QueryClient, stylistId?: string) => {
    queryClient.invalidateQueries({ queryKey: ['ai-insights'] });
    queryClient.invalidateQueries({ queryKey: ['retention-scores'] });
    queryClient.invalidateQueries({ queryKey: ['churn-risk'] });
    if (stylistId) {
      queryClient.invalidateQueries({ queryKey: ['ai-insights', stylistId] });
    }
    logger.debug('Invalidated AI insight queries', { context: 'QueryCache' });
  },

  // Profile updates
  profile: (queryClient: QueryClient, userId?: string) => {
    queryClient.invalidateQueries({ queryKey: ['profile'] });
    queryClient.invalidateQueries({ queryKey: ['stylist-profile'] });
    queryClient.invalidateQueries({ queryKey: ['client-profile'] });
    if (userId) {
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
    }
    logger.debug('Invalidated profile queries', { context: 'QueryCache' });
  },

  // Services
  services: (queryClient: QueryClient, serviceId?: string) => {
    queryClient.invalidateQueries({ queryKey: ['services'] });
    queryClient.invalidateQueries({ queryKey: ['service-popularity'] });
    if (serviceId) {
      queryClient.invalidateQueries({ queryKey: ['service', serviceId] });
    }
    logger.debug('Invalidated service queries', { context: 'QueryCache' });
  },

  // Reviews
  reviews: (queryClient: QueryClient, stylistId?: string) => {
    queryClient.invalidateQueries({ queryKey: ['reviews'] });
    queryClient.invalidateQueries({ queryKey: ['stylist-rating'] });
    if (stylistId) {
      queryClient.invalidateQueries({ queryKey: ['reviews', stylistId] });
    }
    logger.debug('Invalidated review queries', { context: 'QueryCache' });
  },

  // Complete dashboard refresh
  dashboard: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    queryClient.invalidateQueries({ queryKey: ['weekly-overview'] });
    queryClient.invalidateQueries({ queryKey: ['quick-tasks'] });
    queryClient.invalidateQueries({ queryKey: ['ai-insights'] });
    queryClient.invalidateQueries({ queryKey: ['birthdays'] });
    queryClient.invalidateQueries({ queryKey: ['milestones'] });
    logger.debug('Invalidated dashboard queries', { context: 'QueryCache' });
  },

  // Analytics
  analytics: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ queryKey: ['analytics'] });
    queryClient.invalidateQueries({ queryKey: ['revenue-stats'] });
    queryClient.invalidateQueries({ queryKey: ['client-lifetime-value'] });
    queryClient.invalidateQueries({ queryKey: ['service-popularity'] });
    logger.debug('Invalidated analytics queries', { context: 'QueryCache' });
  }
};

/**
 * Helper to invalidate multiple patterns at once
 */
export const invalidateMultiple = (
  queryClient: QueryClient,
  patterns: Array<keyof typeof invalidationPatterns>,
  id?: string
) => {
  patterns.forEach(pattern => {
    invalidationPatterns[pattern](queryClient, id);
  });
};

/**
 * Invalidate all related queries for a complex action
 */
export const invalidateRelated = {
  // When appointment is created/updated/deleted
  appointmentChange: (queryClient: QueryClient, data: { clientId?: string; stylistId?: string }) => {
    invalidationPatterns.appointments(queryClient);
    if (data.clientId) {
      invalidationPatterns.clients(queryClient, data.clientId);
    }
    invalidationPatterns.dashboard(queryClient);
    invalidationPatterns.analytics(queryClient);
  },

  // When client profile is updated
  clientChange: (queryClient: QueryClient, clientId: string) => {
    invalidationPatterns.clients(queryClient, clientId);
    invalidationPatterns.appointments(queryClient);
    invalidationPatterns.aiInsights(queryClient);
  },

  // When formula is created/updated
  formulaChange: (queryClient: QueryClient, formulaId?: string) => {
    invalidationPatterns.formulas(queryClient, formulaId);
    invalidationPatterns.dashboard(queryClient);
  },

  // When service is added/modified
  serviceChange: (queryClient: QueryClient, serviceId?: string) => {
    invalidationPatterns.services(queryClient, serviceId);
    invalidationPatterns.analytics(queryClient);
  }
};
