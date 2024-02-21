import { CapacitorConfig } from '@capacitor/cli';
import { env } from './envs/env';

const config: CapacitorConfig = {
  appId: 'yt.music.player',
  appName: 'YT Music',
  webDir: 'www',
  ...env,
};

export default config;
