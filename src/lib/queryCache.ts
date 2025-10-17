/**
 * Query Cache Management
 * Re-exports the shared query client to maintain backwards compatibility
 * @deprecated Import from '@/lib/queryClient' instead
 */

export { queryClient, queryKeys, prefetchQueries, invalidateQueries } from './queryClient';

// All exports moved to queryClient.ts