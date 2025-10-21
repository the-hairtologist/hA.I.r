/**
 * Global Loading State Hook
 * Manages a centralized loading state that can be accessed across the app
 */

import { create } from 'zustand';

interface LoadingState {
  isLoading: boolean;
  message: string;
  setLoading: (isLoading: boolean, message?: string) => void;
}

export const useGlobalLoading = create<LoadingState>((set) => ({
  isLoading: false,
  message: 'Loading...',
  setLoading: (isLoading: boolean, message = 'Loading...') => 
    set({ isLoading, message }),
}));
