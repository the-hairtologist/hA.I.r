/**
 * Phase 2: Resource Preloading Strategy
 * DNS prefetch, preconnect, prefetch, preload
 */

/**
 * Preload critical resources
 */
export function setupResourceHints() {
  const hints = [
    // DNS Prefetch - Resolve DNS early
    { rel: 'dns-prefetch', href: 'https://fonts.googleapis.com' },
    { rel: 'dns-prefetch', href: 'https://fonts.gstatic.com' },
    { rel: 'dns-prefetch', href: 'https://iyotklwiwyljospfqnoy.supabase.co' },
    
    // Preconnect - Establish connection early
    { rel: 'preconnect', href: 'https://fonts.googleapis.com', crossorigin: 'anonymous' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: 'anonymous' },
    { rel: 'preconnect', href: 'https://iyotklwiwyljospfqnoy.supabase.co', crossorigin: 'anonymous' },
  ];

  hints.forEach(hint => {
    if (!document.querySelector(`link[rel="${hint.rel}"][href="${hint.href}"]`)) {
      const link = document.createElement('link');
      link.rel = hint.rel;
      link.href = hint.href;
      if (hint.crossorigin) {
        link.crossOrigin = hint.crossorigin;
      }
      document.head.appendChild(link);
    }
  });
}

/**
 * Preload fonts to prevent FOIT (Flash of Invisible Text)
 */
export function preloadFonts() {
  const fonts = [
    // Add critical font files here
    // { href: '/fonts/inter-var.woff2', type: 'font/woff2' },
  ];

  fonts.forEach(font => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'font';
    link.type = font.type;
    link.href = font.href;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
}

/**
 * Prefetch role-specific routes on idle
 */
export function prefetchRoleRoutes(role: 'admin' | 'stylist' | 'client') {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      const routes = getRolePrefetchRoutes(role);
      routes.forEach(route => prefetchRoute(route));
    });
  } else {
    // Fallback for browsers without requestIdleCallback
    setTimeout(() => {
      const routes = getRolePrefetchRoutes(role);
      routes.forEach(route => prefetchRoute(route));
    }, 2000);
  }
}

function getRolePrefetchRoutes(role: 'admin' | 'stylist' | 'client'): string[] {
  const routeMap = {
    admin: [
      '/admin/command',
      '/admin/metrics',
      '/admin/users',
    ],
    stylist: [
      '/formulas',
      '/quick-formula',
      '/clients',
      '/appointments',
      '/ai-assistant',
    ],
    client: [
      '/book-appointment',
      '/appointments',
      '/messages',
    ],
  };

  return routeMap[role] || [];
}

function prefetchRoute(route: string) {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = route;
  document.head.appendChild(link);
}

/**
 * Preload critical data after authentication
 */
export async function preloadUserData(userId: string, role: string) {
  // Import supabase client dynamically
  const { supabase } = await import('@/integrations/supabase/client');

  // Common data for all roles
  const profilePromise = supabase.from('profiles').select('*').eq('id', userId).maybeSingle();

  // Role-specific data
  if (role === 'stylist' || role === 'admin') {
    const stylistPromise = supabase.from('stylist_profiles').select('*').eq('user_id', userId).maybeSingle();
    const appointmentsPromise = supabase.from('appointments')
      .select('*')
      .eq('stylist_id', userId)
      .gte('appointment_date', new Date().toISOString())
      .limit(10);
    
    await Promise.all([profilePromise, stylistPromise, appointmentsPromise]);
  } else if (role === 'client') {
    const clientPromise = supabase.from('client_profiles').select('*').eq('user_id', userId).maybeSingle();
    const appointmentsPromise = supabase.from('appointments')
      .select('*')
      .eq('client_id', userId)
      .gte('appointment_date', new Date().toISOString())
      .limit(5);
    
    await Promise.all([profilePromise, clientPromise, appointmentsPromise]);
  } else {
    await profilePromise;
  }
}

/**
 * Preload critical images
 */
export function preloadCriticalImages() {
  const criticalImages = [
    '/icon-192.png',
    '/icon-512.png',
    // Add more critical images
  ];

  criticalImages.forEach(src => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    document.head.appendChild(link);
  });
}

/**
 * Initialize all preload strategies
 */
export function initPreloadStrategies(role?: 'admin' | 'stylist' | 'client') {
  // Run immediately
  setupResourceHints();
  preloadFonts();
  preloadCriticalImages();

  // Run when idle
  if (role) {
    prefetchRoleRoutes(role);
  }
}
