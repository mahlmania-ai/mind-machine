// Hosted civil scope. Keeps upstream layer instances, controls and availability
// semantics, but never supplies an acquisition source for unsupported layers.
import { CATALOG_SOURCE_CONTRACTS } from '../app/sourceComposition.js';
import { createBundledCableSource } from '../layers/submarineCables/bundledSource.js';
import { createUsgsEarthquakeSource } from '../layers/earthquakes/source.js';
import { createWeatherSource } from '../layers/weather/source.js';

export const HOSTED_CORE_LAYERS = Object.freeze([
  'bhote-koshi-2026', 'bhote-koshi-locator',
  'telegeography-submarine-cables', 'earthquakes',
  'weather-radar', 'weather-satellite', 'weather-lightning',
]);
const allowed = new Set(HOSTED_CORE_LAYERS);

export function createHostedSources() {
  return {
    ...Object.fromEntries(Object.keys(CATALOG_SOURCE_CONTRACTS).map(name => [name, null])),
    cables: createBundledCableSource(),
    earthquakes: createUsgsEarthquakeSource(),
    weather: createWeatherSource(),
  };
}

export function restrictHostedCatalog(catalog) {
  return Object.freeze({
    ...catalog,
    getSourceAvailability(id) {
      // Dynamic library entries have their own required server catalog.
      if (!catalog.get(id)) return undefined;
      if (!allowed.has(id)) return Object.freeze({
        available: false, source: 'hosted-civil-scope',
        reason: 'Not configured in this hosted Atlas. Civil maps, weather, earthquakes and bundled cable/flood layers are available.',
      });
      return catalog.getSourceAvailability?.(id) ?? Object.freeze({ available: true, source: 'bundled' });
    },
  });
}
