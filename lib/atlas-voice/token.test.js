import test from 'node:test';
import assert from 'node:assert/strict';
import { createAtlasTokenHandler } from './token.js';
import { ATLAS_VOICE_TOOLS, isHostedVoiceActionAllowed, restrictHostedVoiceRunner } from './policy.js';

const now = () => 1_800_000_000_000;
const env = { VERCEL: '1', ATLAS_VOICE_ENABLED: '1', OPENAI_API_KEY: 'test-server-only-key' };
const request = (overrides = {}) => ({
  method: 'POST', url: '/api/realtime/token?tier=standard',
  headers: { host: 'atlas.example', origin: 'https://atlas.example', 'sec-fetch-site': 'same-origin', 'x-atlas-voice': '1' },
  ...overrides,
});
async function run(handler, req = request()) {
  const headers = {};
  let body;
  const res = { setHeader: (k, v) => { headers[k] = v; }, end: text => { body = JSON.parse(text); } };
  await handler(req, res);
  return { status: res.statusCode, headers, body };
}
const ephemeral = () => new Response(JSON.stringify({ value: 'ek_unit_test_only', expires_at: now() / 1000 + 60, session: { model: 'ignore-untrusted-extras' }, extra: 'never-return-me' }));

test('uses fixed upstream, original models/settings and returns only a short-lived token', async () => {
  let called = 0;
  const handler = createAtlasTokenHandler({ env, now, fetchImpl: async (url, options) => {
    called++;
    assert.equal(url, 'https://api.openai.com/v1/realtime/client_secrets');
    assert.equal(options.method, 'POST'); assert.equal(options.redirect, 'error');
    assert.equal(options.headers.Authorization, 'Bearer test-server-only-key');
    const body = JSON.parse(options.body);
    assert.equal(body.expires_after.seconds, 60);
    assert.equal(body.session.model, 'gpt-realtime-2');
    assert.equal(body.session.audio.output.voice, 'marin');
    assert.equal(body.session.tools.length, 15);
    assert.ok(!body.session.tools.some(t => /military|cctv|track|osm_query|radio|shell/.test(t.name)));
    assert.equal(body.session.max_output_tokens, 1024);
    return ephemeral();
  } });
  const result = await run(handler);
  assert.equal(result.status, 200); assert.equal(called, 1);
  assert.deepEqual(result.body, { value: 'ek_unit_test_only', expires_at: now() / 1000 + 60, session: { model: 'gpt-realtime-2' } });
  assert.ok(!JSON.stringify(result).includes(env.OPENAI_API_KEY));
  assert.equal(result.headers['Cache-Control'], 'no-store, max-age=0');
});

test('all request guards reject before network access', async () => {
  let called = 0;
  const handler = createAtlasTokenHandler({ env, now, fetchImpl: async () => { called++; return ephemeral(); } });
  const cases = [
    [request({ method: 'GET' }), 405],
    [request({ method: 'OPTIONS' }), 405],
    [request({ headers: {} }), 403],
    [request({ headers: { ...request().headers, origin: 'https://evil.example' } }), 403],
    [request({ headers: { ...request().headers, 'sec-fetch-site': 'cross-site' } }), 403],
    [request({ headers: { ...request().headers, 'x-atlas-voice': undefined } }), 403],
    [request({ url: '/api/realtime/token?auth=oauth' }), 400],
    [request({ url: '/api/realtime/token?tier=standard&tier=mini' }), 400],
    [request({ url: '/api/realtime/token?tier=constructor' }), 400],
    [request({ url: '/api/realtime/token?url=https://evil.example' }), 400],
    [request({ body: { session: { model: 'anything' } } }), 400],
    [request({ headers: { ...request().headers, 'content-length': '1' } }), 400],
  ];
  for (const [req, status] of cases) assert.equal((await run(handler, req)).status, status);
  assert.equal(called, 0);
});

test('missing server configuration fails closed and does not call OpenAI', async () => {
  for (const config of [{}, { ...env, ATLAS_VOICE_ENABLED: '0' }, { ...env, VERCEL: '0' }, { ...env, OPENAI_API_KEY: '' }]) {
    const result = await run(createAtlasTokenHandler({ env: config, now, fetchImpl: () => { throw new Error('must not call'); } }));
    assert.equal(result.status, 503); assert.equal(result.body.code, 'API_KEY_MISSING');
  }
});

test('warm-instance rate limit stops reconnect loops', async () => {
  let called = 0;
  const handler = createAtlasTokenHandler({ env, now, fetchImpl: async () => { called++; return ephemeral(); } });
  for (let n = 0; n < 4; n++) assert.equal((await run(handler)).status, 200);
  assert.equal((await run(handler)).status, 429); assert.equal(called, 4);
});

test('upstream errors and invalid tokens never expose server credentials or response details', async () => {
  for (const response of [
    new Response('private detail test-server-only-key', { status: 401 }),
    new Response(JSON.stringify({ value: env.OPENAI_API_KEY, expires_at: now() / 1000 + 60 })),
    new Response(JSON.stringify({ value: 'ek_expired', expires_at: now() / 1000 - 1 })),
    new Response(JSON.stringify({ value: 'ek_long_ttl', expires_at: now() / 1000 + 600 })),
    new Response('x'.repeat(131073)),
  ]) {
    const result = await run(createAtlasTokenHandler({ env, now, fetchImpl: async () => response }));
    assert.equal(result.status, 502);
    assert.ok(!JSON.stringify(result).includes(env.OPENAI_API_KEY));
  }
});

test('civil tool schemas and runtime dispatcher reject unsupported actions/arguments', async () => {
  assert.equal(ATLAS_VOICE_TOOLS.length, 15);
  assert.equal(isHostedVoiceActionAllowed('fly_to_location', { locationId: 'london' }), true);
  assert.equal(isHostedVoiceActionAllowed('set_layer_visibility', { layerId: 'earthquakes', enabled: true }), true);
  assert.equal(isHostedVoiceActionAllowed('set_layer_visibility', { layerId: 'military', enabled: true }), false);
  assert.equal(isHostedVoiceActionAllowed('set_map_stack', { stack: 'photoreal' }), false);
  assert.equal(isHostedVoiceActionAllowed('set_panel_open', { panelId: 'cctv-panel', open: true }), false);
  assert.equal(isHostedVoiceActionAllowed('fly_to_location', { latitude: 91, longitude: 0 }), false);
  assert.equal(isHostedVoiceActionAllowed('zoom_to_globe', { url: 'https://evil.example' }), false);
  assert.equal(isHostedVoiceActionAllowed('set_voice_inactivity_timeout', { minutes: 0 }), false);
  let calls = 0; let disposals = 0;
  const runner = restrictHostedVoiceRunner(Object.assign(async () => { calls++; return { ok: true }; }, { dispose() { disposals++; } }));
  assert.equal((await runner('military_awareness', {})).ok, false);
  assert.equal((await runner('zoom_to_globe', {})).ok, true);
  assert.equal(calls, 1); runner.dispose(); assert.equal(disposals, 1);
});
