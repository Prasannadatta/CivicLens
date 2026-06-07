import { useEffect, useRef, useState } from 'react';
import { fetchDashboardBundle } from '../api/dashboard';

const DEBOUNCE_MS = 300;

export default function useDashboardData(filters) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const cache = useRef({});
  const fetchIdRef = useRef(0);

  const filtersKey = JSON.stringify(filters);

  useEffect(() => {
    const timer = setTimeout(() => {
      const key = filtersKey;
      const parsedFilters = JSON.parse(key);
      const fetchId = fetchIdRef.current + 1;
      fetchIdRef.current = fetchId;

      if (cache.current[key]) {
        setData(cache.current[key]);
        setLoading(false);
        setError(null);
        return;
      }

      const loadDashboardData = async () => {
        setLoading(true);
        setError(null);

        try {
          const bundle = await fetchDashboardBundle(parsedFilters);

          if (fetchIdRef.current !== fetchId) return;

          cache.current[key] = bundle;
          setData(bundle);
        } catch (err) {
          if (fetchIdRef.current !== fetchId) return;
          setError(err);
        } finally {
          if (fetchIdRef.current === fetchId) {
            setLoading(false);
          }
        }
      };

      loadDashboardData();
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [filtersKey]);

  return { data, loading, error };
}
