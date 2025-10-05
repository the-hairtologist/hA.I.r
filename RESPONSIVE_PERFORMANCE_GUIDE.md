# Responsive Design & Performance Guide

## Overview
This guide documents the comprehensive responsive design system and performance optimizations implemented across all devices.

---

## Responsive Breakpoints

### Device Categories
- **Mobile**: < 768px
- **Tablet**: 768px - 1023px
- **Desktop**: ≥ 1024px

### Tailwind Breakpoints
```
xs: 475px   - Small phones
sm: 640px   - Large phones
md: 768px   - Tablets (portrait)
lg: 1024px  - Tablets (landscape) / Small laptops
xl: 1280px  - Laptops
2xl: 1536px - Large screens
```

---

## Typography Scaling

### Responsive Font Sizes
- **Mobile (< 640px)**: Base 14px
- **Tablet (641px - 1024px)**: Base 15px
- **Desktop (> 1024px)**: Base 16px

### Typography Scale
```css
--text-xs: 0.75rem    /* 12px */
--text-sm: 0.875rem   /* 14px */
--text-base: 1rem     /* 16px */
--text-lg: 1.25rem    /* 20px */
--text-xl: 1.5rem     /* 24px */
--text-2xl: 2rem      /* 32px */
--text-3xl: 2.5rem    /* 40px */
```

---

## Touch Targets

### Minimum Sizes (Following Apple HIG & Material Design)
- **Mobile**: 44x44px (iOS) / 48x48px (Android)
- **Tablet**: 40x40px
- **Desktop**: No minimum (pointer precision)

### Implementation
```css
@media (max-width: 640px) {
  button, a[role="button"] {
    min-height: 44px;
    min-width: 44px;
    padding: 0.625rem 1rem;
  }
}
```

---

## Safe Area Support

### iOS Notch & Dynamic Island
```css
body {
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}
```

### Utility Classes
- `.safe-top` - Respects top safe area
- `.safe-bottom` - Respects bottom safe area
- `.safe-left` - Respects left safe area
- `.safe-right` - Respects right safe area

---

## Dynamic Viewport Height

### Problem
Mobile browsers have collapsing/expanding address bars that change viewport height.

### Solution
```css
/* Standard */
min-height: 100vh;
/* Dynamic (modern browsers) */
min-height: 100dvh;
```

### Utility Classes
- `.h-screen-safe` - Dynamic viewport height
- `.min-h-screen-safe` - Minimum dynamic viewport height

---

## Performance Optimizations

### Image Optimization
```typescript
import { ResponsiveImage } from '@/components/ResponsiveImage';

<ResponsiveImage
  src="/image.jpg"
  alt="Description"
  width={800}
  height={600}
  priority={false} // Lazy load by default
/>
```

### Features
- Automatic lazy loading
- Device-specific sizing
- Pixel ratio optimization
- Slow connection detection
- Progressive loading

### Device Capabilities Detection
```typescript
import { getDeviceCapabilities } from '@/lib/performanceOptimizer';

const {
  isTouchDevice,
  hasHover,
  pixelRatio,
  isHighDensity,
  deviceType,
  isSlowConnection,
} = getDeviceCapabilities();
```

---

## Responsive Hooks

### useResponsive()
```typescript
import { useResponsive } from '@/hooks/useResponsive';

const {
  isMobile,
  isTablet,
  isDesktop,
  isTouchDevice,
  hasHover,
  isPortrait,
  isLandscape,
  width,
  height,
  pixelRatio,
  isRetina,
} = useResponsive();
```

### useBreakpoint()
```typescript
import { useBreakpoint } from '@/hooks/useResponsive';

const isMdUp = useBreakpoint('md');
```

### useOrientation()
```typescript
import { useOrientation } from '@/hooks/useResponsive';

const orientation = useOrientation(); // 'portrait' | 'landscape'
```

---

## Performance Monitoring

### Component Performance
```typescript
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';

const MyComponent = () => {
  usePerformanceMonitor({
    componentName: 'MyComponent',
    logToConsole: true,
    reportThreshold: 16, // 60fps threshold
  });
  
  return <div>...</div>;
};
```

### Timing Metrics
```typescript
import { useComponentTiming } from '@/hooks/usePerformanceMonitor';

useComponentTiming('MyComponent');
```

---

## Optimization Utilities

### Debounce (Search, Input)
```typescript
import { debounce } from '@/lib/performanceOptimizer';

const handleSearch = debounce((value: string) => {
  // Search logic
}, 300);
```

### Throttle (Scroll, Resize)
```typescript
import { throttle } from '@/lib/performanceOptimizer';

const handleScroll = throttle(() => {
  // Scroll logic
}, 150);
```

---

## Accessibility Features

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### High Contrast
```css
@media (prefers-contrast: high) {
  button, a, input {
    border-width: 2px;
  }
}
```

### Reduced Data
```css
@media (prefers-reduced-data: reduce) {
  * {
    background-image: none !important;
    animation: none !important;
  }
}
```

---

## Container Queries

### Component-Level Responsiveness
```css
.container-responsive {
  container-type: inline-size;
  container-name: responsive-container;
}
```

---

## Landscape Mode Optimizations

### Mobile Landscape
```css
@media (max-width: 1024px) and (orientation: landscape) {
  body {
    font-size: 14px;
  }
  
  .hide-landscape {
    display: none !important;
  }
}
```

---

## GPU Acceleration

### Optimize Animations
```css
.gpu-accelerated {
  transform: translateZ(0);
  will-change: transform;
  backface-visibility: hidden;
}
```

---

## Scroll Performance

### Smooth Scrolling
```css
.scroll-container {
  -webkit-overflow-scrolling: touch;
  overflow-y: auto;
  overscroll-behavior-y: contain;
}
```

---

## High DPI Displays

### Retina Optimization
```css
@media (-webkit-min-device-pixel-ratio: 2),
       (min-resolution: 192dpi) {
  body {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
}
```

---

## Best Practices

### ✅ Do
- Use semantic breakpoints (isMobile, isTablet, isDesktop)
- Lazy load images below the fold
- Use throttle for scroll/resize events
- Use debounce for user input
- Respect user's motion preferences
- Test on real devices
- Monitor performance metrics
- Use container queries for components
- Respect safe areas on mobile

### ❌ Don't
- Rely on user agent detection
- Block main thread with heavy operations
- Load all images eagerly
- Use heavy animations on mobile
- Ignore orientation changes
- Forget about touch targets
- Use fixed viewport units without fallback
- Ignore network conditions

---

## Testing Checklist

### Devices to Test
- [ ] iPhone SE (small mobile)
- [ ] iPhone 14 Pro (notch)
- [ ] iPhone 14 Pro Max (large mobile)
- [ ] iPad Mini (small tablet)
- [ ] iPad Pro (large tablet)
- [ ] Android phone (various sizes)
- [ ] Desktop 1080p
- [ ] Desktop 1440p
- [ ] Desktop 4K

### Orientations
- [ ] Portrait mode
- [ ] Landscape mode
- [ ] Rotation transitions

### Network Conditions
- [ ] 4G
- [ ] 3G
- [ ] Slow 3G
- [ ] Offline

### Accessibility
- [ ] Reduced motion
- [ ] High contrast
- [ ] Screen readers
- [ ] Keyboard navigation

---

## Performance Targets

### Load Times
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Time to Interactive**: < 3.5s
- **Cumulative Layout Shift**: < 0.1

### Frame Rate
- **Target**: 60fps (16.67ms per frame)
- **Minimum**: 30fps (33.33ms per frame)

### Bundle Size
- **Initial JS**: < 200KB (gzipped)
- **Total JS**: < 500KB (gzipped)
- **CSS**: < 50KB (gzipped)

---

## Tools & Resources

### Development
- Chrome DevTools Device Mode
- React DevTools Profiler
- Lighthouse
- WebPageTest
- BrowserStack

### Monitoring
- `usePerformanceMonitor` hook
- Browser Performance API
- Console performance logs

---

**Last Updated**: 2025-01-05
**Maintained By**: hA.I.r Development Team
