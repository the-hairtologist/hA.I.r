import { Share } from '@capacitor/share';
import { Platform } from './detector';

/**
 * Unified sharing API for both web and mobile
 * Web: Web Share API with clipboard fallback
 * Mobile: Native share sheet
 */

interface ShareOptions {
  /** Title of the shared content */
  title?: string;
  /** Text to share */
  text?: string;
  /** URL to share */
  url?: string;
  /** Dialog title (Android only) */
  dialogTitle?: string;
}

/**
 * Share content using native share sheet or Web Share API
 */
export const share = async (options: ShareOptions): Promise<boolean> => {
  const { title, text, url, dialogTitle } = options;

  if (Platform.isMobile) {
    try {
      await Share.share({
        title,
        text,
        url,
        dialogTitle,
      });
      return true;
    } catch (error) {
      console.error('Share failed:', error);
      return false;
    }
  } else {
    // Web Share API
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url,
        });
        return true;
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Share failed:', error);
        }
        return false;
      }
    } else {
      // Fallback: Copy to clipboard
      return copyToClipboard(url || text || '');
    }
  }
};

/**
 * Check if native sharing is available
 */
export const canShare = async (): Promise<boolean> => {
  if (Platform.isMobile) {
    try {
      const result = await Share.canShare();
      return result.value;
    } catch {
      return false;
    }
  } else {
    return !!navigator.share;
  }
};

/**
 * Copy text to clipboard
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textArea);
      return success;
    }
  } catch (error) {
    console.error('Copy to clipboard failed:', error);
    return false;
  }
};

/**
 * Share a stylist profile
 */
export const shareStylistProfile = async (
  stylistName: string,
  stylistId: string
): Promise<boolean> => {
  const url = `${window.location.origin}/stylist/${stylistId}`;
  return share({
    title: `Check out ${stylistName} on Hair A.I.`,
    text: `I found this amazing stylist: ${stylistName}`,
    url,
    dialogTitle: 'Share Stylist Profile',
  });
};

/**
 * Share appointment details
 */
export const shareAppointment = async (
  appointmentDate: string,
  stylistName: string
): Promise<boolean> => {
  return share({
    title: 'Hair Appointment',
    text: `I have an appointment with ${stylistName} on ${appointmentDate}`,
    dialogTitle: 'Share Appointment',
  });
};
