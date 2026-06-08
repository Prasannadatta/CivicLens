import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchDashboardBundle } from '../api/dashboard';
import {
  CACHE_TTL,
  deleteCached,
  getCached,
  hasFreshCache,
  setCached,
} from '../api/apiCache';
import { devLogFetch, isAbortError } from '../api/devLog';

const DEBOUNCE_MS = 300;

export default function useDashboardData(filters, { enabled = true } = {}) {
  const filtersKey = JSON.stringify(filters);
  const storeKey = `dashboard:${filtersKey}`;

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

      const parsedFilters = JSON.parse(filtersKey);
      const cached = getCached(storeKey);
      const fresh = hasFreshCache(storeKey);

      if (cached) {
        setData(cached);
        setLoading(false);
        setError(null);
        if (fresh && refreshToken === 0) {
          devLogFetch('/api/dashboard', { cacheHit: true, durationMs: 0 });
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
          const bundle = await fetchDashboardBundle(parsedFilters, {}, undefined, {
            signal: controller.signal,
          });

          if (fetchIdRef.current !== fetchId) return;

          setCached(storeKey, bundle, CACHE_TTL.dashboard);
          setData(bundle);
          setError(null);
          devLogFetch('/api/dashboard', {
            durationMs: Math.round(performance.now() - started),
            cacheHit: false,
            stale: Boolean(cached),
          });
        } catch (err) {
          if (isAbortError(err)) {
            devLogFetch('/api/dashboard', { aborted: true });
            return;
          }
          if (fetchIdRef.current !== fetchId) return;
          if (!cached) setError(err);
          devLogFetch('/api/dashboard', {
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
  }, [filtersKey, storeKey, enabled, refreshToken]);

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
