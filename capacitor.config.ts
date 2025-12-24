import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.companyname.appjogosloteria',
  appName: 'Nossa Loto',
  webDir: 'dist',
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      androidScaleType: 'CENTER_CROP',
    },
  },
  android: {
    allowMixedContent: true,
  },
};

export default config;
