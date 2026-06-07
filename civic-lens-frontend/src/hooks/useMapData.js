import { useEffect, useRef, useState } from 'react';
import { fetchMapBundle } from '../api/dashboard';

const DEBOUNCE_MS = 300;

export default function useMapData(filters, extra = {}) {
  const [data, setData] = useState(null);
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
        setData(cache.current[cacheKey]);
        setLoading(false);
        setError(null);
        return;
      }

      const loadMapData = async () => {
        setLoading(true);
        setError(null);

        try {
          const bundle = await fetchMapBundle(parsedFilters, parsedExtra);

          if (fetchIdRef.current !== fetchId) return;

          cache.current[cacheKey] = bundle;
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

      loadMapData();
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [cacheKey]);

  return { data, loading, error };
}
