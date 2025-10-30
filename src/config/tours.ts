/**
 * Tour Configuration
 * Defines guided tours for different pages and user roles
 */

import type { Step } from 'react-joyride';

export interface TourConfig {
  id: string;
  name: string;
  steps: Step[];
  roles?: ('admin' | 'stylist' | 'client')[];
}

export const tours: Record<string, TourConfig> = {
  dashboard: {
    id: 'dashboard',
    name: 'Dashboard Tour',
    roles: ['stylist', 'admin'],
    steps: [
      {
        target: 'body',
        content:
          '👋 Welcome to hA.I.r! Let me show you around your new hair salon management platform.',
        placement: 'center',
        disableBeacon: true,
      },
      {
        target: '[data-tour="sidebar"]',
        content:
          '📍 This is your main navigation. Access Clients, Appointments, AI Assistant, and more from here.',
        placement: 'right',
      },
      {
        target: '[data-tour="settings"]',
        content:
          '⚙️ First, complete your profile in Settings. Add your business name, specialty, and location so clients can find you. (Takes 2 minutes)',
        placement: 'left',
      },
      {
        target: '[data-tour="quick-actions"]',
        content:
          '⚡ Quick Actions let you add clients, book appointments, and access AI tools with one click.',
        placement: 'bottom',
      },
      {
        target: '[data-tour="quick-actions"]',
        content:
          '👥 Next, add your first client to see how the Hair Memory Timeline works. You can import existing clients or add new ones. (Takes 2 minutes)',
        placement: 'bottom',
      },
      {
        target: '[data-tour="quick-actions"]',
        content:
          '📅 Then, set up your availability so clients can book appointments. Update this anytime in Schedule Management. (Takes 3 minutes)',
        placement: 'bottom',
      },
      {
        target: '[data-tour="ai-assistant"]',
        content:
          '🤖 Your AI Assistant can help with formulas, client insights, and business questions. Ask anything!',
        placement: 'left',
      },
      {
        target: 'body',
        content:
          '🎨 Upload portfolio photos to showcase your work and attract new clients. Build your Hair Memory Timeline!',
        placement: 'center',
      },
      {
        target: 'body',
        content:
          '💡 Pro Tip: Use Visual Edits to customize text, colors, and fonts instantly for FREE! Click the Edit button in the chat box, then click any element to modify it without using AI credits.',
        placement: 'center',
      },
    ],
  },

  clients: {
    id: 'clients',
    name: 'Client Management Tour',
    roles: ['stylist', 'admin'],
    steps: [
      {
        target: '[data-tour="add-client-btn"]',
        content:
          '➕ Click here to add your first client. You can also press Ctrl+N as a shortcut!',
        placement: 'bottom',
        disableBeacon: true,
      },
      {
        target: '[data-tour="search-bar"]',
        content:
          '🔍 Search clients by name, email, or phone. Results update as you type!',
        placement: 'bottom',
      },
      {
        target: '[data-tour="filters"]',
        content:
          '🎯 Filter clients by activity status or risk level to prioritize follow-ups.',
        placement: 'left',
      },
      {
        target: '[data-tour="client-card"]',
        content:
          '💳 Client cards show key info, risk indicators, and quick actions. Click to see full details.',
        placement: 'top',
      },
      {
        target: '[data-tour="export-btn"]',
        content:
          '📤 Export your client list to CSV for reports or backups. Press Ctrl+E!',
        placement: 'left',
      },
    ],
  },

  aiAssistant: {
    id: 'aiAssistant',
    name: 'AI Assistant Tour',
    roles: ['stylist', 'admin'],
    steps: [
      {
        target: '[data-tour="chat-input"]',
        content:
          '💬 Type your questions here! Ask about formulas, client history, or business advice.',
        placement: 'top',
        disableBeacon: true,
      },
      {
        target: '[data-tour="client-context"]',
        content:
          '👤 Select a client to get personalized insights and formula recommendations.',
        placement: 'bottom',
      },
      {
        target: '[data-tour="example-prompts"]',
        content:
          '💡 Not sure what to ask? Try these example prompts to get started!',
        placement: 'left',
      },
      {
        target: '[data-tour="chat-history"]',
        content:
          '📜 Your conversation history is saved. Scroll up to review previous insights.',
        placement: 'left',
      },
    ],
  },

  formulas: {
    id: 'formulas',
    name: 'Formula Management Tour',
    roles: ['stylist', 'admin'],
    steps: [
      {
        target: '[data-tour="create-formula"]',
        content: '🧪 Create custom color formulas for your clients here.',
        placement: 'bottom',
        disableBeacon: true,
      },
      {
        target: '[data-tour="link-client"]',
        content:
          '🔗 Link formulas to clients so you can track their color history.',
        placement: 'bottom',
      },
      {
        target: '[data-tour="upload-photo"]',
        content:
          '📸 Upload before/after photos to document results and build your portfolio.',
        placement: 'left',
      },
      {
        target: '[data-tour="search-formulas"]',
        content: '🔎 Search formulas by client name or color details.',
        placement: 'bottom',
      },
    ],
  },
};

export const getTourByPath = (path: string): TourConfig | null => {
  const pathMap: Record<string, string> = {
    '/dashboard': 'dashboard',
    '/clients': 'clients',
    '/ai': 'aiAssistant',
    '/ai-assistant': 'aiAssistant',
    '/formulas': 'formulas',
  };

  const tourId = pathMap[path];
  return tourId ? tours[tourId] : null;
};
