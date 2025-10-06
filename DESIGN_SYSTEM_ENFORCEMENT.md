# Design System Enforcement Guide
**Version:** 2.0  
**Status:** 🔒 MANDATORY

---

## ⛔ NEVER Use These (Auto-Fail Code Review)

### ❌ Hardcoded Colors
```tsx
// ❌ WRONG - Direct color usage
<div className="text-white bg-black">
<Button className="text-white">

// ✅ CORRECT - Semantic tokens
<div className="text-on-surface-primary bg-background">
<Button> {/* Uses design system by default */}
```

### ❌ Custom Borders
```tsx
// ❌ WRONG - Hardcoded border widths
<Card className="border-[2px] border-foreground">
<Card className="border-[3px] border-foreground">

// ✅ CORRECT - Brutal design tokens
<Card className="brutal-border">
```

### ❌ Custom Shadows
```tsx
// ❌ WRONG - Hardcoded shadow values
className="shadow-[4px_4px_0px_0px_hsl(var(--foreground))]"
className="shadow-[8px_8px_0px_0px_hsl(var(--foreground))]"

// ✅ CORRECT - Standardized shadow tokens
className="brutal-shadow-xs"  // 2px shadow
className="brutal-shadow-sm"  // 4px shadow  
className="brutal-shadow-md"  // 6px shadow
className="brutal-shadow-lg"  // 8px shadow
```

---

## ✅ Approved Design Tokens (Use These)

### Colors
```css
/* Surface/Background Colors */
--background
--foreground
--card
--card-foreground

/* On-Surface Colors (for text on colored backgrounds) */
--on-surface-primary    /* White/light text on dark surfaces */
--on-surface-secondary  /* Muted text on surfaces */
--on-surface-muted      /* Very subtle text */

/* Brand Colors */
--primary / --primary-foreground
--secondary / --secondary-foreground
--accent / --accent-foreground
--success / --success-foreground
--destructive / --destructive-foreground

/* UI States */
--border
--input
--ring
--muted / --muted-foreground
```

### Borders
```css
/* Standard brutal borders */
.brutal-border      /* 3px solid border */
.border-brutal      /* Alias */

/* Use standard Tailwind for specific sides */
.border-t-brutal
.border-b-brutal
.border-l-brutal
.border-r-brutal
```

### Shadows
```css
.brutal-shadow-xs   /* 2px offset - subtle */
.brutal-shadow-sm   /* 4px offset - small cards */
.brutal-shadow-md   /* 6px offset - dialogs */
.brutal-shadow-lg   /* 8px offset - prominent elements */
.brutal-shadow-top  /* Top shadow for sticky elements */
```

### Interactive States
```css
.brutal-hover       /* Standard hover animation */
.brutal-card        /* Card with border + shadow + hover */
.brutal-button      /* Button with all brutal effects */
```

---

## 🎯 Component Guidelines

### Buttons
```tsx
// Default button already has brutal styling
<Button variant="default">Click me</Button>

// For custom needs, add brutal classes
<Button variant="outline" className="brutal-shadow-sm">
```

### Cards
```tsx
// Use the variant system
<Card variant="brutal">Content</Card>
<Card variant="glass">Content</Card>
<Card variant="elevated">Content</Card>

// Or add brutal classes
<Card className="brutal-border brutal-shadow-md">
```

### Dialogs
```tsx
<DialogContent className="brutal-border brutal-shadow-md">
  {/* content */}
</DialogContent>
```

### Text on Colored Backgrounds
```tsx
// On primary/secondary backgrounds
<div className="bg-primary">
  <h1 className="text-on-surface-primary">White text on dark</h1>
  <p className="text-on-surface-secondary">Slightly muted</p>
</div>

// On accent/success backgrounds  
<div className="bg-success">
  <span className="text-on-surface-primary">High contrast</span>
</div>
```

---

## 🔍 Pre-Commit Checklist

Before committing code, verify:

- [ ] No `border-[2px]`, `border-[3px]`, or `border-[4px]` in new code
- [ ] No `shadow-[` custom values in new code
- [ ] No `text-white`, `bg-white`, `text-black`, or `bg-black` (use semantic tokens)
- [ ] All interactive elements use `brutal-hover` or component defaults
- [ ] All cards use `brutal-border` and `brutal-shadow-*`
- [ ] Text on colored backgrounds uses `text-on-surface-*`

---

## 🚨 Migration Status

**Phase 1:** ✅ Design tokens created  
**Phase 2:** ✅ Core components updated (buttons, cards, badges)  
**Phase 3:** 🟡 IN PROGRESS (365 instances remaining)
- 150 custom borders → brutal-border
- 215 custom shadows → brutal-shadow-*

**Remaining files to update:**
- AIFeedbackPrompt.tsx
- AIProgressNarrative.tsx  
- FloatingActionButton.tsx
- DelightfulToast.tsx
- OnboardingWizard.tsx
- And 41 more components...

---

## 📖 Quick Reference

| Need | Use This | Not This |
|------|----------|----------|
| Card border | `brutal-border` | `border-[3px]` |
| Card shadow | `brutal-shadow-sm` | `shadow-[4px_4px...]` |
| White text | `text-on-surface-primary` | `text-white` |
| Dialog | `brutal-border brutal-shadow-md` | Custom values |
| Hover effect | `brutal-hover` | Custom transform + shadow |

---

**Maintained by:** Hair A.I. Design Team  
**Last Updated:** Phase 3 Cleanup  
**Questions?** Check index.css for token definitions
