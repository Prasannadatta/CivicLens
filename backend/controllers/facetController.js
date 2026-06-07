import { getCascadingFacetOptions } from '../services/cascadingFacets.js';

export async function getCascadingFacets(req, res) {
  try {
    const facets = await getCascadingFacetOptions(req);
    res.json(facets);
  } catch (err) {
    console.error('getCascadingFacets failed', err);
    res.status(500).json({ error: 'Failed to fetch cascading facets' });
  }
}
