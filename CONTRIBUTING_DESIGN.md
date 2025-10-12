# Design Contribution Guidelines

When adding new components or modifying existing ones, follow these standards to maintain visual consistency across the Hair AI app.

## Quick Reference

### Standard Component Structure
```tsx
<Card className="p-4 sm:p-5 md:p-6">
  <CardHeader className="p-0 mb-4">
    <CardTitle className="text-lg sm:text-xl font-display flex items-center gap-2">
      <Icon className="h-5 w-5" />
      Title
    </CardTitle>
  </CardHeader>
  <CardContent className="p-0 space-y-4">
    {/* Content */}
  </CardContent>
</Card>
```

### Standard Spacing
- **Between sections**: `space-y-6` (24px)
- **Between cards**: `gap-3 sm:gap-4` (12-16px)
- **Card padding**: `p-4 sm:p-5 md:p-6` (16-24px)
- **Within elements**: `gap-2` or `gap-3` (8-12px)

### Standard Text Sizing
- **Headings**: `text-lg sm:text-xl lg:text-2xl`
- **Body**: `text-xs sm:text-sm`
- **Small text**: `text-[11px] sm:text-xs`

### Standard Grids
```tsx
// 2-column to 4-column
<div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">

// 1-column to 2-column
<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
```

## Component Checklist

When creating a new component, ensure:

- [ ] Uses responsive padding: `p-{size} sm:p-{size+1} md:p-{size+2}`
- [ ] Uses consistent gaps: `gap-3 sm:gap-4` for grids, `space-y-4` for stacks
- [ ] Text is responsive: `text-xs sm:text-sm` or `text-sm sm:text-base`
- [ ] Icons are sized appropriately: `h-4 w-4` or `h-5 w-5`
- [ ] Touch targets are minimum 44px (`h-11` or `h-12`)
- [ ] Uses design system colors (not hardcoded colors)
- [ ] Includes hover states for interactive elements
- [ ] Works on mobile (320px+), tablet (641px+), and desktop (1025px+)

## Dashboard Widget Template

```tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icon } from "lucide-react";

interface WidgetProps {
  // Props here
}

export const Widget = ({ ...props }: WidgetProps) => {
  return (
    <Card className="p-4 sm:p-5 md:p-6 animate-fade-in">
      <CardHeader className="p-0 mb-4">
        <CardTitle className="text-lg sm:text-xl font-display flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          Widget Title
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 space-y-4">
        {/* Your content here */}
      </CardContent>
    </Card>
  );
};
```

## Common Patterns

### Icon + Text Button
```tsx
<Button className="gap-2">
  <Icon className="h-4 w-4" />
  <span>Action</span>
</Button>
```

### Stat Card
```tsx
<div className="p-4 rounded-lg border-2 border-border bg-card">
  <div className="flex items-center gap-2 mb-2">
    <Icon className="h-5 w-5 text-primary" />
    <p className="text-xs sm:text-sm text-muted-foreground">Label</p>
  </div>
  <p className="text-2xl sm:text-3xl font-bold">Value</p>
</div>
```

### List Item (clickable)
```tsx
<div className="flex items-center gap-3 p-3 sm:p-4 rounded-lg border brutal-border hover:bg-muted/50 cursor-pointer transition-colors">
  <div className="p-2 rounded-lg bg-primary/10 shrink-0">
    <Icon className="h-4 w-4 text-primary" />
  </div>
  <div className="flex-1 min-w-0">
    <p className="text-sm sm:text-base font-semibold truncate">Title</p>
    <p className="text-xs sm:text-sm text-muted-foreground truncate">Subtitle</p>
  </div>
</div>
```

## Mobile-First Development

Always start with mobile and scale up:

```tsx
// ❌ Wrong - desktop first
<div className="p-6 sm:p-4">

// ✅ Correct - mobile first
<div className="p-4 sm:p-6">

// ❌ Wrong - large text on mobile
<h1 className="text-3xl sm:text-2xl">

// ✅ Correct - scales up
<h1 className="text-xl sm:text-2xl lg:text-3xl">
```

## Testing Requirements

Before submitting:

1. **Test on Mobile** (375px width minimum)
   - Text is readable
   - Buttons are tappable (44px+)
   - No horizontal scroll
   - All content fits

2. **Test on Tablet** (768px)
   - Layout adjusts appropriately
   - Grid columns increase
   - Spacing feels comfortable

3. **Test on Desktop** (1440px)
   - Content doesn't stretch too wide
   - Max-widths are respected
   - Visual hierarchy is clear

## Color Usage

Never hardcode colors - use design system tokens:

```tsx
// ❌ Wrong
<div className="bg-blue-500 text-white">

// ✅ Correct
<div className="bg-primary text-primary-foreground">

// ❌ Wrong
<div className="border-gray-200">

// ✅ Correct
<div className="border-border">
```

## Animation Standards

```tsx
// Standard fade in
<div className="animate-fade-in">

// With delay
<div 
  className="animate-fade-in"
  style={{ animationDelay: `${index * 50}ms` }}
>

// Hover transitions
<div className="transition-all hover:scale-105 hover:shadow-lg">
```

## Accessibility

- All images have alt text
- All buttons have aria-labels if icon-only
- Color contrast meets WCAG AA (4.5:1)
- Focus states are visible
- Touch targets are 44px minimum

## Questions?

Refer to `DESIGN_SYSTEM.md` for detailed specifications or ask the team lead.
