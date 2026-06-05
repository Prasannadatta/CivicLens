import { useMemo, useState, useCallback } from 'react';
import { Box } from '@mui/material';
import PageIntro from '../components/PageIntro';
import DashboardCompactFilters from '../components/DashboardCompactFilters';
import DashboardKpis from '../components/DashboardKpis';
import ServiceBurdenMap from '../components/ServiceBurdenMap';
import ComplaintTreemap from '../components/ComplaintTreemap';
import DelayTimeline from '../components/DelayTimeline';
import DashboardHotspotPreview from '../components/DashboardHotspotPreview';
import RequestDetailsDrawer from '../components/RequestDetailsDrawer';
import { DEFAULT_FILTERS } from '../components/FilterPanel';
import { mockRequests } from '../data/mockRequests';
import {
  applyFilters,
  getKpis,
  getBoroughStats,
  getTopComplaints,
  getMonthlyTimeline,
  getHotspotPoints,
} from '../utils/analytics';
import {
  PAGE_GRID_GAP,
  PAGE_SECTION_GAP,
  DASHBOARD_PLOT_HEIGHT_ROW1,
  DASHBOARD_PLOT_HEIGHT_ROW2,
} from '../styles/dashboardLayout';

const GRID_12 = {
  display: 'grid',
  gridTemplateColumns: 'repeat(12, minmax(0, 1fr))',
  gap: PAGE_GRID_GAP,
  alignItems: 'stretch',
};

export default function DashboardPage() {
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
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: PAGE_SECTION_GAP,
        }}
      >
        <PageIntro
          page="dashboard"
          eyebrow="Citywide Analytics"
          title="Service Dashboard"
          description="Explore city-level service burden, complaint composition, delay trends, and hotspot patterns across NYC."
        />

        <DashboardCompactFilters
          requests={mockRequests}
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onReset={handleResetFilters}
        />

        <DashboardKpis kpis={kpis} showValueSkeleton={!filteredRequests.length} />

        <Box sx={GRID_12}>
          <Box sx={{ gridColumn: { xs: '1 / -1', lg: 'span 7' }, minHeight: 0, display: 'flex' }}>
            <ServiceBurdenMap
              boroughStats={boroughStats}
              selectedBorough={selectedBorough}
              onSelectBorough={handleBoroughSelect}
              title="Service Burden Map"
              subtitle="Borough-level burden by selected metric."
              plotHeight={DASHBOARD_PLOT_HEIGHT_ROW1}
              compactFooter
            />
          </Box>
          <Box sx={{ gridColumn: { xs: '1 / -1', lg: 'span 5' }, minHeight: 0, display: 'flex' }}>
            <ComplaintTreemap
              topComplaints={topComplaints}
              selectedComplaint={selectedComplaint}
              onSelectComplaint={handleComplaintSelect}
              title="Complaint Type Landscape"
              subtitle="Volume by area, color by average delay."
              plotHeight={DASHBOARD_PLOT_HEIGHT_ROW1}
              compactFooter
            />
          </Box>
        </Box>

        <Box sx={GRID_12}>
          <Box sx={{ gridColumn: { xs: '1 / -1', lg: 'span 7' }, minHeight: 0, display: 'flex' }}>
            <DelayTimeline
              timelineData={timelineData}
              title="Delay Timeline"
              subtitle="Monthly volume and response delay."
              plotHeight={DASHBOARD_PLOT_HEIGHT_ROW2}
              compactFooter
            />
          </Box>
          <Box sx={{ gridColumn: { xs: '1 / -1', lg: 'span 5' }, minHeight: 0, display: 'flex' }}>
            <DashboardHotspotPreview
              points={hotspotPoints}
              onSelectRequest={handleOpenDrawer}
              plotHeight={DASHBOARD_PLOT_HEIGHT_ROW2}
            />
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
