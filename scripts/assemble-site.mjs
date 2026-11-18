import { access, readFile, rename, writeFile } from 'node:fs/promises';

// Vite has already rebuilt the homepage dist and Atlas has verified its own output.
await access('dist/index.html');
await access('atlas/dist/index.html');
await access('atlas/dist/cesium/Cesium.js');
// Authenticated deployments also need the user's site session for the web manifest.
const atlasIndex = 'atlas/dist/index.html';
const html = await readFile(atlasIndex, 'utf8');
const manifest = '<link rel="manifest"';
if (!html.includes(manifest)) throw new Error('Missing Atlas web manifest');
await writeFile(atlasIndex, html.replace(manifest, manifest + ' crossorigin="use-credentials"'));
await rename('atlas/dist', 'dist/atlas');
