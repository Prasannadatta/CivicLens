import { useEffect, useRef, useState } from 'react';

const DEFAULT_DEBOUNCE_MS = 300;

/**
 * Debounced server fetch whenever filters (or extra query params) change.
 */
export default function useFilteredEndpoint(fetchFn, filters, extra = {}, debounceMs = DEFAULT_DEBOUNCE_MS) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fetchIdRef = useRef(0);

  const filtersKey = JSON.stringify(filters);
  const extraKey = JSON.stringify(extra);

  useEffect(() => {
    const fetchId = fetchIdRef.current + 1;
    fetchIdRef.current = fetchId;

    const timer = setTimeout(async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await fetchFn(filters, extra);
        if (fetchIdRef.current !== fetchId) return;
        setData(result);
      } catch (err) {
        if (fetchIdRef.current !== fetchId) return;
        setError(err);
      } finally {
        if (fetchIdRef.current === fetchId) {
          setLoading(false);
        }
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [fetchFn, filtersKey, extraKey, debounceMs]);

  return { data, loading, error };
}
