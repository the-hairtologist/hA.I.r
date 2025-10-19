/**
 * AppLayout - Main application layout wrapper
 * Includes mobile header and main content area (only for authenticated pages)
 */

import { MobileHeader } from "@/components/MobileHeader";
import { ReactNode } from "react";
import { useLocation } from "react-router-dom";

interface AppLayoutProps {
  children: ReactNode;
  notificationCount?: number;
}

// Public pages that should NOT show the mobile header
const PUBLIC_ROUTES = [
  '/',
  '/auth',
  '/privacy',
  '/terms',
  '/cookie-policy',
  '/500',
  '/404'
];

export const AppLayout = ({ children, notificationCount = 0 }: AppLayoutProps) => {
  const location = useLocation();
  
  // Don't render mobile header on public pages
  const shouldShowHeader = !PUBLIC_ROUTES.includes(location.pathname);
  
  return (
    <>
      {shouldShowHeader && <MobileHeader notificationCount={notificationCount} />}
      <main className="min-h-screen-safe overflow-y-auto overflow-x-hidden">
        {children}
      </main>
    </>
  );
};
