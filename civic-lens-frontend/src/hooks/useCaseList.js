import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchCaseCount, fetchCaseList } from '../api/requests';

const DEBOUNCE_MS = 300;
const PAGE_SIZE = 50;

function stableKey(value) {
  return JSON.stringify(value ?? {});
}

/**
 * Server-paginated ML case list with debounced filter/search/sort changes.
 * Fetches rows immediately; total count loads in the background.
 */
export default function useCaseList(filters, { search = '', sort = 'predicted_delay_desc' } = {}) {
  const [records, setRecords] = useState([]);
  const [total, setTotal] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [countLoading, setCountLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchIdRef = useRef(0);
  const countIdRef = useRef(0);
  const queryKey = stableKey({ filters, search, sort });

  const loadPage = useCallback(async (skip, append) => {
    const fetchId = fetchIdRef.current + 1;
    fetchIdRef.current = fetchId;

    if (append) setLoadingMore(true);
    else setLoading(true);

    setError(null);

    try {
      const result = await fetchCaseList(filters, { search, sort, skip, limit: PAGE_SIZE, skipCount: true });
      if (fetchIdRef.current !== fetchId) return null;

      setHasMore(result.hasMore);
      setRecords((prev) => (append ? [...prev, ...result.records] : result.records));
      if (!append) setTotal(null);
      return result;
    } catch (err) {
      if (fetchIdRef.current !== fetchId) return null;
      if (!append) {
        setRecords([]);
        setTotal(null);
        setHasMore(false);
      }
      setError(err instanceof Error ? err : new Error(String(err)));
      return null;
    } finally {
      if (fetchIdRef.current === fetchId) {
        setLoading(false);
        setLoadingMore(false);
      }
    }
  }, [filters, search, sort]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadPage(0, false);
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [queryKey, loadPage]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const countId = countIdRef.current + 1;
      countIdRef.current = countId;
      setCountLoading(true);

      fetchCaseCount(filters, { search })
        .then((count) => {
          if (countIdRef.current !== countId) return;
          setTotal(count);
        })
        .catch(() => {
          if (countIdRef.current !== countId) return;
        })
        .finally(() => {
          if (countIdRef.current === countId) {
            setCountLoading(false);
          }
        });
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [queryKey, filters, search]);

  const loadMore = useCallback(() => {
    if (loading || loadingMore || !hasMore) return;
    loadPage(records.length, true);
  }, [loading, loadingMore, hasMore, records.length, loadPage]);

  const refresh = useCallback(() => loadPage(0, false), [loadPage]);

  return {
    records,
    total,
    hasMore,
    loading,
    loadingMore,
    countLoading,
    error,
    loadMore,
    refresh,
  };
}
