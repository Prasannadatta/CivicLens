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

function readFilterValue(filters, camelKey, snakeKey) {
  return filters[camelKey] ?? filters[snakeKey];
}

function hasActiveFilters(filters = {}, extra = {}) {
  const complaintType = readFilterValue(filters, 'complaintType', 'complaint_type');
  const delayBucket = readFilterValue(filters, 'delayBucket', 'delay_bucket');

  return Boolean(
    isActive(filters.borough)
    || isActive(complaintType)
    || isActive(filters.agency)
    || isActive(filters.status)
    || isActive(delayBucket)
    || isActive(filters.season)
    || isActive(filters.year)
    || extra.mlOnly
    || extra.highDelayOnly
    || isActive(extra.delayBucket),
  );
}

export function filtersToQueryParams(filters = {}, extra = {}) {
  const params = new URLSearchParams();

  if (isActive(filters.borough)) params.set('borough', filters.borough);

  const complaintType = readFilterValue(filters, 'complaintType', 'complaint_type');
  if (isActive(complaintType)) params.set('complaintType', complaintType);

  if (isActive(filters.agency)) params.set('agency', filters.agency);
  if (isActive(filters.status)) params.set('status', filters.status);
  if (isActive(filters.season)) params.set('season', filters.season);
  if (isActive(filters.year)) params.set('year', String(filters.year));

  const delayBucket = readFilterValue(filters, 'delayBucket', 'delay_bucket');
  if (isActive(delayBucket)) params.set('delayBucket', delayBucket);
  else if (isActive(extra.delayBucket)) params.set('delayBucket', extra.delayBucket);

  if (extra.mlOnly) params.set('mlOnly', '1');
  if (extra.highDelayOnly) params.set('highDelayOnly', '1');
  if (extra.caseList) params.set('caseList', '1');

  if (hasActiveFilters(filters, extra)) {
    params.set('hasFilters', '1');
  }

  return params;
}

const CASE_SORT_OPTIONS = new Set([
  'predicted_delay_desc',
  'predicted_delay_asc',
  'created_date_desc',
]);

/**
 * Paginated ML case list for the model explanation picker (server-side filter + sort).
 */
function buildCaseListParams(
  filters = {},
  {
    search = '',
    sort = 'predicted_delay_desc',
    skip = 0,
    limit = 50,
    skipCount = false,
    countOnly = false,
  } = {},
) {
  const params = filtersToQueryParams(filters, { mlOnly: true, caseList: true });
  params.set('skip', String(skip));
  params.set('limit', String(limit));
  if (search.trim()) params.set('search', search.trim());
  if (CASE_SORT_OPTIONS.has(sort)) params.set('sort', sort);
  if (countOnly) params.set('countOnly', '1');
  else if (skipCount) params.set('skipCount', '1');
  return params;
}

export async function fetchCaseList(
  filters = {},
  {
    search = '',
    sort = 'predicted_delay_desc',
    skip = 0,
    limit = 50,
    skipCount = true,
  } = {},
  baseUrl = BASE,
  { signal } = {},
) {
  const params = buildCaseListParams(filters, { search, sort, skip, limit, skipCount });
  const res = await fetch(apiUrl(`/api/requests?${params}`, baseUrl), { signal });
  const payload = await parseJson(res, 'Failed to fetch case list');

  return {
    records: payload.records ?? [],
    total: payload.total ?? null,
    skip: payload.skip ?? skip,
    limit: payload.limit ?? limit,
    hasMore: Boolean(payload.hasMore),
    countPending: Boolean(payload.countPending),
  };
}

/** Deferred total count for the case picker (does not block list rows). */
export async function fetchCaseCount(
  filters = {},
  { search = '' } = {},
  baseUrl = BASE,
  { signal } = {},
) {
  const params = buildCaseListParams(filters, { search, countOnly: true, limit: 1 });
  const res = await fetch(apiUrl(`/api/requests?${params}`, baseUrl), { signal });
  const payload = await parseJson(res, 'Failed to fetch case count');
  return payload.total ?? 0;
}

export async function fetchRequestById(id, baseUrl = BASE, { signal } = {}) {
  const res = await fetch(apiUrl(`/api/requests/${encodeURIComponent(id)}`, baseUrl), { signal });
  return parseJson(res, `Failed to fetch request ${id}`);
}
