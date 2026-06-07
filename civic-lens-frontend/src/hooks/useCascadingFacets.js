import { useEffect, useRef, useState } from 'react';
import { fetchCascadingFacets } from '../api/dashboard';

const DEBOUNCE_MS = 300;

const EMPTY_FACETS = {
  borough: [],
  complaint_type: [],
  agency: [],
  delay_bucket: [],
  status: [],
};

export default function useCascadingFacets(filters, extra = {}) {
  const [facets, setFacets] = useState(EMPTY_FACETS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const cache = useRef({});
  const fetchIdRef = useRef(0);

  const cacheKey = JSON.stringify({ filters, extra });

  useEffect(() => {
    const timer = setTimeout(() => {
      const { filters: parsedFilters, extra: parsedExtra } = JSON.parse(cacheKey);
      const fetchId = fetchIdRef.current + 1;
      fetchIdRef.current = fetchId;

      if (cache.current[cacheKey]) {
        setFacets(cache.current[cacheKey]);
        setLoading(false);
        setError(null);
        return;
      }

      const loadFacets = async () => {
        setLoading(true);
        setError(null);

        try {
          const data = await fetchCascadingFacets(parsedFilters, parsedExtra);
          if (fetchIdRef.current !== fetchId) return;

          const next = { ...EMPTY_FACETS, ...data };
          cache.current[cacheKey] = next;
          setFacets(next);
        } catch (err) {
          if (fetchIdRef.current !== fetchId) return;
          setError(err);
        } finally {
          if (fetchIdRef.current === fetchId) {
            setLoading(false);
          }
        }
      };

      loadFacets();
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [cacheKey]);

  return { facets, loading, error };
}
