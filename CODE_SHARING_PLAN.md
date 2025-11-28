# Code Sharing Plan

## Hair A.I. Mono-Repo Strategy

**Version:** 1.0.0  
**Date:** 2025-10-04  
**Target Platforms:** Web, iOS, Android

---

## Executive Summary

This document outlines the strategy for maximizing code sharing between Hair A.I.'s web and mobile applications. The goal is to achieve **90%+ shared UI logic** while maintaining platform-specific optimizations and native feel.

**Current State:** 85% shared business logic  
**Target State:** 90% shared UI logic + 95% shared business logic  
**Approach:** Capacitor-based hybrid app with platform adapters

---

## 1. Architecture Strategy

### 1.1 Chosen Approach: Capacitor + React

**Why Capacitor?**

- ✅ Already installed and configured
- ✅ Uses existing React codebase
- ✅ Web-first with native capabilities
- ✅ Smaller learning curve
- ✅ Single codebase for all platforms
- ✅ Access to native plugins ecosystem

**Rejected Alternatives:**

- **Expo React Native:** Requires rewriting entire UI in React Native
- **Flutter:** Requires learning Dart and rebuilding app
- **Separate native apps:** 3x development effort

### 1.2 Directory Structure

```
hair-ai-app/
├── src/
│   ├── shared/              # NEW: Shared business logic
│   │   ├── api/            # API clients and hooks
│   │   ├── models/         # Data models and types
│   │   ├── utils/          # Pure utility functions
│   │   ├── validation/     # Zod schemas
│   │   └── constants/      # App constants
│   │
│   ├── web/                # NEW: Web-specific code
│   │   ├── components/     # Web-only components
│   │   ├── layouts/        # Web layouts
│   │   └── styles/         # Web-specific styles
│   │
│   ├── mobile/             # NEW: Mobile-specific code
│   │   ├── components/     # Mobile adaptations
│   │   ├── navigation/     # Native navigation
│   │   └── adapters/       # Platform adapters
│   │
│   ├── components/         # CURRENT: Universal components
│   │   └── ui/            # shadcn/ui primitives
│   │
│   ├── platform/           # NEW: Platform detection & adapters
│   │   ├── storage.ts     # Storage abstraction
│   │   ├── camera.ts      # Camera abstraction
│   │   ├── notifications.ts # Push notification abstraction
│   │   ├── haptics.ts     # Haptic feedback
│   │   └── detector.ts    # Platform detection
│   │
│   └── pages/             # CURRENT: Route components
│
├── ios/                    # iOS native project (Capacitor)
├── android/                # Android native project (Capacitor)
├── public/                 # Web static assets
└── capacitor.config.ts     # Capacitor configuration
```

---

## 2. Shared Code Categories

### 2.1 100% Shared (No Platform Differences)

**Business Logic**

```typescript
// src/shared/api/appointments.ts
export const bookAppointment = async (data: AppointmentData) => {
  // Same logic for web and mobile
  const { data: appointment, error } = await supabase
    .from('appointments')
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return appointment;
};
```

**Data Models**

```typescript
// src/shared/models/appointment.ts
export interface Appointment {
  id: string;
  stylist_id: string;
  client_id: string;
  service_id: string;
  start_time: string;
  end_time: string;
  status: AppointmentStatus;
  notes?: string;
}
```

**Validation Schemas**

```typescript
// src/shared/validation/appointment.ts
export const appointmentSchema = z.object({
  stylist_id: z.string().uuid(),
  client_id: z.string().uuid(),
  service_id: z.string().uuid(),
  start_time: z.string().datetime(),
  end_time: z.string().datetime(),
  notes: z.string().optional(),
});
```

### 2.2 95% Shared (Minor Platform Adaptations)

**React Hooks**

```typescript
// src/shared/hooks/useAppointments.ts
export const useAppointments = (userId: string) => {
  // Same query logic for both platforms
  const { data, isLoading } = useQuery({
    queryKey: ['appointments', userId],
    queryFn: () => fetchAppointments(userId),
  });

  return { data, isLoading };
};
```

**UI Components (with adapters)**

```typescript
// src/components/ui/button.tsx
import { ButtonBase } from '@/platform/button'; // Platform adapter

export const Button = ({ children, ...props }) => {
  return (
    <ButtonBase {...props}>
      {children}
    </ButtonBase>
  );
};
```

### 2.3 80% Shared (Platform-Specific Wrappers)

**Navigation**

```typescript
// src/platform/navigation.ts
import { Platform } from './detector';

export const navigate = Platform.select({
  web: (path: string) => {
    // react-router-dom
    window.history.pushState({}, '', path);
  },
  mobile: (path: string) => {
    // Capacitor App API or native navigation
    App.open({ url: path });
  },
});
```

**File Upload**

```typescript
// src/platform/camera.ts
import { Camera } from '@capacitor/camera';
import { Platform } from './detector';

export const captureImage = async () => {
  if (Platform.isMobile) {
    const photo = await Camera.getPhoto({
      quality: 90,
      allowEditing: true,
      resultType: CameraResultType.DataUrl,
    });
    return photo.dataUrl;
  } else {
    // Web file input
    return new Promise(resolve => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = e => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        }
      };
      input.click();
    });
  }
};
```

---

## 3. Platform Detection

### 3.1 Platform Detector Utility

```typescript
// src/platform/detector.ts
import { Capacitor } from '@capacitor/core';

export const Platform = {
  isWeb: !Capacitor.isNativePlatform(),
  isMobile: Capacitor.isNativePlatform(),
  isIOS: Capacitor.getPlatform() === 'ios',
  isAndroid: Capacitor.getPlatform() === 'android',

  select<T>(options: {
    web?: T;
    mobile?: T;
    ios?: T;
    android?: T;
  }): T | undefined {
    if (this.isIOS && options.ios) return options.ios;
    if (this.isAndroid && options.android) return options.android;
    if (this.isMobile && options.mobile) return options.mobile;
    if (this.isWeb && options.web) return options.web;
    return options.web; // Default fallback
  },
};
```

### 3.2 Usage Example

```typescript
import { Platform } from '@/platform/detector';

const headerHeight =
  Platform.select({
    web: 64,
    ios: 88, // Account for notch
    android: 56,
  }) ?? 64;
```

---

## 4. Component Adaptation Strategy

### 4.1 Universal Components (No Changes Needed)

These components work identically on web and mobile:

- All shadcn/ui primitives (Button, Input, Card, etc.)
- Pure presentational components
- Layout components using flexbox

### 4.2 Platform-Aware Components

```typescript
// src/components/AppHeader.tsx
import { Platform } from '@/platform/detector';
import { useStatusBar } from '@/platform/statusBar';

export const AppHeader = () => {
  useStatusBar({ style: 'dark' }); // Mobile only

  return (
    <header
      className="header"
      style={{
        paddingTop: Platform.select({
          ios: 'env(safe-area-inset-top)',
          android: 0,
          web: 0,
        }),
      }}
    >
      {/* Header content */}
    </header>
  );
};
```

### 4.3 Component Mapping

```typescript
// src/platform/components.ts
import { Platform } from './detector';

// Web uses standard button, mobile uses Capacitor haptics
export const InteractiveButton = Platform.isMobile
  ? require('@/mobile/components/HapticButton').default
  : require('@/web/components/Button').default;
```

---

## 5. Styling Strategy

### 5.1 Shared Design Tokens

```css
/* src/index.css - Used by both platforms */
:root {
  --color-primary: 210 100% 50%;
  --color-secondary: 280 80% 60%;
  --spacing-unit: 4px;
  --border-radius: 8px;
  --font-sans: 'DM Sans', sans-serif;
  --font-display: 'Space Grotesk', sans-serif;
}
```

### 5.2 Tailwind Config (Shared)

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        primary: 'hsl(var(--color-primary))',
        secondary: 'hsl(var(--color-secondary))',
      },
      spacing: {
        unit: 'var(--spacing-unit)',
      },
    },
  },
};
```

### 5.3 Platform-Specific Styles

```typescript
// src/platform/styles.ts
export const platformStyles = {
  card: Platform.select({
    web: 'shadow-lg hover:shadow-xl transition-shadow',
    mobile: 'shadow-md active:opacity-80',
  }),
  button: Platform.select({
    web: 'hover:scale-105 transition-transform',
    mobile: 'active:scale-95',
  }),
};
```

---

## 6. Navigation Sharing

### 6.1 Route Definitions (100% Shared)

```typescript
// src/shared/routes.ts
export const ROUTES = {
  HOME: '/',
  AUTH: '/auth',
  DASHBOARD: '/dashboard',
  APPOINTMENTS: '/appointments',
  BOOK: '/book-appointment',
  STYLISTS: '/stylists',
  STYLIST_PROFILE: '/stylist/:id',
  MESSAGES: '/messages',
  SETTINGS: '/settings',
} as const;
```

### 6.2 Navigation Implementation

```typescript
// src/platform/navigation.ts
import { ROUTES } from '@/shared/routes';
import { useNavigate as useWebNavigate } from 'react-router-dom';
import { App } from '@capacitor/app';
import { Platform } from './detector';

export const useNavigation = () => {
  const webNavigate = Platform.isWeb ? useWebNavigate() : null;

  const navigate = (route: string) => {
    if (Platform.isWeb) {
      webNavigate?.(route);
    } else {
      App.open({ url: route });
    }
  };

  return { navigate, ROUTES };
};
```

---

## 7. State Management (100% Shared)

### 7.1 React Query Configuration

```typescript
// src/shared/api/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
      retry: 2,
    },
  },
});
```

### 7.2 Shared Hooks

All hooks in `src/hooks/` remain 100% shared:

- `useAuth.ts`
- `useProfile.ts`
- `useAppointments.ts`
- `useRealtimeUpdates.ts`
- etc.

---

## 8. Platform Adapters

### 8.1 Storage Adapter

```typescript
// src/platform/storage.ts
import { Preferences } from '@capacitor/preferences';
import { Platform } from './detector';

export const Storage = {
  async set(key: string, value: string) {
    if (Platform.isMobile) {
      await Preferences.set({ key, value });
    } else {
      localStorage.setItem(key, value);
    }
  },

  async get(key: string): Promise<string | null> {
    if (Platform.isMobile) {
      const { value } = await Preferences.get({ key });
      return value;
    } else {
      return localStorage.getItem(key);
    }
  },

  async remove(key: string) {
    if (Platform.isMobile) {
      await Preferences.remove({ key });
    } else {
      localStorage.removeItem(key);
    }
  },
};
```

### 8.2 Haptic Feedback Adapter

```typescript
// src/platform/haptics.ts
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Platform } from './detector';

export const haptic = {
  impact(style: 'light' | 'medium' | 'heavy' = 'medium') {
    if (Platform.isMobile) {
      const styleMap = {
        light: ImpactStyle.Light,
        medium: ImpactStyle.Medium,
        heavy: ImpactStyle.Heavy,
      };
      Haptics.impact({ style: styleMap[style] });
    } else {
      // Web fallback: minimal vibration
      navigator.vibrate?.(style === 'heavy' ? 50 : 20);
    }
  },

  notification(type: 'success' | 'warning' | 'error' = 'success') {
    if (Platform.isMobile) {
      // More advanced patterns for mobile
      const patterns = {
        success: [10, 50, 10],
        warning: [10, 100, 10, 100],
        error: [10, 50, 10, 50, 10],
      };
      Haptics.vibrate({ duration: 100 });
    }
  },
};
```

### 8.3 Notification Adapter

```typescript
// src/platform/notifications.ts
import { PushNotifications } from '@capacitor/push-notifications';
import { Platform } from './detector';

export const notifications = {
  async requestPermission(): Promise<boolean> {
    if (Platform.isMobile) {
      const result = await PushNotifications.requestPermissions();
      return result.receive === 'granted';
    } else {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
  },

  async getToken(): Promise<string | null> {
    if (Platform.isMobile) {
      const result = await PushNotifications.register();
      return result.value;
    } else {
      // Web push token logic
      // (requires service worker setup)
      return null;
    }
  },
};
```

---

## 9. Build Configuration

### 9.1 Package.json Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "dev:mobile": "vite --mode mobile",
    "build": "tsc && vite build",
    "build:web": "tsc && vite build --mode production",
    "build:mobile": "tsc && vite build --mode mobile",
    "sync:ios": "npm run build:mobile && npx cap sync ios",
    "sync:android": "npm run build:mobile && npx cap sync android",
    "open:ios": "npx cap open ios",
    "open:android": "npx cap open android",
    "run:ios": "npm run sync:ios && npx cap run ios",
    "run:android": "npm run sync:android && npx cap run android"
  }
}
```

### 9.2 Vite Configuration

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: mode === 'mobile' ? 'dist-mobile' : 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          supabase: ['@supabase/supabase-js'],
        },
      },
    },
  },
}));
```

---

## 10. Testing Strategy

### 10.1 Shared Unit Tests

```typescript
// src/shared/__tests__/appointments.test.ts
import { describe, it, expect } from 'vitest';
import { bookAppointment } from '../api/appointments';

describe('Appointment Booking', () => {
  it('should book appointment successfully', async () => {
    // Test runs on both web and mobile
    const result = await bookAppointment(mockData);
    expect(result).toBeDefined();
  });
});
```

### 10.2 Platform-Specific E2E Tests

```typescript
// E2E/tests/web/booking.spec.ts
test('Web: Complete booking flow', async ({ page }) => {
  // Web-specific test
});

// E2E/tests/mobile/booking.spec.ts (to be added)
test('Mobile: Complete booking flow', async ({ device }) => {
  // Mobile-specific test
});
```

---

## 11. Migration Plan

### Phase 1: Foundation (Week 1)

- [ ] Create `src/shared/` directory structure
- [ ] Move business logic to shared folder
- [ ] Create platform detection utility
- [ ] Set up platform adapters (storage, camera)

### Phase 2: Component Adaptation (Week 2)

- [ ] Identify components needing platform-specific versions
- [ ] Create mobile-specific component wrappers
- [ ] Test components on both platforms
- [ ] Update imports throughout codebase

### Phase 3: Navigation & Routing (Week 3)

- [ ] Implement unified navigation abstraction
- [ ] Test deep linking on mobile
- [ ] Ensure route parity across platforms
- [ ] Add mobile-specific navigation gestures

### Phase 4: Native Features (Week 4)

- [ ] Add haptic feedback to mobile
- [ ] Implement native camera integration
- [ ] Set up push notifications for both platforms
- [ ] Add biometric authentication (mobile only)

### Phase 5: Testing & Optimization (Week 5-6)

- [ ] Write cross-platform integration tests
- [ ] Performance audit on both platforms
- [ ] Fix platform-specific bugs
- [ ] Optimize bundle sizes

### Phase 6: CI/CD & Deployment (Week 7-8)

- [ ] Set up mobile build pipeline
- [ ] Configure Fastlane or EAS Build
- [ ] Create beta distribution channels
- [ ] Document deployment process

---

## 12. Code Sharing Metrics

### Target Metrics

| Category       | Current | Target  | Strategy                          |
| -------------- | ------- | ------- | --------------------------------- |
| Business Logic | 85%     | 95%     | Move remaining logic to `shared/` |
| UI Components  | 70%     | 85%     | Create platform adapters          |
| Hooks & State  | 90%     | 95%     | Already highly shared             |
| Styling        | 60%     | 80%     | Use design tokens consistently    |
| Navigation     | 50%     | 85%     | Unified navigation abstraction    |
| **Overall**    | **75%** | **90%** | Systematic refactoring            |

### Measurement

```typescript
// scripts/measure-sharing.ts
// Analyzes import statements and calculates sharing percentage
const sharedImports = countImports('src/shared/**');
const totalImports = countImports('src/**');
const sharingPercentage = (sharedImports / totalImports) * 100;
console.log(`Code sharing: ${sharingPercentage}%`);
```

---

## 13. Best Practices

### 13.1 Do's

✅ Write platform-agnostic business logic  
✅ Use platform detection for conditional features  
✅ Abstract platform-specific APIs behind adapters  
✅ Share design tokens and constants  
✅ Test on both platforms regularly  
✅ Document platform differences

### 13.2 Don'ts

❌ Hardcode platform-specific values  
❌ Use web-only APIs without fallbacks  
❌ Duplicate business logic  
❌ Mix platform-specific code with shared code  
❌ Forget to sync mobile builds after changes  
❌ Assume identical behavior without testing

---

## 14. Tools & Resources

### Development Tools

- **Capacitor DevTools:** For debugging mobile builds
- **React DevTools:** Works on both platforms
- **Sentry:** Error tracking for web and mobile
- **Flipper:** Advanced mobile debugging

### Documentation

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [React Native Web](https://necolas.github.io/react-native-web/) (for reference)
- [Tailwind RN](https://www.nativewind.dev/) (future consideration)

---

## 15. Success Criteria

### Code Sharing Goals

- [x] 85% business logic sharing (Current)
- [ ] 90% UI logic sharing (Target)
- [ ] 95% data model sharing (Target)
- [ ] 100% API client sharing (Current)

### Quality Metrics

- [ ] Zero code duplication in business logic
- [ ] All platform-specific code isolated to adapters
- [ ] 100% feature parity between platforms
- [ ] < 5% performance difference between platforms

### Developer Experience

- [ ] Single command to build both platforms
- [ ] Hot reload works on mobile
- [ ] Clear documentation for adding new features
- [ ] Automated cross-platform testing

---

## Conclusion

By following this code sharing plan, Hair A.I. will achieve 90%+ code reuse between web and mobile platforms while maintaining native performance and UX quality. The Capacitor-based approach leverages existing React expertise and minimizes the learning curve while providing access to native capabilities.

**Next Steps:**

1. Review this plan with development team
2. Begin Phase 1 implementation
3. Set up weekly progress tracking
4. Adjust strategy based on learnings

**Maintained By:** Hair A.I. Engineering Team  
**Last Updated:** 2025-10-04
