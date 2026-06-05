import { useMemo, useState, useCallback } from 'react';
import { Box, Typography, alpha } from '@mui/material';
import { motion } from 'framer-motion';
import AppHeader from '../components/AppHeader';
import RightNav from '../components/RightNav';
import DashboardCompactFilters from '../components/DashboardCompactFilters';
import DashboardKpis from '../components/DashboardKpis';
import ServiceBurdenMap from '../components/ServiceBurdenMap';
import ComplaintTreemap from '../components/ComplaintTreemap';
import DelayTimeline from '../components/DelayTimeline';
import DashboardHotspotPreview from '../components/DashboardHotspotPreview';
import RequestDetailsDrawer from '../components/RequestDetailsDrawer';
import { DEFAULT_FILTERS } from '../components/FilterPanel';
import { mockRequests } from '../data/mockRequests';
import { useAppColors } from '../ColorModeContext';
import {
  applyFilters,
  getKpis,
  getBoroughStats,
  getTopComplaints,
  getMonthlyTimeline,
  getHotspotPoints,
} from '../utils/analytics';
import {
  PAGE_BOTTOM_PADDING,
  PAGE_GRID_GAP,
  PAGE_NAV_RESERVE,
  PAGE_PADDING_X,
  PAGE_PADDING_Y,
  PAGE_SECTION_GAP,
  DASHBOARD_PLOT_HEIGHT_ROW1,
  DASHBOARD_PLOT_HEIGHT_ROW2,
} from '../styles/dashboardLayout';

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
  show: { transition: { staggerChildren: 0.04 } },
};

export default function DashboardPage({ onNavigate }) {
  const colors = useAppColors();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filteredRequests = useMemo(
    () => applyFilters(mockRequests, filters),
    [filters],
  );

  const kpis = useMemo(() => getKpis(filteredRequests), [filteredRequests]);
  const boroughStats = useMemo(() => getBoroughStats(filteredRequests), [filteredRequests]);
  const topComplaints = useMemo(() => getTopComplaints(filteredRequests, 10), [filteredRequests]);
  const timelineData = useMemo(() => getMonthlyTimeline(filteredRequests), [filteredRequests]);
  const hotspotPoints = useMemo(() => getHotspotPoints(filteredRequests, 1000), [filteredRequests]);

  const selectedBorough = filters.borough !== 'All' ? filters.borough : null;
  const selectedComplaint = filters.complaintType !== 'All' ? filters.complaintType : null;

  const handleFiltersChange = useCallback((next) => {
    setFilters(next);
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const handleBoroughSelect = useCallback((borough) => {
    setFilters((prev) => ({
      ...prev,
      borough: borough || 'All',
    }));
  }, []);

  const handleComplaintSelect = useCallback((complaint) => {
    setFilters((prev) => ({
      ...prev,
      complaintType: complaint || 'All',
    }));
  }, []);

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

      <RightNav activeView="dashboard" onNavigate={onNavigate} />

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
          transition={{ duration: 0.3 }}
        >
          <AppHeader compact />
        </MotionBox>

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
            <Box sx={{ mb: 0.5 }}>
              <Typography
                variant="h5"
                component="h2"
                sx={{ fontWeight: 800, fontSize: '1.35rem', color: colors.textPrimary, letterSpacing: '-0.02em' }}
              >
                Dashboard
              </Typography>
              <Typography variant="body2" sx={{ color: colors.textSecondary, fontSize: '0.875rem', mt: 0.35 }}>
                Explore service burden, delay trends, and complaint patterns across NYC.
              </Typography>
            </Box>
          </MotionBox>

          <MotionBox variants={fadeUp}>
            <DashboardCompactFilters
              requests={mockRequests}
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onReset={handleResetFilters}
            />
          </MotionBox>

          <MotionBox variants={fadeUp}>
            <DashboardKpis kpis={kpis} showValueSkeleton={!filteredRequests.length} />
          </MotionBox>

          <MotionBox variants={fadeUp}>
            <Box sx={GRID_12}>
              <Box sx={{ gridColumn: { xs: '1 / -1', lg: 'span 7' }, minHeight: 0 }}>
                <ServiceBurdenMap
                  boroughStats={boroughStats}
                  selectedBorough={selectedBorough}
                  onSelectBorough={handleBoroughSelect}
                  title="Service Burden Map"
                  subtitle="Areas with higher delay, unresolved rate, and request volume."
                  plotHeight={DASHBOARD_PLOT_HEIGHT_ROW1}
                  compactFooter
                />
              </Box>
              <Box sx={{ gridColumn: { xs: '1 / -1', lg: 'span 5' }, minHeight: 0 }}>
                <ComplaintTreemap
                  topComplaints={topComplaints}
                  selectedComplaint={selectedComplaint}
                  onSelectComplaint={handleComplaintSelect}
                  title="Complaint Type Landscape"
                  subtitle="Issue mix by volume and average response time."
                  plotHeight={DASHBOARD_PLOT_HEIGHT_ROW1}
                  compactFooter
                />
              </Box>
            </Box>
          </MotionBox>

          <MotionBox variants={fadeUp}>
            <Box sx={GRID_12}>
              <Box sx={{ gridColumn: { xs: '1 / -1', lg: 'span 7' }, minHeight: 0 }}>
                <DelayTimeline
                  timelineData={timelineData}
                  title="Delay Timeline"
                  subtitle="Monthly request volume and average response delay."
                  plotHeight={DASHBOARD_PLOT_HEIGHT_ROW2}
                  compactFooter
                />
              </Box>
              <Box sx={{ gridColumn: { xs: '1 / -1', lg: 'span 5' }, minHeight: 0 }}>
                <DashboardHotspotPreview
                  points={hotspotPoints}
                  onSelectRequest={handleOpenDrawer}
                  plotHeight={DASHBOARD_PLOT_HEIGHT_ROW2}
                />
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
