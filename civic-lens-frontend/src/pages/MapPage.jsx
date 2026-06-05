import { useMemo, useState, useCallback } from 'react';
import { Box } from '@mui/material';
import PageIntro from '../components/PageIntro';
import MapControlPanel from '../components/MapControlPanel';
import MapStatsBar from '../components/MapStatsBar';
import NYCRequestMap from '../components/NYCRequestMap';
import MapRequestDrawer from '../components/MapRequestDrawer';
import { mockRequests } from '../data/mockRequests';
import {
  applyMapFilters,
  DEFAULT_MAP_FILTERS,
  getMapStats,
} from '../utils/mapHelpers';
import { PAGE_SECTION_GAP } from '../styles/modelViewLayout';

export default function MapPage() {
  const [filters, setFilters] = useState(DEFAULT_MAP_FILTERS);
  const [colorMode, setColorMode] = useState('delayBucket');
  const [highDelayOnly, setHighDelayOnly] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filteredRequests = useMemo(
    () => applyMapFilters(mockRequests, filters, { highDelayOnly }),
    [filters, highDelayOnly],
  );

  const stats = useMemo(() => getMapStats(filteredRequests), [filteredRequests]);

  const selectedRequestId = selectedRequest?.unique_key ?? selectedRequest?._id ?? null;

  const handleFiltersChange = useCallback((next) => {
    setFilters(next);
  }, []);

  const handleReset = useCallback(() => {
    setFilters(DEFAULT_MAP_FILTERS);
    setHighDelayOnly(false);
    setColorMode('delayBucket');
  }, []);

  const handleSelectRequest = useCallback((request) => {
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
          pb: '96px',
        }}
      >
        <PageIntro
          page="map"
          eyebrow="Spatial Exploration"
          title="NYC Request Map"
          description="View 311 requests on a real NYC map, colored by delay bucket, complaint type, status, or prediction risk."
        />

        <MapStatsBar stats={stats} />

        <MapControlPanel
          requests={mockRequests}
          filters={filters}
          colorMode={colorMode}
          highDelayOnly={highDelayOnly}
          onFiltersChange={handleFiltersChange}
          onColorModeChange={setColorMode}
          onHighDelayOnlyChange={setHighDelayOnly}
          onReset={handleReset}
        />

        <Box sx={{ minHeight: 0 }}>
          <NYCRequestMap
            requests={filteredRequests}
            colorMode={colorMode}
            selectedRequestId={selectedRequestId}
            onSelectRequest={handleSelectRequest}
          />
        </Box>
      </Box>

      <MapRequestDrawer
        request={selectedRequest}
        open={drawerOpen}
        onClose={handleCloseDrawer}
      />
    </>
  );
}
