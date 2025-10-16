/**
 * Tour Hook
 * Manages tour state and localStorage persistence
 */

import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { getTourByPath } from '@/config/tours';

const TOUR_STORAGE_KEY = 'hair-completed-tours';
const TOUR_DISMISSED_KEY = 'hair-dismissed-tours';

export function useTour() {
  const location = useLocation();
  const [isRunning, setIsRunning] = useState(false);
  const [currentTour, setCurrentTour] = useState<string | null>(null);

  const getCompletedTours = (): string[] => {
    try {
      const stored = localStorage.getItem(TOUR_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const getDismissedTours = (): string[] => {
    try {
      const stored = localStorage.getItem(TOUR_DISMISSED_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const markTourCompleted = useCallback((tourId: string) => {
    const completed = getCompletedTours();
    if (!completed.includes(tourId)) {
      localStorage.setItem(TOUR_STORAGE_KEY, JSON.stringify([...completed, tourId]));
    }
  }, []);

  const markTourDismissed = useCallback((tourId: string) => {
    const dismissed = getDismissedTours();
    if (!dismissed.includes(tourId)) {
      localStorage.setItem(TOUR_DISMISSED_KEY, JSON.stringify([...dismissed, tourId]));
    }
  }, []);

  const isTourCompleted = useCallback((tourId: string): boolean => {
    return getCompletedTours().includes(tourId);
  }, []);

  const isTourDismissed = useCallback((tourId: string): boolean => {
    return getDismissedTours().includes(tourId);
  }, []);

  const shouldShowTour = useCallback((tourId: string): boolean => {
    return !isTourCompleted(tourId) && !isTourDismissed(tourId);
  }, [isTourCompleted, isTourDismissed]);

  const startTour = useCallback((tourId?: string) => {
    const tour = tourId ? { id: tourId } : getTourByPath(location.pathname);
    if (tour) {
      setCurrentTour(tour.id);
      setIsRunning(true);
    }
  }, [location.pathname]);

  const endTour = useCallback(() => {
    if (currentTour) {
      markTourCompleted(currentTour);
    }
    setIsRunning(false);
    setCurrentTour(null);
  }, [currentTour, markTourCompleted]);

  const skipTour = useCallback(() => {
    if (currentTour) {
      markTourDismissed(currentTour);
    }
    setIsRunning(false);
    setCurrentTour(null);
  }, [currentTour, markTourDismissed]);

  const resetAllTours = useCallback(() => {
    localStorage.removeItem(TOUR_STORAGE_KEY);
    localStorage.removeItem(TOUR_DISMISSED_KEY);
  }, []);

  // Auto-start tour on page load if not completed
  useEffect(() => {
    const tour = getTourByPath(location.pathname);
    if (tour && shouldShowTour(tour.id)) {
      // Delay to ensure DOM elements are rendered
      const timer = setTimeout(() => {
        startTour(tour.id);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [location.pathname]);

  return {
    isRunning,
    currentTour,
    startTour,
    endTour,
    skipTour,
    shouldShowTour,
    isTourCompleted,
    resetAllTours,
  };
}
