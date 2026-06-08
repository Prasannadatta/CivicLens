import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchCaseCount, fetchCaseList } from '../api/requests';
import {
  CACHE_TTL,
  getCached,
  hasFreshCache,
  setCached,
} from '../api/apiCache';
import { devLogFetch, isAbortError } from '../api/devLog';

const DEBOUNCE_MS = 300;
const PAGE_SIZE = 50;

function stableKey(value) {
  return JSON.stringify(value ?? {});
}

function dedupeRecords(rows) {
  const seen = new Set();
  return rows.filter((row) => {
    const key = row._id || row.unique_key;
    if (!key) return true;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Server-paginated ML case list with debounced filter/search/sort changes.
 * Fetches rows immediately; total count loads in the background.
 */
export default function useCaseList(
  filters,
  { search = '', sort = 'predicted_delay_desc', enabled = true } = {},
) {
  const queryKey = stableKey({ filters, search, sort });
  const listStoreKey = `caseList:${queryKey}:0`;
  const countStoreKey = `caseCount:${stableKey({ filters, search })}`;

  const [records, setRecords] = useState(() => getCached(listStoreKey)?.records ?? []);
  const [total, setTotal] = useState(() => getCached(countStoreKey) ?? null);
  const [hasMore, setHasMore] = useState(() => getCached(listStoreKey)?.hasMore ?? false);
  const [loading, setLoading] = useState(() => enabled && !getCached(listStoreKey));
  const [loadingMore, setLoadingMore] = useState(false);
  const [countLoading, setCountLoading] = useState(
    () => enabled && getCached(countStoreKey) == null,
  );
  const [error, setError] = useState(null);
  const [hasFetched, setHasFetched] = useState(false);

  const fetchIdRef = useRef(0);
  const countIdRef = useRef(0);
  const listAbortRef = useRef(null);
  const countAbortRef = useRef(null);

  const loadPage = useCallback(async (skip, append, signal) => {
    const fetchId = fetchIdRef.current + 1;
    fetchIdRef.current = fetchId;

    if (append) setLoadingMore(true);
    else if (!getCached(`caseList:${queryKey}:${skip}`)) setLoading(true);

    setError(null);

    const started = performance.now();
    const pageKey = `caseList:${queryKey}:${skip}`;

    try {
      const result = await fetchCaseList(filters, {
        search,
        sort,
        skip,
        limit: PAGE_SIZE,
        skipCount: true,
      }, undefined, { signal });

      if (fetchIdRef.current !== fetchId) return null;

      setCached(pageKey, result, CACHE_TTL.caseList);
      setHasMore(result.hasMore);
      setRecords((prev) => (
        append
          ? dedupeRecords([...prev, ...result.records])
          : result.records
      ));
      if (!append) {
        setTotal(null);
        setHasFetched(true);
      }

      if (import.meta.env.DEV && !append) {
        console.debug('[useCaseList] fetch complete', {
          queryKey,
          count: result.records?.length ?? 0,
        });
      }

      devLogFetch('/api/requests?caseList', {
        durationMs: Math.round(performance.now() - started),
        cacheHit: false,
      });
      return result;
    } catch (err) {
      if (isAbortError(err)) {
        devLogFetch('/api/requests?caseList', { aborted: true });
        if (import.meta.env.DEV && !append) {
          console.debug('[useCaseList] fetch aborted', { queryKey });
        }
        return null;
      }
      if (fetchIdRef.current !== fetchId) return null;
      if (!append) {
        setRecords([]);
        setTotal(null);
        setHasMore(false);
        setHasFetched(true);
      }
      setError(err instanceof Error ? err : new Error(String(err)));
      if (import.meta.env.DEV && !append) {
        console.debug('[useCaseList] fetch error', { queryKey, message: err?.message });
      }
      return null;
    } finally {
      if (fetchIdRef.current === fetchId) {
        setLoading(false);
        setLoadingMore(false);
      }
    }
  }, [filters, search, sort, queryKey]);

  useEffect(() => {
    setHasFetched(false);
  }, [queryKey]);

  useEffect(() => {
    if (!enabled) return undefined;

    const timer = setTimeout(() => {
      listAbortRef.current?.abort();
      const controller = new AbortController();
      listAbortRef.current = controller;

      const cached = getCached(listStoreKey);
      const fresh = hasFreshCache(listStoreKey);

      if (cached) {
        setRecords(cached.records ?? []);
        setHasMore(Boolean(cached.hasMore));
        setLoading(false);
        if (fresh) {
          setHasFetched(true);
          if (import.meta.env.DEV) {
            console.debug('[useCaseList] cache hit', {
              queryKey,
              count: cached.records?.length ?? 0,
            });
          }
          devLogFetch('/api/requests?caseList', { cacheHit: true, durationMs: 0 });
          return;
        }
      }

      if (import.meta.env.DEV) {
        console.debug('[useCaseList] fetch started', { queryKey, enabled });
      }

      loadPage(0, false, controller.signal);
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      listAbortRef.current?.abort();
    };
  }, [queryKey, listStoreKey, enabled, loadPage]);

  useEffect(() => {
    if (!enabled) return undefined;

    const timer = setTimeout(() => {
      countAbortRef.current?.abort();
      const controller = new AbortController();
      countAbortRef.current = controller;

      const countId = countIdRef.current + 1;
      countIdRef.current = countId;

      const cachedCount = getCached(countStoreKey);
      const freshCount = hasFreshCache(countStoreKey);

      if (cachedCount != null && freshCount) {
        setTotal(cachedCount);
        setCountLoading(false);
        devLogFetch('/api/requests?countOnly', { cacheHit: true, durationMs: 0 });
        return;
      }

      if (cachedCount != null) {
        setTotal(cachedCount);
      } else {
        setCountLoading(true);
      }

      const started = performance.now();

      fetchCaseCount(filters, { search }, undefined, { signal: controller.signal })
        .then((count) => {
          if (countIdRef.current !== countId) return;
          setCached(countStoreKey, count, CACHE_TTL.caseCount);
          setTotal(count);
          devLogFetch('/api/requests?countOnly', {
            durationMs: Math.round(performance.now() - started),
            cacheHit: false,
            stale: cachedCount != null,
          });
        })
        .catch((err) => {
          if (isAbortError(err)) {
            devLogFetch('/api/requests?countOnly', { aborted: true });
            return;
          }
          if (countIdRef.current !== countId) return;
        })
        .finally(() => {
          if (countIdRef.current === countId) {
            setCountLoading(false);
          }
        });
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      countAbortRef.current?.abort();
    };
  }, [queryKey, countStoreKey, enabled, filters, search]);

  const loadMore = useCallback(() => {
    if (loading || loadingMore || !hasMore) return;
    loadPage(records.length, true, undefined);
  }, [loading, loadingMore, hasMore, records.length, loadPage]);

  const refresh = useCallback(() => loadPage(0, false, undefined), [loadPage]);

  return {
    records,
    total,
    hasMore,
    loading,
    isLoading: loading,
    loadingMore,
    countLoading,
    error,
    hasFetched,
    loadMore,
    refresh,
    refetch: refresh,
  };
}

export { stableKey as caseListQueryKey };
