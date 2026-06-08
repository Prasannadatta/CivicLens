import { useCallback, useEffect, useRef, useState } from 'react';
import useMinimumLoading from './useMinimumLoading';

/** Matches debounce in useDashboardData / useMapData / useCascadingFacets. */
const FILTER_DEBOUNCE_MS = 300;

/**
 * User-triggered filter transition loading — shows skeletons even when cache
 * returns immediately. Separate from network `loading` so cached revisits still
 * animate for the minimum duration.
 */
export default function useFilterTransitionLoading({
  filterKey,
  hasEverLoadedRef,
  facetsReady,
  facetsLoading,
  loading,
  isRefreshing,
}) {
  const [active, setActive] = useState(false);
  const [debouncePassed, setDebouncePassed] = useState(false);
  const targetKeyRef = useRef(null);

  const beginTransition = useCallback(() => {
    if (!hasEverLoadedRef.current) return;
    targetKeyRef.current = null;
    setDebouncePassed(false);
    setActive(true);
  }, [hasEverLoadedRef]);

  useEffect(() => {
    if (!active) {
      targetKeyRef.current = null;
      setDebouncePassed(false);
      return;
    }

    if (targetKeyRef.current === null) {
      targetKeyRef.current = filterKey;
    } else if (targetKeyRef.current !== filterKey) {
      targetKeyRef.current = filterKey;
      setDebouncePassed(false);
    }
  }, [active, filterKey]);

  useEffect(() => {
    if (!active || targetKeyRef.current !== filterKey) return undefined;

    setDebouncePassed(false);
    const timer = setTimeout(() => setDebouncePassed(true), FILTER_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [active, filterKey]);

  const fetchSettled = facetsReady && !facetsLoading && !loading && !isRefreshing;

  useEffect(() => {
    if (!active || targetKeyRef.current !== filterKey) return;
    if (debouncePassed && fetchSettled) {
      setActive(false);
    }
  }, [active, filterKey, debouncePassed, fetchSettled]);

  const visibleFilterTransitioning = useMinimumLoading(active);

  return {
    beginTransition,
    filterTransitionActive: active,
    visibleFilterTransitioning,
  };
}

/**
 * Case-selection transition loading for Model page (no filter debounce).
 */
export function useCaseTransitionLoading({ hasEverLoadedRef, caseLoading, hasCaseData }) {
  const [active, setActive] = useState(false);

  const beginTransition = useCallback(() => {
    if (!hasEverLoadedRef.current) return;
    setActive(true);
  }, [hasEverLoadedRef]);

  useEffect(() => {
    if (!active) return;
    if (!caseLoading && hasCaseData) {
      setActive(false);
    }
  }, [active, caseLoading, hasCaseData]);

  const visibleCaseTransitioning = useMinimumLoading(active);

  return {
    beginTransition,
    caseTransitionActive: active,
    visibleCaseTransitioning,
  };
}
