/**
 * Capacitor Plugin Stubs for Production Web Builds
 * Provides mock implementations when native plugins aren't available
 */

/**
 * Core Capacitor API stub
 * Mimics @capacitor/core for web builds
 */
export const Capacitor = {
  getPlatform: () => 'web' as const,
  isNativePlatform: () => false,
  isPluginAvailable: () => false,
  convertFileSrc: (filePath: string) => filePath,

  // Plugin registry stubs
  registerPlugin: () => ({}),

  // Web view communication stubs
  nativeCallback: () => {},
  nativePromise: () => Promise.resolve(),

  // Exception stubs
  Exception: class CapacitorException extends Error {
    constructor(message: string, code?: string) {
      super(message);
      this.name = 'CapacitorException';
    }
  },
};

// Platform constants
export const CapacitorPlatforms = {
  Web: 'web',
  iOS: 'ios',
  Android: 'android',
};

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
    photos: 'granted',
  }),
  requestPermissions: async () => ({
    camera: 'granted',
    photos: 'granted',
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

// Preferences stubs
export const Preferences = {
  get: async () => ({ value: null }),
  set: async () => {},
  remove: async () => {},
  clear: async () => {},
  keys: async () => ({ keys: [] }),
  migrate: async () => {},
};

// App stubs
export const App = {
  addListener: () => ({ remove: () => {} }),
  removeAllListeners: async () => {},
  exitApp: async () => {},
  getInfo: async () => ({
    name: 'hair-ai-app',
    id: 'app.lovable.a1a18f9db2f94d81aa8ce28408bee3a2',
    build: '1',
    version: '1.0.0',
  }),
  getState: async () => ({ isActive: true }),
  getLaunchUrl: async () => ({ url: '' }),
  minimizeApp: async () => {},
};

// Share stubs
export const Share = {
  share: async () => {},
  canShare: async () => ({ value: false }),
};

// StatusBar stubs
export const StatusBar = {
  setStyle: async () => {},
  setBackgroundColor: async () => {},
  setOverlaysWebView: async () => {},
  show: async () => {},
  hide: async () => {},
  getInfo: async () => ({ visible: true, style: 'LIGHT', color: '#000000' }),
};

export const Style = {
  Dark: 'DARK',
  Light: 'LIGHT',
  Default: 'DEFAULT',
};
