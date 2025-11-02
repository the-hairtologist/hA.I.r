**Architecture & Boot**
- React 18 + Vite + TypeScript under `src`; `@/...` resolves to `src/...`. `vite.config.ts` enforces `VITE_SUPABASE_*` at startup, stubs Capacitor plugins for web builds, enables PWA/compression, and serves dev on port 8080.
- `src/main.tsx` wraps bootstrap in `initializeApp`, lazy-imports monitoring, and renders immediately; keep new startup logic inside that guard and preserve the inline crash fallback.

**App Shell & Providers**
- `src/App.tsx` stacks `GlobalErrorBoundary → QueryErrorResetBoundary → QueryClientProvider → SubscriptionProvider → DemoModeProvider → TooltipProvider → BrowserRouter → EnhancedAuthProvider → TourProvider` plus toasters, `GlobalAnnouncer`, `OfflineIndicator`, and `GlobalLoadingIndicator`.
- `AnalyticsInitializer` defers `initAnalytics`, `initSentry`, `initUTMTracking`, and `performanceTracker.initialize()` by 1s while invoking `useAnalytics`, `useSentryUser`, and `useSessionTracking`; keep additions non-blocking.

**Routing & Access**
- Centralize routes in `src/routes/index.tsx` with `lazyWithRetry` and `Suspense` fallback to `LoadingSpinner`. Wrap privileged pages with `ProtectedRoute`, optionally `allowedRoles`, plus `SubscriptionGate feature="…"` and `DashboardErrorBoundary`.
- Deep links (`/appointment/:id`, `/transformation/:id`) stay public. When adding routes, reuse existing gates instead of duplicating auth checks.

**Auth & Subscription**
- `EnhancedAuthContext` batches profile, roles, stylist, and client fetches, verifies stylist/admin roles via Supabase, and exposes helpers (`isStylist`, etc.). After mutating user data call `refreshAuth`; do not bypass its role integrity checks.
- `SubscriptionProvider` (see `src/contexts/SubscriptionContext.tsx`) drives `SubscriptionGate`, Apple IAP setup, access-code unlocks, and Supabase function `check-subscription`. After checkout/access code call `useSubscription().checkSubscription()`.

**Data & Supabase**
- `src/integrations/supabase/client.ts` lazily creates the typed client using `import.meta.env`; missing envs throw early. Query types come from `src/integrations/supabase/types.ts` (auto-generated Postgres schema).
- Edge calls (`create-checkout`, `check-subscription`, `hair-assistant-chat`, etc.) expect a bearer token from `supabase.auth.getSession()`; fetch sessions before making privileged requests.

**State & Async Patterns**
- React Query defaults (5 min stale, 10 min cache, retry with backoff, no focus refetch) are configured once in `App.tsx`; prefer `queryClient.invalidateQueries` over manual Supabase fetches from components.
- Global loading UI is driven by the Zustand store in `src/hooks/useGlobalLoading.ts`; `ProtectedRoute` toggles it automatically. Wrap long spans with `setLoading` instead of bespoke spinners.

**AI & Self-Healing**
- AI orchestrators live in `src/lib/ai/**` (e.g., `ClientRetentionAI` invoking `supabase.functions.invoke('hair-assistant-chat')`). Extend these classes or plug into their exposed methods before introducing new services.
- `src/lib/selfHealing/index.ts` wires health monitoring, performance optimizers, data integrity checks, and AI maintenance. Reuse exported singletons (`healthMonitor`, `performanceMonitor`, etc.) when adding resiliency features.

**Logging & Monitoring**
- Prefer `logger` (`src/lib/logger.ts`) or `productionLogger` (`src/lib/logging/productionLogger.ts`) over raw console; they scrub PII, buffer events, and forward to Sentry.
- Surface errors through `handleError` utilities and `ErrorBoundary` components so `userJourney` tracking and monitoring receive context.

**Offline & Integrations**
- Offline mutations go through `src/lib/offlineQueue.ts`; it batches Supabase CRUD/storage actions, handles retries, and is cleared on logout. Reuse it for any new offline-capable writes.
- `SubscriptionGate` orchestrates Stripe checkout, Apple IAP (`AppleIAPSubscription`), and access-code unlocks; hook new premium features by checking `useSubscription().isFeatureAllowed(feature)` instead of duplicating logic.

**UI & Accessibility**
- Tailwind + shadcn/Radix live under `src/components/ui`; use the `cn` helper, design tokens in `tailwind.config.ts`, and respect safe-areas from `src/index.css`.
- Accessibility helpers (`GlobalAnnouncer`, skip links, touch-target utilities) assume 44px targets and honor `prefers-reduced-motion`; keep animations opt-in and aria labels descriptive.

**Developer Workflow**
- Primary scripts: `npm run dev`, `npm run lint`, `npm run type-check`, `npm run test`, `npm run build`; VS Code tasks mirror these. Run lint + type-check before shipping to catch eslint `no-explicit-any` violations.
- Playwright suites live in `E2E/**` (see `E2E/README.md`); keep `data-testid` selectors stable across auth/subscription/analytics flows. Shared Vitest setup is `src/test/setup.ts`.

**Reference Docs**
- Start with `README.md`, `GETTING_STARTED.md`, and `DOCUMENTATION_INDEX.md`; feature-specific guidance lives in `src/components/README.md`, `src/hooks/README.md`, and `src/lib/README.md`.
- When adding routes, hooks, or providers, update the nearest README plus relevant analytics/accessibility docs so future agents stay aligned.
