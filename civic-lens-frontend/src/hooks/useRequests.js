import { useEffect, useMemo, useState } from 'react';
import { fetchRequests } from '../api/requests';

const DEBOUNCE_MS = 350;

function stableKey(value) {
  return JSON.stringify(value ?? {});
}

/**
 * Loads NYC 311 requests from the API using server-side filters.
 * Refetches when filters or map/model options change.
 */
export function useRequests(filters = {}, extra = {}) {
  const [requests, setRequests] = useState([]);
  const [meta, setMeta] = useState({ total: 0, loaded: 0, capped: false });
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(null);

  const filterKey = useMemo(() => stableKey({ filters, extra }), [filters, extra]);

  useEffect(() => {
    let mounted = true;
    let debounceId = null;

    async function load() {
      setStatus('loading');
      setError(null);
      setProgress(null);

      try {
        const result = await fetchRequests(filters, extra, undefined, {
          onProgress: (p) => {
            if (mounted) setProgress(p);
          },
        });

        if (!mounted) return;
        setRequests(result.records);
        setMeta({
          total: result.total,
          loaded: result.loaded,
          capped: result.capped,
        });
        setStatus('ready');
      } catch (err) {
        if (!mounted) return;
        setRequests([]);
        setMeta({ total: 0, loaded: 0, capped: false });
        setError(err instanceof Error ? err : new Error(String(err)));
        setStatus('error');
      }
    }

    debounceId = setTimeout(load, DEBOUNCE_MS);

    return () => {
      mounted = false;
      if (debounceId) clearTimeout(debounceId);
    };
  }, [filterKey]);

  return {
    requests,
    meta,
    progress,
    status,
    error,
    loading: status === 'loading',
    isEmpty: status === 'ready' && requests.length === 0,
    isReady: status === 'ready',
    isError: status === 'error',
  };
}
