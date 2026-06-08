import { useCallback, useEffect, useRef, useState } from 'react';
import { Box } from '@mui/material';
import RequestDetailsDrawer from '../components/RequestDetailsDrawer';
import PredictionCaseSelector from '../components/PredictionCaseSelector';
import PredictionOverviewCard from '../components/PredictionOverviewCard';
import ShapExplanationPanel from '../components/ShapExplanationPanel';
import ModelFeatureTable from '../components/ModelFeatureTable';
import RequestLocationPreview from '../components/RequestLocationPreview';
import PageIntro from '../components/PageIntro';
import PageLoadingBar from '../components/PageLoadingBar';
import ChartLoadingOverlay from '../components/ChartLoadingOverlay';
import { DataEmptyState, DataErrorState } from '../components/DataFetchStatus';
import { useFilters } from '../context/FilterContext';
import { useAppSnackbar } from '../context/AppSnackbarContext';
import { fetchRequestById } from '../api/requests';
import {
  CACHE_TTL,
  getCached,
  hasFreshCache,
  setCached,
  deleteCached,
} from '../api/apiCache';
import { devLogFetch, isAbortError } from '../api/devLog';
import useMinimumLoading from '../hooks/useMinimumLoading';
import useFilterTransitionLoading, { useCaseTransitionLoading } from '../hooks/useFilterTransitionLoading';
import {
  PAGE_GRID_GAP,
  PAGE_SECTION_GAP,
} from '../styles/modelViewLayout';

const MODEL_HEADER_GAP = '24px';

const GRID_12 = {
  display: 'grid',
  gridTemplateColumns: 'repeat(12, minmax(0, 1fr))',
  gap: PAGE_GRID_GAP,
  alignItems: 'stretch',
};

const MODEL_CARD_HEIGHT = 320;
const MODEL_TABLE_HEIGHT = 280;
const MODEL_MAP_HEIGHT = 240;

const SHOWCASE_HIGH_DELAY_KEY = '68598811';

function resolveCaseKey(recordOrKey) {
  if (typeof recordOrKey === 'string') return recordOrKey;
  return recordOrKey?.unique_key || recordOrKey?._id || null;
}

function normalizeRequestResponse(response) {
  return response?.data ?? response?.request ?? response;
}

function ModelCardSkeleton({ height }) {
  return (
    <ChartLoadingOverlay loading>
      <Box sx={{ width: '100%', minHeight: height }} />
    </ChartLoadingOverlay>
  );
}

export default function ModelPage() {
  const { filters, pendingModelCaseKey, setPendingModelCaseKey } = useFilters();
  const { beginUserLoad, completeUserLoad } = useAppSnackbar();
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeCase, setActiveCase] = useState(null);
  const [selectedStub, setSelectedStub] = useState(null);
  const [caseLoading, setCaseLoading] = useState(false);
  const [caseError, setCaseError] = useState(null);
  const [initialBootstrapDone, setInitialBootstrapDone] = useState(false);
  const [noMatchingCases, setNoMatchingCases] = useState(false);

  const activeKeyRef = useRef(null);
  const abortRef = useRef(null);
  const hasEverLoadedRef = useRef(Boolean(activeCase));
  const lastBootstrapKeyRef = useRef(null);

  useEffect(() => () => {
    abortRef.current?.abort();
  }, []);

  const loadFullCase = useCallback(async (recordOrKey, { userTriggered = false } = {}) => {
    const key = resolveCaseKey(recordOrKey);

    if (!key) {
      setActiveCase(null);
      setCaseLoading(false);
      return;
    }

    const userLoadId = userTriggered ? beginUserLoad() : null;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    activeKeyRef.current = key;
    setCaseError(null);
    setNoMatchingCases(false);

    const storeKey = `request:${key}`;
    const cached = normalizeRequestResponse(getCached(storeKey));
    const fresh = hasFreshCache(storeKey);

    if (cached) {
      setActiveCase(cached);
      setSelectedStub(cached);
      if (fresh) {
        setCaseLoading(false);
        if (userLoadId) completeUserLoad(null, userLoadId);
        devLogFetch(`/api/requests/${key}`, { cacheHit: true, durationMs: 0 });
        if (import.meta.env.DEV) {
          console.debug('[ModelPage] loadFullCase cache hit', {
            key,
            hasPrediction: cached?.predicted_response_hours != null,
            hasShap: Boolean(cached?.shap_explanation),
          });
        }
        return;
      }
      setCaseLoading(true);
    } else {
      setCaseLoading(true);
    }

    const started = performance.now();
    let caughtError = null;

    if (import.meta.env.DEV) {
      console.debug('[ModelPage] loadFullCase fetch started', { key });
    }

    try {
      const raw = await fetchRequestById(key, undefined, { signal: controller.signal });
      if (activeKeyRef.current !== key) return;
      const full = normalizeRequestResponse(raw);
      setCached(storeKey, full, CACHE_TTL.requestDetails);
      setActiveCase(full);
      setSelectedStub(full);
      if (import.meta.env.DEV) {
        console.debug('[ModelPage] loadFullCase fetch complete', {
          key,
          hasPrediction: full?.predicted_response_hours != null,
          hasShap: Boolean(full?.shap_explanation),
          responseKeys: full && typeof full === 'object' ? Object.keys(full).slice(0, 12) : [],
        });
      }
      devLogFetch(`/api/requests/${key}`, {
        durationMs: Math.round(performance.now() - started),
        cacheHit: false,
        stale: Boolean(cached),
      });
    } catch (err) {
      if (isAbortError(err)) {
        devLogFetch(`/api/requests/${key}`, { aborted: true });
        return;
      }
      if (activeKeyRef.current !== key) return;
      caughtError = err instanceof Error ? err : new Error(String(err));
      if (!cached) {
        setActiveCase(null);
        setCaseError(caughtError);
      }
      devLogFetch(`/api/requests/${key}`, {
        durationMs: Math.round(performance.now() - started),
        cacheHit: false,
      });
    } finally {
      if (activeKeyRef.current === key) {
        setCaseLoading(false);
        if (userLoadId) {
          completeUserLoad(caughtError, userLoadId);
        }
      }
    }
  }, [beginUserLoad, completeUserLoad]);

  const markBootstrapDone = useCallback(() => {
    setInitialBootstrapDone(true);
  }, []);

  const displayCase = activeCase;
  const hasCaseData = Boolean(displayCase);

  useEffect(() => {
    if (hasCaseData) {
      hasEverLoadedRef.current = true;
    }
  }, [hasCaseData]);

  const {
    beginTransition: beginCaseTransition,
    visibleCaseTransitioning,
  } = useCaseTransitionLoading({
    hasEverLoadedRef,
    caseLoading,
    hasCaseData,
  });

  const handleFirstRecords = useCallback((records) => {
    if (!records?.length) return;
    markBootstrapDone();
    setNoMatchingCases(false);

    const preferred = records.find(
      (r) => r.unique_key === SHOWCASE_HIGH_DELAY_KEY || r._id === SHOWCASE_HIGH_DELAY_KEY,
    ) ?? records[0];

    const id = preferred?.unique_key || preferred?._id;
    if (!id) return;

    if (lastBootstrapKeyRef.current === id && activeKeyRef.current === id && activeCase) {
      return;
    }
    lastBootstrapKeyRef.current = id;

    setSelectedStub(preferred);
    loadFullCase(preferred);
  }, [loadFullCase, markBootstrapDone, activeCase]);

  const handleCasesEmpty = useCallback(() => {
    markBootstrapDone();
    setNoMatchingCases(true);
    lastBootstrapKeyRef.current = null;
    setSelectedStub(null);
    setActiveCase(null);
    activeKeyRef.current = null;
  }, [markBootstrapDone]);

  const handleSelectCase = useCallback((record) => {
    markBootstrapDone();
    beginCaseTransition();
    setSelectedStub(record);
    loadFullCase(record, { userTriggered: true });
  }, [loadFullCase, markBootstrapDone, beginCaseTransition]);

  useEffect(() => {
    if (!pendingModelCaseKey) return;

    const key = pendingModelCaseKey;
    markBootstrapDone();
    setNoMatchingCases(false);
    lastBootstrapKeyRef.current = key;
    beginCaseTransition();
    setPendingModelCaseKey(null);
    setSelectedStub({ unique_key: key });
    loadFullCase(key, { userTriggered: true });
  }, [pendingModelCaseKey, setPendingModelCaseKey, loadFullCase, markBootstrapDone, beginCaseTransition]);

  const handleOpenDrawer = useCallback((request) => {
    setSelectedRequest(request);
    setDrawerOpen(true);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setDrawerOpen(false);
  }, []);

  const rawInitialLoading = !hasEverLoadedRef.current && !hasCaseData && (
    !initialBootstrapDone || caseLoading
  );
  const rawRefreshing = hasCaseData && caseLoading;

  const visibleInitialLoading = useMinimumLoading(rawInitialLoading);
  const visibleRefreshing = useMinimumLoading(rawRefreshing);
  const showFilterLoading = visibleCaseTransitioning || visibleRefreshing;
  const showLoadingState = visibleInitialLoading || showFilterLoading;

  const showCaseError = !showLoadingState && caseError && !hasCaseData;
  const showNoMatchingCases = initialBootstrapDone
    && noMatchingCases
    && !hasCaseData
    && !showLoadingState
    && !caseError;
  const showSelectPrompt = initialBootstrapDone
    && !noMatchingCases
    && !hasCaseData
    && !showLoadingState
    && !caseError;

  const selectedCaseId = selectedStub?.unique_key
    ?? selectedStub?._id
    ?? activeKeyRef.current
    ?? null;

  useEffect(() => {
    if (!import.meta.env.DEV) return;
    console.debug('[ModelPage state]', {
      initialBootstrapDone,
      noMatchingCases,
      caseLoading,
      showLoadingState,
      selectedCaseId,
      activeCaseExists: hasCaseData,
      caseError: Boolean(caseError),
      emptyReason: showNoMatchingCases
        ? 'no_matching_cases'
        : showSelectPrompt
          ? 'select_prompt'
          : showCaseError
            ? 'error'
            : showLoadingState
              ? 'loading'
              : hasCaseData
                ? 'loaded'
                : 'none',
    });
  }, [
    initialBootstrapDone,
    noMatchingCases,
    caseLoading,
    showLoadingState,
    selectedCaseId,
    hasCaseData,
    caseError,
    showNoMatchingCases,
    showSelectPrompt,
    showCaseError,
  ]);

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: PAGE_SECTION_GAP,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: MODEL_HEADER_GAP,
            width: '100%',
            minWidth: 0,
          }}
        >
          <PageIntro
            page="model"
            eyebrow="Prediction + Explainability"
            title="Model Explanation"
            description="Select a 311 request to inspect its CatBoost-predicted response delay, delay bucket, model inputs, and SHAP-based explanation."
          />

          <PredictionCaseSelector
            initialFilters={filters}
            selectedRequest={selectedStub ?? displayCase}
            onSelectRequest={handleSelectCase}
            onFirstRecords={handleFirstRecords}
            onCasesEmpty={handleCasesEmpty}
          />
        </Box>

        <PageLoadingBar loading={showLoadingState} page="model" />

        {showCaseError ? (
          <DataErrorState
            error={caseError}
            onRetry={() => {
              const retryKey = resolveCaseKey(selectedStub ?? activeKeyRef.current);
              if (retryKey) {
                deleteCached(`request:${retryKey}`);
              }
              beginCaseTransition();
              loadFullCase(selectedStub ?? activeKeyRef.current, { userTriggered: true });
            }}
          />
        ) : null}

        {showNoMatchingCases ? (
          <DataEmptyState message="No matching requests found." />
        ) : null}

        {showSelectPrompt ? (
          <DataEmptyState message="Select a request to view its prediction and SHAP explanation." />
        ) : null}

        {showLoadingState ? (
          <>
            <Box sx={GRID_12}>
              <Box sx={{ gridColumn: { xs: '1 / -1', md: 'span 4' }, minHeight: 0, display: 'flex' }}>
                <ModelCardSkeleton height={MODEL_CARD_HEIGHT} />
              </Box>
              <Box sx={{ gridColumn: { xs: '1 / -1', md: 'span 8' }, minHeight: 0, display: 'flex' }}>
                <ModelCardSkeleton height={MODEL_CARD_HEIGHT} />
              </Box>
            </Box>
            <Box sx={GRID_12}>
              <Box sx={{ gridColumn: { xs: '1 / -1', md: 'span 7' }, minHeight: 0, display: 'flex' }}>
                <ModelCardSkeleton height={MODEL_TABLE_HEIGHT} />
              </Box>
              <Box sx={{ gridColumn: { xs: '1 / -1', md: 'span 5' }, minHeight: 0, display: 'flex' }}>
                <ModelCardSkeleton height={MODEL_MAP_HEIGHT} />
              </Box>
            </Box>
          </>
        ) : null}

        {!showLoadingState && activeCase ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: PAGE_GRID_GAP,
              width: '100%',
              minWidth: 0,
            }}
          >
            <Box sx={GRID_12}>
              <Box sx={{ gridColumn: { xs: '1 / -1', md: 'span 4' }, minWidth: 0, minHeight: 0, display: 'flex' }}>
                <PredictionOverviewCard
                  request={activeCase}
                  onViewRecord={() => handleOpenDrawer(activeCase)}
                />
              </Box>
              <Box sx={{ gridColumn: { xs: '1 / -1', md: 'span 8' }, minWidth: 0, minHeight: 0, display: 'flex' }}>
                <ShapExplanationPanel request={activeCase} />
              </Box>
            </Box>
            <Box sx={GRID_12}>
              <Box sx={{ gridColumn: { xs: '1 / -1', md: 'span 7' }, minWidth: 0, minHeight: 0, display: 'flex' }}>
                <ModelFeatureTable request={activeCase} />
              </Box>
              <Box sx={{ gridColumn: { xs: '1 / -1', md: 'span 5' }, minWidth: 0, minHeight: 0, display: 'flex' }}>
                <RequestLocationPreview request={activeCase} />
              </Box>
            </Box>
          </Box>
        ) : null}
      </Box>

      <RequestDetailsDrawer
        open={drawerOpen}
        request={selectedRequest}
        onClose={handleCloseDrawer}
      />
    </>
  );
}
