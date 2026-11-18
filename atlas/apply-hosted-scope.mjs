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
  ["import { loadToolCatalog } from './toolCatalog.js';\n", ''],
  ['    ...options,\n    voice:', '    ...options,\n    library: { ...options?.library, requireCatalog: true },\n    voice:'],
  ["      supportedProviders: ['openai', 'gemini'],\n      panel: true,\n", ''],
  ['      toolCatalog: loadToolCatalog,\n', ''],
  ['      ...options?.voice,', "      ...options?.voice,\n      supportedProviders: ['openai'],\n      panel: true,\n      toolCatalog: undefined,\n      debugSink: () => {},"],
]);
await edit('src/voice/gevRealtime.js', [
  ["import { createVoiceCommands } from './commands.js';", "import { createVoiceCommands } from './commands.js';\nimport { createHostedVoiceCommands } from './hostedCommands.js';\nimport { restrictHostedVoiceRunner } from './hostedPolicy.js';"],
  ['export function initGevVoiceCommands(options) {', 'export function initGevVoiceCommands(options) {\n  if (options.enabled === false) return createHostedVoiceCommands(options, createGevActionRunner);'],
  ['    runner: withToolCatalog(', '    runner: restrictHostedVoiceRunner(withToolCatalog('],
  ['      options.toolCatalog,\n    ),', '      undefined,\n    )),'],
]);
await edit('src/voice/realtimeBackend.js', [
  ["      if (authMode === 'oauth') query.set('auth', 'oauth');", "      // Hosted Atlas always uses the server's API key, never local OAuth."],
  ['      const response = await tokenTransport(url, {\n        signal,', "      const response = await tokenTransport(url, {\n        method: 'POST',\n        credentials: 'same-origin',\n        headers: { 'X-Atlas-Voice': '1' },\n        signal,"],
]);
await edit('src/voice/cloudVoiceAuth.js', [
  ["const CLOUD_VOICE_AUTH_MODES = Object.freeze(['api-key', 'oauth']);", "const CLOUD_VOICE_AUTH_MODES = Object.freeze(['api-key']);"],
]);
await edit('src/ui/views/ProviderSettingsView.vue', [
  ['<button type="button" class="key-setup-cloud-auth-toggle"', '<button v-if="false" type="button" class="key-setup-cloud-auth-toggle"'],
]);
await edit('src/ui/applicationShell.js', [
  ['    const receiver = this.services.localAdsbLayer?.receiver;', '    // Hosted Atlas does not bind local hardware receiver controls.\n    const receiver = null;'],
]);
await fs.copyFile(path.join(root, 'hostedScope.js'), path.join(source, 'src/standalone/hostedScope.js'));
await fs.copyFile(path.join(root, 'hostedVoice.js'), path.join(source, 'src/voice/hostedCommands.js'));
await fs.copyFile(path.join(root, '../lib/atlas-voice/policy.js'), path.join(source, 'src/voice/hostedPolicy.js'));
await fs.copyFile(path.join(root, '../lib/atlas-voice/tools.json'), path.join(source, 'src/voice/tools.json'));
console.log('Applied hosted civil catalog and original OpenAI-only voice with restricted civil actions.');
