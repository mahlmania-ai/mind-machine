# Mahlmania.ai Atlas frontend

This directory reproducibly builds the existing God's Eye View frontend by Bilawal Sidhu at a pinned upstream revision, with the approved Mahlmania.ai/Atlas branding patch. It does not implement or start the upstream provider server.

## Build

Use Node 24.14 or newer within Node 24, npm, curl, tar, and patch. Run `bash build-atlas.sh`. The script verifies the exact archive, lockfile and branding patch before installing locked dependencies without lifecycle scripts. The separate Vite configuration never imports the upstream standalone/server configuration or loads `.env` files, and passes empty provider credentials.

The generated application is `dist/`. Source and installed dependencies remain only in the ignored `.atlas-build/` directory. Do not commit that directory, generated output, credentials or installed dependencies.

The integrated site invokes `bash atlas/build-atlas.sh` and merges `atlas/dist/` under its final `/atlas/` directory. Vite's public base is `/atlas/`; the verifier normalizes the Cesium plugin's duplicate path prefix. The script is insensitive to the invoking working directory. Use Node24.x. A standalone verification project could use `atlas` as project root, `bash build-atlas.sh` as its build command, and `dist` as output, but the final integrated root build and Vercel configuration are owned separately. Root-relative API, icon and application route handling, deployment authentication, civil imagery/terrain support, response policies and network restrictions require that root integration.

## Verification and attribution

`verify-output.mjs` rejects missing or modified Cesium static files, missing entry assets, altered bundled cable datasets, missing Nepal flood imagery, or missing approved branding. This additional check is necessary because the upstream Cesium plugin can log copy errors while exiting successfully. `SOURCE-PROVENANCE.json` in the built output records the pinned source and completed checks.

The original logo artwork, in-app credits and source notices are preserved. `UPSTREAM-LICENSE` is the original source license and data-terms notice. The complete upstream `LICENSE`, `THIRD_PARTY_NOTICES.md` and `DATA_SOURCES.md` are copied into `dist/`. Both requested bundled cable and Nepal flood datasets remain; their separate data terms still apply. This build does not establish commercial data permissions or activate real-time providers, tracking, cameras, agents or AI services.

The current frontend-only build is distinct from a fully connected upstream application. Its safe civil serving policy is maintained separately from the pinned source and branding patch.
