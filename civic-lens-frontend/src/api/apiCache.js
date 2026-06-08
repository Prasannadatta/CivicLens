/** Module-level API response cache — survives page navigation. */
const store = new Map();

export const CACHE_TTL = {
  facets: 10 * 60 * 1000,
  dashboard: 4 * 60 * 1000,
  map: 4 * 60 * 1000,
  caseList: 2 * 60 * 1000,
  caseCount: 2 * 60 * 1000,
  requestDetails: 5 * 60 * 1000,
};

export function getCached(key) {
  const entry = store.get(key);
  if (!entry) return null;
  return entry.data;
}

export function hasFreshCache(key) {
  const entry = store.get(key);
  if (!entry) return false;
  return Date.now() < entry.expiresAt;
}

export function setCached(key, data, ttlMs) {
  store.set(key, {
    data,
    expiresAt: Date.now() + ttlMs,
  });
}

export function clearCache(prefix) {
  if (!prefix) {
    store.clear();
    return;
  }
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) store.delete(key);
  }
}

export function deleteCached(key) {
  store.delete(key);
}
