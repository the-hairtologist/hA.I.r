/**
 * Capacitor Plugin Stubs for Production Web Builds
 * Provides mock implementations when native plugins aren't available
 */

// Haptics stubs
export const Haptics = {
  impact: async () => {},
  notification: async () => {},
  vibrate: async () => {},
  selectionStart: async () => {},
  selectionChanged: async () => {},
  selectionEnd: async () => {},
};

export const ImpactStyle = {
  Heavy: 'HEAVY',
  Medium: 'MEDIUM',
  Light: 'LIGHT',
};

export const NotificationType = {
  Success: 'SUCCESS',
  Warning: 'WARNING',
  Error: 'ERROR',
};

// Camera stubs
export const Camera = {
  getPhoto: async () => ({ 
    webPath: '', 
    format: 'jpeg',
    saved: false,
  }),
  pickImages: async () => ({ photos: [] }),
  checkPermissions: async () => ({ 
    camera: 'granted', 
    photos: 'granted' 
  }),
  requestPermissions: async () => ({ 
    camera: 'granted', 
    photos: 'granted' 
  }),
};

export const CameraResultType = {
  Uri: 'uri',
  Base64: 'base64',
  DataUrl: 'dataUrl',
};

export const CameraSource = {
  Prompt: 'PROMPT',
  Camera: 'CAMERA',
  Photos: 'PHOTOS',
};

export const CameraDirection = {
  Rear: 'REAR',
  Front: 'FRONT',
};

// Keyboard stubs
export const Keyboard = {
  show: async () => {},
  hide: async () => {},
  setAccessoryBarVisible: async () => {},
  setScroll: async () => {},
  setStyle: async () => {},
  setResizeMode: async () => {},
  addListener: () => ({ remove: () => {} }),
  removeAllListeners: async () => {},
};

export const KeyboardStyle = {
  Dark: 'DARK',
  Light: 'LIGHT',
  Default: 'DEFAULT',
};

export const KeyboardResize = {
  Body: 'body',
  Ionic: 'ionic',
  Native: 'native',
  None: 'none',
};
