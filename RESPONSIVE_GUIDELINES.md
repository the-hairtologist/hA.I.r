# Responsive Design System Guidelines

## 🎯 Purpose
This document ensures **perfect scaling and consistency** across all devices when using AI-generated code or making manual edits.

## ⚠️ Critical Rules

### DO NOT Use Fixed Pixels
```tsx
// ❌ BAD - Fixed sizing breaks on different devices
<div className="w-[200px] h-[400px] text-[16px]">

// ✅ GOOD - Responsive units adapt to device
<div className="w-full max-w-sm h-auto text-base">
```

### Always Import Responsive System
```tsx
import { responsiveBestPractices as rsp } from '@/lib/responsiveSystem';
```

## 📐 Responsive Utilities

### Typography
```tsx
// Use fluid text that scales with viewport
import { fluidText } from '@/lib/responsiveSystem';

<h1 className={fluidText['4xl']}>Responsive Heading</h1>
<p className={fluidText.base}>Body text that adapts</p>
```

### Spacing
```tsx
import { getResponsivePadding, getResponsiveMargin, getResponsiveGap } from '@/lib/responsiveSystem';

// Containers
<div className={getResponsivePadding('lg')}>
  Content with device-appropriate padding
</div>

// Sections
<section className={getResponsiveMargin('md')}>
  Properly spaced section
</section>

// Flex/Grid
<div className={`flex ${getResponsiveGap('md')}`}>
  Items with responsive gaps
</div>
```

### Layout
```tsx
import { containerWidths, cardGrid, sidebarLayout } from '@/lib/responsiveSystem';

// Content containers
<div className={`${containerWidths.xl} mx-auto ${getResponsivePadding('md')}`}>
  Properly contained content
</div>

// Card grids
<div className={`${cardGrid.responsive} ${getResponsiveGap('lg')}`}>
  <Card />
  <Card />
  <Card />
</div>

// Sidebar layouts
<div className={sidebarLayout.container}>
  <aside className={sidebarLayout.sidebar}>Sidebar</aside>
  <main className={sidebarLayout.content}>Content</main>
</div>
```

### Touch Targets (Mobile Accessibility)
```tsx
import { touchTargets, buttonSizes } from '@/lib/responsiveSystem';

// All interactive elements MUST be at least 44x44px
<button className={`${buttonSizes.md} rounded-lg`}>
  Properly sized button
</button>

// For icon buttons or small controls
<button className={touchTargets.comfortable}>
  <Icon className="h-5 w-5" />
</button>
```

## 🎨 Tailwind Responsive Classes

### Breakpoint Prefixes
- `sm:` - 640px and up (large phones, small tablets)
- `md:` - 768px and up (tablets)
- `lg:` - 1024px and up (laptops)
- `xl:` - 1280px and up (desktops)
- `2xl:` - 1536px and up (large screens)

### Common Patterns
```tsx
// Stack on mobile, row on desktop
<div className="flex flex-col md:flex-row gap-4">

// 1 column mobile, 2 tablet, 3 desktop
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

// Responsive text size
<h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl">

// Hide on mobile, show on desktop
<div className="hidden lg:block">Desktop only</div>

// Show on mobile only
<div className="block lg:hidden">Mobile only</div>
```

## 📱 Device-Specific Optimizations

### Safe Areas (Notches, etc.)
```tsx
import { safeAreaInsets } from '@/lib/responsiveSystem';

// For fixed headers/footers on mobile
<header className={`fixed top-0 w-full ${safeAreaInsets.top}`}>
  Header respects device notch
</header>
```

### Images
```tsx
import { responsiveImage, aspectRatios } from '@/lib/responsiveSystem';

// Responsive images that maintain aspect ratio
<img 
  src="/photo.jpg" 
  className={`${responsiveImage} ${aspectRatios.landscape}`}
  alt="Description"
/>
```

## 🔍 Testing Checklist

Before deploying any change, test on:
- [ ] Mobile (320px - 767px)
- [ ] Tablet (768px - 1023px)
- [ ] Desktop (1024px+)
- [ ] Portrait orientation
- [ ] Landscape orientation

### Quick Test Commands
```tsx
// Use the responsive hook to test device detection
import { useResponsive } from '@/hooks/useResponsive';

const { isMobile, isTablet, isDesktop } = useResponsive();
```

## ⚡ Performance Rules

1. **Use `rem` instead of `px`** - Respects user font size preferences
2. **Use `clamp()` for fluid sizing** - Smooth scaling between breakpoints
3. **Avoid fixed heights** - Let content determine height
4. **Use `max-width` not `width`** - Allows shrinking on small screens
5. **Use `min-h-screen` not `h-screen`** - Prevents content cutoff

## 🚫 Common Mistakes to Avoid

### Fixed Widths
```tsx
// ❌ BAD
<div className="w-[800px]">

// ✅ GOOD
<div className="w-full max-w-4xl">
```

### Fixed Font Sizes
```tsx
// ❌ BAD
<p className="text-[18px]">

// ✅ GOOD
<p className="text-lg">
// or better:
<p className={fluidText.lg}>
```

### Fixed Heights
```tsx
// ❌ BAD
<div className="h-[500px]">

// ✅ GOOD
<div className="min-h-[500px]">
// or even better:
<div className="h-auto">
```

### Pixel-Based Spacing
```tsx
// ❌ BAD
<div className="mt-[32px] mb-[16px]">

// ✅ GOOD
<div className="mt-8 mb-4">
// or better:
<div className={getResponsiveMargin('md')}>
```

## 🤖 AI Prompt Guidelines

When asking AI to generate code, always include:

> "Use the responsive system from @/lib/responsiveSystem. Never use fixed pixel values. Use semantic Tailwind breakpoints (sm:, md:, lg:, xl:). Ensure all buttons meet 44x44px minimum touch target. Test on mobile, tablet, and desktop."

## 📊 Component Example

Here's a complete example of a properly responsive component:

```tsx
import { responsiveBestPractices as rsp } from '@/lib/responsiveSystem';
import { useResponsive } from '@/hooks/useResponsive';

export function ResponsiveCard() {
  const { isMobile } = useResponsive();

  return (
    <div className={`
      ${rsp.containers.lg}
      ${rsp.padding('lg')}
      mx-auto
    `}>
      <div className={`
        ${rsp.cards.responsive}
        ${rsp.gap('lg')}
      `}>
        <div className="bg-card rounded-lg overflow-hidden">
          <img 
            src="/image.jpg"
            className={`${rsp.image} ${rsp.aspect.video}`}
            alt="Responsive image"
          />
          <div className={rsp.padding('md')}>
            <h2 className={rsp.typography['2xl']}>
              Fluid Typography
            </h2>
            <p className={`${rsp.typography.base} text-muted-foreground`}>
              This text scales perfectly on all devices
            </p>
            <button className={`
              ${rsp.buttons.md}
              bg-primary text-primary-foreground
              rounded-lg
              w-full sm:w-auto
            `}>
              {isMobile ? 'Tap' : 'Click'} Here
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

## 🎓 Additional Resources

- [Tailwind Responsive Design Docs](https://tailwindcss.com/docs/responsive-design)
- [WCAG Touch Target Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/target-size.html)
- Project Hook: `src/hooks/useResponsive.ts`
- Responsive System: `src/lib/responsiveSystem.ts`

---

**Remember**: Every pixel matters. Always think responsive-first! 📱💻🖥️
