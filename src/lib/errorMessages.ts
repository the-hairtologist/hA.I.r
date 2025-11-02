/**
 * Improved Error Messages with Actionable Guidance
 * Provides context-aware, user-friendly error messages
 */

export interface ErrorMessageConfig {
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * Network-related errors
 */
export const networkErrors = {
  loadFailed: (resource: string, retry?: () => void): ErrorMessageConfig => ({
    title: `Couldn't load ${resource}`,
    description: 'Check your internet connection and try again',
    action: retry ? { label: 'Retry', onClick: retry } : undefined,
  }),

  connectionLost: (retry?: () => void): ErrorMessageConfig => ({
    title: 'Connection lost',
    description:
      "Your changes are saved locally and will sync when you're back online",
    action: retry ? { label: 'Retry Now', onClick: retry } : undefined,
  }),

  timeout: (resource: string, retry?: () => void): ErrorMessageConfig => ({
    title: 'Request timed out',
    description: `Taking longer than usual to load ${resource}. Check your connection and try again`,
    action: retry ? { label: 'Try Again', onClick: retry } : undefined,
  }),
};

/**
 * Authentication errors
 */
export const authErrors = {
  sessionExpired: (goToAuth: () => void): ErrorMessageConfig => ({
    title: 'Session expired',
    description: 'Please sign in again to continue',
    action: { label: 'Sign In', onClick: goToAuth },
  }),

  signOutFailed: (retry?: () => void): ErrorMessageConfig => ({
    title: "Couldn't sign out",
    description: 'Please try again or refresh the page',
    action: retry ? { label: 'Try Again', onClick: retry } : undefined,
  }),

  invalidCredentials: (): ErrorMessageConfig => ({
    title: 'Invalid credentials',
    description: 'Check your email and password, then try again',
  }),
};

/**
 * Form/Data errors
 */
export const dataErrors = {
  saveFailed: (resource: string, retry?: () => void): ErrorMessageConfig => ({
    title: `Couldn't save ${resource}`,
    description:
      "Your changes weren't saved. Check your connection and try again",
    action: retry ? { label: 'Try Again', onClick: retry } : undefined,
  }),

  updateFailed: (resource: string, retry?: () => void): ErrorMessageConfig => ({
    title: `Couldn't update ${resource}`,
    description: 'The update failed. Please try again or refresh the page',
    action: retry ? { label: 'Retry', onClick: retry } : undefined,
  }),

  deleteFailed: (resource: string): ErrorMessageConfig => ({
    title: `Couldn't delete ${resource}`,
    description: "The item wasn't deleted. Please try again",
  }),

  validationError: (field: string): ErrorMessageConfig => ({
    title: 'Invalid information',
    description: `Please check the ${field} field and try again`,
  }),
};

/**
 * Permission errors
 */
export const permissionErrors = {
  accessDenied: (goBack?: () => void): ErrorMessageConfig => ({
    title: 'Access denied',
    description: "You don't have permission to view this page",
    action: goBack ? { label: 'Go Back', onClick: goBack } : undefined,
  }),

  requiresAuth: (goToAuth: () => void): ErrorMessageConfig => ({
    title: 'Sign in required',
    description: 'You need to sign in to access this feature',
    action: { label: 'Sign In', onClick: goToAuth },
  }),
};

/**
 * Generic fallback
 */
export const genericError = (retry?: () => void): ErrorMessageConfig => ({
  title: 'Something went wrong',
  description: 'Please try again or contact support if the problem persists',
  action: retry ? { label: 'Try Again', onClick: retry } : undefined,
});
