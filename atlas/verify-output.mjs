import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const [sourceArg, outputArg] = process.argv.slice(2);
if (!sourceArg || !outputArg) throw new Error('Usage: node verify-output.mjs SOURCE OUTPUT');
const source = path.resolve(sourceArg);
const output = path.resolve(outputArg);
const root = path.dirname(fileURLToPath(import.meta.url));
const pin = JSON.parse(await fs.readFile(path.join(root, 'upstream-pin.json'), 'utf8'));
const hash = async (file) => createHash('sha256').update(await fs.readFile(file)).digest('hex');

// vite-plugin-cesium includes Vite's URL base in its output path. The root
// site mounts this complete directory at /atlas/, so remove that one duplicate
// directory prefix while keeping every Cesium asset byte-identical.
const nestedCesium = path.join(output, 'atlas', 'cesium');
if (await fs.stat(nestedCesium).then(stat => stat.isDirectory()).catch(() => false)) {
  if (await fs.stat(path.join(output, 'cesium')).then(() => true).catch(() => false)) {
    throw new Error('Ambiguous Cesium output: both prefixed and root directories exist');
  }
  await fs.rename(nestedCesium, path.join(output, 'cesium'));
  if ((await fs.readdir(path.join(output, 'atlas'))).length === 0) await fs.rmdir(path.join(output, 'atlas'));
}

async function files(dir) {
  const result = [];
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) result.push(...await files(file));
    else if (entry.isFile()) result.push(file);
  }
  return result;
}
async function compareTree(from, to) {
  const paths = (await fs.stat(from)).isDirectory() ? await files(from) : [from];
  for (const file of paths) {
    const target = paths.length === 1 && file === from && !(await fs.stat(from)).isDirectory()
      ? to : path.join(to, path.relative(from, file));
    if (await hash(file) !== await hash(target)) throw new Error(`Output mismatch: ${target}`);
  }
  return paths.length;
}

let cesiumFiles = 0;
for (const name of ['Assets', 'ThirdParty', 'Workers', 'Widgets', 'Cesium.js']) {
  cesiumFiles += await compareTree(path.join(source, 'node_modules/cesium/Build/Cesium', name), path.join(output, 'cesium', name));
}
const floodFiles = await compareTree(path.join(source, 'public/events/bhote-koshi-2026'), path.join(output, 'events/bhote-koshi-2026'));
const cableSource = path.join(source, 'src/data/local_data/telegeography_submarine_cables');
const emitted = await fs.readdir(path.join(output, 'assets'));
for (const name of ['cable-geo', 'landing-point-geo']) {
  const asset = emitted.find(file => file.startsWith(`${name}-`) && file.endsWith('.json'));
  if (!asset) throw new Error(`Missing bundled cable data: ${name}`);
  if (await hash(path.join(cableSource, `${name}.json`)) !== await hash(path.join(output, 'assets', asset))) {
    throw new Error(`Bundled cable bytes differ: ${name}`);
  }
}
const html = await fs.readFile(path.join(output, 'index.html'), 'utf8');
if (!html.includes('<title>Atlas | Mahlmania.ai</title>') || !html.includes('MAHLMANIA')) throw new Error('Approved branding is missing');
for (const match of html.matchAll(/(?:src|href)="(\/[^"?#]+\.(?:js|css))"/g)) {
  const relative = match[1].replace(/^\/atlas\//, '/');
  if (!(await fs.stat(path.join(output, relative))).isFile()) throw new Error(`Missing entry asset ${match[1]}`);
}
for (const name of ['LICENSE', 'THIRD_PARTY_NOTICES.md', 'DATA_SOURCES.md']) {
  await fs.copyFile(path.join(source, name), path.join(output, name));
}
const provenance = {
  upstream: pin.repository, revision: pin.revision, archiveSha256: pin.archiveSha256,
  packageLockSha256: pin.packageLockSha256, brandingPatchSha256: pin.brandingPatchSha256,
  builtAt: new Date().toISOString(), buildMode: 'frontend-only', providerServerIncluded: false,
  basePath: html.includes('src="/atlas/') ? '/atlas/' : '/',
  providerServerStarted: false, credentialsConfigured: false,
  cesiumFilesByteVerified: cesiumFiles, floodFilesByteVerified: floodFiles,
  submarineCableDatasetsByteVerified: 2,
  notice: 'Bundled third-party data retains its original license and attribution; no commercial permission is implied. Runtime serving policy is configured separately.',
};
await fs.writeFile(path.join(output, 'SOURCE-PROVENANCE.json'), JSON.stringify(provenance, null, 2) + '\n');
console.log(JSON.stringify(provenance, null, 2));
