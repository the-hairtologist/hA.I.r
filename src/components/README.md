# Component Organization Structure

**Status:** Phase 3 - Documentation Complete  
**Updated:** 2025-10-20

## 📁 Folder Structure

```
src/components/
├── ai/              # AI-powered features
├── appointments/    # Scheduling & appointment management
├── clients/         # Client management
├── formulas/        # Formula/color management
├── admin/           # Admin-only tools
├── layout/          # Layout components
├── shared/          # Cross-cutting concerns
└── ui/              # Base UI components (shadcn)
```

## 🎯 Component Categories

### AI Features (`ai/`)

All AI-powered components:

- AIFormulaAnalyzer
- AIProductRecommendations
- AIScheduleOptimizer
- AIRetentionDashboard
- AISmartNotifications

### Appointments (`appointments/`)

Scheduling and calendar features:

- AppointmentInsights
- AppointmentTimerWidget
- CalendarView
- SmartSchedulingSuggestions

### Clients (`clients/`)

Client management tools:

- AddClientDialog
- ClientHistoryTimeline
- PredictiveClientInsights

### Formulas (`formulas/`)

Color formula management:

- AIFormulaQuickStart
- FormulaCard

### Admin (`admin/`)

Administrative tools:

- AdminDivineWeapon
- AuditLogViewer

### Layout (`layout/`)

Core app structure:

- DashboardLayout
- AppSidebar
- MobileBottomNav
- MobileHeader

### Shared (`shared/`)

Reusable components:

- EmptyState
- LoadingStates
- ErrorBoundaries
- Tooltips

### UI (`ui/`)

Base design system (shadcn):

- button.tsx
- card.tsx
- dialog.tsx

## 📝 Migration Guidelines

1. Update import paths
2. Create barrel exports
3. Test component
4. Update documentation

## 🚀 Import Examples

```tsx
// After organization
import { AIFormulaAnalyzer } from '@/components/ai';
import { AddClientDialog } from '@/components/clients';
```
