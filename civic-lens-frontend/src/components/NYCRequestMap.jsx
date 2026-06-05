import { useMemo, useCallback } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet';
import { Box, Typography, alpha } from '@mui/material';
import { useAppColors, useColorMode } from '../ColorModeContext';
import { formatHours } from '../utils/analytics';
import {
  buildComplaintTypeColorMap,
  getMapPlotPoints,
  getMarkerColor,
  getMarkerRadius,
  getRequestDelayBucket,
} from '../utils/mapHelpers';
import MapLegend from './MapLegend';
import DashboardCard from './DashboardCard';

const NYC_CENTER = [40.7128, -74.006];
const DEFAULT_ZOOM = 11;
const NYC_MAX_BOUNDS = [
  [40.45, -74.35],
  [41.0, -73.65],
];

const BASEMAP_ATTRIBUTION = '&copy; OpenStreetMap contributors &copy; CARTO';

const BASEMAP_TILES = {
  light: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
  dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
};

// TODO: Add NYC borough GeoJSON (e.g. data/nyc-boroughs.geojson) and render with
// react-leaflet GeoJSON — color #2563eb, weight 1.2, opacity 0.65, fillOpacity 0.02.

function isHighDelayMarker(request) {
  const bucket = getRequestDelayBucket(request);
  return bucket === '3–7 Days' || bucket === 'More than 1 Week';
}

function getMarkerVisuals(request, color, isSelected, themeMode, colors) {
  const baseRadius = getMarkerRadius(request);
  const highDelay = isHighDelayMarker(request);
  const radius = highDelay ? Math.min(baseRadius + 1.2, 11) : baseRadius;
  const strokeColor = themeMode === 'light' ? '#ffffff' : '#141827';
  const selectedRing = colors.primary;

  const fillOpacity = isSelected ? 0.92 : highDelay ? 0.82 : 0.72;

  return {
    radius,
    pathOptions: {
      fillColor: color,
      fillOpacity,
      color: isSelected ? selectedRing : strokeColor,
      weight: isSelected ? 3 : 1.5,
      opacity: isSelected ? 1 : 0.95,
    },
    hoverFillOpacity: isSelected ? 0.92 : highDelay ? 0.9 : 0.85,
    restFillOpacity: fillOpacity,
  };
}

function MapTooltipContent({ request }) {
  const bucket = getRequestDelayBucket(request);
  return (
    <div style={{ minWidth: 160, maxWidth: 220, lineHeight: 1.45 }}>
      <div style={{ fontWeight: 700, fontSize: '0.78rem', marginBottom: 4 }}>
        {request.complaint_type}
      </div>
      <div style={{ fontSize: '0.72rem' }}>
        {request.borough} · {request.incident_zip}
        <br />
        {request.agency}
        <br />
        Predicted: {formatHours(request.predicted_response_hours)}
        <br />
        {bucket} · {request.status}
      </div>
    </div>
  );
}

function RequestMarker({ request, color, isSelected, themeMode, colors, onSelect }) {
  const lat = Number(request.latitude);
  const lng = Number(request.longitude);
  const { radius, pathOptions, hoverFillOpacity, restFillOpacity } = getMarkerVisuals(
    request,
    color,
    isSelected,
    themeMode,
    colors,
  );

  return (
    <CircleMarker
      center={[lat, lng]}
      radius={radius}
      pathOptions={pathOptions}
      eventHandlers={{
        click: () => onSelect?.(request),
        mouseover: (e) => {
          e.target.setStyle({ fillOpacity: hoverFillOpacity });
        },
        mouseout: (e) => {
          e.target.setStyle({ fillOpacity: restFillOpacity });
        },
      }}
    >
      <Tooltip direction="top" offset={[0, -6]} opacity={0.95}>
        <MapTooltipContent request={request} />
      </Tooltip>
    </CircleMarker>
  );
}

export default function NYCRequestMap({
  requests = [],
  colorMode = 'delayBucket',
  selectedRequestId = null,
  onSelectRequest,
}) {
  const colors = useAppColors();
  const { mode } = useColorMode();

  const plotPoints = useMemo(() => getMapPlotPoints(requests), [requests]);

  const { colorMap, topTypes } = useMemo(
    () => buildComplaintTypeColorMap(requests),
    [requests],
  );

  const complaintLegend = useMemo(
    () => topTypes.map((type) => ({
      type,
      color: colorMap[type],
      otherColor: colorMap.__other,
    })),
    [topTypes, colorMap],
  );

  const handleSelect = useCallback(
    (request) => onSelectRequest?.(request),
    [onSelectRequest],
  );

  const mapHeight = {
    xs: 480,
    sm: 560,
    md: 680,
    lg: 720,
  };

  const tileUrl = BASEMAP_TILES[mode] ?? BASEMAP_TILES.light;

  return (
    <DashboardCard
      contentSx={{
        p: 0,
        position: 'relative',
        overflow: 'hidden',
        '&:last-child': { pb: 0 },
      }}
      sx={{ height: '100%' }}
    >
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          height: mapHeight,
          minHeight: 480,
          borderRadius: '20px',
          overflow: 'hidden',
          '& .leaflet-container': {
            height: '100%',
            width: '100%',
            fontFamily: 'inherit',
            background: mode === 'light' ? '#f1f3f5' : colors.mapOceanStart,
          },
          '& .leaflet-control-attribution': {
            fontSize: '0.62rem',
            opacity: mode === 'light' ? 0.75 : 0.55,
            color: mode === 'light' ? '#64748b' : '#94a3b8',
            background: mode === 'light' ? 'rgba(255,255,255,0.7)' : 'rgba(31,41,55,0.75)',
          },
        }}
      >
        {plotPoints.length === 0 ? (
          <Box
            sx={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: mode === 'light' ? '#f1f3f5' : alpha(colors.background, 0.6),
            }}
          >
            <Typography variant="body2" sx={{ color: colors.textSecondary }}>
              No requests with valid coordinates match the current filters.
            </Typography>
          </Box>
        ) : (
          <MapContainer
            center={NYC_CENTER}
            zoom={DEFAULT_ZOOM}
            minZoom={10}
            maxZoom={16}
            maxBounds={NYC_MAX_BOUNDS}
            maxBoundsViscosity={0.8}
            scrollWheelZoom
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution={BASEMAP_ATTRIBUTION}
              url={tileUrl}
            />
            {plotPoints.map((request) => {
              const id = request.unique_key ?? request._id;
              const markerColor = getMarkerColor(request, colorMode, colorMap, topTypes);
              return (
                <RequestMarker
                  key={id}
                  request={request}
                  color={markerColor}
                  isSelected={selectedRequestId === id}
                  themeMode={mode}
                  colors={colors}
                  onSelect={handleSelect}
                />
              );
            })}
          </MapContainer>
        )}

        {plotPoints.length > 0 && (
          <MapLegend
            colorMode={colorMode}
            complaintLegend={complaintLegend}
            otherColor={colorMap.__other}
          />
        )}
      </Box>
    </DashboardCard>
  );
}
