# Atlas OpenAI voice

This preserves the pinned God's Eye View OpenAI voice panel, provider/session
lifecycle, WebRTC transport, captions, tier control and microphone teardown.
Upstream: `bilawalsidhu/gods-eye-view` at
`9554d6ea71f7da548d31eb78d812b32f90e15a81` (MIT; attribution retained).

The 15 tools in `tools.json` are derived from that revision's
`server/providers/openai/tools.js` / `toolDescriptions.js` and
`src/voice/actionSchemas.js`. They retain original schemas and descriptions,
with hosted civil layer, panel and base-map enums narrowed. Unsupported
tracking, camera, hardware, external-service catalog and agent tools are not
offered and are rejected by the client dispatcher. Nepal flood imagery remains
available through the original scene controls, which are outside this voice
subset. The original standalone text-chat backend is not hosted here.

## Deployment

- Keep **Vercel Authentication on every deployment**, including production.
  The application does not parse or export Vercel authentication cookies.
- Configure server-only `OPENAI_API_KEY` and `ATLAS_VOICE_ENABLED=1` in this
  project's protected environments. `VERCEL=1` is supplied by Vercel. Never
  put this key in a `VITE_` variable, source, browser settings or build define.
- Native function path: `POST /api/realtime/token?tier=standard|mini`.
  No rewrite, request body, OAuth path, custom provider/model URL or CORS is
  supported. The original fetch is patched to POST with a purpose header.
- Atlas Permissions-Policy needs `microphone=(self)`; keep camera, USB and
  serial denied. `connect-src` needs only the additional
  `https://api.openai.com/v1/realtime/calls` URL for SDP negotiation. Audio uses
  the original WebRTC peer connection; no WebSocket connection is introduced.
- Give `api/realtime/token.js` at least a 20-second function duration. The
  upstream request times out after 15 seconds. All token responses are no-store.

The API mints only at the fixed OpenAI `/v1/realtime/client_secrets` endpoint,
using the original models `gpt-realtime-2` / `gpt-realtime-2.1-mini`, `marin`
voice, and `gpt-4o-mini-transcribe` captions. Output is capped at 1,024 tokens
per response, with the upstream retention configuration. The returned payload
is reduced to the ephemeral token, expiry and served model. Errors do not
include upstream bodies or credentials; no request, transcript or token is
logged by this adapter. The hosted controller's diagnostic sink is disabled.

Secrets expire for **new connections after 60 seconds**. This is not the
duration of an active session. OpenAI permits token reuse until expiry; it is
not a single-use credential, and the browser's ephemeral session capability
does not constitute immutable server enforcement of conversation settings.
The civil dispatcher and absence of operational data/services enforce this
site's available actions. The permanent API key is never returned.

The in-memory throttle is 4 mints/minute per observed IP and 20/minute per
warm instance, with bounded entries. It is deliberately described as a
warm-instance reconnect safeguard, not a distributed quota or billing cap.
The original client session cost guard remains an estimate, not an account
spend limit. Vercel Authentication is a required independent access boundary.

## Verification

`node --test lib/atlas-voice/token.test.js` tests the fixed request, redacted
responses, missing configuration, origin/method/body/query guards, token TTL,
throttle and action restrictions using mocked responses only.
`node atlas/test-hosted-boot.mjs EXTRACTED_SOURCE` exercises the pinned real
application/tools/provider lifecycle and original token/SDP contract with
mocked renderer and transports. It starts no browser and makes no paid call.
Both run in the cloud build. A successful build is not microphone/voice QA;
that must be verified separately in the signed-in approved browser after the
server credential is configured.

Official reference checked November 18, 2026:
- https://developers.openai.com/api/reference/resources/realtime/subresources/client_secrets/methods/create
- https://developers.openai.com/api/docs/guides/voice-webrtc?voice-api=realtime
