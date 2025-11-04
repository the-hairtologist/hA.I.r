# Typography Guide

## Overview
This guide documents the consistent typography system used across the hA.I.r application. All typography follows mobile-first responsive design principles.

## Font Families

### font-pixel (Press Start 2P)
**Usage**: Page titles, section headers, primary branding elements
**Characteristics**: Retro pixel font for distinctive branding
**When to use**:
- Main page titles (Dashboard, Formulas, Portfolio)
- Section headers within pages
- Card titles for major features
- Stat labels when appropriate

### font-display (Space Grotesk)
**Usage**: Display numbers, stats, headings, emphasis
**Characteristics**: Modern sans-serif with geometric feel
**When to use**:
- Numerical stats and KPIs
- Revenue numbers and metrics
- Hierarchical headings (H1-H4)
- Data visualization labels

### font-sans (DM Sans)
**Usage**: Body text, descriptions, buttons, labels
**Characteristics**: Highly readable sans-serif for UI elements
**When to use**:
- All body copy and paragraphs
- Form labels and inputs
- Button text
- Helper text and descriptions
- UI element labels

---

## Typography Scales

### Page Titles
```tsx
import { typography } from '@/lib/design/typography';

// Page-level titles
<h1 className={typography.title.page}>
  Client Formulas
</h1>

// Section titles  
<h2 className={typography.title.section}>
  Weekly Overview
</h2>

// Card titles
<h3 className={typography.title.card}>
  Quick Actions
</h3>
```

**Responsive Sizes**:
- `title.page`: text-xl → sm:text-2xl → lg:text-3xl
- `title.section`: text-base → sm:text-lg → lg:text-xl
- `title.card`: text-sm → sm:text-base

---

## Related Documentation

- See `FORM_PATTERNS.md` for form-specific typography
- See `TOAST_MESSAGING_GUIDE.md` for notification text
- See `src/lib/design/typography.ts` for implementation details
