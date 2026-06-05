import { useMemo, useState, useCallback, useEffect } from 'react';
import { Box, Alert, Typography, alpha } from '@mui/material';
import { motion } from 'framer-motion';
import AppHeader from '../components/AppHeader';
import RightNav from '../components/RightNav';
import { DEFAULT_FILTERS } from '../components/FilterPanel';
import RequestDetailsDrawer from '../components/RequestDetailsDrawer';
import PredictionCaseSelector from '../components/PredictionCaseSelector';
import PredictionOverviewCard from '../components/PredictionOverviewCard';
import ShapExplanationPanel from '../components/ShapExplanationPanel';
import ModelFeatureTable from '../components/ModelFeatureTable';
import RequestLocationPreview from '../components/RequestLocationPreview';
import { mockRequests } from '../data/mockRequests';
import { useAppColors } from '../ColorModeContext';
import { applyFilters } from '../utils/analytics';
import { getDemoCases } from '../utils/mlExplanation';
import {
  PAGE_BOTTOM_PADDING,
  PAGE_GRID_GAP,
  PAGE_NAV_RESERVE,
  PAGE_PADDING_X,
  PAGE_PADDING_Y,
  PAGE_SECTION_GAP,
} from '../styles/modelViewLayout';

const MotionBox = motion.create(Box);

const GRID_12 = {
  display: 'grid',
  gridTemplateColumns: 'repeat(12, minmax(0, 1fr))',
  gap: PAGE_GRID_GAP,
  alignItems: 'stretch',
};

const fadeUp = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] } },
};

const staggerContainer = {
  show: {
    transition: { staggerChildren: 0.04 },
  },
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

export default function ModelPage({ onNavigate }) {
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
    <Box
      sx={{
        flex: 1,
        width: '100%',
        minHeight: '100vh',
        pb: PAGE_BOTTOM_PADDING,
        position: 'relative',
      }}
    >
      <Box
        aria-hidden
        sx={{
          pointerEvents: 'none',
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          background: `
            radial-gradient(circle at 18% 22%, ${alpha(colors.primary, 0.04)} 0%, transparent 28%),
            radial-gradient(circle at 82% 78%, ${alpha(colors.secondary, 0.03)} 0%, transparent 24%)
          `,
        }}
      />

      <RightNav activeView="model" onNavigate={onNavigate} />

      <Box
        sx={{
          width: '100%',
          maxWidth: 1320,
          mx: 'auto',
          px: PAGE_PADDING_X,
          py: PAGE_PADDING_Y,
          pr: {
            xs: PAGE_PADDING_X.xs,
            sm: PAGE_PADDING_X.sm,
            md: `calc(${PAGE_PADDING_X.md} + ${PAGE_NAV_RESERVE})`,
          },
          boxSizing: 'border-box',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <MotionBox
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <AppHeader compact />
        </MotionBox>

        {!hasData && (
          <Alert
            severity="warning"
            variant="outlined"
            sx={{
              mt: PAGE_SECTION_GAP,
              borderColor: alpha(colors.warning, 0.45),
              bgcolor: alpha(colors.warning, 0.06),
              color: colors.textPrimary,
              fontSize: '0.8125rem',
              '& .MuiAlert-icon': { color: colors.warning },
            }}
          >
            No requests available.
          </Alert>
        )}

        <MotionBox
          initial="hidden"
          animate="show"
          variants={staggerContainer}
          sx={{
            mt: PAGE_SECTION_GAP,
            display: 'flex',
            flexDirection: 'column',
            gap: PAGE_SECTION_GAP,
          }}
        >
          <MotionBox variants={fadeUp}>
            <PredictionCaseSelector
              requests={caseOptions}
              selectedRequest={displayCase}
              onSelectRequest={setActiveCase}
            />
          </MotionBox>

          <MotionBox variants={fadeUp}>
            <Box sx={GRID_12}>
              <Box sx={{ gridColumn: { xs: '1 / -1', md: 'span 4' }, minHeight: 0 }}>
                <PredictionOverviewCard
                  request={displayCase}
                  onViewRecord={displayCase ? () => handleOpenDrawer(displayCase) : undefined}
                />
              </Box>
              <Box sx={{ gridColumn: { xs: '1 / -1', md: 'span 8' }, minHeight: 0 }}>
                <ShapExplanationPanel request={displayCase} />
              </Box>
            </Box>
          </MotionBox>

          <MotionBox variants={fadeUp}>
            <Box sx={GRID_12}>
              <Box sx={{ gridColumn: { xs: '1 / -1', md: 'span 7' }, minHeight: 0 }}>
                <ModelFeatureTable request={displayCase} />
              </Box>
              <Box sx={{ gridColumn: { xs: '1 / -1', md: 'span 5' }, minHeight: 0 }}>
                <RequestLocationPreview request={displayCase} />
              </Box>
            </Box>
          </MotionBox>
        </MotionBox>
      </Box>

      <RequestDetailsDrawer
        open={drawerOpen}
        request={selectedRequest}
        onClose={handleCloseDrawer}
      />
    </Box>
  );
}
