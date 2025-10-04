# Breakpoints & Responsive Design Specification

## Breakpoint System

### Viewport Ranges

| Name | Min Width | Max Width | Target Devices | Priority |
|------|-----------|-----------|----------------|----------|
| **Mobile Small** | 0 | 374px | iPhone SE, small Android | P1 |
| **Mobile Medium** | 375px | 479px | iPhone 12/13/14, standard Android | P0 |
| **Mobile Large** | 480px | 767px | iPhone Plus, large Android | P1 |
| **Tablet** | 768px | 1023px | iPad, Android tablets | P0 |
| **Desktop Small** | 1024px | 1279px | Small laptops | P1 |
| **Desktop Medium** | 1280px | 1439px | Standard desktop | P0 |
| **Desktop Large** | 1440px | 1919px | Large desktop | P1 |
| **Desktop XL** | 1920px+ | ∞ | Ultra-wide | P2 |

### Tailwind Breakpoints (Current)

```css
sm: 640px   /* Tablet and above */
md: 768px   /* Tablet and above */
lg: 1024px  /* Desktop and above */
xl: 1280px  /* Large desktop */
2xl: 1536px /* Extra large */
```

---

## Typography Scale by Viewport

### Mobile (< 768px)

| Element | Size | Line Height | Weight | Letter Spacing |
|---------|------|-------------|--------|----------------|
| H1 (Page Title) | 24px (1.5rem) | 1.2 (29px) | Bold (700) | -0.02em |
| H2 (Section) | 20px (1.25rem) | 1.3 (26px) | Bold (700) | -0.01em |
| H3 (Card Title) | 18px (1.125rem) | 1.4 (25px) | SemiBold (600) | 0 |
| Body Large | 16px (1rem) | 1.5 (24px) | Regular (400) | 0 |
| Body | 14px (0.875rem) | 1.5 (21px) | Regular (400) | 0 |
| Body Small | 12px (0.75rem) | 1.4 (17px) | Regular (400) | 0.01em |
| Caption | 11px (0.688rem) | 1.3 (14px) | Regular (400) | 0.02em |
| Button | 14px (0.875rem) | 1 (14px) | SemiBold (600) | 0.01em |

### Tablet (768px - 1023px)

| Element | Size | Line Height | Weight | Letter Spacing |
|---------|------|-------------|--------|----------------|
| H1 | 32px (2rem) | 1.2 (38px) | Bold (700) | -0.02em |
| H2 | 24px (1.5rem) | 1.3 (31px) | Bold (700) | -0.01em |
| H3 | 20px (1.25rem) | 1.4 (28px) | SemiBold (600) | 0 |
| Body Large | 18px (1.125rem) | 1.5 (27px) | Regular (400) | 0 |
| Body | 16px (1rem) | 1.5 (24px) | Regular (400) | 0 |
| Body Small | 14px (0.875rem) | 1.4 (20px) | Regular (400) | 0.01em |
| Caption | 12px (0.75rem) | 1.3 (16px) | Regular (400) | 0.02em |
| Button | 16px (1rem) | 1 (16px) | SemiBold (600) | 0.01em |

### Desktop (1024px+)

| Element | Size | Line Height | Weight | Letter Spacing |
|---------|------|-------------|--------|----------------|
| H1 | 40px (2.5rem) | 1.2 (48px) | Bold (700) | -0.02em |
| H2 | 32px (2rem) | 1.3 (42px) | Bold (700) | -0.01em |
| H3 | 24px (1.5rem) | 1.4 (34px) | SemiBold (600) | 0 |
| Body Large | 18px (1.125rem) | 1.6 (29px) | Regular (400) | 0 |
| Body | 16px (1rem) | 1.6 (26px) | Regular (400) | 0 |
| Body Small | 14px (0.875rem) | 1.5 (21px) | Regular (400) | 0.01em |
| Caption | 12px (0.75rem) | 1.4 (17px) | Regular (400) | 0.02em |
| Button | 16px (1rem) | 1 (16px) | SemiBold (600) | 0 |

---

## Spacing System

### Container Padding

| Viewport | Padding (Left/Right) | Max Width |
|----------|---------------------|-----------|
| Mobile (< 640px) | 16px (1rem) | 100% |
| Tablet (640px - 1023px) | 24px (1.5rem) | 100% |
| Desktop (1024px - 1279px) | 32px (2rem) | 1024px |
| Desktop (1280px+) | 40px (2.5rem) | 1280px |

### Vertical Spacing

| Size | Mobile | Tablet | Desktop | Usage |
|------|--------|--------|---------|-------|
| XXS | 4px | 4px | 4px | Icon gaps, tight spacing |
| XS | 8px | 8px | 12px | Form field gaps |
| SM | 12px | 16px | 16px | Card padding (small) |
| MD | 16px | 24px | 24px | Card padding |
| LG | 24px | 32px | 40px | Section spacing |
| XL | 32px | 48px | 64px | Page sections |
| XXL | 48px | 64px | 96px | Hero sections |

---

## Button Sizing

### Button Height & Width

| Size | Mobile Height | Desktop Height | Min Width | Padding (X) | Icon Size |
|------|---------------|----------------|-----------|-------------|-----------|
| **Small** | 36px | 36px | 80px | 12px | 16px |
| **Default** | 44px | 40px | 100px | 16px | 20px |
| **Large** | 48px | 44px | 120px | 24px | 24px |
| **XL** | 52px | 48px | 140px | 32px | 24px |
| **Icon Only (sm)** | 36px | 36px | 36px | 0 | 16px |
| **Icon Only** | 44px | 40px | 44px | 0 | 20px |
| **Icon Only (lg)** | 48px | 44px | 48px | 0 | 24px |

### Button Spacing

- **Minimum spacing between buttons**: 8px (gap-2)
- **Minimum spacing in button groups**: 4px (gap-1)
- **Full-width buttons**: Add `w-full` on mobile, constrain on desktop

### Button Variants

| Variant | Background | Text | Border | Shadow | Usage |
|---------|------------|------|--------|--------|-------|
| **Primary** | `bg-primary` | `text-primary-foreground` | 2px `border-foreground` | 3px offset | Main CTA |
| **Secondary** | `bg-secondary` | `text-secondary-foreground` | 2px `border-foreground` | 3px offset | Supporting actions |
| **Outline** | `bg-background` | `text-foreground` | 2px `border-foreground` | 3px offset | Tertiary actions |
| **Ghost** | Transparent | `text-foreground` | None | None | Subtle actions |
| **Destructive** | `bg-destructive` | `text-destructive-foreground` | 2px `border-foreground` | 3px offset | Delete/cancel |

---

## Tap Target Specifications

### Minimum Touch Targets

| Platform | Minimum Size | Recommended Size | Spacing |
|----------|--------------|------------------|---------|
| **iOS** | 44×44 pt | 48×48 pt | 8pt |
| **Android** | 48×48 dp | 48×48 dp | 8dp |
| **Web** | 44×44 px | 48×48 px | 8px |

### Current Implementation Status

| Component | Current | Required | Status | Fix |
|-----------|---------|----------|--------|-----|
| Primary Buttons | 44×44px ✅ | 44×44px | ✅ Pass | None |
| Mobile Nav Icons | ~40×40px | 44×44px | ❌ Fail | Add padding |
| Calendar Dates | 36×36px | 44×44px | ❌ Fail | Increase size |
| Icon Buttons | 40×40px | 44×44px | ❌ Fail | Use size="icon" |
| Dropdown Items | Full width × 40px | Full × 44px | ❌ Fail | Increase height |
| Checkbox/Radio | 20×20px | 24×24px + padding | ❌ Fail | Wrap in 44px container |

### Tap Target Corrections Needed

```typescript
// Current (MobileNav.tsx)
<Icon className="h-5 w-5" /> // 20px icon in ~40px container

// Fix: Add padding to meet 44px minimum
<div className="flex items-center justify-center min-h-[44px] min-w-[44px]">
  <Icon className="h-5 w-5" />
</div>

// Current (Button icon variant)
size: {
  icon: "h-10 w-10" // 40px
}

// Fix: Increase to 44px minimum
size: {
  icon: "h-11 w-11 min-h-[44px] min-w-[44px]" // 44px
}
```

---

## Component Sizing by Viewport

### Cards

| Viewport | Padding | Border | Radius | Shadow |
|----------|---------|--------|--------|--------|
| Mobile | 12px | 2px | 8px | 2px offset |
| Tablet | 16px | 2px | 8px | 3px offset |
| Desktop | 20px | 3px | 12px | 4px offset |

### Dialogs/Modals

| Viewport | Width | Max Height | Padding |
|----------|-------|------------|---------|
| Mobile | calc(100vw - 32px) | 90vh | 16px |
| Tablet | 600px | 80vh | 24px |
| Desktop | 800px | 80vh | 32px |

### Forms

| Element | Mobile Height | Desktop Height | Spacing |
|---------|---------------|----------------|---------|
| Input | 44px | 40px | 12px between fields |
| Textarea | 120px min | 120px min | 16px below |
| Label | - | - | 8px above input |
| Helper Text | - | - | 4px below input |
| Error Message | - | - | 4px below input |

---

## Navigation Components

### Desktop Sidebar (AppSidebar)

| State | Width | Transition | Content |
|-------|-------|------------|---------|
| Expanded | 240px (15rem) | 300ms ease | Icon + text |
| Collapsed | 56px (3.5rem) | 300ms ease | Icon only |
| Mobile | Hidden | - | Use MobileNav instead |

### Mobile Bottom Nav (MobileNav)

| Property | Value | Notes |
|----------|-------|-------|
| Height | 64px | Fixed |
| Position | Fixed bottom | z-index: 50 |
| Background | `bg-card` | With backdrop blur |
| Border | 2px top | `border-border` |
| Item Width | 1fr (equal) | 5 items = 20% each |
| Item Height | 64px | Full height |
| Icon Size | 20px | 5 w-5 h-5 |
| Label Size | 12px | text-xs |

**Critical**: Add `pb-16` (64px) to main content on mobile to prevent content being hidden behind nav.

---

## Grid Systems

### Dashboard Grid

| Viewport | Columns | Gap | Item Min Width |
|----------|---------|-----|----------------|
| Mobile | 1 | 16px | 100% |
| Tablet | 2 | 24px | 300px |
| Desktop | 3 | 24px | 350px |
| Desktop XL | 4 | 32px | 300px |

### Appointment Calendar

| Viewport | Layout | Cell Size | Gap |
|----------|--------|-----------|-----|
| Mobile | 1 week, vertical | Full width | 8px |
| Tablet | 1 week, grid | ~100px | 12px |
| Desktop | 1 month, grid | ~140px | 16px |

---

## Layout Patterns

### Page Header

| Viewport | Height | Layout | Content |
|----------|--------|--------|---------|
| Mobile | Auto | Vertical stack | Title above actions |
| Tablet | 72px | Horizontal | Title left, actions right |
| Desktop | 80px | Horizontal | Title left, actions right |

### Content Area

| Viewport | Max Width | Padding | Margin |
|----------|-----------|---------|--------|
| Mobile | 100% | 16px | 0 |
| Tablet | 100% | 24px | 0 |
| Desktop | 1280px | 32px | Auto (centered) |

---

## Image Sizing

### Avatar Sizes

| Size | Dimensions | Usage |
|------|------------|-------|
| XS | 24×24px | Inline mentions |
| SM | 32×32px | Message sender |
| MD | 40×40px | Profile icon |
| LG | 64×64px | Profile header |
| XL | 128×128px | Profile page |

### Portfolio Images

| Viewport | Width | Height | Aspect Ratio |
|----------|-------|--------|--------------|
| Mobile | 100% | Auto | 4:3 |
| Tablet | 50% (2 col) | Auto | 4:3 |
| Desktop | 33.33% (3 col) | Auto | 4:3 |

---

## Animation & Transition Durations

| Element | Duration | Easing | Reduced Motion |
|---------|----------|--------|----------------|
| Button hover | 150ms | ease-out | Instant |
| Modal open/close | 200ms | ease-in-out | Instant |
| Page transition | 300ms | ease-in-out | Instant |
| Toast appear | 250ms | ease-out | Instant |
| Skeleton pulse | 2s | ease-in-out | Disable |
| Loading spinner | 1s | linear | Disable |

---

## Safe Areas (iOS)

### Notch/Island Handling

```css
/* Top safe area (status bar, notch, Dynamic Island) */
padding-top: max(16px, env(safe-area-inset-top));

/* Bottom safe area (home indicator) */
padding-bottom: max(16px, env(safe-area-inset-bottom));

/* Sides (landscape notch) */
padding-left: env(safe-area-inset-left);
padding-right: env(safe-area-inset-right);
```

### Status Bar Colors

| Theme | Status Bar | Navigation Bar |
|-------|------------|----------------|
| Light | Dark text on light bg | Light bg |
| Dark | Light text on dark bg | Dark bg |

---

## Testing Matrix

### Test Each Breakpoint

- [ ] 360×800 (Small Android)
- [ ] 375×812 (iPhone 12/13 Pro)
- [ ] 390×844 (iPhone 14 Pro)
- [ ] 414×896 (iPhone 14 Plus)
- [ ] 768×1024 (iPad)
- [ ] 834×1194 (iPad Pro 11")
- [ ] 1280×800 (Small laptop)
- [ ] 1440×900 (Standard desktop)
- [ ] 1920×1080 (Full HD)

### Test Orientations

- [ ] Portrait (mobile/tablet)
- [ ] Landscape (mobile/tablet)
- [ ] Landscape laptop (keyboard/trackpad)

### Test Zoom Levels

- [ ] 100% (default)
- [ ] 150% (browser zoom)
- [ ] 200% (WCAG AA requirement)

---

## Implementation Checklist

### Current State

- ✅ Tailwind breakpoints configured
- ✅ Some responsive classes used
- ✅ Mobile navigation component exists
- ❌ Inconsistent spacing across viewports
- ❌ Tap targets too small in many places
- ❌ Typography doesn't scale properly
- ❌ Safe areas not handled

### Priority Fixes

1. **P0**: Fix tap target sizes (< 1 day)
2. **P0**: Add mobile bottom padding (< 1 hour)
3. **P0**: Fix button sizing variants (< 1 day)
4. **P1**: Implement consistent spacing scale (2 days)
5. **P1**: Add responsive typography (2 days)
6. **P1**: Test all breakpoints (1 day)
7. **P2**: Add safe area support (1 day)
8. **P2**: Optimize grid layouts (2 days)

---

## Resources

- **Design tokens**: `src/index.css` (CSS variables)
- **Button styles**: `src/lib/buttonStyles.ts`
- **Button component**: `src/components/ui/button.tsx`
- **Tailwind config**: `tailwind.config.ts`
- **Mobile nav**: `src/components/MobileNav.tsx`

---

**Version**: 1.0  
**Last Updated**: 2025-01-04  
**Owner**: Design + Frontend Team
