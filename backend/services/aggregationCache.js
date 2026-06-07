const TTL_MS = Number(process.env.AGG_CACHE_TTL_MS || 5 * 60 * 1000);
const MAX_ENTRIES = Number(process.env.AGG_CACHE_MAX || 100);

const cache = new Map();

export function buildCacheKey(prefix, input = {}) {
  const q = input.query ?? input;
  const parts = Object.keys(q)
    .sort()
    .filter((key) => q[key] != null && q[key] !== '')
    .map((key) => `${key}=${q[key]}`);
  return `${prefix}:${parts.join('&')}`;
}

export function getCached(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > TTL_MS) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

export function setCached(key, data) {
  if (cache.has(key)) {
    cache.delete(key);
  } else if (cache.size >= MAX_ENTRIES) {
    const oldest = cache.keys().next().value;
    cache.delete(oldest);
  }
  cache.set(key, { data, ts: Date.now() });
}
