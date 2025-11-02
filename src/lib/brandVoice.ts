/**
 * Brand Voice & Messaging Guidelines
 * God-Tier Persuasion & Communication Blueprint
 *
 * Built from psychology of influence, empathy, and habit-forming design.
 * Every word is a behavioral nudge combining logic, emotion, and identity.
 */

// Brand Archetype: The Mentor-Friend
// Warm, witty, wise. Not teaching—reminding them they already know.
export const BRAND_PERSONALITY = {
  // The calm in their storm
  tone: 'confident, empathetic, grounded',
  // Speak to what they feel, not what they do
  voice: 'conversational, rhythmic, validating',
  // The exhale after a long day
  visual: 'relief meets creativity',
  // Core positioning
  promise: 'No more chaos. Just clients, color, and calm.',
};

// Psychological Levers - Trigger engagement through identity
export const PSYCHOLOGICAL_LEVERS = {
  autonomy: 'Your chair. Your clients. Your rules.',
  competence: 'You already have the skill—this makes it unstoppable.',
  belonging: 'Built for stylists, not salons.',
  relief: 'No more chasing DMs. Drop one link and breathe.',
};

// Curiosity Triggers - Mystery + proof without revealing everything
export const CURIOSITY_TRIGGERS = [
  'What if your booking link worked harder than you?',
  'How many hours could you win back if cancellations filled themselves?',
  'Your clients will think you hired an assistant.',
  'You bring the color. We handle the chaos.',
];

// Conversational Flow: Empathy → Agitate → Solution → Vision
// Short rhythmic sentences. 3-5 words per phrase feels conversational.
export const MESSAGES = {
  // Success messages - relief + validation
  success: {
    appointmentBooked: 'Locked in. One less thing to track.',
    appointmentUpdated: "Updated. You're all set.",
    appointmentCancelled: "Cancelled. Slot's open again.",
    profileUpdated: 'Saved. Looking sharp.',
    clientAdded: 'Added. Their journey starts now.',
    formulaSaved: 'Saved. Your winning recipe is locked in.',
    messageSent: "Sent. They'll love hearing from you.",
    reviewPosted: 'Posted. Your voice helps the community.',
    serviceCreated: 'Live. Ready for bookings.',
    scheduleUpdated: "Updated. You're in control.",
  },

  // Error messages - empathetic partner, not critic
  errors: {
    generic: "Something slipped. Let's give that another shot.",
    network: 'Connection lost. Check your signal and try again.',
    notFound: "Can't find that. Double-check and we'll look again.",
    unauthorized: 'Need to sign in first. Takes two seconds.',
    validation: "Almost there. Quick fix and you're good.",
    conflict: "That slot's taken. Pick another time?",
  },

  // Loading states - calm confidence
  loading: {
    generic: 'One moment...',
    dashboard: 'Loading your space...',
    appointments: 'Pulling your schedule...',
    clients: 'Loading your roster...',
    formulas: 'Grabbing your formulas...',
    saving: 'Saving...',
    processing: 'Working on it...',
  },

  // Empty states - identity + relief + vision
  emptyStates: {
    noAppointments: {
      title: 'Your calendar is clear.',
      description:
        'No chaos. No double-bookings. Just space for your next masterpiece.',
      action: 'Book Your First',
    },
    noClients: {
      title: 'Your roster starts here.',
      description:
        'Track their color journey. Remember their preferences. Build loyalty that lasts.',
      action: 'Add First Client',
    },
    noFormulas: {
      title: 'Your color genius lives here.',
      description:
        'Save winning formulas once. Recreate perfection every time.',
      action: 'Save First Formula',
    },
    noMessages: {
      title: 'Inbox: calm.',
      description:
        "When clients reach out, you'll see them here. No more lost DMs.",
    },
    noReviews: {
      title: 'Your work speaks volumes.',
      description: "Client love notes will land here. They're coming.",
    },
  },

  // Confirmations - clear, no pressure
  confirmations: {
    delete: "Delete this? Can't undo.",
    cancel: "Cancel? They'll get a heads up.",
    signOut: "Sign out? We'll be here when you're back.",
    leave: "Leave without saving? Changes won't stick.",
  },

  // Hints - whispered wisdom, not lectures
  hints: {
    firstTime: "First time? Two-minute tour. You'll thank us.",
    profileIncomplete: 'Finish your profile. Unlock everything.',
    noPhone: 'Add your number. Never miss a reminder.',
    noAvatar: 'Pick an avatar. Make it yours.',
    tips: {
      appointment: 'Pro move: Book 24 hours ahead. Less scramble.',
      formula: 'Pro move: Add photos. Memory aid for next time.',
      client: 'Pro move: Detailed notes. Better service every visit.',
    },
  },
};

// Action button labels - momentum, not pressure
export const ACTIONS = {
  primary: {
    book: 'Book It',
    create: 'Create',
    save: 'Save',
    update: 'Update',
    add: 'Add',
    send: 'Send',
    confirm: 'Lock It In',
    continue: 'Keep Going',
    finish: 'Done',
    start: 'Start Now',
  },
  secondary: {
    cancel: 'Cancel',
    back: 'Back',
    skip: 'Skip',
    later: 'Later',
    dismiss: 'Got It',
    close: 'Close',
  },
  tertiary: {
    learnMore: 'Learn More',
    viewAll: 'See All',
    seeDetails: 'Details',
    explore: 'Explore',
  },
};

// Signature Phrases - The Mentor-Friend Voice
export const SIGNATURE_PHRASES = {
  empathy: 'We see the artist in your hustle.',
  support: 'You make magic. We make it easier.',
  identity: 'Color genius meets calm business.',
  relief: 'Less chaos, more confidence.',
  vision: 'You bring the art. hA.I.r brings the rest.',
};

// The Persuasion Triad - Every message blends all three
export const PERSUASION_TRIAD = {
  logic: 'One app for everything.',
  emotion: 'Less chaos, more confidence.',
  identity: 'Built by people who get hair.',
};

// Helper function to get contextual messages
export const getBrandMessage = (
  type: keyof typeof MESSAGES,
  key: string,
  fallback?: string
): string => {
  const message = (MESSAGES[type] as any)?.[key];
  return message || fallback || MESSAGES.errors.generic;
};
