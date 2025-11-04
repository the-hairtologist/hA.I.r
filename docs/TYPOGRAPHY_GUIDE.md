# Typography Guide

Consistent typography hierarchy and styling for the hA.I.r app.

## Font Families

### font-pixel (Primary Brand Font)
**Use for**: Page titles, section headers, card titles, buttons

```css
font-family: 'Pixel', monospace;
```

### font-sans (Body Font)
**Use for**: Body text, labels, descriptions, captions

```css
font-family: 'Inter', system-ui, sans-serif;
```

### font-display (Stats/Numbers Font)
**Use for**: Large numbers, statistics, prices

```css
font-family: 'Space Grotesk', monospace;
```

## Typography Hierarchy

### Page Titles

```typescript
className={cn(
  mobileFirst.text['2xl'],  // 1.5rem (24px) on mobile
  'sm:text-3xl',             // 1.875rem (30px) on small screens
  'md:text-4xl',             // 2.25rem (36px) on medium+
  'font-pixel',
  'break-words'
)}
```

**Example**: "Dashboard", "Clients", "Appointments"

### Section Headers

```typescript
className={cn(
  mobileFirst.text.xl,  // 1.25rem (20px) on mobile
  'sm:text-2xl',         // 1.5rem (24px) on small screens+
  'font-pixel'
)}
```

**Example**: "Quick Actions", "Recent Activity", "Upcoming Appointments"

### Card Titles

```typescript
className={cn(
  mobileFirst.text.lg,  // 1.125rem (18px) on mobile
  'sm:text-xl',          // 1.25rem (20px) on small screens+
  'font-pixel',
  'truncate'  // or 'break-words' if multi-line allowed
)}
```

**Example**: Client names, formula names

### Subsection Headers

```typescript
className={cn(
  mobileFirst.text.base,  // 1rem (16px) on mobile
  'sm:text-lg',            // 1.125rem (18px) on small screens+
  'font-pixel'
)}
```

**Example**: "Personal Information", "Business Details"

### Body Text (Standard)

```typescript
className={cn(
  mobileFirst.text.sm,   // 0.875rem (14px) on mobile
  'sm:text-base',         // 1rem (16px) on small screens+
  'font-sans'
)}
```

**Example**: Paragraphs, descriptions, longer content

### Body Text (Large)

```typescript
className={cn(
  mobileFirst.text.base,  // 1rem (16px) on mobile
  'sm:text-lg',            // 1.125rem (18px) on small screens+
  'font-sans'
)}
```

**Example**: Important descriptions, featured content

### Labels

```typescript
className={cn(
  mobileFirst.text.xs,   // 0.75rem (12px) on mobile
  'sm:text-sm',           // 0.875rem (14px) on small screens+
  'font-sans',
  'font-semibold',
  'text-muted-foreground'
)}
```

**Example**: Form labels, card metadata

### Captions

```typescript
className={cn(
  mobileFirst.text.xs,   // 0.75rem (12px)
  'font-sans',
  'text-muted-foreground'
)}
```

**Example**: Timestamps, photo captions, help text

### Stats/Numbers (Large)

```typescript
className={cn(
  mobileFirst.text['3xl'],  // 1.875rem (30px) on mobile
  'sm:text-4xl',             // 2.25rem (36px) on small screens
  'md:text-5xl',             // 3rem (48px) on medium+
  'font-display',
  'font-bold'
)}
```

**Example**: Dashboard statistics, revenue numbers

### Stats/Numbers (Medium)

```typescript
className={cn(
  mobileFirst.text['2xl'],  // 1.5rem (24px) on mobile
  'sm:text-3xl',             // 1.875rem (30px) on small screens+
  'font-display',
  'font-semibold'
)}
```

**Example**: Card statistics

## Text Color Guidelines

### Primary Text

```typescript
className="text-foreground"  // Default, high contrast
```

### Secondary Text

```typescript
className="text-muted-foreground"  // Reduced emphasis
```

### Error Text

```typescript
className="text-destructive"  // Error messages
```

### Success Text

```typescript
className="text-success"  // Success messages (if available)
```

## Text Overflow Handling

### Single Line with Truncation

```typescript
className="truncate"
```
Shows ellipsis (...) when text overflows

### Multi-Line with Word Break

```typescript
className="break-words"
```
Wraps long words to prevent overflow

### Line Clamp (Multi-Line Truncation)

```typescript
className="line-clamp-2"  // Shows 2 lines max with ellipsis
className="line-clamp-3"  // Shows 3 lines max with ellipsis
```

## Responsive Text Guidelines

### Mobile-First Sizing

Always start with the smallest size for mobile, then scale up:

```typescript
// ✅ CORRECT
className="text-sm sm:text-base md:text-lg"

// ❌ WRONG - Desktop-first approach
className="text-lg md:text-sm"
```

### Minimum Readable Sizes

- **Body text**: Never smaller than 14px (0.875rem) on mobile
- **Labels**: 12px (0.75rem) minimum
- **Touch targets**: Text inside buttons should be 14px+ minimum

## Line Height Guidelines

Default line heights are good, but for special cases:

```typescript
className="leading-tight"    // 1.25 - For headlines
className="leading-snug"     // 1.375 - For subheadings
className="leading-normal"   // 1.5 - Default body
className="leading-relaxed"  // 1.625 - For comfortable reading
```

## Font Weight Guidelines

```typescript
className="font-normal"     // 400 - Body text
className="font-medium"     // 500 - Slightly emphasized
className="font-semibold"   // 600 - Headers, labels
className="font-bold"       // 700 - Strong emphasis
```

## Complete Examples

### Dashboard Page Header

```typescript
<div className="space-y-2">
  <h1 className={cn(
    mobileFirst.text['2xl'],
    'sm:text-3xl',
    'md:text-4xl',
    'font-pixel',
    'break-words'
  )}>
    Dashboard
  </h1>
  <p className={cn(
    mobileFirst.text.sm,
    'sm:text-base',
    'font-sans',
    'text-muted-foreground'
  )}>
    Welcome back! Here's what's happening today.
  </p>
</div>
```

### Card with Statistics

```typescript
<Card>
  <CardHeader>
    <CardTitle className={cn(
      mobileFirst.text.lg,
      'sm:text-xl',
      'font-pixel'
    )}>
      Total Revenue
    </CardTitle>
  </CardHeader>
  <CardContent>
    <div className={cn(
      mobileFirst.text['3xl'],
      'sm:text-4xl',
      'font-display',
      'font-bold'
    )}>
      $12,345
    </div>
    <p className={cn(
      mobileFirst.text.xs,
      'sm:text-sm',
      'font-sans',
      'text-muted-foreground'
    )}>
      This month
    </p>
  </CardContent>
</Card>
```

### Form Section

```typescript
<div className="space-y-4">
  <h2 className={cn(
    mobileFirst.text.xl,
    'sm:text-2xl',
    'font-pixel'
  )}>
    Personal Information
  </h2>
  <p className={cn(
    mobileFirst.text.sm,
    'sm:text-base',
    'font-sans',
    'text-muted-foreground'
  )}>
    Update your personal details and profile information.
  </p>
  {/* Form fields here */}
</div>
```

## Migration Checklist

When updating typography:

- [ ] Replace hardcoded sizes with mobile-first classes
- [ ] Use font-pixel for headlines and titles
- [ ] Use font-sans for body text
- [ ] Use font-display for numbers and stats
- [ ] Add `break-words` to prevent overflow on long titles
- [ ] Use `truncate` for single-line text that can overflow
- [ ] Ensure text is readable at 320px viewport width
- [ ] Test all breakpoints (320px, 390px, 768px, 1024px+)
