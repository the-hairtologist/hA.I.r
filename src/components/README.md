# Components

This directory contains React components organized by feature and purpose.

## Directory Structure

```
components/
├── ui/                    # Shadcn UI components (base components)
├── dashboard/             # Dashboard-specific components
├── reviews/               # Review system components
├── [Feature]Dialog.tsx    # Feature-specific dialogs
└── [Feature]*.tsx         # Feature components
```

## UI Components (`ui/`)

Base components from Shadcn UI, customized for the app:
- `button.tsx` - Button with multiple variants
- `dialog.tsx` - Modal dialogs with focus trap
- `card.tsx` - Card containers
- `input.tsx` - Form inputs
- `form.tsx` - Form components
- And many more...

**Usage:**
```tsx
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
```

## Layout Components

### `DashboardLayout.tsx`
Main application layout with sidebar, header, and mobile navigation.

**Features:**
- Responsive sidebar
- Mobile bottom navigation
- Keyboard shortcuts
- Role-based layout

### `AppSidebar.tsx`
Application sidebar with navigation items.

### `MobileBottomNav.tsx`
Mobile-optimized bottom navigation bar.

### `MobileHeader.tsx`
Mobile header with menu and quick actions.

## Form Components

### `FormFieldWithValidation.tsx`
Enhanced form field with built-in validation display.

### `SearchInput.tsx`
Search input with debouncing and clear button.

### `FormFieldError.tsx`
Displays form field errors with proper accessibility.

## Dialog Components

Convention: `[Feature]Dialog.tsx` for feature-specific dialogs.

Examples:
- `AddClientDialog.tsx` - Add new client
- `SaveFormulaDialog.tsx` - Save formula
- `RescheduleDialog.tsx` - Reschedule appointment
- `ReviewDialog.tsx` - Write review

## Accessibility Components

### `AccessibilityAnnouncer.tsx`
Screen reader announcements for dynamic content.

### `KeyboardShortcutHint.tsx`
Display keyboard shortcuts to users.

### `FocusTrap.tsx` (in `ui/`)
Traps focus within modals for accessibility.

## Performance Components

### `VirtualizedList.tsx`
Renders large lists efficiently using virtualization.

### `OptimizedAppointmentList.tsx`
Optimized appointment list with memoization.

### `LoadingSkeleton.tsx`
Skeleton loaders for better perceived performance.

## Error Handling

### `ErrorBoundary.tsx`
Catches and displays React errors gracefully.

### `DashboardErrorBoundary.tsx`
Specialized error boundary for dashboard.

## Empty States

### `EmptyState.tsx`
Generic empty state component.

### `HelpfulEmptyState.tsx`
Empty state with helpful suggestions.

### `AIEnhancedEmptyState.tsx`
AI-powered contextual empty states.

## Naming Conventions

1. **Components:** PascalCase (e.g., `ClientCard.tsx`)
2. **Dialogs:** `[Feature]Dialog.tsx`
3. **Cards:** `[Feature]Card.tsx`
4. **Lists:** `[Feature]List.tsx`

## Component Guidelines

1. **Single Responsibility:** Each component should do one thing well
2. **Props Interface:** Always define TypeScript interfaces for props
3. **Memoization:** Use `React.memo()` for expensive components
4. **Accessibility:** Include ARIA labels and keyboard support
5. **Documentation:** Add JSDoc comments for complex components
6. **Styling:** Use Tailwind classes and design system tokens
7. **Error Handling:** Handle errors gracefully with fallbacks

## Best Practices

```tsx
/**
 * ClientCard Component
 * 
 * Displays client information in a card format with actions.
 * 
 * @param client - Client data object
 * @param onEdit - Callback when edit is clicked
 * @param onDelete - Callback when delete is clicked
 */
export const ClientCard = memo(({ 
  client, 
  onEdit, 
  onDelete 
}: ClientCardProps) => {
  // Component logic
  return (
    // JSX
  );
});

ClientCard.displayName = "ClientCard";
```
