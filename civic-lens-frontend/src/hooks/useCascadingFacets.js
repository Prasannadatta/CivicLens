import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { fetchCascadingFacets } from '../api/dashboard';
import {
  CACHE_TTL,
  getCached,
  hasFreshCache,
  setCached,
} from '../api/apiCache';
import { devLogFetch, isAbortError } from '../api/devLog';

const DEBOUNCE_MS = 300;

const EMPTY_FACETS = {
  borough: [],
  complaint_type: [],
  agency: [],
  delay_bucket: [],
  status: [],
};

export default function useCascadingFacets(filters, extra = {}) {
  const queryKey = useMemo(() => JSON.stringify({ filters, extra }), [filters, extra]);
  const storeKey = `facets:${queryKey}`;

  const [facets, setFacets] = useState(() => {
    const cached = getCached(storeKey);
    return cached ? { ...EMPTY_FACETS, ...cached } : EMPTY_FACETS;
  });
  const [loading, setLoading] = useState(() => !hasFreshCache(storeKey));
  const [error, setError] = useState(null);
  const [facetsReady, setFacetsReady] = useState(() => hasFreshCache(storeKey));

  const fetchIdRef = useRef(0);
  const abortRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const fetchId = fetchIdRef.current + 1;
      fetchIdRef.current = fetchId;

      const cached = getCached(storeKey);
      const fresh = hasFreshCache(storeKey);

      if (cached) {
        setFacets({ ...EMPTY_FACETS, ...cached });
        setFacetsReady(true);
        if (fresh) {
          setLoading(false);
          setError(null);
          devLogFetch('/api/facets', { cacheHit: true, durationMs: 0 });
          return;
        }
        setLoading(false);
      } else {
        setLoading(true);
      }

      const started = performance.now();
      const { filters: parsedFilters, extra: parsedExtra } = JSON.parse(queryKey);

      (async () => {
        if (!cached) setError(null);

        try {
          const data = await fetchCascadingFacets(parsedFilters, parsedExtra, undefined, {
            signal: controller.signal,
          });

          if (fetchIdRef.current !== fetchId) return;

          setCached(storeKey, data, CACHE_TTL.facets);
          setFacets({ ...EMPTY_FACETS, ...data });
          setError(null);
          devLogFetch('/api/facets', {
            durationMs: Math.round(performance.now() - started),
            cacheHit: false,
            stale: Boolean(cached),
          });
        } catch (err) {
          if (isAbortError(err)) {
            devLogFetch('/api/facets', { aborted: true });
            return;
          }
          if (fetchIdRef.current !== fetchId) return;
          setError(err);
          devLogFetch('/api/facets', {
            durationMs: Math.round(performance.now() - started),
            cacheHit: false,
          });
        } finally {
          if (fetchIdRef.current === fetchId) {
            setLoading(false);
            setFacetsReady(true);
          }
        }
      })();
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      abortRef.current?.abort();
    };
  }, [queryKey, storeKey]);

  return {
    facets,
    loading,
    facetsLoading: loading,
    error,
    facetsError: error,
    facetsReady,
  };
}
