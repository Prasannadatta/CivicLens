import { useEffect, useRef, useState } from 'react';

const DEFAULT_MIN_MS = 500;

/**
 * Keeps visible loading true for at least minMs after loading starts.
 * When loading ends before minMs, visible loading stays until the minimum elapses.
 */
export default function useMinimumLoading(loading, minMs = DEFAULT_MIN_MS) {
  const [visible, setVisible] = useState(Boolean(loading));
  const startedAtRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (loading) {
      startedAtRef.current = Date.now();
      setVisible(true);
      return undefined;
    }

    if (startedAtRef.current == null) {
      setVisible(false);
      return undefined;
    }

    const elapsed = Date.now() - startedAtRef.current;
    const remaining = Math.max(0, minMs - elapsed);

    if (remaining === 0) {
      startedAtRef.current = null;
      setVisible(false);
      return undefined;
    }

    timerRef.current = setTimeout(() => {
      startedAtRef.current = null;
      setVisible(false);
      timerRef.current = null;
    }, remaining);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [loading, minMs]);

  return visible;
}
