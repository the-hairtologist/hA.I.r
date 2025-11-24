/**
 * Tour Provider Component
 * Wraps app to provide tour functionality
 */

import { ReactNode } from 'react';
import { GuidedTour } from './GuidedTour';

interface TourProviderProps {
  children: ReactNode;
}

export const TourProvider = ({ children }: TourProviderProps) => {
  return (
    <>
      {children}
      <GuidedTour />
    </>
  );
};
