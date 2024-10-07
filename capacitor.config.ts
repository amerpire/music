import { CapacitorConfig } from '@capacitor/cli';
import { env } from './envs/env';

const config: CapacitorConfig = {
  appId: 'com.amerpire.music',
  appName: 'Amerpire Music',
  webDir: 'www',
  ...env,
};

export default config;
