import { useMemo, useCallback } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip, Popup } from 'react-leaflet';
import { Box, Typography, alpha } from '@mui/material';
import { useAppColors, useColorMode } from '../ColorModeContext';
import { formatHours } from '../utils/analytics';
import { getChartTooltipTextPrimary, getChartTooltipTextSecondary } from '../styles/chartTooltip';
import {
  buildComplaintTypeColorMap,
  getMapPlotPoints,
  getMarkerColor,
  getMarkerRadius,
  getBucket,
  isOpenRequest,
} from '../utils/mapHelpers';
import MapLegend from './MapLegend';
import AppCard from './AppCard';

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
  const bucket = getBucket(request);
  return bucket === '3–7 Days' || bucket === 'More than 1 Week';
}

function getMarkerVisuals(request, color, isSelected, themeMode, colors) {
  const radius = getMarkerRadius(request);
  const highDelay = isHighDelayMarker(request);
  const strokeColor = themeMode === 'light' ? '#ffffff' : '#141827';
  const selectedRing = colors.secondary;
  const fillOpacity = isSelected ? 0.82 : highDelay ? 0.78 : 0.68;

  return {
    radius,
    pathOptions: {
      fillColor: color,
      fillOpacity,
      color: isSelected ? selectedRing : strokeColor,
      weight: isSelected ? 3 : 1.5,
      opacity: 0.9,
    },
    hoverFillOpacity: isSelected ? 0.85 : highDelay ? 0.82 : 0.75,
    restFillOpacity: fillOpacity,
  };
}

function MapRequestSummary({ request, onViewModelDetails, showModelLink = false }) {
  const { mode } = useColorMode();
  const isLight = mode === 'light';
  const textPrimary = getChartTooltipTextPrimary(isLight);
  const textSecondary = getChartTooltipTextSecondary(isLight);
  const linkColor = isLight ? '#2563eb' : '#60a5fa';
  const bucket = getBucket(request) ?? '—';
  const rows = [
    `Borough / ZIP: ${request.borough} · ${request.incident_zip ?? '—'}`,
    `Agency: ${request.agency}`,
    `Predicted delay: ${formatHours(request.predicted_response_hours)}`,
    `Status: ${request.status}`,
    `Bucket: ${bucket}`,
  ];

  return (
    <div style={{ minWidth: 150, maxWidth: 240 }}>
      <div style={{ fontWeight: 700, fontSize: 14, lineHeight: 1.3, color: textPrimary, marginBottom: 4 }}>
        {request.complaint_type}
      </div>
      {rows.map((row) => (
        <div key={row} style={{ fontSize: 12, lineHeight: 1.45, color: textSecondary }}>
          {row}
        </div>
      ))}
      {showModelLink && isOpenRequest(request) ? (
        <button
          type="button"
          onClick={() => onViewModelDetails?.(request)}
          style={{
            marginTop: 10,
            padding: 0,
            border: 'none',
            background: 'none',
            color: linkColor,
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
            textDecoration: 'underline',
            fontFamily: 'inherit',
          }}
        >
          View model details
        </button>
      ) : null}
    </div>
  );
}

function RequestMarker({
  request,
  color,
  isSelected,
  themeMode,
  colors,
  onSelect,
  onViewModelDetails,
  showModelLink,
}) {
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
        click: () => {
          onSelect?.(request);
        },
        mouseover: (e) => {
          e.target.setStyle({ fillOpacity: hoverFillOpacity });
        },
        mouseout: (e) => {
          e.target.setStyle({ fillOpacity: restFillOpacity });
        },
      }}
    >
      <Tooltip direction="top" offset={[0, -8]} opacity={1} className="civic-map-tooltip">
        <MapRequestSummary request={request} />
      </Tooltip>
      <Popup closeButton className="civic-map-popup" offset={[0, -8]}>
        <MapRequestSummary
          request={request}
          showModelLink={showModelLink}
          onViewModelDetails={onViewModelDetails}
        />
      </Popup>
    </CircleMarker>
  );
}

export default function NYCRequestMap({
  requests = [],
  colorMode = 'delayBucket',
  selectedRequestId = null,
  onSelectRequest,
  onViewModelDetails,
  showModelLink = false,
}) {
  const colors = useAppColors();
  const { mode } = useColorMode();

  const plotPoints = useMemo(() => getMapPlotPoints(requests), [requests]);

  const { colorMap, topTypes } = useMemo(
    () => buildComplaintTypeColorMap(requests, mode),
    [requests, mode],
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
    <AppCard
      accent="map"
      sx={{ height: '100%', overflow: 'hidden' }}
      contentSx={{
        p: 0,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          height: mapHeight,
          minHeight: 480,
          overflow: 'hidden',
          bgcolor: 'transparent',
          '& .leaflet-container': {
            height: '100%',
            width: '100%',
            fontFamily: 'inherit',
            background: mode === 'light' ? '#eef2f6' : colors.mapOceanStart,
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
            {plotPoints.map((request, index) => {
              const id = request.unique_key ?? request._id;
              const markerColor = getMarkerColor(request, colorMode, colorMap, topTypes, mode);
              return (
                <RequestMarker
                  key={`${id ?? 'point'}-${request.latitude}-${request.longitude}-${index}`}
                  request={request}
                  color={markerColor}
                  isSelected={selectedRequestId === id}
                  themeMode={mode}
                  colors={colors}
                  onSelect={handleSelect}
                  onViewModelDetails={onViewModelDetails}
                  showModelLink={showModelLink}
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
    </AppCard>
  );
}
