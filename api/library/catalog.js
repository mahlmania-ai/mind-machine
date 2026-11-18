// These are existing pinned upstream entries, verified as public civil imagery.
// Omitted entries are hidden and refused by the client's required catalog.
const entries = Object.freeze([
  { id: 'usgs-topo', available: true, reason: null },
  { id: 'naip', available: true, reason: null },
  { id: 'nasa-black-marble', available: true, reason: null },
]);
export default function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'method_not_allowed' });
  }
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  return res.status(200).json({ entries });
}
