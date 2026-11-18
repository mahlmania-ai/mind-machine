import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

// Exact pre/post images of the five files in the preserved branding patch.
// Preimages were read from the pinned GitHub revision; postimages match the
// previously verified approved branding. No fuzzy matching is permitted.
const images = new Map([
  ['index.html', ['ada782a02919cff717855a0c63bb4579ae40d9850431b9406b5fddb90c949304', '693759e1cb2ca9c75806f827b42718537bc3d7741befdab97f4cf568074c828f']],
  ['public/manifest.webmanifest', ['a9020715c498e7fea0ae486952c4f795090ebfa4add7f729636b1d64bf8439a5', '11bac1372de19b7b611650f8e2f92dcb956766c48e79c5747acadd40b8c83b55']],
  ['src/ui/frameRateView.test.mjs', ['8639c50aad482c6d1c804b2ad0d4e41d7dd3633dd126a2a3ed7661cae4ea696b', 'f9feaa9345c8df38e00f852f768bb2235eee9006d2ee645c45cf52c7f67f116a']],
  ['src/ui/views/SceneChromeView.vue', ['a5e488a736164e93bd2b24b0ab72243d7784cd17117ee571ebd06efd5e8f252b', '5c11507eec8acf7e15895dbac7b10bfa5ed4a8ca8fe9c35c2807909107cd0115']],
  ['src/ui/views/stories/StoriesHeader.vue', ['92a9b87b4dbcee6727a5a6d3edf6c2a1a778d4a770f1e232cc61cc09e321a40b', '0cea1f58b7d2de71b62d43159b8294bd77646f43bd54baff8b152e25b8d2b393']],
]);
const sha256 = value => createHash('sha256').update(value).digest('hex');
const root = path.dirname(fileURLToPath(import.meta.url));
if (!process.argv[2]) throw new Error('Expected extracted source directory');
const source = path.resolve(process.argv[2]);
const pin = JSON.parse(await fs.readFile(path.join(root, 'upstream-pin.json'), 'utf8'));
const patchBytes = await fs.readFile(path.join(root, 'branding.patch'));
if (sha256(patchBytes) !== pin.brandingPatchSha256) throw new Error('Branding patch checksum mismatch');
const sections = patchBytes.toString('utf8').split(/^diff --git /m);
if (sections.shift() !== '' || sections.length !== images.size) throw new Error('Unexpected branding patch structure');
const prepared = [];
const seen = new Set();

for (const section of sections) {
  const patchLines = section.split('\n');
  const match = patchLines[0].match(/^a\/(\S+) b\/(\S+)$/);
  if (!match || match[1] !== match[2] || !images.has(match[1]) || seen.has(match[1])) throw new Error('Unexpected branding patch path');
  const name = match[1];
  seen.add(name);
  if (!patchLines.includes(`--- a/${name}`) || !patchLines.includes(`+++ b/${name}`)) throw new Error(`Invalid file header: ${name}`);
  const file = path.join(source, name);
  if (!(await fs.lstat(file)).isFile()) throw new Error(`Expected regular source file: ${name}`);
  const original = await fs.readFile(file);
  const [before, after] = images.get(name);
  if (sha256(original) !== before) throw new Error(`Original branding file checksum mismatch: ${name}`);
  const text = original.toString('utf8');
  if (!text.endsWith('\n')) throw new Error(`Expected final newline: ${name}`);
  const oldLines = text.slice(0, -1).split('\n');
  const output = [];
  let cursor = 0;
  let hunks = 0;
  let i = patchLines.findIndex(line => line.startsWith('@@ '));
  if (i < 0) throw new Error(`Missing branding hunk: ${name}`);
  while (i < patchLines.length) {
    if (i === patchLines.length - 1 && patchLines[i] === '') break;
    const hunk = patchLines[i++].match(/^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@(?:.*)$/);
    if (!hunk) throw new Error(`Invalid branding hunk: ${name}`);
    const oldStart = Number(hunk[1]) - 1;
    const oldCount = Number(hunk[2] ?? 1);
    const newStart = Number(hunk[3]) - 1;
    const newCount = Number(hunk[4] ?? 1);
    if (oldStart < cursor || oldStart > oldLines.length) throw new Error(`Out-of-order branding hunk: ${name}`);
    output.push(...oldLines.slice(cursor, oldStart));
    cursor = oldStart;
    if (output.length !== newStart) throw new Error(`New hunk position mismatch: ${name}`);
    let consumed = 0;
    let produced = 0;
    while (i < patchLines.length && !patchLines[i].startsWith('@@ ')) {
      if (i === patchLines.length - 1 && patchLines[i] === '') { i++; break; }
      const line = patchLines[i++];
      const kind = line[0];
      const content = line.slice(1);
      if (![' ', '-', '+'].includes(kind)) throw new Error(`Unsupported branding hunk content: ${name}`);
      if (kind !== '+') {
        if (oldLines[cursor++] !== content) throw new Error(`Exact branding context mismatch: ${name}`);
        consumed++;
      }
      if (kind !== '-') { output.push(content); produced++; }
    }
    if (consumed !== oldCount || produced !== newCount) throw new Error(`Branding hunk length mismatch: ${name}`);
    hunks++;
  }
  output.push(...oldLines.slice(cursor));
  const result = output.join('\n') + '\n';
  if (!hunks || sha256(result) !== after) throw new Error(`Branded file checksum mismatch: ${name}`);
  prepared.push({ file, name, result, after });
}

// Validate every file before changing any source, then confirm written bytes.
for (const item of prepared) await fs.writeFile(item.file, item.result);
for (const item of prepared) {
  if (sha256(await fs.readFile(item.file)) !== item.after) throw new Error(`Branding write verification failed: ${item.name}`);
}
console.log(`Applied and byte-verified ${prepared.length} approved branding files with Node only.`);
