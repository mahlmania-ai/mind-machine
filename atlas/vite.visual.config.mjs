import { createBrowserViteConfig } from './build/vite.js';

// Frontend assets only: no environment loading, provider middleware or live services.
const config = createBrowserViteConfig({
  command: 'build',
  googleApiKey: '',
  cesiumToken: '',
  photonUrl: 'off',
  mapillaryToken: '',
  host: '127.0.0.1',
});
export default { ...config, base: '/atlas/', envDir: false, envPrefix: 'ATLAS_VISUAL_UNUSED_' };
