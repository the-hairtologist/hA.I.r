# Mobile UI Standards - hA.I.r App

## 🎯 Core Principles
1. **Touch-First Design**: All interactive elements must be easily tappable
2. **Readable Text**: No text smaller than 14px (text-sm)
3. **Visible Icons**: All icons minimum 24px (h-6 w-6)
4. **Consistent Spacing**: Use standard gap sizes (gap-2, gap-3, gap-4)
5. **No Overlaps**: z-index hierarchy must be clear

## 📏 Size Standards

### Icons
- **Minimum**: `h-6 w-6` (24px) - for inline icons
- **Standard**: `h-7 w-7` (28px) - for buttons and features
- **Large**: `h-8 w-8` (32px) - for primary actions
- **Hero**: `h-10 w-10` or larger - for landing/showcase

### Text
- **Minimum**: `text-sm` (14px) - for labels and descriptions
- **Standard**: `text-base` (16px) - for body text
- **Headings**: `text-lg` (18px) and up

### Touch Targets
- **Minimum**: `44x44px` - WCAG accessibility standard
- **Buttons**: `min-w-[44px] min-h-[44px]`
- **Icon buttons**: Always include `touch-manipulation` class

### Spacing
- **Compact**: `gap-2` (8px)
- **Standard**: `gap-3` (12px) or `gap-4` (16px)
- **Generous**: `gap-6` (24px) for sections

## 🎨 Component Standards

### Buttons
```tsx
<Button 
  className="min-w-[44px] min-h-[44px] touch-manipulation"
>
  <Icon className="h-7 w-7" />
  <span className="text-base">Label</span>
</Button>
```

### Cards
```tsx
<Card className="p-4 gap-3">
  <Icon className="h-8 w-8" />
  <h3 className="text-lg font-semibold">Title</h3>
  <p className="text-sm text-muted-foreground">Description</p>
</Card>
```

### Dialogs
```tsx
<DialogContent className="z-[60]">
  <Icon className="h-10 w-10" />
  <DialogTitle className="text-xl">Title</DialogTitle>
  <DialogDescription className="text-base">Description</DialogDescription>
</DialogContent>
```

## 🔢 Z-Index Hierarchy
- **Base content**: `z-0` to `z-10`
- **Headers/Navigation**: `z-40`
- **Dropdowns/Popovers**: `z-50`
- **Dialogs/Modals**: `z-[60]`
- **Toasts/Alerts**: `z-[100]`

## ✅ Checklist for Every Component
- [ ] All icons are h-6 w-6 or larger
- [ ] All text is text-sm or larger
- [ ] All buttons have min 44x44px touch target
- [ ] All interactive elements have touch-manipulation class
- [ ] Spacing is consistent using gap utilities
- [ ] z-index is appropriate for component type
- [ ] Component is tested on mobile viewport (375px width)
