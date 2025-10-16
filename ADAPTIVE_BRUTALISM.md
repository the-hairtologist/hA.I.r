# Adaptive Brutalism Design System
## Hair AI Master Theme

**Version:** 2.0.0  
**Date:** 2025-10-16

---

## Philosophy

**Adaptive Brutalism** maintains the bold, confident, pixelated brand identity from the landing page while ensuring usability and readability throughout the application. This approach blends the retro-gaming aesthetic with modern UX principles.

---

## Core Visual Language (Apply Everywhere)

### 1. Brutalist Borders
```css
/* Always use these border widths */
--brutal-border-standard: 3px;
--brutal-border-bold: 4px;

/* Component usage */
.brutal-border {
  border-width: 3px;
  border-color: hsl(var(--foreground));
}
```

### 2. Hard Box Shadows
```css
/* Brutalist shadow system */
--brutal-shadow-sm: 2px 2px 0px 0px hsl(var(--foreground));
--brutal-shadow-md: 3px 3px 0px 0px hsl(var(--foreground));
--brutal-shadow-lg: 5px 5px 0px 0px hsl(var(--foreground));
--brutal-shadow-xl: 8px 8px 0px 0px hsl(var(--foreground));
```

### 3. Bold Color Palette
```css
/* LEGO-inspired pixelated colors */
--primary: 8 100% 55%;      /* Vibrant red/orange */
--secondary: 45 100% 50%;    /* Bold yellow */
--accent: 215 100% 50%;      /* Bright blue */
```

### 4. High Contrast
- Minimum contrast ratio: 4.5:1 for body text
- All interactive elements must pass WCAG AAA

---

## Typography Hierarchy (Adaptive)

### Headers & Titles: Press Start 2P
**When to use:** Page titles, section headers, card titles, dialog titles

```tsx
// Page Header
<h1 className="font-pixel text-2xl sm:text-3xl lg:text-4xl">Dashboard</h1>

// Section Header
<h2 className="font-pixel text-xl sm:text-2xl">Your Clients</h2>

// Card Title
<h3 className="font-pixel text-base sm:text-lg">Appointment #123</h3>
```

**Guidelines:**
- Always use Press Start 2P for anything that represents a "label" or "title"
- Keep text short (Press Start 2P is hard to read in long passages)
- Use uppercase sparingly - the font is already bold

### Buttons & CTAs: Bold Sans
**When to use:** All interactive buttons, navigation items, badges

```tsx
// Primary CTA
<Button className="font-bold uppercase tracking-wide">
  Book Appointment
</Button>

// Secondary Action
<Button variant="outline" className="font-bold uppercase tracking-wide">
  View Details
</Button>
```

**Guidelines:**
- Use DM Sans or Space Grotesk with `font-bold`
- Always uppercase for primary CTAs
- Add `tracking-wide` for better readability

### Body Text: DM Sans
**When to use:** Paragraphs, descriptions, form labels, table data

```tsx
// Paragraph
<p className="font-sans text-sm sm:text-base text-muted-foreground">
  Your appointment is scheduled for tomorrow at 3pm.
</p>

// Form Label
<label className="font-sans text-sm font-medium">
  Client Name
</label>
```

**Guidelines:**
- Use regular weight (400) for body text
- Use medium weight (500) for emphasis
- Use semibold (600) for form labels

### Data & Numbers: Space Grotesk
**When to use:** Statistics, metrics, prices, dates

```tsx
// Stat Card
<div className="font-display text-3xl font-bold">
  247
</div>
<p className="font-sans text-xs text-muted-foreground">
  Total Bookings
</p>
```

---

## Component Patterns

### Brutalist Card
```tsx
<Card className="border-[3px] border-foreground shadow-[5px_5px_0px_0px_hsl(var(--foreground))] bg-gradient-to-br from-primary/5 to-secondary/5">
  <CardHeader>
    <CardTitle className="font-pixel text-base sm:text-lg">
      Card Title
    </CardTitle>
  </CardHeader>
  <CardContent className="space-y-3">
    <p className="font-sans text-sm text-muted-foreground">
      Body text goes here with readable font.
    </p>
  </CardContent>
</Card>
```

### Brutalist Button
```tsx
<Button 
  variant="default"
  className="border-[3px] border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_hsl(var(--foreground))] font-bold uppercase tracking-wide"
>
  Take Action
</Button>
```

### Empty State
```tsx
<Card className="border-[3px] border-foreground shadow-[5px_5px_0px_0px_hsl(var(--foreground))] bg-gradient-to-br from-primary/5 to-secondary/5">
  <CardContent className="py-12 text-center">
    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary">
      <Icon className="h-8 w-8 text-primary" />
    </div>
    <h3 className="font-pixel text-lg mb-2">No Data Yet</h3>
    <p className="font-sans text-sm text-muted-foreground mb-6 max-w-md mx-auto">
      Readable description of the empty state.
    </p>
    <Button className="font-bold uppercase tracking-wide">
      Get Started
    </Button>
  </CardContent>
</Card>
```

---

## Mobile Adaptations

### Touch Targets
- **Minimum button height**: 44px (iOS standard)
- **Comfortable button height**: 48px
- All interactive elements must be easily tappable

### Typography Scaling
```tsx
// Mobile-first responsive text
"text-xs sm:text-sm lg:text-base"        // Body
"text-base sm:text-lg lg:text-xl"        // Subheadings
"text-xl sm:text-2xl lg:text-3xl"        // Headings
```

### Brutalist Elements on Mobile
- Reduce shadow offset on mobile: `shadow-[3px_3px_0px_0px]` → `shadow-[2px_2px_0px_0px]`
- Keep borders consistent: `border-[3px]`
- Maintain color vibrancy

---

## Accessibility

### Focus States
All interactive elements must have visible focus rings:
```css
focus-visible:ring-4 focus-visible:ring-primary focus-visible:ring-offset-2
```

### Motion
Respect `prefers-reduced-motion`:
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Screen Readers
- Use semantic HTML (`<header>`, `<main>`, `<nav>`, `<article>`)
- Provide descriptive alt text for all images
- Use ARIA labels for icon-only buttons

---

## Do's and Don'ts

### ✅ DO
- Use Press Start 2P for all titles and headers
- Keep brutalist borders (3px) on all cards and buttons
- Use bold, uppercase text for CTAs
- Maintain high contrast throughout
- Use readable fonts (DM Sans) for body text
- Keep the gradient backgrounds from landing page

### ❌ DON'T
- Use Press Start 2P for long paragraphs
- Remove or soften the brutalist borders
- Use thin or light fonts
- Compromise on contrast for aesthetics
- Use custom colors outside the defined palette
- Make buttons without adequate touch targets

---

## Implementation Checklist

When creating new components or pages:

- [ ] Page title uses `font-pixel`
- [ ] Section headers use `font-pixel`
- [ ] Body text uses `font-sans` (DM Sans)
- [ ] Buttons have `font-bold uppercase tracking-wide`
- [ ] Cards have `border-[3px] border-foreground`
- [ ] Cards have brutalist shadow: `shadow-[5px_5px_0px_0px_hsl(var(--foreground))]`
- [ ] Gradient backgrounds use design system tokens
- [ ] Interactive elements have minimum 44px height
- [ ] Focus states are visible with ring
- [ ] Text contrast meets WCAG AAA (7:1)

---

## Success Metrics

### Visual Consistency
- 100% of headers use Press Start 2P
- 100% of cards have brutalist borders
- 100% of buttons have brutalist shadows
- 0 instances of non-design-system colors

### Usability
- All text meets WCAG AAA contrast (7:1)
- All interactive elements ≥ 44px touch target
- 0 accessibility violations in automated tests

---

## Example Pages

See these pages for reference implementation:
- Landing page (original brutalist design)
- Dashboard (adaptive brutalist implementation)
- Booking page (form-heavy with readable fonts)
- Analytics (data-heavy with Space Grotesk)

---

**Maintained By:** Hair AI Design Team  
**Next Review:** 2025-11-16
