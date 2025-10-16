# Hair AI Design System

## 🎨 Adaptive Brutalism Philosophy

Hair AI uses **Adaptive Brutalism** - a design approach that maintains our bold, pixelated brand identity from the landing page while ensuring usability throughout the app. This system combines retro-gaming aesthetics with modern UX principles.

**Core Principles:**
- **Visual Consistency**: Bold colors, thick borders, hard shadows everywhere
- **Typography Hierarchy**: Right font for the right purpose
- **Readability First**: Never sacrifice usability for aesthetics
- **Touch-Friendly**: Minimum 44px touch targets on all interactive elements

---

## Typography System

### When to Use Each Font

#### Press Start 2P (Pixelated Headers)
**Use for:** Page titles, section headers, card titles, dialog titles, labels
```tsx
<h1 className="font-pixel text-2xl sm:text-3xl lg:text-4xl">Dashboard</h1>
<h2 className="font-pixel text-xl sm:text-2xl">Your Clients</h2>
<h3 className="font-pixel text-base sm:text-lg">Appointment Details</h3>
```

#### Bold Sans (CTAs & Buttons)
**Use for:** All buttons, navigation items, badges, action text
```tsx
<Button className="font-bold uppercase tracking-wide">
  Book Now
</Button>
```

#### DM Sans (Readable Body Text)
**Use for:** Paragraphs, descriptions, form labels, table data
```tsx
<p className="font-sans text-sm sm:text-base text-muted-foreground">
  Your appointment is confirmed for tomorrow at 3pm.
</p>
```

#### Space Grotesk (Data & Numbers)
**Use for:** Statistics, metrics, prices, dates, large numbers
```tsx
<div className="font-display text-3xl font-bold">247</div>
```

---
Use these standardized spacing values across all components:

### Component Spacing
- **Card padding**: `p-4 sm:p-5 md:p-6` (16px → 20px → 24px)
- **Card gap between elements**: `space-y-4` (16px)
- **Section gap**: `space-y-6` (24px)
- **Grid gaps**: `gap-3 sm:gap-4` (12px → 16px)

### Text Spacing
- **Heading margin bottom**: `mb-2` (8px) for subtitles, `mb-4` (16px) for sections
- **Paragraph margin bottom**: `mb-3` (12px)
- **List item spacing**: `space-y-2` (8px) for compact, `space-y-3` (12px) for comfortable

### Icon + Text Gaps
- **Icon with text**: `gap-2` (8px)
- **Button icon**: `gap-1.5` (6px)
- **Flex items**: `gap-3` (12px)

## Typography Scale

### Responsive Text Sizing
```tsx
// Headings
- Hero: "text-2xl sm:text-3xl lg:text-4xl"
- H1: "text-xl sm:text-2xl lg:text-3xl"
- H2: "text-lg sm:text-xl lg:text-2xl"
- H3: "text-base sm:text-lg"

// Body
- Large body: "text-sm sm:text-base"
- Normal body: "text-xs sm:text-sm"
- Small text: "text-[11px] sm:text-xs"
- Tiny text: "text-[10px]"
```

### Font Weights
- **Headings**: `font-bold` or `font-black` for hero
- **Subheadings**: `font-semibold`
- **Body**: `font-medium` for emphasis, `font-normal` for regular
- **Muted**: `font-normal` or `font-light`

## Component Sizing

### Cards
```tsx
// Standard card
<Card className="p-4 sm:p-5 md:p-6">

// Compact card (dashboard widgets)
<Card className="p-3 sm:p-4">

// Large card (forms, modals)
<Card className="p-6 sm:p-8">
```

### Buttons
```tsx
// Size variants
- xs: "h-7 px-2 text-[11px]"
- sm: "h-8 px-3 text-xs"
- default: "h-9 px-4 text-sm"
- lg: "h-10 px-6 text-base"
```

### Icons
```tsx
// Icon sizes
- Tiny: "h-3 w-3"
- Small: "h-4 w-4"
- Default: "h-5 w-5"
- Large: "h-6 w-6"
- XL: "h-8 w-8"
```

### Containers
```tsx
// Max widths
- Narrow: "max-w-sm" (384px)
- Medium: "max-w-md" (448px)
- Standard: "max-w-lg" (512px)
- Wide: "max-w-2xl" (672px)
- Full dashboard: "max-w-7xl" (1280px)

// Heights
- Compact scroll: "max-h-[300px]"
- Medium scroll: "max-h-[400px]"
- Tall scroll: "max-h-[500px]"
```

## Mobile-First Breakpoints

### Screen Sizes
- **Mobile**: 0-640px (sm)
- **Tablet**: 641-1024px (md/lg)
- **Desktop**: 1025px+ (xl/2xl)

### Touch Targets (Mobile)
- **Minimum**: 44px x 44px (11 units / h-11 w-11)
- **Comfortable**: 48px x 48px (12 units / h-12 w-12)
- **Button height**: minimum `h-9` (36px) with padding

### Mobile Adjustments
```tsx
// Grid columns responsive
"grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"

// Padding responsive
"p-3 sm:p-4 lg:p-6"

// Text responsive
"text-xs sm:text-sm lg:text-base"

// Gap responsive
"gap-2 sm:gap-3 lg:gap-4"
```

## Layout Patterns

### Dashboard Grid
```tsx
<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
  {/* Cards */}
</div>
```

### Stats Grid
```tsx
<div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
  {/* Stat cards */}
</div>
```

### Form Layout
```tsx
<div className="space-y-4 sm:space-y-6">
  {/* Form fields */}
</div>
```

## Animation Standards

### Timing
- **Fast**: 150ms (hover states)
- **Normal**: 300ms (transitions)
- **Slow**: 500ms (page transitions)

### Easing
- **UI**: `ease-in-out`
- **Entrances**: `ease-out`
- **Exits**: `ease-in`

## Common Patterns

### Card with Icon Header
```tsx
<Card className="p-4 sm:p-5">
  <CardHeader className="p-0 mb-4">
    <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
      <div className="p-2 rounded-lg bg-primary/10">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      Title
    </CardTitle>
  </CardHeader>
  <CardContent className="p-0 space-y-3">
    {/* Content */}
  </CardContent>
</Card>
```

### Empty State
```tsx
<div className="p-6 sm:p-8 text-center">
  <div className="mb-3 sm:mb-4">
    <Icon className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-muted-foreground" />
  </div>
  <h3 className="text-base sm:text-lg font-semibold mb-2">Title</h3>
  <p className="text-xs sm:text-sm text-muted-foreground mb-4">Description</p>
  <Button size="sm">Action</Button>
</div>
```

### List Item
```tsx
<div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
  <Icon className="h-5 w-5 text-muted-foreground" />
  <div className="flex-1 min-w-0">
    <p className="text-sm font-medium truncate">Title</p>
    <p className="text-xs text-muted-foreground">Subtitle</p>
  </div>
  <Button size="sm" variant="ghost">Action</Button>
</div>
```

## Accessibility

### Color Contrast
- Minimum: 4.5:1 for normal text
- Large text: 3:1
- UI components: 3:1
- **Target**: WCAG AAA (7:1) for critical text

### Focus States
- All interactive elements must have visible focus rings
- Use `focus-visible:ring-4 focus-visible:ring-primary focus-visible:ring-offset-2`

### Touch Targets
- Minimum 44x44px for mobile (iOS standard)
- Comfortable: 48x48px
- Adequate spacing between clickable elements (min 8px gap)

### Motion Preferences
- Respect `prefers-reduced-motion`
- Provide alternatives to animations
- No auto-playing animations

---

## Helper Components

### BrutalCard
Pre-built card with brutalist styling:
```tsx
import { BrutalCard } from "@/components/adaptive-brutalism";

<BrutalCard hover gradient>
  {/* Content */}
</BrutalCard>
```

### BrutalHeader
Pixelated headers with responsive sizing:
```tsx
import { BrutalHeader } from "@/components/adaptive-brutalism";

<BrutalHeader size="lg" as="h1">Page Title</BrutalHeader>
```

### BrutalText
Readable body text:
```tsx
import { BrutalText } from "@/components/adaptive-brutalism";

<BrutalText size="normal" muted>
  Your description here
</BrutalText>
```

---

## Implementation Checklist

Before committing new UI components:

- [ ] Page titles use Press Start 2P (`font-pixel`)
- [ ] Buttons have bold, uppercase text with tracking
- [ ] Body text uses DM Sans (`font-sans`)
- [ ] Cards have 3px borders and brutalist shadows
- [ ] Gradient backgrounds use design system tokens
- [ ] All interactive elements ≥ 44px touch target
- [ ] Focus states are visible
- [ ] Text contrast meets WCAG AAA
- [ ] No hardcoded colors outside design system

---

## Quick Reference

### Import Utilities
```tsx
import { typography, brutalist, spacing } from "@/lib/brutalismUtils";
```

### Common Patterns
```tsx
// Stat card
<div className={brutalist.card}>
  <div className={typography.stat}>247</div>
  <p className={typography.statLabel}>Bookings</p>
</div>

// Action button
<button className={cn(brutalist.buttonFull, typography.cta)}>
  Get Started
</button>
```

---

**For complete guidelines, see:** `ADAPTIVE_BRUTALISM.md`
**Design System Version:** 2.0.0 (Adaptive Brutalism)

