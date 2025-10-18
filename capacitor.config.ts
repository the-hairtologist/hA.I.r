import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.a1a18f9db2f94d81aa8ce28408bee3a2',
  appName: 'hA.I.r Pro',
  webDir: 'dist',
  // IMPORTANT: For production builds, comment out the server config below
  // The server config is ONLY for development hot-reload
  // For store submissions, build should use local 'dist' folder
  // Uncomment for development:
  // server: {
  //   url: 'https://a1a18f9d-b2f9-4d81-aa8c-e28408bee3a2.lovableproject.com?forceHideBadge=true',
  //   cleartext: true,
  // },
  android: {
    allowMixedContent: true,
    backgroundColor: '#ffffff',
    captureInput: true,
    // Enable hardware acceleration
    webContentsDebuggingEnabled: false,
  },
  ios: {
    contentInset: 'automatic',
    backgroundColor: '#ffffff',
    // Improved scrolling performance
    scrollEnabled: true,
    allowsInlineMediaPlayback: true,
    // Splash screen configuration
    splashDuration: 2000,
    splashFadeOutDuration: 500,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#ffffff',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      iosSpinnerStyle: 'small',
      spinnerColor: '#999999',
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
};

export default config;
