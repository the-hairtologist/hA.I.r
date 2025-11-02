**Architecture**
- React 18 + Vite + TypeScript lives in `src`; alias `@/...` resolves to `src/...`; `vite.config.ts` enforces Supabase env vars at startup and adds PWA, compression, and manual chunking.
- `src/main.tsx` guards boot with async Sentry init; keep new bootstrap logic inside the guard to avoid double renders.

**App Shell & Providers**
- `src/App.tsx` layers `GlobalErrorBoundary`, `QueryErrorResetBoundary`, `QueryClientProvider`, `SubscriptionProvider`, `DemoModeProvider`, `TooltipProvider`, `BrowserRouter`, `EnhancedAuthProvider`, `TourProvider`, global toasters, announcers, and loading overlays. Add providers alongside these layers without reordering unless necessary.
- Query client defaults: 5 min stale, 10 min cache, 3 retries, no refetch on focus. Invalidate queries instead of bypassing React Query when data changes.

**Routing & Access**
- All routes live in `src/routes/index.tsx` using `lazyWithRetry` (or `lazyWithPreload`) plus `ProtectedRoute` and optional `SubscriptionGate feature="..."` wrappers.
- Gate stylist/admin surfaces via `allowedRoles`; deep links like `/appointment/:id` stay public. Reuse `DashboardErrorBoundary` and `LoadingSpinner` for error and suspense flows.

**Auth & User Data**
- `EnhancedAuthContext` loads profile, roles, stylist, and client records in one pass and re-validates critical roles. Consume via `useEnhancedAuth`, call `refreshAuth` after mutations, and rely on helpers (`isStylist`, etc.).
- Global loading overlay comes from Zustand `useGlobalLoading`; wrap async spans with `setLoading` instead of bespoke spinners.

**Supabase & Integrations**
- Supabase client lives in `src/integrations/supabase/client.ts`; read env via `import.meta.env` only.
- Edge functions under `supabase/functions/**` share middleware for auth, rate limiting, and error logging. Fetch sessions with `supabase.auth.getSession()` before privileged calls.
- Billing flows depend on `create-checkout` and `check-subscription`; follow up with `useSubscription().checkSubscription()` after checkout completes.

**Analytics & Monitoring**
- `AnalyticsInitializer` defers `initAnalytics`, `initSentry`, `initUTMTracking`, and `performanceTracker.initialize()` by one second; keep new trackers non-blocking.
- Use `userJourney` and `productionLogger` from `src/lib/logging` plus `handleError` utilities for surfaced failures instead of ad hoc console usage.

**AI, Automation & Self-Healing**
- AI orchestration lives under `src/lib/ai` and mirrored Supabase functions; extend existing orchestrators before introducing new providers.
- Self-healing modules (`src/lib/selfHealing/**`) own health checks, data integrity, and recovery workflows; plug into provided strategy interfaces when enhancing resiliency.

**UI & Accessibility**
- Tailwind, shadcn/ui, and Radix compose the design system; use `cn` for class merges and respect tokens in `tailwind.config.ts` and safe-area rules in `src/index.css`.
- Accessibility helpers (`GlobalAnnouncer`, skip links, touch-target utilities) presume proper aria labels and 44px targets; honor `prefers-reduced-motion` when adding animation.

**Developer Workflow**
- Prefer VS Code tasks: `Start Development Server` (`npm run dev` on port 8080), `Lint Code`, `Run Tests`, `Build Production`.
- Run `npm run lint`, `npm run type-check`, and `npm run build` before commits; ESLint flags many `no-explicit-any` warnings; resolve new ones when you touch affected files.
- Command aliases live in `VSCODE_SHORTCUTS_REFERENCE.md`; specialty scripts include `npm run test:ui`, `npm run test:headed`, and `npm run test:a11y`.

**Testing**
- Vitest powers unit and integration tests (`npm run test`, `npm run test:watch`) with shared setup in `src/test/setup.ts`.
- Playwright suites live in `E2E/**`; follow `E2E/README.md` for mobile, accessibility, and performance runs (`npx playwright test`, `--project=mobile`, `--headed`).
- Maintain `data-testid` selectors and update tests when modifying auth flows, subscription gating, or analytics hooks.

**Docs & References**
- Start with `README.md`, `GETTING_STARTED.md`, and `DOCUMENTATION_INDEX.md`; feature READMEs live under `src/components`, `src/hooks`, and `src/lib`.
- When adding routes, hooks, or providers, update the nearest README plus analytics/accessibility guides so future agents stay aligned.
