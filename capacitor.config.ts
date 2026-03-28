import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.kindnesscommunityfoundation.app',
  appName: 'Kindness Community Foundation',
  webDir: 'dist',

  // Load the live website — always up to date, no rebundling needed
  server: {
    url: 'https://kindnesscommunityfoundation.com',
    cleartext: false,
    androidScheme: 'https',
  },

  android: {
    backgroundColor: '#030712',
    allowMixedContent: false,
  },

  ios: {
    backgroundColor: '#030712',
    contentInset: 'always',
  },

  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#030712',
      showSpinner: false,
      androidSplashResourceName: 'splash',
      iosSplashResourceName: 'Default',
    },
  },
};

export default config;
