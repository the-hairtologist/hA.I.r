/**
 * Page preloading utilities for improved perceived performance
 */

const preloadedPages = new Set<string>();

/**
 * Preload a page by dynamically importing its module
 */
export const preloadPage = async (pagePath: string): Promise<void> => {
  if (preloadedPages.has(pagePath)) {
    return;
  }

  try {
    await import(/* @vite-ignore */ pagePath);
    preloadedPages.add(pagePath);
    console.log(`✅ Preloaded: ${pagePath}`);
  } catch (error) {
    console.warn(`❌ Failed to preload ${pagePath}:`, error);
  }
};

/**
 * Preload high-frequency pages on app initialization
 */
export const preloadHighFrequencyPages = async (): Promise<void> => {
  const highFrequencyPages = [
    "../pages/Dashboard",
    "../pages/Clients",
    "../pages/Appointments",
    "../pages/Messages",
    "../pages/Formulas",
  ];

  // Preload in parallel
  await Promise.allSettled(
    highFrequencyPages.map((page) => preloadPage(page))
  );
};

/**
 * Preload pages based on user role
 */
export const preloadRolePages = async (role: "stylist" | "client"): Promise<void> => {
  if (role === "stylist") {
    const stylistPages = [
      "../pages/Schedule",
      "../pages/Services",
      "../pages/Portfolio",
      "../pages/ClientDiscovery",
    ];
    await Promise.allSettled(stylistPages.map((page) => preloadPage(page)));
  } else {
    const clientPages = [
      "../pages/StylistDiscovery",
      "../pages/ClientRequests",
    ];
    await Promise.allSettled(clientPages.map((page) => preloadPage(page)));
  }
};
