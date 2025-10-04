import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.a1a18f9db2f94d81aa8ce28408bee3a2',
  appName: 'Hair A.I.',
  webDir: 'dist',
  
  // Production configuration (comment out server block for production builds)
  server: {
    url: 'https://a1a18f9d-b2f9-4d81-aa8c-e28408bee3a2.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#ffffff',
      showSpinner: false,
      androidScaleType: 'CENTER_CROP',
      iosSpinnerStyle: 'small',
      splashFullScreen: true,
      splashImmersive: true,
    },
    Keyboard: {
      resize: 'native',
      style: 'dark',
      resizeOnFullScreen: true,
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#ffffff',
      overlaysWebView: false,
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
  
  ios: {
    contentInset: 'always',
    scheme: 'Hair A.I.',
    // Production settings - Replace YOUR_TEAM_ID with actual Apple Team ID
    buildOptions: {
      development_team: 'YOUR_TEAM_ID',
    },
  },
  
  android: {
    buildOptions: {
      keystorePath: undefined, // Set for production release
      keystoreAlias: undefined, // Set for production release
    },
    // Production settings
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false, // Disable for production
  },
};

export default config;
