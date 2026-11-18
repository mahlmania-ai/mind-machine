# Fixed NOAA weather adapter

Only the pinned upstream weather handler and its three pure body/translation helpers are included. No standalone server, other provider middleware, configuration loader or credentials are present. The mechanical changes are documented in `PROVENANCE.json`; the original MIT notice is at `../../atlas/UPSTREAM-LICENSE`.

`api/weather.js` accepts only GET and the explicit endpoint selector `manifest`, `image` or `tile`. Root routing rewrites `/api/weather/:part` to `/api/weather?atlasEndpoint=:part`. Requests can reach only the fixed NOAA nowCOAST observations weather_radar, satellite and lightning_detection WMS paths. The inherited handler bounds query keys, timestamps, tile coordinates, image sizes, response body sizes, concurrency and caches; it refuses redirects, non-PNG image responses, invalid image dimensions and arbitrary destination URLs. Unavailable observations are labeled unavailable, not fabricated.

Allow at least 15 seconds of serverless duration (recommended 30) for the upstream handler's12-second timeout. Runtime data is public weather imagery and metadata; no API key is required. This does not supply a general proxy or enable any other Atlas provider.
