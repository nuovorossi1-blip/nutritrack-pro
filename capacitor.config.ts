import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.nutritrack.pro',
  appName: 'NutriTrack PRO',
  webDir: 'www',
  server: { url: 'https://nutritrack-pro-zeta.vercel.app', cleartext: false, errorPath: 'offline.html' },
  android: { allowMixedContent: false, backgroundColor: '#0a0a0a' },
  plugins: { SystemBars: { insetsHandling: 'css', initialViewportFitValueHint: 'contain' } },
};
export default config;
