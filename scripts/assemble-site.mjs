import { access, rename } from 'node:fs/promises';

// Vite has already rebuilt the homepage dist and Atlas has verified its own output.
await access('dist/index.html');
await access('atlas/dist/index.html');
await access('atlas/dist/cesium/Cesium.js');
await rename('atlas/dist', 'dist/atlas');
