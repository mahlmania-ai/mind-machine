import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.dirname(fileURLToPath(import.meta.url));
const pin = JSON.parse(await readFile(path.join(root, 'upstream-pin.json'), 'utf8'));
const [kind, file] = process.argv.slice(2);
const expected = { archive: pin.archiveSha256, lock: pin.packageLockSha256, branding: pin.brandingPatchSha256 }[kind];
if (!/^[a-f0-9]{64}$/.test(expected || '')) throw new Error(`Missing pinned hash for ${kind}`);
const actual = createHash('sha256').update(await readFile(file)).digest('hex');
if (actual !== expected) throw new Error(`${kind} checksum mismatch: ${actual}`);
console.log(`Verified ${kind} SHA-256.`);
