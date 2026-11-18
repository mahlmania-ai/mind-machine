// Node-only contract regression: run the pinned application's real start/stop
// and tools construction with a mocked DOM/renderer; never launch a browser.
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { createHostedVoiceCommands } from './hostedVoice.js';
const source = path.resolve(process.argv[2] || '.atlas-build/source');
const { supportedVoiceProviders } = await import(pathToFileURL(path.join(source, 'src/voice/providerCapabilities.js')));
const noop = () => {};
const cleanup = () => noop;
let providerConstructions = 0;
let runnerDisposals = 0;
let viewsRun;
const runnerFactory = () => Object.assign(async (name) => ({ ok: true, name }), { dispose() { runnerDisposals++; } });

function evaluate(code, name, dependencies) {
  return new Function(...Object.keys(dependencies), `${code}\nreturn ${name};`)(...Object.values(dependencies));
}
const voiceSource = await fs.readFile(path.join(source, 'src/voice/gevRealtime.js'), 'utf8');
const initVoice = evaluate(voiceSource.slice(voiceSource.indexOf('export function initGevVoiceCommands')).replace(/^export /, ''), 'initGevVoiceCommands', {
  createHostedVoiceCommands, createGevActionRunner: runnerFactory,
  canvasOf: () => null, cameraPoseKey: () => null, createReferentRegistry: () => ({}),
  withToolCatalog: runner => runner,
  createVoiceCommands(options) {
    providerConstructions++;
    supportedVoiceProviders(options.supportedProviders, { openai: noop, gemini: noop });
    throw new Error('A hosted boot must never construct a voice provider');
  },
});
const removeImports = code => code.replace(/^import[\s\S]*?;\n/gm, '').replace(/^export /gm, '');
const app = evaluate(removeImports(await fs.readFile(path.join(source, 'src/app/application.js'), 'utf8')), 'createApplication', { mountApplicationViews: noop });
const destroyable = () => ({ destroy: noop });
const toolMocks = {
  SceneDirector: class { destroy() {} }, bootStories: destroyable,
  stopVoiceForStories: () => false, storiesOpener: () => noop,
  useStoriesStore: () => ({}), applicationPinia: () => ({}),
  initAnnotations: destroyable, initDrawTool: destroyable, initGeoFileImport: destroyable,
  useDisplayStore: () => ({ connect: noop, detach: noop }),
  createDataLibrary: () => ({ start: () => Promise.resolve(), destroy: noop }),
  useDataLibraryStore: () => ({ publish: noop, connect: noop }),
  createLibraryBrowser: () => ({ controls: {}, destroy: noop }),
  localGeoJsonServices: {}, overlayHost: {},
  installGlobeInViewRecovery: cleanup, isScopeMaskEnabled: () => false,
  KEYHOLE_OUTER_RADIUS: 1, governorRequestRender: noop,
  installLayerReleaseTrim: cleanup, releaseContinuousRender: noop,
  holdContinuousRender: noop, installScopeMask: noop, destroyScopeMask: noop,
  onFollowChanged: cleanup, isEmbeddedInline: () => false,
  getRenderGovernorDiagnostics: noop, readEntityRecord: noop, entityRecord: noop,
  initGevVoiceCommands: initVoice, isStoriesOpen: () => false,
  installViews: ({ run }) => { viewsRun = run; return noop; },
  claimPointer: noop, releasePointer: noop, isPointerFree: () => true,
};
const tools = evaluate(removeImports(await fs.readFile(path.join(source, 'src/app/tools.js'), 'utf8')), 'createApplicationTools', toolMocks);
globalThis.document = { hidden: false, addEventListener: noop, removeEventListener: noop };
globalThis.window = {};
const scene = { viewer: {}, renderer: { frame: { suspend: noop } }, mapStackController: {}, operations: { surface: { groundFloor: {} }, requests: { terrain: {} } } };
const controls = { styleManager: {}, weatherEffects: null, cockpitCloudEffects: null };
const data = { dataManager: { layers: new Map() }, presentation: { flushVisible: noop } };
const start = voice => app({
  createScene: () => scene, createControls: () => controls, createData: () => data,
  createTools: context => tools({ ...context, loadingScreen: {}, voice }),
});

// Reproduce the production failure from the former empty-provider setting.
const broken = start({ supportedProviders: [], panel: false });
await assert.rejects(broken.start(), /No supported voice provider is configured/);
assert.equal(broken.getState().status, 'failed');
const before = providerConstructions;
const disposalBefore = runnerDisposals;
const fixed = start({ enabled: false, panel: false });
const components = await fixed.start();
assert.equal(fixed.getState().status, 'ready');
assert.equal(providerConstructions, before, 'no provider is constructed');
const commands = components.tools.voiceCommands;
assert.equal(commands.session, null);
assert.equal(typeof commands.runner, 'function');
assert.equal(typeof commands.stop, 'function');
assert.ok(commands.signal instanceof AbortSignal);
assert.deepEqual(await viewsRun('set_view', {}), { ok: true, name: 'set_view' });
await fixed.destroy();
assert.equal(fixed.getState().status, 'destroyed');
assert.equal(runnerDisposals - disposalBefore, 1, 'local runner is disposed exactly once');
assert.equal(window.__godsEyeView, undefined, 'application debug handle is cleaned');
console.log('PASS: reproduced empty-provider failure; corrected real application/tools lifecycle reaches ready, preserves local actions and cleans up without constructing a provider.');
