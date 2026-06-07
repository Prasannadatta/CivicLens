const BASE = import.meta.env.VITE_API_BASE_URL ?? '';

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

/** Build URLSearchParams from shared filter state (skip keys where value === "All"). */
export function filtersToParams(filters = {}, extra = {}) {
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

async function fetchEndpoint(path, filters, extra = {}, baseUrl = BASE) {
  const params = filtersToParams(filters, extra);
  const qs = params.toString();
  const url = apiUrl(`${path}${qs ? `?${qs}` : ''}`, baseUrl);
  const res = await fetch(url);
  return parseJson(res, `Failed to fetch ${path}`);
}

export function fetchDashboardBundle(filters, extra, baseUrl) {
  return fetchEndpoint('/api/dashboard', filters, extra, baseUrl);
}

export function fetchMapBundle(filters, extra, baseUrl) {
  return fetchEndpoint('/api/map-bundle', filters, extra, baseUrl);
}

export function fetchStats(filters, extra, baseUrl) {
  return fetchEndpoint('/api/stats', filters, extra, baseUrl);
}

export function fetchMapPoints(filters, extra, baseUrl) {
  return fetchEndpoint('/api/map-points', filters, extra, baseUrl);
}

export function fetchBoroughBurden(filters, extra, baseUrl) {
  return fetchEndpoint('/api/borough-burden', filters, extra, baseUrl);
}

export function fetchComplaintDrivers(filters, extra, baseUrl) {
  return fetchEndpoint('/api/complaint-drivers', filters, extra, baseUrl);
}

export function fetchDelayTrend(filters, extra, baseUrl) {
  return fetchEndpoint('/api/delay-trend', filters, extra, baseUrl);
}

export function fetchCascadingFacets(filters, extra, baseUrl) {
  return fetchEndpoint('/api/facets', filters, extra, baseUrl);
}
