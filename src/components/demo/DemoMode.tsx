/**
 * Demo Mode Context
 * Provides realistic demo data and enables demo mode across the app
 */

import { createContext, useContext, useState, ReactNode } from "react";

interface DemoContextValue {
  isDemoMode: boolean;
  enableDemo: () => void;
  disableDemo: () => void;
  demoData: {
    stylist: {
      appointments: number;
      clients: number;
      revenue: number;
      formulas: number;
    };
    client: {
      appointments: number;
      stylist: string;
      lastVisit: string;
    };
  };
}

const DemoContext = createContext<DemoContextValue | undefined>(undefined);

export function DemoModeProvider({ children }: { children: ReactNode }) {
  const [isDemoMode, setIsDemoMode] = useState(false);

  const demoData = {
    stylist: {
      appointments: 247,
      clients: 89,
      revenue: 47650,
      formulas: 312,
    },
    client: {
      appointments: 12,
      stylist: "Sarah Martinez",
      lastVisit: "2 weeks ago",
    },
  };

  return (
    <DemoContext.Provider
      value={{
        isDemoMode,
        enableDemo: () => setIsDemoMode(true),
        disableDemo: () => setIsDemoMode(false),
        demoData,
      }}
    >
      {children}
    </DemoContext.Provider>
  );
}

export function useDemoMode() {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error("useDemoMode must be used within DemoModeProvider");
  }
  return context;
}
