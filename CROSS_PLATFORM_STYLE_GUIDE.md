# Cross-Platform Style Guide
## Hair A.I. Unified Design System

**Version:** 1.0.0  
**Date:** 2025-10-04

---

## Design Tokens (100% Shared)

### Colors (HSL)
```css
--primary: 210 100% 50%;
--secondary: 280 80% 60%;
--accent: 330 90% 65%;
--background: 0 0% 100%;
--foreground: 222 47% 11%;
```

### Typography
- **Primary:** DM Sans (body text)
- **Display:** Space Grotesk (headings)
- **Scale:** 12px, 14px, 16px, 18px, 24px, 32px, 48px

### Spacing
- **Base unit:** 4px
- **Scale:** 4, 8, 12, 16, 24, 32, 48, 64, 96px

### Border Radius
- **Small:** 4px
- **Medium:** 8px
- **Large:** 12px
- **Full:** 9999px

---

## Platform-Specific Adaptations

| Element | Web | Mobile |
|---------|-----|--------|
| Button tap area | 44px min | 48px min |
| Touch feedback | hover states | haptic + opacity |
| Scrolling | smooth scroll | native momentum |
| Navigation | hover menus | bottom tabs |
| Modals | centered overlay | full-screen drawer |

---

## Component Guidelines

### Buttons
- Web: hover:scale-105 transition
- Mobile: active:scale-95 + haptic feedback

### Cards
- Web: shadow-lg hover:shadow-xl
- Mobile: shadow-md active:opacity-80

### Forms
- Web: focus rings with outline
- Mobile: larger input fields (48px height)

---

**Maintained By:** Hair A.I. Design Team
