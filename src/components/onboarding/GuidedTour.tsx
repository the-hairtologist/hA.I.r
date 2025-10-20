/**
 * Guided Tour Component
 * Main tour component using react-joyride
 */

import { useEffect } from 'react';
import Joyride, { CallBackProps, STATUS, EVENTS } from 'react-joyride';
import { useTour } from '@/hooks/useTour';
import { tours } from '@/config/tours';
import { TourTooltip } from './TourTooltip';

export const GuidedTour = () => {
  const { isRunning, currentTour, endTour, skipTour } = useTour();

  const tour = currentTour ? tours[currentTour] : null;

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, type, action } = data;

    // Handle tour completion
    if (status === STATUS.FINISHED) {
      endTour();
      return;
    }

    // Handle tour skip
    if (status === STATUS.SKIPPED) {
      skipTour();
      return;
    }

    // Handle close button click
    if (type === EVENTS.TOUR_END) {
      endTour();
      return;
    }

    // Handle target not found - continue tour
    if (type === EVENTS.TARGET_NOT_FOUND) {
      // Continue tour
    }
  };

  if (!isRunning || !tour) {
    return null;
  }

  return (
    <Joyride
      steps={tour.steps}
      run={isRunning}
      continuous
      showProgress={false}
      showSkipButton={false}
      disableOverlayClose
      spotlightClicks
      callback={handleJoyrideCallback}
      tooltipComponent={TourTooltip}
      styles={{
        options: {
          zIndex: 10000,
        },
        overlay: {
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        },
        spotlight: {
          borderRadius: 0,
        },
      }}
      locale={{
        back: 'Back',
        close: 'Close',
        last: 'Finish',
        next: 'Next',
        skip: 'Skip Tour',
      }}
    />
  );
};
