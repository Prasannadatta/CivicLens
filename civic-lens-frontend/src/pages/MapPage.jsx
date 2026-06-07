import { useMemo, useState, useCallback } from 'react';
import { Box } from '@mui/material';
import PageIntro from '../components/PageIntro';
import MapControlPanel from '../components/MapControlPanel';
import MapStatsBar from '../components/MapStatsBar';
import NYCRequestMap from '../components/NYCRequestMap';
import ChartLoadingOverlay from '../components/ChartLoadingOverlay';
import { DataEmptyState, DataErrorState } from '../components/DataFetchStatus';
import { DEFAULT_FILTERS, useFilters } from '../context/FilterContext';
import useCascadingFacets from '../hooks/useCascadingFacets';
import useMapData from '../hooks/useMapData';
import { PAGE_SECTION_GAP } from '../styles/modelViewLayout';

const EMPTY_MAP_STATS = {
  visibleRequests: 0,
  avgPredictedDelay: 0,
  highDelayCount: 0,
  unresolvedRate: 0,
};

export default function MapPage({ onNavigate }) {
  const { filters: dashboardFilters, setPendingModelCaseKey } = useFilters();
  const [mapFilters, setMapFilters] = useState(() => ({ ...dashboardFilters }));
  const [colorMode, setColorMode] = useState('delayBucket');
  const [highDelayOnly, setHighDelayOnly] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const mapExtra = useMemo(() => ({ highDelayOnly, mapBuckets: true }), [highDelayOnly]);
  const { facets } = useCascadingFacets(mapFilters, mapExtra);
  const { data, loading, error } = useMapData(mapFilters, mapExtra);

  const handleMapFilterChange = useCallback((key, value) => {
    setMapFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const hasData = Boolean(data);
  const showLoadingOverlay = loading && hasData;
  const showKpiSkeleton = loading && !hasData;

  const requests = data?.mapPoints?.records ?? [];
  const stats = useMemo(() => {
    const statsData = data?.stats;
    if (!statsData) return EMPTY_MAP_STATS;
    return {
      visibleRequests: data?.mapPoints?.count ?? requests.length,
      avgPredictedDelay: statsData.avgPredictedHours ?? 0,
      highDelayCount: statsData.highDelayCount ?? 0,
      unresolvedRate: statsData.unresolvedRate ?? 0,
    };
  }, [data, requests.length]);

  const handleReset = useCallback(() => {
    setMapFilters({ ...DEFAULT_FILTERS });
    setHighDelayOnly(false);
    setColorMode('delayBucket');
    setSelectedRequestId(null);
  }, []);

  const handleSelectRequest = useCallback((request) => {
    const id = request?.unique_key ?? request?._id ?? null;
    setSelectedRequestId(id);
  }, []);

  const handleViewModelDetails = useCallback((request) => {
    const key = request?.unique_key ?? request?._id;
    if (!key) return;
    setPendingModelCaseKey(key);
    onNavigate?.('model');
  }, [setPendingModelCaseKey, onNavigate]);

  const isEmpty = !loading && hasData && requests.length === 0;

  if (error && !hasData) {
    return <DataErrorState error={error} />;
  }

  if (isEmpty) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: PAGE_SECTION_GAP, pb: '96px' }}>
        <PageIntro
          page="map"
          eyebrow="Spatial Exploration"
          title="NYC Request Map"
          description="View 311 requests on a real NYC map, colored by delay bucket, complaint type, status, or prediction risk."
        />
        <MapControlPanel
          facets={facets}
          filters={mapFilters}
          colorMode={colorMode}
          highDelayOnly={highDelayOnly}
          onFilterChange={handleMapFilterChange}
          onColorModeChange={setColorMode}
          onHighDelayOnlyChange={setHighDelayOnly}
          onReset={handleReset}
        />
        <DataEmptyState message="No map points match the current filters." />
      </Box>
    );
  }

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: PAGE_SECTION_GAP,
          pb: '96px',
        }}
      >
        <PageIntro
          page="map"
          eyebrow="Spatial Exploration"
          title="NYC Request Map"
          description="View 311 requests on a real NYC map, colored by delay bucket, complaint type, status, or prediction risk."
        />

        <MapStatsBar stats={stats} loading={showKpiSkeleton} />

        <MapControlPanel
          facets={facets}
          filters={mapFilters}
          colorMode={colorMode}
          highDelayOnly={highDelayOnly}
          onFilterChange={handleMapFilterChange}
          onColorModeChange={setColorMode}
          onHighDelayOnlyChange={setHighDelayOnly}
          onReset={handleReset}
        />

        <Box sx={{ minHeight: 0 }}>
          <ChartLoadingOverlay loading={showLoadingOverlay}>
            <NYCRequestMap
              requests={requests}
              colorMode={colorMode}
              selectedRequestId={selectedRequestId}
              onSelectRequest={handleSelectRequest}
              onViewModelDetails={handleViewModelDetails}
            />
          </ChartLoadingOverlay>
        </Box>
      </Box>
    </>
  );
}
