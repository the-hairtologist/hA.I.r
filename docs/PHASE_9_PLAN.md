# Phase 9: Design System Compliance - Execution Plan

## Overview
This document outlines the systematic replacement of custom `border-[...]` and `shadow-[...]` patterns with design system tokens across 44 files with 185 border matches and 56 files with 182 shadow matches.

## Design System Tokens

### Border Utilities
- `brutal-border` → `border-[3px] border-foreground` (standard)
- `brutal-border-subtle` → `border-[2px] border-foreground` 
- `brutal-border-bold` → `border-[4px] border-foreground`

### Shadow Utilities
- `shadow-brutal-xs` → `shadow-[1px_1px_0px_0px_hsl(var(--foreground))]`
- `shadow-brutal-sm` → `shadow-[2px_2px_0px_0px_hsl(var(--foreground))]`
- `shadow-brutal` or `shadow-brutal-md` → `shadow-[3px_3px_0px_0px_hsl(var(--foreground))]`
- `shadow-brutal-lg` → `shadow-[4px_4px_0px_0px_hsl(var(--foreground))]` or `shadow-[5px_5px_0px_0px_hsl(var(--foreground))]`
- `shadow-brutal-xl` → `shadow-[6px_6px_0px_0px_hsl(var(--foreground))]`
- `shadow-brutal-2xl` → `shadow-[8px_8px_0px_0px_hsl(var(--foreground))]`

## Replacement Strategy

### Pattern Matching Rules

1. **Standard Borders (border-[2px] or border-[3px])**
   - `border-[2px]` → `brutal-border-subtle`
   - `border-[3px]` → `brutal-border`
   - `border-[4px]` → `brutal-border-bold`

2. **Standard Shadows**
   - `shadow-[1px_1px_0px_0px_hsl(var(--foreground))]` → `shadow-brutal-xs`
   - `shadow-[2px_2px_0px_0px_hsl(var(--foreground))]` → `shadow-brutal-sm`
   - `shadow-[3px_3px_0px_0px_hsl(var(--foreground))]` → `shadow-brutal` or `shadow-brutal-md`
   - `shadow-[4px_4px_0px_0px_hsl(var(--foreground))]` → `shadow-brutal-lg`
   - `shadow-[5px_5px_0px_0px_hsl(var(--foreground))]` → `shadow-brutal-lg`
   - `shadow-[6px_6px_0px_0px_hsl(var(--foreground))]` → `shadow-brutal-xl`
   - `shadow-[8px_8px_0px_0px_hsl(var(--foreground))]` → `shadow-brutal-2xl`

3. **Colored Shadows (with specific color vars)**
   - Leave as-is if using specific color variables (e.g., `shadow-[4px_4px_0px_0px_hsl(var(--primary))]`)
   - These are intentional design variations, not design system violations

4. **Special Cases to Keep**
   - Soft shadows with opacity (e.g., `shadow-[0_8px_24px_rgba(0,0,0,0.15)]`)
   - Gradient shadows (e.g., `shadow-[0_2px_8px_rgba(251,191,36,0.3)]`)
   - Non-brutal shadows (standard drop shadows)

## File Batches

### Batch 1: Components (15 files)
- BeforeAfterPhotoFlow.tsx
- HelpButton.tsx
- ProactiveInsightsPanel.tsx
- UnifiedEmptyState.tsx
- WeeklyScheduleView.tsx
- WeeklySummaryCard.tsx
- HelpTooltip.tsx
- InteractiveCard.tsx
- OfflineIndicator.tsx
- PageHeader.tsx
- PerformanceOverlay.tsx
- ProgressSteps.tsx
- BottomSheet.tsx (shadow only)
- AppSidebar.tsx (shadow only)

### Batch 2: Admin & Dashboard (10 files)
- admin/ErrorBoundaryDebugger.tsx
- admin/SecurityHealthScore.tsx
- dashboard/EmptyStateGuidance.tsx
- dashboard/LiveKPICards.tsx
- dashboard/* (other dashboard components)

### Batch 3: Landing & Marketing (5 files)
- landing/FinalValueProp.tsx
- landing/HeroPhoneMockup.tsx
- landing/* (other landing components)

### Batch 4: Pages (10 files)
- pages/Formulas.tsx
- pages/Finance.tsx  
- pages/Portfolio.tsx
- pages/Analytics.tsx
- pages/* (other pages)

### Batch 5: Remaining Components (10+ files)
- All other component files with violations

## Execution Steps

### Step 1: Design System Enhancement ✅
- [x] Add `brutal-border` utilities to tailwind.config.ts
- [x] Add `brutal-border` utility classes to index.css
- [x] Add `shadow-brutal-*` utilities to tailwind.config.ts

### Step 2: Batch Replacements (In Progress)
- [ ] Batch 1: Core Components
- [ ] Batch 2: Admin & Dashboard
- [ ] Batch 3: Landing & Marketing
- [ ] Batch 4: Pages
- [ ] Batch 5: Remaining Components

### Step 3: Verification
- [ ] Visual regression testing
- [ ] Check all pages render correctly
- [ ] Verify no broken borders or shadows
- [ ] Confirm design system consistency

### Step 4: Documentation
- [ ] Update PHASE_9_SUMMARY.md
- [ ] Document new utilities in design system guide
- [ ] Create before/after comparison

## Testing Checklist

After each batch:
- [ ] Check components render visually correct
- [ ] Verify brutal aesthetic maintained
- [ ] Confirm no layout shifts
- [ ] Test hover/focus states
- [ ] Validate responsive behavior

## Success Criteria

- ✅ 100% of `border-[2px]`, `border-[3px]`, `border-[4px]` patterns replaced
- ✅ 100% of brutal shadow patterns replaced with tokens
- ✅ All components maintain visual consistency
- ✅ No regression in functionality
- ✅ Improved maintainability and consistency
