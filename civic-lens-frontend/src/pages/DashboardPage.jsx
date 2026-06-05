import { useMemo, useState, useCallback } from 'react';
import { Box } from '@mui/material';
import PageIntro from '../components/PageIntro';
import DashboardCompactFilters from '../components/DashboardCompactFilters';
import DashboardKpis from '../components/DashboardKpis';
import DashboardSectionHeading from '../components/DashboardSectionHeading';
import ServiceBurdenChoropleth from '../components/ServiceBurdenChoropleth';
import SelectedAreaInsightPanel from '../components/SelectedAreaInsightPanel';
import ComplaintTypeRanking from '../components/ComplaintTypeRanking';
import DelayTimeline from '../components/DelayTimeline';
import { DEFAULT_FILTERS } from '../components/FilterPanel';
import { mockRequests } from '../data/mockRequests';
import {
  applyFilters,
  getKpis,
  getBoroughStats,
  getTopComplaints,
  getMonthlyTimeline,
  getSelectedAreaSummary,
  getDashboardDelayDrivers,
} from '../utils/analytics';
import {
  PAGE_GRID_GAP,
  DASHBOARD_PLOT_HEIGHT_ROW1,
  DASHBOARD_PLOT_HEIGHT_ROW2,
} from '../styles/dashboardLayout';

const DASHBOARD_SECTION_GAP = '22px';
const DASHBOARD_BLOCK_GAP = '28px';

const GRID_12 = {
  display: 'grid',
  gridTemplateColumns: 'repeat(12, minmax(0, 1fr))',
  gap: PAGE_GRID_GAP,
  alignItems: 'stretch',
};

export default function DashboardPage() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const filteredRequests = useMemo(
    () => applyFilters(mockRequests, filters),
    [filters],
  );

  const kpis = useMemo(() => getKpis(filteredRequests), [filteredRequests]);
  const boroughStats = useMemo(() => getBoroughStats(filteredRequests), [filteredRequests]);
  const complaintStats = useMemo(() => getTopComplaints(filteredRequests, 8), [filteredRequests]);
  const timelineData = useMemo(() => getMonthlyTimeline(filteredRequests), [filteredRequests]);

  const selectedBorough = filters.borough !== 'All' ? filters.borough : null;
  const selectedComplaint = filters.complaintType !== 'All' ? filters.complaintType : null;

  const effectiveArea = useMemo(() => {
    if (selectedBorough) return selectedBorough;
    return boroughStats[0]?.borough ?? null;
  }, [selectedBorough, boroughStats]);

  const areaSummary = useMemo(
    () => getSelectedAreaSummary(filteredRequests, selectedBorough),
    [filteredRequests, selectedBorough],
  );

  const delayDrivers = useMemo(
    () => getDashboardDelayDrivers(filteredRequests, effectiveArea),
    [filteredRequests, effectiveArea],
  );

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

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: DASHBOARD_BLOCK_GAP,
      }}
    >
      <PageIntro
        page="dashboard"
        eyebrow="Citywide Analytics"
        title="Service Dashboard"
        description="Explore where service burden is highest, why selected areas stand out, which complaints drive delay and backlog, and how volume and response times change over time."
      />

      <DashboardCompactFilters
        requests={mockRequests}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onReset={handleResetFilters}
      />

      <DashboardKpis kpis={kpis} showValueSkeleton={!filteredRequests.length} />

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: DASHBOARD_SECTION_GAP }}>
        <DashboardSectionHeading
          title="Where is service burden highest?"
          subtitle="Start with geography — identify boroughs with heavier volume, slower response, and unresolved cases."
        />

        <Box sx={GRID_12}>
          <Box sx={{ gridColumn: { xs: '1 / -1', lg: 'span 8' }, minWidth: 0, minHeight: 0, display: 'flex' }}>
            <ServiceBurdenChoropleth
              boroughStats={boroughStats}
              selectedBorough={selectedBorough}
              onSelectBorough={handleBoroughSelect}
              title="Borough Burden Overview"
              subtitle="Compares boroughs using request volume, response delay, unresolved rate, and high-delay share."
              plotHeight={DASHBOARD_PLOT_HEIGHT_ROW1}
              compactFooter
              densePlot
            />
          </Box>
          <Box sx={{ gridColumn: { xs: '1 / -1', lg: 'span 4' }, minWidth: 0, minHeight: 0, display: 'flex' }}>
            <SelectedAreaInsightPanel summary={areaSummary} drivers={delayDrivers} />
          </Box>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: DASHBOARD_SECTION_GAP }}>
        <DashboardSectionHeading
          title="What issues drive delay and backlog?"
          subtitle="Rank complaint types by volume, response time, and unresolved rate."
        />

        <Box sx={GRID_12}>
          <Box sx={{ gridColumn: { xs: '1 / -1', lg: 'span 6' }, minWidth: 0, minHeight: 0, display: 'flex' }}>
            <ComplaintTypeRanking
              complaintStats={complaintStats}
              selectedBorough={selectedBorough}
              selectedComplaint={selectedComplaint}
              onSelectComplaint={handleComplaintSelect}
              title="Top Complaint Drivers"
              subtitle="Ranks complaint types by request volume, delay, and unresolved rate."
              plotHeight={DASHBOARD_PLOT_HEIGHT_ROW2}
              compactFooter
              maxItems={8}
            />
          </Box>
          <Box sx={{ gridColumn: { xs: '1 / -1', lg: 'span 6' }, minWidth: 0, minHeight: 0, display: 'flex' }}>
            <DelayTimeline
              timelineData={timelineData}
              selectedBorough={selectedBorough}
              title="Delay Trend Over Time"
              subtitle="Shows how request volume, actual response time, predicted response time, and unresolved rate change by month."
              plotHeight={DASHBOARD_PLOT_HEIGHT_ROW2}
              compactFooter
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
