import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.altf.voicerecorder',
  appName: 'Voice Recorder App',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    // Add any Capacitor plugin configurations here
  }
};

export default config;
