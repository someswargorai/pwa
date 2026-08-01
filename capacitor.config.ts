import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.nexus.storefront',
  appName: 'NexusStorefront',
  webDir: 'out',
  server: {
    url: 'https://pwa-gules-three.vercel.app',
    cleartext: true
  }
};

export default config;
