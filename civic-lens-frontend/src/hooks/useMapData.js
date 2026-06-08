import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { fetchMapBundle } from '../api/dashboard';
import {
  CACHE_TTL,
  deleteCached,
  getCached,
  hasFreshCache,
  setCached,
} from '../api/apiCache';
import { devLogFetch, isAbortError } from '../api/devLog';

const DEBOUNCE_MS = 300;

export default function useMapData(filters, extra = {}, { enabled = true } = {}) {
  const queryKey = useMemo(() => JSON.stringify({ filters, extra }), [filters, extra]);
  const storeKey = `map:${queryKey}`;

  const [data, setData] = useState(() => getCached(storeKey));
  const [loading, setLoading] = useState(() => enabled && !getCached(storeKey));
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [refreshToken, setRefreshToken] = useState(0);

  const fetchIdRef = useRef(0);
  const abortRef = useRef(null);

  useEffect(() => {
    if (!enabled) return undefined;

    const timer = setTimeout(() => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const fetchId = fetchIdRef.current + 1;
      fetchIdRef.current = fetchId;

      const { filters: parsedFilters, extra: parsedExtra } = JSON.parse(queryKey);
      const cached = getCached(storeKey);
      const fresh = hasFreshCache(storeKey);

      if (cached) {
        setData(cached);
        setLoading(false);
        setError(null);
        if (fresh && refreshToken === 0) {
          devLogFetch('/api/map-bundle', { cacheHit: true, durationMs: 0 });
          return;
        }
        setIsRefreshing(true);
      } else {
        setLoading(true);
        setIsRefreshing(false);
      }

      const started = performance.now();

      (async () => {
        if (!cached) setError(null);

        try {
          const bundle = await fetchMapBundle(parsedFilters, parsedExtra, undefined, {
            signal: controller.signal,
          });

          if (fetchIdRef.current !== fetchId) return;

          setCached(storeKey, bundle, CACHE_TTL.map);
          setData(bundle);
          setError(null);
          devLogFetch('/api/map-bundle', {
            durationMs: Math.round(performance.now() - started),
            cacheHit: false,
            stale: Boolean(cached),
          });
        } catch (err) {
          if (isAbortError(err)) {
            devLogFetch('/api/map-bundle', { aborted: true });
            return;
          }
          if (fetchIdRef.current !== fetchId) return;
          if (!cached) setError(err);
          devLogFetch('/api/map-bundle', {
            durationMs: Math.round(performance.now() - started),
            cacheHit: false,
          });
        } finally {
          if (fetchIdRef.current === fetchId) {
            setLoading(false);
            setIsRefreshing(false);
          }
        }
      })();
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      abortRef.current?.abort();
    };
  }, [queryKey, storeKey, enabled, refreshToken]);

  const refetch = useCallback(() => {
    deleteCached(storeKey);
    setRefreshToken((token) => token + 1);
  }, [storeKey]);

  return {
    data,
    loading,
    isRefreshing,
    error,
    refetch,
    isLoading: loading,
  };
}
