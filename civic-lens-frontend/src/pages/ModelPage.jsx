import { useMemo, useState, useCallback, useEffect } from 'react';
import { Box, Alert, alpha } from '@mui/material';
import { DEFAULT_FILTERS } from '../components/FilterPanel';
import RequestDetailsDrawer from '../components/RequestDetailsDrawer';
import PredictionCaseSelector from '../components/PredictionCaseSelector';
import PredictionOverviewCard from '../components/PredictionOverviewCard';
import ShapExplanationPanel from '../components/ShapExplanationPanel';
import ModelFeatureTable from '../components/ModelFeatureTable';
import RequestLocationPreview from '../components/RequestLocationPreview';
import PageIntro from '../components/PageIntro';
import { mockRequests } from '../data/mockRequests';
import { useAppColors } from '../ColorModeContext';
import { applyFilters } from '../utils/analytics';
import { getDemoCases } from '../utils/mlExplanation';
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

const SHOWCASE_HIGH_DELAY_KEY = '61999001';

function pickDefaultCase(requests) {
  if (!requests?.length) return null;
  return (
    requests.find((r) => r.unique_key === SHOWCASE_HIGH_DELAY_KEY)
    ?? requests.find((r) => r.prediction_risk_level === 'High' || r.prediction_risk_level === 'Critical')
    ?? [...requests].sort(
      (a, b) => (Number(b.predicted_response_hours) || 0) - (Number(a.predicted_response_hours) || 0),
    )[0]
  );
}

export default function ModelPage() {
  const colors = useAppColors();
  const [filters] = useState(DEFAULT_FILTERS);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeCase, setActiveCase] = useState(null);

  const filteredRequests = useMemo(
    () => applyFilters(mockRequests, filters),
    [filters],
  );

  const caseOptions = useMemo(() => getDemoCases(filteredRequests, 30), [filteredRequests]);
  const defaultCase = useMemo(() => pickDefaultCase(caseOptions), [caseOptions]);
  const hasData = filteredRequests.length > 0;

  const displayCase = activeCase ?? defaultCase;

  useEffect(() => {
    if (!caseOptions.length) {
      setActiveCase(null);
      return;
    }
    if (activeCase && caseOptions.some((r) => r.unique_key === activeCase.unique_key)) {
      return;
    }
    setActiveCase(defaultCase);
  }, [caseOptions, activeCase, defaultCase]);

  const handleOpenDrawer = useCallback((request) => {
    setSelectedRequest(request);
    setDrawerOpen(true);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setDrawerOpen(false);
  }, []);

  return (
    <>
      {!hasData && (
        <Alert
          severity="warning"
          variant="outlined"
          sx={{
            mb: PAGE_SECTION_GAP,
            borderColor: alpha(colors.warning, 0.35),
            bgcolor: alpha(colors.warning, 0.05),
            color: colors.textPrimary,
            fontSize: '0.8125rem',
            '& .MuiAlert-icon': { color: colors.warning },
          }}
        >
          No requests available.
        </Alert>
      )}

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
          description="Select a 311 request to inspect its predicted response delay, delay bucket, model inputs, and SHAP-based explanation."
        />

        <PredictionCaseSelector
          requests={caseOptions}
          selectedRequest={displayCase}
          onSelectRequest={setActiveCase}
        />

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

        <Box sx={GRID_12}>
          <Box sx={{ gridColumn: { xs: '1 / -1', md: 'span 7' }, minHeight: 0, display: 'flex' }}>
            <ModelFeatureTable request={displayCase} />
          </Box>
          <Box sx={{ gridColumn: { xs: '1 / -1', md: 'span 5' }, minHeight: 0, display: 'flex' }}>
            <RequestLocationPreview request={displayCase} />
          </Box>
        </Box>
      </Box>

      <RequestDetailsDrawer
        open={drawerOpen}
        request={selectedRequest}
        onClose={handleCloseDrawer}
      />
    </>
  );
}
