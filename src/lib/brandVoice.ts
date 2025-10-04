/**
 * Brand Voice & Messaging Guidelines
 * Consistent, delightful messaging across the app
 */

// Brand personality traits
export const BRAND_PERSONALITY = {
  // Professional but friendly
  tone: 'warm, encouraging, confident',
  // Empowering language
  voice: 'clear, action-oriented, supportive',
  // Visual style
  visual: 'vibrant, playful, modern',
};

// Consistent messaging patterns
export const MESSAGES = {
  // Success messages - celebrate wins!
  success: {
    appointmentBooked: "🎉 Appointment booked! Get ready to shine!",
    appointmentUpdated: "✨ All set! Your appointment has been updated.",
    appointmentCancelled: "Appointment cancelled. We'll miss you!",
    profileUpdated: "Looking good! Profile updated successfully.",
    clientAdded: "🎊 New client added! Time to work some magic.",
    formulaSaved: "✨ Formula saved! Your secret recipe is secured.",
    messageSent: "Message sent! They'll love hearing from you.",
    reviewPosted: "Thanks for sharing! Your review helps stylists shine.",
    serviceCreated: "Service added! Ready to showcase your skills.",
    scheduleUpdated: "Schedule updated! Your time, your way.",
  },

  // Error messages - empathetic and helpful
  errors: {
    generic: "Oops! Something went wrong. Let's try that again.",
    network: "Connection hiccup! Check your internet and try again.",
    notFound: "We couldn't find that. Double-check and try again?",
    unauthorized: "You'll need to log in first. Quick and easy!",
    validation: "Almost there! Just fix these details and you're good to go.",
    conflict: "That time slot is already taken. Pick another?",
  },

  // Loading states - keep it light
  loading: {
    generic: "Just a moment...",
    dashboard: "Loading your dashboard...",
    appointments: "Gathering your appointments...",
    clients: "Loading your client list...",
    formulas: "Fetching your formulas...",
    saving: "Saving...",
    processing: "Processing...",
  },

  // Empty states - encouraging and actionable
  emptyStates: {
    noAppointments: {
      title: "Your calendar awaits!",
      description: "No appointments yet. Start booking and watch your business grow!",
      action: "Book First Appointment",
    },
    noClients: {
      title: "Build your dream team!",
      description: "Add clients to keep track of their hair journey and preferences.",
      action: "Add Your First Client",
    },
    noFormulas: {
      title: "Create color magic!",
      description: "Save your winning formulas so you can recreate perfection every time.",
      action: "Create First Formula",
    },
    noMessages: {
      title: "Inbox zero achieved!",
      description: "No messages yet. When clients reach out, you'll see them here.",
    },
    noReviews: {
      title: "Reviews coming soon!",
      description: "Your amazing work will speak for itself. Client reviews will appear here.",
    },
  },

  // Confirmations - clear and friendly
  confirmations: {
    delete: "Are you sure? This can't be undone.",
    cancel: "Cancel this appointment? They'll be notified.",
    signOut: "Sign out? We'll be here when you're ready to return!",
    leave: "Leave without saving? Your changes won't be saved.",
  },

  // Tooltips & hints - helpful nudges
  hints: {
    firstTime: "New here? Follow our quick tour to get started!",
    profileIncomplete: "Complete your profile to unlock all features.",
    noPhone: "Add your phone number to receive appointment reminders.",
    noAvatar: "Choose an avatar that represents you!",
    tips: {
      appointment: "💡 Pro tip: Book appointments at least 24 hours in advance.",
      formula: "💡 Pro tip: Add photos to your formulas for better reference.",
      client: "💡 Pro tip: Keep detailed notes for better service each visit.",
    },
  },
};

// Action button labels - action-oriented and clear
export const ACTIONS = {
  primary: {
    book: "Book Now",
    create: "Create",
    save: "Save Changes",
    update: "Update",
    add: "Add",
    send: "Send",
    confirm: "Confirm",
    continue: "Continue",
    finish: "Finish",
    start: "Get Started",
  },
  secondary: {
    cancel: "Cancel",
    back: "Go Back",
    skip: "Skip",
    later: "Maybe Later",
    dismiss: "Dismiss",
    close: "Close",
  },
  tertiary: {
    learnMore: "Learn More",
    viewAll: "View All",
    seeDetails: "See Details",
    explore: "Explore",
  },
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
