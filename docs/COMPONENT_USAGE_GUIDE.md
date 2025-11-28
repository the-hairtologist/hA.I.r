# Component Usage Guide

Quick reference for using new performance and polish components.

## Loading States

### List Skeletons

```tsx
import { ListSkeleton } from '@/components/LoadingSkeleton';

// Compact list (default)
<ListSkeleton items={5} />

// Detailed list with images
<ListSkeleton items={3} variant="detailed" />

// Grid layout
<ListSkeleton items={6} variant="grid" />
```

### Table Skeleton

```tsx
import { TableSkeleton } from '@/components/LoadingSkeleton';

<TableSkeleton rows={10} columns={5} />;
```

### Page Skeletons

```tsx
import {
  PageHeaderSkeleton,
  StatsSkeleton,
  ChartSkeleton,
  AnalyticsPageSkeleton,
  FormPageSkeleton
} from '@/components/skeletons/PageSkeleton';

// Complete analytics page
<AnalyticsPageSkeleton />

// Individual components
<PageHeaderSkeleton />
<StatsSkeleton count={4} />
<ChartSkeleton title="Revenue" />
<FormPageSkeleton />
```

## Empty States

### Card-style Empty State

```tsx
import { EmptyStateCard } from '@/components/empty-states/EmptyStateCard';
import { Users } from 'lucide-react';

<EmptyStateCard
  icon={Users}
  title="No clients yet"
  description="Add your first client to get started"
  actionLabel="Add Client"
  onAction={() => setShowDialog(true)}
  secondaryActionLabel="Learn More"
  onSecondaryAction={() => navigate('/help')}
/>;
```

### Table Empty State

```tsx
import { EmptyTableState } from '@/components/empty-states/EmptyStateCard';
import { Calendar } from 'lucide-react';

<EmptyTableState
  icon={Calendar}
  title="No appointments scheduled"
  description="Your calendar is clear"
  actionLabel="Book Appointment"
  onAction={handleBook}
/>;
```

## Optimistic Updates

```tsx
import { useOptimisticUpdate } from '@/hooks/useOptimisticUpdate';

function MyComponent() {
  const { mutate, isUpdating, error } = useOptimisticUpdate();

  const handleUpdate = async () => {
    await mutate(() => supabase.from('table').update(data).eq('id', id), {
      successMessage: 'Updated!',
      errorMessage: 'Update failed',
      onSuccess: result => {
        // Refresh data
      },
    });
  };

  return (
    <Button onClick={handleUpdate} disabled={isUpdating}>
      {isUpdating ? 'Updating...' : 'Update'}
    </Button>
  );
}
```

## Performance Utilities

### Debounced Search

```tsx
import { debounce } from '@/lib/performance/dataFetching';
import { useState, useMemo } from 'react';

function SearchComponent() {
  const [query, setQuery] = useState('');

  const debouncedSearch = useMemo(
    () =>
      debounce((value: string) => {
        // Perform search
        fetchResults(value);
      }, 300),
    []
  );

  return (
    <input
      onChange={e => {
        setQuery(e.target.value);
        debouncedSearch(e.target.value);
      }}
    />
  );
}
```

### Data Caching

```tsx
import { dataCache } from '@/lib/performance/dataFetching';

async function fetchData() {
  // Check cache first
  const cached = dataCache.get<DataType[]>('cache-key');
  if (cached) return cached;

  // Fetch from API
  const data = await api.fetch();

  // Cache for 5 minutes (default)
  dataCache.set('cache-key', data);
  return data;
}

// Invalidate cache when data changes
dataCache.invalidate('cache-key');

// Clear all cache
dataCache.clear();
```

### Batch Fetching

```tsx
import { batchFetch } from '@/lib/performance/dataFetching';

// Fetch multiple resources with 50ms delay between each
const [clients, appointments, services] = await batchFetch(
  [
    () => supabase.from('clients').select('*'),
    () => supabase.from('appointments').select('*'),
    () => supabase.from('services').select('*'),
  ],
  50
);
```

## Complete Page Pattern

```tsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ListSkeleton } from '@/components/LoadingSkeleton';
import { EmptyStateCard } from '@/components/empty-states/EmptyStateCard';
import { PageHeaderSkeleton } from '@/components/skeletons/PageSkeleton';
import { Users } from 'lucide-react';

function ClientsPage() {
  const { data: clients, isLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: fetchClients,
  });

  // Loading state
  if (isLoading) {
    return (
      <div>
        <PageHeaderSkeleton />
        <ListSkeleton items={5} variant="detailed" />
      </div>
    );
  }

  // Empty state
  if (!clients || clients.length === 0) {
    return (
      <EmptyStateCard
        icon={Users}
        title="No clients yet"
        description="Start by adding your first client"
        actionLabel="Add Client"
        onAction={() => setShowDialog(true)}
      />
    );
  }

  // Success state
  return <div>{/* Your content */}</div>;
}
```

## Animation Delays

For staggered animations in lists:

```tsx
{
  items.map((item, i) => (
    <div
      key={item.id}
      className="animate-fade-in"
      style={{ animationDelay: `${i * 50}ms` }}
    >
      {/* Item content */}
    </div>
  ));
}
```

## Mobile-First Considerations

```tsx
// Stack buttons vertically on mobile
<div className="flex flex-col sm:flex-row gap-3">
  <Button>Primary</Button>
  <Button variant="outline">Secondary</Button>
</div>

// Responsive skeleton grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Grid items */}
</div>
```

## Accessibility

Always include:

- `role="status"` for loading states
- `aria-label` for context
- `aria-live="polite"` for updates

```tsx
<div role="status" aria-live="polite" aria-label="Loading clients">
  <ListSkeleton items={3} />
</div>
```

---

**Quick Tips:**

1. Always show skeleton before data loads
2. Always show empty state when no data
3. Use optimistic updates for instant feedback
4. Debounce search inputs (300ms)
5. Cache expensive queries
6. Stagger list animations
