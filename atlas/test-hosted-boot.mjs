// Node-only contract regression: run the pinned application's real start/stop
// and tools construction with a mocked DOM/renderer; never launch a browser.
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { createHostedVoiceCommands } from './hostedVoice.js';
import { restrictHostedVoiceRunner } from '../lib/atlas-voice/policy.js';
const source = path.resolve(process.argv[2] || '.atlas-build/source');
const { supportedVoiceProviders } = await import(pathToFileURL(path.join(source, 'src/voice/providerCapabilities.js')));
const { createProviderCommands } = await import(pathToFileURL(path.join(source, 'src/voice/providerCommands.js')));
const noop = () => {};
const cleanup = () => noop;
let providerConstructions = 0;
let runnerDisposals = 0;
let sessionStarts = 0;
let viewsRun;
const runnerFactory = () => Object.assign(async (name) => ({ ok: true, name }), { dispose() { runnerDisposals++; } });

function evaluate(code, name, dependencies) {
  return new Function(...Object.keys(dependencies), `${code}\nreturn ${name};`)(...Object.values(dependencies));
}
const voiceSource = await fs.readFile(path.join(source, 'src/voice/gevRealtime.js'), 'utf8');
const initVoice = evaluate(voiceSource.slice(voiceSource.indexOf('export function initGevVoiceCommands')).replace(/^export /, ''), 'initGevVoiceCommands', {
  createHostedVoiceCommands, restrictHostedVoiceRunner, createGevActionRunner: runnerFactory,
  canvasOf: () => null, cameraPoseKey: () => null, createReferentRegistry: () => ({}),
  withToolCatalog: runner => runner,
  createVoiceCommands(options) {
    providerConstructions++;
    supportedVoiceProviders(options.supportedProviders, { openai: noop, gemini: noop });
    return createProviderCommands(options, {
      factories: { openai: noop, gemini: noop },
      storage: { getItem: () => 'gemini', setItem: noop },
      bind(settings) {
        assert.equal(settings.provider, 'openai');
        return { session: {
          state: 'idle', adapter: { getStartOptions: () => ({}) },
          start: () => { sessionStarts++; }, stop: noop, destroy: noop,
          isActive: () => false, sendText: noop, sendMapEvent: noop,
        } };
      },
    });
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

const enabled = start({ supportedProviders: ['openai'], panel: true });
const enabledParts = await enabled.start();
assert.equal(enabled.getState().status, 'ready');
assert.deepEqual(enabledParts.tools.voiceCommands.supportedProviders, ['openai']);
assert.equal(enabledParts.tools.voiceCommands.provider, 'openai', 'old Gemini preference cannot change provider');
assert.equal(sessionStarts, 0, 'boot mounts controls but never starts microphone/API session');
assert.equal((await viewsRun('zoom_to_globe', {})).ok, true);
assert.equal((await viewsRun('control_cctv', {})).ok, false);
assert.equal((await viewsRun('set_layer_visibility', { layerId: 'military', enabled: true })).ok, false);
await enabled.destroy();
assert.equal(enabled.getState().status, 'destroyed');
assert.equal(enabledParts.tools.voiceCommands.disposed, true);

// The patched original backend uses the protected POST route and exchanges
// only an ephemeral credential with the fixed OpenAI WebRTC endpoint.
const { createRealtimeBackend } = await import(pathToFileURL(path.join(source, 'src/voice/realtimeBackend.js')));
let tokenRequests = 0;
const backend = createRealtimeBackend({
  tokenTransport: async (url, options) => {
    tokenRequests++;
    assert.equal(url, '/api/realtime/token?tier=mini');
    assert.equal(options.method, 'POST');
    assert.equal(options.credentials, 'same-origin');
    assert.equal(options.headers['X-Atlas-Voice'], '1');
    return new Response(JSON.stringify({ value: 'ek_backend_test', expires_at: Date.now() / 1000 + 60, session: { model: 'gpt-realtime-2.1-mini' } }));
  },
  connectionTransport: async (url, options) => {
    assert.equal(url, 'https://api.openai.com/v1/realtime/calls');
    assert.equal(options.headers.Authorization, 'Bearer ek_backend_test');
    assert.equal(options.body, 'unit-test-offer');
    return new Response('unit-test-answer');
  },
});
const credential = await backend.requestToken({ tier: 'mini', authMode: 'oauth' });
assert.equal(tokenRequests, 1);
assert.equal(await backend.negotiate({ offerSdp: 'unit-test-offer', credential }), 'unit-test-answer');
const { readStoredCloudVoiceAuthMode } = await import(pathToFileURL(path.join(source, 'src/voice/cloudVoiceAuth.js')));
assert.equal(readStoredCloudVoiceAuthMode({ getItem: () => 'oauth' }), 'api-key');
console.log('PASS: original application/provider lifecycle mounts OpenAI-only controls without starting a session; civil actions, shutdown and original WebRTC token/SDP contract pass.');
