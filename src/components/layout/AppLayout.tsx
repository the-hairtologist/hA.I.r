/**
 * AppLayout - Main application layout wrapper
 * Includes mobile header and main content area
 */

import { MobileHeader } from "@/components/MobileHeader";
import { ReactNode } from "react";

interface AppLayoutProps {
  children: ReactNode;
  notificationCount?: number;
}

export const AppLayout = ({ children, notificationCount = 0 }: AppLayoutProps) => {
  return (
    <>
      <MobileHeader notificationCount={notificationCount} />
      <main className="min-h-screen">
        {children}
      </main>
    </>
  );
};
