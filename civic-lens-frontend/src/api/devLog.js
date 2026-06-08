export function isAbortError(error) {
  if (!error) return false;
  if (error.name === 'AbortError') return true;
  const message = String(error.message ?? error);
  return message.includes('aborted') || message.includes('AbortError');
}

/** Dev-only fetch timing logs. */
export function devLogFetch(endpoint, { durationMs, cacheHit, aborted, stale }) {
  if (import.meta.env.PROD) return;
  const parts = [`[fetch] ${endpoint}`];
  if (cacheHit) parts.push('cache=HIT');
  else if (stale) parts.push('cache=STALE');
  else parts.push('cache=MISS');
  if (aborted) parts.push('aborted');
  if (durationMs != null) parts.push(`${durationMs}ms`);
  console.debug(parts.join(' '));
}
