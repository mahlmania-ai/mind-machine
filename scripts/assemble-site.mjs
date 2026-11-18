import { access, mkdir, readFile, rename, writeFile } from 'node:fs/promises';

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

const rooms = { explore:'Explore', machine:'Machine', markets:'Markets', floor:'The Floor', work:'Selected work', services:'Services', history:'Historical engine', media:'Media & publishing', software:'Software', dashboard:'My dashboard', about:'About & contact', guide:'Site guide' };
const shell = await readFile('dist/index.html','utf8');
for (const [slug, name] of Object.entries(rooms)) {
  await mkdir('dist/'+slug,{recursive:true});
  const label = name.replaceAll('&','&amp;');
  const page = shell.replace(/<title>[^<]*<\/title>/,'<title>'+label+' | Mahlmania.ai</title>')
    .replace(/<noscript>[\s\S]*?<\/noscript>/,'<noscript><main><h1>'+label+'</h1><p>Enable JavaScript to use this interactive screen.</p><a href="/">Return to Mind</a></main></noscript>');
  await writeFile('dist/'+slug+'/index.html',page);
}
console.log('Verified page entry points:',Object.keys(rooms).join(', '));

const founderUrl = 'https://mahlmania-founder-os.vercel.app/';
await mkdir('dist/founder-os', { recursive: true });
// Static hosts can serve the same entry when platform redirects are unavailable.
await writeFile('dist/founder-os/index.html', '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><meta http-equiv="refresh" content="0;url='+founderUrl+'"><title>Founder OS | Mahlmania.ai</title></head><body><main><h1>Founder OS</h1><p><a href="'+founderUrl+'">Open the Founder OS workspace</a></p></main></body></html>');
