import { useEffect, useState } from 'react';
import { fetchRequestFacets } from '../api/requests';

const EMPTY_FACETS = {
  borough: [],
  complaint_type: [],
  agency: [],
  status: [],
  season: [],
  year: [],
};

export function useRequestFacets() {
  const [facets, setFacets] = useState(EMPTY_FACETS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchRequestFacets();
        if (!mounted) return;
        setFacets({ ...EMPTY_FACETS, ...data });
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => { mounted = false; };
  }, []);

  return { facets, loading, error };
}
