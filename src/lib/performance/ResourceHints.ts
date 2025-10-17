/**
 * Resource Hints and Preloading Strategies
 * Optimizes page load performance with strategic resource loading
 */

/**
 * Add DNS prefetch for external domains
 */
export const dnsPrefetch = (domains: string[]) => {
  domains.forEach((domain) => {
    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = domain;
    document.head.appendChild(link);
  });
};

/**
 * Preconnect to critical third-party origins
 */
export const preconnect = (origins: string[]) => {
  origins.forEach((origin) => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = origin;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
};

/**
 * Prefetch next likely navigation targets
 */
export const prefetchRoutes = (routes: string[]) => {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(
      () => {
        routes.forEach((route) => {
          const link = document.createElement('link');
          link.rel = 'prefetch';
          link.href = route;
          document.head.appendChild(link);
        });
      },
      { timeout: 2000 }
    );
  }
};

/**
 * Preload critical resources
 */
export const preloadCritical = (resources: Array<{ href: string; as: string; type?: string }>) => {
  resources.forEach(({ href, as, type }) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    if (type) link.type = type;
    if (as === 'font') {
      link.crossOrigin = 'anonymous';
    }
    document.head.appendChild(link);
  });
};

/**
 * Initialize all resource hints
 */
export const initResourceHints = () => {
  // DNS prefetch for common domains
  dnsPrefetch([
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
    'https://www.googletagmanager.com',
  ]);

  // Preconnect to critical origins
  preconnect([
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
  ]);

  // Preload critical fonts
  preloadCritical([
    {
      href: '/fonts/inter-var.woff2',
      as: 'font',
      type: 'font/woff2',
    },
  ]);

  console.log('✅ Resource hints initialized');
};

/**
 * Dynamically prefetch based on hover intent
 */
export const prefetchOnHover = (element: HTMLElement, url: string) => {
  let timeoutId: NodeJS.Timeout;

  const handleMouseEnter = () => {
    // Delay to avoid prefetching on accidental hovers
    timeoutId = setTimeout(() => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = url;
      document.head.appendChild(link);
    }, 200);
  };

  const handleMouseLeave = () => {
    clearTimeout(timeoutId);
  };

  element.addEventListener('mouseenter', handleMouseEnter);
  element.addEventListener('mouseleave', handleMouseLeave);

  return () => {
    element.removeEventListener('mouseenter', handleMouseEnter);
    element.removeEventListener('mouseleave', handleMouseLeave);
    clearTimeout(timeoutId);
  };
};

/**
 * Smart prefetching based on network conditions
 */
export const smartPrefetch = (urls: string[]) => {
  // Check if user is on slow connection
  const connection = (navigator as any).connection;
  
  if (connection) {
    const slowConnection = 
      connection.effectiveType === 'slow-2g' ||
      connection.effectiveType === '2g' ||
      connection.saveData;

    if (slowConnection) {
      console.log('⚠️ Slow connection detected, skipping prefetch');
      return;
    }
  }

  // Prefetch during idle time
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      urls.forEach((url) => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = url;
        document.head.appendChild(link);
      });
    });
  }
};
