/**
 * ARIA Label Utilities
 * Helpers for generating accessible labels and descriptions
 */

/**
 * Generate accessible label for time/date
 */
export function getTimeLabel(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  }).format(dateObj);
}

/**
 * Generate accessible label for currency
 */
export function getCurrencyLabel(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Generate accessible label for percentage
 */
export function getPercentageLabel(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)} percent`;
}

/**
 * Generate accessible label for status badge
 */
export function getStatusLabel(status: string, context?: string): string {
  const labels: Record<string, string> = {
    pending: 'Pending',
    completed: 'Completed',
    cancelled: 'Cancelled',
    confirmed: 'Confirmed',
    active: 'Active',
    inactive: 'Inactive',
    paid: 'Paid',
    unpaid: 'Unpaid',
  };

  const label = labels[status.toLowerCase()] || status;
  return context ? `${context} status: ${label}` : `Status: ${label}`;
}

/**
 * Generate accessible label for file upload
 */
export function getFileUploadLabel(
  fileName?: string,
  fileType?: string,
  fileSize?: number
): string {
  if (!fileName) return 'No file selected';

  const parts = [fileName];

  if (fileType) {
    parts.push(`type: ${fileType}`);
  }

  if (fileSize) {
    const sizeInKB = Math.round(fileSize / 1024);
    parts.push(`size: ${sizeInKB} kilobytes`);
  }

  return parts.join(', ');
}

/**
 * Generate accessible label for pagination
 */
export function getPaginationLabel(
  currentPage: number,
  totalPages: number
): string {
  return `Page ${currentPage} of ${totalPages}`;
}

/**
 * Generate accessible label for loading state
 */
export function getLoadingLabel(context?: string): string {
  return context ? `Loading ${context}` : 'Loading';
}

/**
 * Generate accessible label for error state
 */
export function getErrorLabel(error: string, context?: string): string {
  if (context) {
    return `Error in ${context}: ${error}`;
  }
  return `Error: ${error}`;
}

/**
 * Generate accessible label for form field with validation
 */
export function getFormFieldLabel(
  label: string,
  required: boolean = false,
  error?: string,
  hint?: string
): {
  label: string;
  ariaLabel: string;
  ariaDescribedBy?: string;
  ariaInvalid?: boolean;
  ariaRequired?: boolean;
} {
  const ariaLabel = required ? `${label}, required` : label;
  const descriptions: string[] = [];

  if (hint) descriptions.push(hint);
  if (error) descriptions.push(error);

  return {
    label,
    ariaLabel,
    ariaDescribedBy: descriptions.length > 0 ? descriptions.join('. ') : undefined,
    ariaInvalid: !!error,
    ariaRequired: required,
  };
}

/**
 * Generate accessible label for interactive list items
 */
export function getListItemLabel(
  item: string,
  index: number,
  total: number,
  actions?: string[]
): string {
  const position = `Item ${index + 1} of ${total}`;
  const actionsText = actions?.length
    ? `. Available actions: ${actions.join(', ')}`
    : '';

  return `${item}. ${position}${actionsText}`;
}

/**
 * Generate accessible label for toggles/switches
 */
export function getToggleLabel(
  label: string,
  state: boolean,
  context?: string
): string {
  const stateText = state ? 'on' : 'off';
  const contextText = context ? ` for ${context}` : '';
  return `${label}${contextText}, currently ${stateText}`;
}

/**
 * Generate accessible label for modals/dialogs
 */
export function getDialogLabel(
  title: string,
  type: 'modal' | 'alert' | 'confirmation' = 'modal'
): {
  role: string;
  ariaLabel: string;
  ariaModal: boolean;
} {
  const roleMap = {
    modal: 'dialog',
    alert: 'alertdialog',
    confirmation: 'alertdialog',
  };

  return {
    role: roleMap[type],
    ariaLabel: title,
    ariaModal: true,
  };
}

/**
 * Generate accessible label for tabs
 */
export function getTabLabel(
  label: string,
  index: number,
  total: number,
  isActive: boolean
): string {
  const position = `Tab ${index + 1} of ${total}`;
  const status = isActive ? 'selected' : 'not selected';
  return `${label}. ${position}, ${status}`;
}

/**
 * Generate accessible label for progress indicators
 */
export function getProgressLabel(
  current: number,
  total: number,
  context?: string
): {
  ariaLabel: string;
  ariaValueNow: number;
  ariaValueMin: number;
  ariaValueMax: number;
  ariaValueText: string;
} {
  const percentage = Math.round((current / total) * 100);
  const contextText = context ? ` for ${context}` : '';

  return {
    ariaLabel: `Progress${contextText}`,
    ariaValueNow: current,
    ariaValueMin: 0,
    ariaValueMax: total,
    ariaValueText: `${current} of ${total} completed, ${percentage} percent`,
  };
}

/**
 * Generate accessible label for notifications
 */
export function getNotificationLabel(
  message: string,
  type: 'info' | 'success' | 'warning' | 'error',
  count?: number
): {
  role: string;
  ariaLive: 'polite' | 'assertive';
  ariaAtomic: boolean;
  ariaLabel: string;
} {
  const typeLabel = type.charAt(0).toUpperCase() + type.slice(1);
  const countText = count ? ` (${count} notification${count > 1 ? 's' : ''})` : '';
  
  return {
    role: type === 'error' ? 'alert' : 'status',
    ariaLive: type === 'error' ? 'assertive' : 'polite',
    ariaAtomic: true,
    ariaLabel: `${typeLabel} notification${countText}: ${message}`,
  };
}

/**
 * Generate accessible label for avatars/images
 */
export function getAvatarLabel(
  name: string,
  role?: string,
  status?: 'online' | 'offline' | 'away'
): string {
  const parts = [`Avatar for ${name}`];
  
  if (role) parts.push(`role: ${role}`);
  if (status) parts.push(`status: ${status}`);

  return parts.join(', ');
}

/**
 * Generate accessible sort labels for tables
 */
export function getSortLabel(
  columnName: string,
  sortDirection?: 'asc' | 'desc' | null
): {
  ariaLabel: string;
  ariaSort: 'ascending' | 'descending' | 'none';
} {
  let ariaLabel: string;
  let ariaSort: 'ascending' | 'descending' | 'none';

  if (!sortDirection) {
    ariaLabel = `Sort ${columnName}`;
    ariaSort = 'none';
  } else if (sortDirection === 'asc') {
    ariaLabel = `${columnName}, sorted ascending. Click to sort descending`;
    ariaSort = 'ascending';
  } else {
    ariaLabel = `${columnName}, sorted descending. Click to remove sort`;
    ariaSort = 'descending';
  }

  return { ariaLabel, ariaSort };
}
