import { weatherProxy } from '../lib/atlas-weather/weather.js';

const parts = new Set(['manifest', 'image', 'tile']);
const services = new Set(['weather_radar', 'satellite', 'lightning_detection']);
const handler = weatherProxy({
  timeoutMs: 12_000,
  fetchImpl: (input, init) => {
    const url = new URL(String(input));
    const match = url.pathname.match(/^\/geoserver\/observations\/([^/]+)\/ows$/);
    if (url.protocol !== 'https:' || url.hostname !== 'nowcoast.noaa.gov' || url.port || url.username || url.password || !match || !services.has(match[1])) {
      throw new Error('Weather destination is not allowed');
    }
    // No credentials, forwarding headers, URL parameters or arbitrary targets
    // from the client are passed through to the fixed NOAA service.
    return fetch(url, { ...init, method: 'GET', redirect: 'error', credentials: 'omit' });
  },
}).handler;

function reject(res, status, error) {
  res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
  res.end(JSON.stringify({ error }));
}

export default async function weather(req, res) {
  if (req.method !== 'GET') return reject(res, 405, 'method_not_allowed');
  if (String(req.headers?.['sec-fetch-site'] || '') === 'cross-site') return reject(res, 403, 'same_origin_required');
  const origin = req.headers?.origin;
  if (origin) {
    try {
      if (new URL(origin).host !== req.headers.host) return reject(res, 403, 'same_origin_required');
    } catch { return reject(res, 403, 'same_origin_required'); }
  }
  const url = new URL(req.url || '/', 'https://atlas.invalid');
  const endpoint = req.query?.atlasEndpoint ?? url.searchParams.get('atlasEndpoint');
  if (typeof endpoint !== 'string' || !parts.has(endpoint) || url.searchParams.getAll('atlasEndpoint').length > 1) return reject(res, 404, 'unknown_weather_endpoint');
  url.searchParams.delete('atlasEndpoint');
  const original = req.url;
  req.url = `/${endpoint}${url.searchParams.size ? `?${url.searchParams}` : ''}`;
  res.setHeader('X-Content-Type-Options', 'nosniff');
  try { await handler(req, res); }
  finally { req.url = original; }
}
