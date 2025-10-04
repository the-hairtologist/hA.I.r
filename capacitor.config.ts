import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.a1a18f9db2f94d81aa8ce28408bee3a2',
  appName: 'hA.I.r',
  webDir: 'dist',
  server: {
    url: 'https://a1a18f9d-b2f9-4d81-aa8c-e28408bee3a2.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#FFFFFF",
      showSpinner: false,
    },
    Keyboard: {
      resize: 'body',
      style: 'dark',
      resizeOnFullScreen: true
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#FFFFFF'
    }
  },
  ios: {
    contentInset: 'always',
    scheme: 'hair'
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true
  }
};

export default config;
