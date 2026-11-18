import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.dirname(fileURLToPath(import.meta.url));
const source = path.resolve(process.argv[2] || '');
if (!process.argv[2]) throw new Error('Expected extracted source directory');
async function edit(name, replacements) {
  const file = path.join(source, name);
  let text = await fs.readFile(file, 'utf8');
  for (const [before, after] of replacements) {
    if (text.split(before).length !== 2) throw new Error(`Pinned source mismatch: ${name}`);
    text = text.replace(before, after);
  }
  await fs.writeFile(file, text);
}
await edit('src/standalone/catalog.js', [
  ["import { createStandaloneLayerSources } from './layerSources.js';", "import { createHostedSources, restrictHostedCatalog } from './hostedScope.js';"],
  ['  return createApplicationCatalog({', '  const catalog = createApplicationCatalog({'],
  ['    sources: createStandaloneLayerSources(sources),\n    streetLevelProviders,', '    sources: createHostedSources(),\n    streetLevelProviders: [],'],
  ['  });\n}\n\n// Direct compatibility', '  });\n  return restrictHostedCatalog(catalog);\n}\n\n// Direct compatibility'],
]);
await edit('src/standalone/tools.js', [
  ['    ...options,\n    voice:', '    ...options,\n    library: { ...options?.library, requireCatalog: true },\n    voice:'],
  ["      supportedProviders: ['openai', 'gemini'],\n      panel: true,\n", ''],
  ['      ...options?.voice,', '      ...options?.voice,\n      supportedProviders: [],\n      panel: false,'],
]);
await fs.copyFile(path.join(root, 'hostedScope.js'), path.join(source, 'src/standalone/hostedScope.js'));
console.log('Applied hosted civil catalog, unavailable-source guards and required Data Library catalog.');
