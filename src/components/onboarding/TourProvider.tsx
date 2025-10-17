/**
 * Tour Provider Component
 * Wraps app to provide tour functionality and contextual hints
 */

import { ReactNode } from 'react';
import { GuidedTour } from './GuidedTour';
import { QuickTips } from './QuickTips';

interface TourProviderProps {
  children: ReactNode;
}

export const TourProvider = ({ children }: TourProviderProps) => {
  return (
    <>
      {children}
      <GuidedTour />
      <QuickTips />
    </>
  );
};
