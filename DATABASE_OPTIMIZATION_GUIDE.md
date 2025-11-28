# 🗄️ Database Optimization Guide

## Query Performance Best Practices

### 1. Use Appropriate Indexes

The following indexes are recommended for optimal performance:

#### Appointments Table

```sql
-- Stylist calendar view (most common query)
CREATE INDEX idx_appointments_stylist_date ON appointments(stylist_id, appointment_date);

-- Client appointment history
CREATE INDEX idx_appointments_client_date ON appointments(client_id, appointment_date);

-- Status filtering
CREATE INDEX idx_appointments_status_date ON appointments(status, appointment_date);

-- Reminder scheduling
CREATE INDEX idx_appointments_reminders ON appointments(reminder_sent, appointment_date)
WHERE status = 'scheduled';
```

#### Client Profiles Table

```sql
-- User lookup (most frequent)
CREATE INDEX idx_client_profiles_user ON client_profiles(user_id);

-- Stylist's client list
CREATE INDEX idx_client_profiles_stylist ON client_profiles(preferred_stylist_id);

-- Email search
CREATE INDEX idx_client_profiles_email ON client_profiles(email);
```

#### Formulas Table

```sql
-- Stylist formula history
CREATE INDEX idx_formulas_stylist_date ON formulas(stylist_id, created_at DESC);

-- Client formula history
CREATE INDEX idx_formulas_client_date ON formulas(client_id, created_at DESC);
```

### 2. Pagination Best Practices

Always use pagination for list queries:

```typescript
import {
  createPaginationParams,
  calculatePaginationRange,
} from '@/lib/database/queryOptimization';

// In your query
const params = createPaginationParams({ page: 1, pageSize: 50 });
const { from, to } = calculatePaginationRange(params);

const { data, error, count } = await supabase
  .from('appointments')
  .select('*', { count: 'exact' })
  .range(from, to)
  .order('appointment_date', { ascending: false });
```

### 3. Query Caching

Use the query cache for frequently accessed data:

```typescript
import { queryCache, createCacheKey } from '@/lib/database/queryOptimization';

// Cache query results
const cacheKey = createCacheKey('appointments', { stylistId, date });
const cached = queryCache.get(cacheKey);

if (cached) {
  return cached;
}

const data = await fetchAppointments();
queryCache.set(cacheKey, data, 5 * 60 * 1000); // 5 minute TTL

// Invalidate cache when data changes
queryCache.invalidate(cacheKey);
// Or invalidate all related caches
queryCache.invalidatePattern('appointments');
```

### 4. Batch Operations

Fetch multiple records efficiently:

```typescript
import { batchFetch } from '@/lib/database/queryOptimization';

// Instead of multiple single queries
const clients = await batchFetch(
  async ids => {
    const { data } = await supabase
      .from('client_profiles')
      .select('*')
      .in('id', ids);
    return data || [];
  },
  clientIds,
  50 // batch size
);
```

### 5. Select Only Required Columns

```typescript
// ❌ Bad: Fetches all columns including large text fields
const { data } = await supabase.from('client_profiles').select('*');

// ✅ Good: Only fetch what you need
const { data } = await supabase
  .from('client_profiles')
  .select('id, full_name, email, phone');
```

### 6. Use Counts Efficiently

```typescript
// ❌ Bad: Fetches all data just to count
const { data } = await supabase.from('appointments').select('*');
const count = data?.length || 0;

// ✅ Good: Use count parameter
const { count } = await supabase
  .from('appointments')
  .select('*', { count: 'exact', head: true });
```

## Slow Query Analysis

### Identify Slow Queries

Monitor query performance in your application:

```typescript
const startTime = performance.now();
const { data } = await supabase.from('table').select('*');
const duration = performance.now() - startTime;

if (duration > 1000) {
  logger.warn('Slow query detected', 'QueryPerformance', {
    table: 'table',
    duration,
  });
}
```

### Common Performance Issues

1. **Missing Indexes**: Add indexes for frequently filtered/sorted columns
2. **N+1 Queries**: Use joins or batch fetching
3. **Large Result Sets**: Implement pagination
4. **Inefficient Joins**: Select only needed columns from joined tables
5. **No Query Caching**: Cache frequently accessed, rarely changed data

## Database Maintenance

### Vacuum and Analyze (Supabase manages this automatically)

Supabase automatically handles:

- VACUUM to reclaim storage
- ANALYZE to update statistics
- Index maintenance

### Monitor Database Size

```sql
-- Check table sizes
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check index usage
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;
```

## Best Practices Summary

✅ **DO:**

- Use indexes for frequently filtered columns
- Implement pagination for lists
- Cache frequently accessed data
- Use batch operations for multiple IDs
- Select only required columns
- Monitor slow queries

❌ **DON'T:**

- Fetch all data without pagination
- Run N+1 queries
- Skip indexes on foreign keys
- Cache data that changes frequently
- Use `SELECT *` in production code
- Ignore query performance metrics

## Performance Monitoring

Use the enhanced query hook for automatic monitoring:

```typescript
import { useEnhancedQuery } from '@/hooks/useEnhancedQuery';

const { data, error, isLoading } = useEnhancedQuery({
  queryKey: ['appointments', stylistId],
  queryFn: () => fetchAppointments(stylistId),
  cacheTable: 'appointments',
  cacheParams: { stylistId },
  retryOptions: {
    maxRetries: 3,
    baseDelay: 1000,
  },
});
```

## Real-World Optimization Examples

### Example 1: Calendar View Optimization

```typescript
// ❌ Before: Slow, no caching, no pagination
const appointments = await supabase
  .from('appointments')
  .select('*, client_profiles(*), stylist_profiles(*)')
  .eq('stylist_id', stylistId);

// ✅ After: Fast, cached, optimized
const cacheKey = createCacheKey('appointments_calendar', { stylistId, month });
const cached = queryCache.get(cacheKey);
if (cached) return cached;

const { data } = await supabase
  .from('appointments')
  .select(
    `
    id,
    appointment_date,
    service_type,
    status,
    client_profiles!inner(id, full_name, phone)
  `
  )
  .eq('stylist_id', stylistId)
  .gte('appointment_date', startOfMonth)
  .lte('appointment_date', endOfMonth)
  .order('appointment_date', { ascending: true });

queryCache.set(cacheKey, data, 2 * 60 * 1000); // 2 min cache
```

### Example 2: Client List Optimization

```typescript
// ❌ Before: Fetches all clients
const clients = await supabase
  .from('client_profiles')
  .select('*')
  .eq('preferred_stylist_id', stylistId);

// ✅ After: Paginated, filtered
const params = createPaginationParams({ page, pageSize: 50 });
const { from, to } = calculatePaginationRange(params);

const { data, count } = await supabase
  .from('client_profiles')
  .select(
    'id, full_name, email, phone, last_appointment:appointments(appointment_date)',
    { count: 'exact' }
  )
  .eq('preferred_stylist_id', stylistId)
  .order('full_name', { ascending: true })
  .range(from, to);
```

---

**Last Updated:** 2025-01-19  
**Version:** 1.0.0
