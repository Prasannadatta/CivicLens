import { useCallback, useEffect, useRef, useState } from 'react';
import { Box } from '@mui/material';
import RequestDetailsDrawer from '../components/RequestDetailsDrawer';
import PredictionCaseSelector from '../components/PredictionCaseSelector';
import PredictionOverviewCard from '../components/PredictionOverviewCard';
import ShapExplanationPanel from '../components/ShapExplanationPanel';
import ModelFeatureTable from '../components/ModelFeatureTable';
import RequestLocationPreview from '../components/RequestLocationPreview';
import PageIntro from '../components/PageIntro';
import { DataEmptyState, DataErrorState, DataLoadingState } from '../components/DataFetchStatus';
import { useFilters } from '../context/FilterContext';
import { fetchRequestById } from '../api/requests';
import {
  PAGE_GRID_GAP,
  PAGE_SECTION_GAP,
} from '../styles/modelViewLayout';

const GRID_12 = {
  display: 'grid',
  gridTemplateColumns: 'repeat(12, minmax(0, 1fr))',
  gap: PAGE_GRID_GAP,
  alignItems: 'stretch',
};

const SHOWCASE_HIGH_DELAY_KEY = '68598811';

export default function ModelPage() {
  const { filters, pendingModelCaseKey, setPendingModelCaseKey } = useFilters();
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeCase, setActiveCase] = useState(null);
  const [selectedStub, setSelectedStub] = useState(null);
  const [caseLoading, setCaseLoading] = useState(false);
  const [caseError, setCaseError] = useState(null);

  const defaultPickedRef = useRef(false);
  const activeKeyRef = useRef(null);

  const loadFullCase = useCallback(async (recordOrKey) => {
    const key = typeof recordOrKey === 'string'
      ? recordOrKey
      : recordOrKey?.unique_key;

    if (!key) {
      setActiveCase(null);
      setCaseLoading(false);
      return;
    }

    activeKeyRef.current = key;
    setCaseLoading(true);
    setCaseError(null);

    try {
      const full = await fetchRequestById(key);
      if (activeKeyRef.current !== key) return;
      setActiveCase(full);
      setSelectedStub(full);
    } catch (err) {
      if (activeKeyRef.current !== key) return;
      setActiveCase(null);
      setCaseError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      if (activeKeyRef.current === key) {
        setCaseLoading(false);
      }
    }
  }, []);

  const handleFirstRecords = useCallback((records) => {
    if (defaultPickedRef.current || !records?.length) return;
    defaultPickedRef.current = true;

    const showcase = records.find((r) => r.unique_key === SHOWCASE_HIGH_DELAY_KEY);
    const pick = showcase ?? records[0];
    setSelectedStub(pick);
    loadFullCase(pick);
  }, [loadFullCase]);

  const handleSelectCase = useCallback((record) => {
    setSelectedStub(record);
    loadFullCase(record);
  }, [loadFullCase]);

  useEffect(() => {
    if (!pendingModelCaseKey) return;

    const key = pendingModelCaseKey;
    defaultPickedRef.current = true;
    setPendingModelCaseKey(null);
    setSelectedStub({ unique_key: key });
    loadFullCase(key);
  }, [pendingModelCaseKey, setPendingModelCaseKey, loadFullCase]);

  const handleOpenDrawer = useCallback((request) => {
    setSelectedRequest(request);
    setDrawerOpen(true);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setDrawerOpen(false);
  }, []);

  const displayCase = activeCase;
  const showExplanation = Boolean(displayCase);

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: PAGE_SECTION_GAP,
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
        />

        {caseLoading && !displayCase ? (
          <DataLoadingState message="Loading case details…" />
        ) : null}

        {caseError && !displayCase ? (
          <DataErrorState error={caseError} />
        ) : null}

        {!showExplanation && !caseLoading && !caseError ? (
          <DataEmptyState message="Select a case above to view its prediction and SHAP explanation." />
        ) : null}

        {showExplanation ? (
          <Box sx={GRID_12}>
            <Box sx={{ gridColumn: { xs: '1 / -1', md: 'span 4' }, minHeight: 0, display: 'flex' }}>
              <PredictionOverviewCard
                request={displayCase}
                onViewRecord={displayCase ? () => handleOpenDrawer(displayCase) : undefined}
              />
            </Box>
            <Box sx={{ gridColumn: { xs: '1 / -1', md: 'span 8' }, minHeight: 0, display: 'flex' }}>
              <ShapExplanationPanel request={displayCase} />
            </Box>
          </Box>
        ) : null}

        {showExplanation ? (
          <Box sx={GRID_12}>
            <Box sx={{ gridColumn: { xs: '1 / -1', md: 'span 7' }, minHeight: 0, display: 'flex' }}>
              <ModelFeatureTable request={displayCase} />
            </Box>
            <Box sx={{ gridColumn: { xs: '1 / -1', md: 'span 5' }, minHeight: 0, display: 'flex' }}>
              <RequestLocationPreview request={displayCase} />
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
