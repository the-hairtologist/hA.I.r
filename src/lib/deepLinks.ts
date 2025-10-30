/**
 * Deep Link System
 * Enables sharing specific appointments, formulas, and transformations
 * Drives viral growth through easy sharing
 */

export interface DeepLinkData {
  type: 'appointment' | 'formula' | 'transformation' | 'stylist' | 'booking';
  id: string;
  metadata?: Record<string, any>;
}

/**
 * Generate shareable deep link
 */
export function generateDeepLink(data: DeepLinkData): string {
  const baseUrl = window.location.origin;

  switch (data.type) {
    case 'appointment':
      return `${baseUrl}/appointment/${data.id}`;
    case 'formula':
      return `${baseUrl}/formula/${data.id}`;
    case 'transformation':
      return `${baseUrl}/transformation/${data.id}`;
    case 'stylist':
      return `${baseUrl}/stylist/${data.id}`;
    case 'booking':
      return `${baseUrl}/book/${data.id}`;
    default:
      return baseUrl;
  }
}

/**
 * Parse deep link and extract data
 */
export function parseDeepLink(url: string): DeepLinkData | null {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const parts = pathname.split('/').filter(Boolean);

    if (parts.length < 2) return null;

    const type = parts[0] as DeepLinkData['type'];
    const id = parts[1];

    if (
      [
        'appointment',
        'formula',
        'transformation',
        'stylist',
        'booking',
      ].includes(type)
    ) {
      return { type, id };
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Share deep link with native share API or fallback to clipboard
 */
export async function shareDeepLink(
  link: string,
  title: string,
  text: string
): Promise<boolean> {
  // Try native share API first (mobile)
  if (navigator.share) {
    try {
      await navigator.share({ title, text, url: link });
      return true;
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('Share failed:', error);
      }
      // User cancelled, that's ok
      return false;
    }
  }

  // Fallback to clipboard
  try {
    await navigator.clipboard.writeText(link);
    return true;
  } catch (error) {
    console.error('Clipboard copy failed:', error);
    return false;
  }
}

/**
 * Generate shareable transformation link with metadata
 */
export function generateTransformationShare(
  appointmentId: string,
  beforeImageUrl: string,
  afterImageUrl: string,
  stylistName: string
): { link: string; title: string; text: string } {
  const link = generateDeepLink({ type: 'transformation', id: appointmentId });
  const title = `My Hair Transformation by ${stylistName}`;
  const text = `Check out my amazing hair transformation! 💇‍♀️✨ Book your appointment with ${stylistName}`;

  return { link, title, text };
}

/**
 * Generate shareable booking link for stylist
 */
export function generateBookingShare(
  stylistId: string,
  stylistName: string,
  businessName?: string
): { link: string; title: string; text: string } {
  const link = generateDeepLink({ type: 'booking', id: stylistId });
  const title = businessName || `Book with ${stylistName}`;
  const text = `Book your next appointment with ${stylistName} on hA.I.r 💇‍♀️`;

  return { link, title, text };
}

/**
 * Generate Instagram story-ready metadata
 */
export function generateInstagramStoryMeta(transformationUrl: string): {
  backgroundColor: string;
  stickerUrl: string;
  contentUrl: string;
} {
  return {
    backgroundColor: '#7c3aed', // Brand purple
    stickerUrl: `${window.location.origin}/og-image.png`,
    contentUrl: transformationUrl,
  };
}
