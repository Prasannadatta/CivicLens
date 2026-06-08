const BASE = import.meta.env.VITE_API_BASE_URL ?? '';
const DEFAULT_MAP_POINT_LIMIT = Number(import.meta.env.VITE_MAP_POINT_LIMIT || 5000);

function apiUrl(path, baseUrl = BASE) {
  const base = (baseUrl || '').replace(/\/$/, '');
  return `${base}${path}`;
}

async function parseJson(res, label) {
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`${label}: ${res.status}${text ? ` — ${text}` : ''}`);
  }
  return res.json();
}

function isActive(value) {
  return value != null && value !== '' && value !== 'All';
}

function filtersToParams(filters = {}, extra = {}) {
  const params = new URLSearchParams();

  if (isActive(filters.borough)) params.set('borough', filters.borough);
  if (isActive(filters.complaint_type)) params.set('complaint_type', filters.complaint_type);
  if (isActive(filters.agency)) params.set('agency', filters.agency);
  if (isActive(filters.delay_bucket)) params.set('delay_bucket', filters.delay_bucket);
  if (isActive(filters.status)) params.set('status', filters.status);

  if (extra.highDelayOnly) params.set('highDelayOnly', '1');
  if (extra.mlOnly) params.set('mlOnly', '1');
  if (extra.mapBuckets) params.set('mapBuckets', '1');

  return params;
}

async function fetchEndpoint(path, filters, extra = {}, options = {}) {
  const { baseUrl = BASE, signal } = options;
  const params = filtersToParams(filters, extra);
  const qs = params.toString();
  const url = apiUrl(`${path}${qs ? `?${qs}` : ''}`, baseUrl);
  const res = await fetch(url, { signal });
  return parseJson(res, `Failed to fetch ${path}`);
}

export function fetchDashboardBundle(filters, extra, baseUrl, options = {}) {
  return fetchEndpoint('/api/dashboard', filters, extra, { baseUrl, ...options });
}

export function fetchMapBundle(filters, extra, baseUrl, options = {}) {
  const { baseUrl: resolvedBase = BASE, signal } = options;
  const params = filtersToParams(filters, extra);
  params.set('limit', String(DEFAULT_MAP_POINT_LIMIT));
  const qs = params.toString();
  const url = apiUrl(`/api/map-bundle${qs ? `?${qs}` : ''}`, resolvedBase);
  return fetch(url, { signal }).then((res) => parseJson(res, 'Failed to fetch /api/map-bundle'));
}

export function fetchCascadingFacets(filters, extra, baseUrl, options = {}) {
  return fetchEndpoint('/api/facets', filters, extra, { baseUrl, ...options });
}
