import { getCascadingFacetOptions } from '../services/cascadingFacets.js';
import { buildCacheKey, getCached, setCached } from '../services/aggregationCache.js';

const isDev = process.env.NODE_ENV !== 'production';

export async function getCascadingFacets(req, res) {
  const started = Date.now();
  try {
    const cacheKey = buildCacheKey('facets', req);
    const cached = getCached(cacheKey);
    if (cached) {
      if (isDev) {
        console.debug(`[api] GET /api/facets cache=HIT ${Date.now() - started}ms`);
      }
      res.set('X-Cache', 'HIT');
      return res.json(cached);
    }

    const facets = await getCascadingFacetOptions(req);
    setCached(cacheKey, facets);

    if (isDev) {
      console.debug(`[api] GET /api/facets cache=MISS ${Date.now() - started}ms`);
    }
    res.set('X-Cache', 'MISS');
    res.json(facets);
  } catch (err) {
    console.error('getCascadingFacets failed', err);
    res.status(500).json({ error: 'Failed to fetch cascading facets' });
  }
}
