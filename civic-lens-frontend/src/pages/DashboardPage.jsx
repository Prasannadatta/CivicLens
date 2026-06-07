import { useMemo, useCallback } from 'react';
import { Box } from '@mui/material';
import PageIntro from '../components/PageIntro';
import DashboardCompactFilters from '../components/DashboardCompactFilters';
import DashboardKpis from '../components/DashboardKpis';
import DashboardSectionHeading from '../components/DashboardSectionHeading';
import ServiceBurdenChoropleth from '../components/ServiceBurdenChoropleth';
import SelectedAreaInsightPanel from '../components/SelectedAreaInsightPanel';
import ComplaintTypeRanking from '../components/ComplaintTypeRanking';
import DelayTimeline from '../components/DelayTimeline';
import ChartLoadingOverlay from '../components/ChartLoadingOverlay';
import { DataEmptyState, DataErrorState } from '../components/DataFetchStatus';
import { useFilters } from '../context/FilterContext';
import useCascadingFacets from '../hooks/useCascadingFacets';
import useDashboardData from '../hooks/useDashboardData';
import { buildAreaSummary, buildDelayDrivers } from '../utils/areaInsight';
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

const EMPTY_KPIS = {
  totalRequests: 0,
  avgResponseHours: 0,
  unresolvedRate: 0,
  highDelayCount: 0,
};

export default function DashboardPage() {
  const { filters, handleFilterChange, resetFilters } = useFilters();
  const { facets } = useCascadingFacets(filters);
  const { data, loading, error } = useDashboardData(filters);

  const statsData = data?.stats ?? null;
  const boroughStats = data?.boroughBurden?.boroughs ?? [];
  const complaintStats = data?.complaintDrivers?.complaints ?? [];
  const timelineData = data?.delayTrend?.timeline ?? [];

  const kpis = statsData ?? EMPTY_KPIS;
  const hasData = Boolean(data);
  const showLoadingOverlay = loading && hasData;
  const showKpiSkeleton = loading && !hasData;

  const selectedBorough = filters.borough !== 'All' ? filters.borough : null;
  const selectedComplaint = filters.complaint_type !== 'All' ? filters.complaint_type : null;

  const areaSummary = useMemo(
    () => buildAreaSummary(filters, boroughStats, complaintStats, kpis),
    [filters, boroughStats, complaintStats, kpis],
  );

  const delayDrivers = useMemo(
    () => buildDelayDrivers(complaintStats),
    [complaintStats],
  );

  const handleBoroughSelect = useCallback((borough) => {
    handleFilterChange('borough', borough || 'All');
  }, [handleFilterChange]);

  const handleComplaintSelect = useCallback((complaint) => {
    handleFilterChange('complaint_type', complaint || 'All');
  }, [handleFilterChange]);

  const isEmpty = !loading && hasData && kpis.totalRequests === 0;

  if (error && !hasData) {
    return <DataErrorState error={error} />;
  }

  if (isEmpty) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: DASHBOARD_BLOCK_GAP }}>
        <PageIntro
          page="dashboard"
          eyebrow="Citywide Analytics"
          title="Service Dashboard"
          description="Explore where service burden is highest, why selected areas stand out, which complaints drive delay and backlog, and how volume and response times change over time."
        />
        <DashboardCompactFilters
          facets={facets}
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={resetFilters}
        />
        <DataEmptyState message="No requests match the current filters." />
      </Box>
    );
  }

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
        facets={facets}
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={resetFilters}
      />

      <DashboardKpis kpis={kpis} loading={showKpiSkeleton} />

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: DASHBOARD_SECTION_GAP }}>
        <DashboardSectionHeading
          title="Where is service burden highest?"
          subtitle="Start with geography — identify boroughs with heavier volume, slower response, and unresolved cases."
        />

        <Box sx={GRID_12}>
          <Box sx={{ gridColumn: { xs: '1 / -1', lg: 'span 8' }, minWidth: 0, minHeight: 0, display: 'flex' }}>
            <ChartLoadingOverlay loading={showLoadingOverlay}>
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
            </ChartLoadingOverlay>
          </Box>
          <Box sx={{ gridColumn: { xs: '1 / -1', lg: 'span 4' }, minWidth: 0, minHeight: 0, display: 'flex' }}>
            <ChartLoadingOverlay loading={showLoadingOverlay}>
              <SelectedAreaInsightPanel summary={areaSummary} drivers={delayDrivers} />
            </ChartLoadingOverlay>
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
            <ChartLoadingOverlay loading={showLoadingOverlay}>
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
            </ChartLoadingOverlay>
          </Box>
          <Box sx={{ gridColumn: { xs: '1 / -1', lg: 'span 6' }, minWidth: 0, minHeight: 0, display: 'flex' }}>
            <ChartLoadingOverlay loading={showLoadingOverlay}>
              <DelayTimeline
                timelineData={timelineData}
                selectedBorough={selectedBorough}
                title="Delay Trend Over Time"
                subtitle="Shows how request volume, actual response time, predicted response time, and unresolved rate change by month."
                plotHeight={DASHBOARD_PLOT_HEIGHT_ROW2}
                compactFooter
              />
            </ChartLoadingOverlay>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
