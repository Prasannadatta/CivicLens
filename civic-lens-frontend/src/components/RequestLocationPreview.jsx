import { useEffect, useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Box, Typography, alpha } from '@mui/material';
import { useAppColors, useColorMode } from '../ColorModeContext';
import { cardSubtitleSx, cardTitleSx } from '../styles/modelViewLayout';
import {
  getBoroughShade,
  getBoroughStrokeColor,
  normalizeBoroughName,
} from '../styles/dashboardColors';
import boroughGeoRaw from '../data/nyc-boroughs.geojson?raw';
import DashboardCard from './DashboardCard';
import ChartTooltip from './ChartTooltip';

const boroughGeoJson = JSON.parse(boroughGeoRaw);

const MAP_HEIGHT = 210;
const MAP_PADDING = { top: 10, right: 12, bottom: 10, left: 12 };

function getBoroughFromFeature(feature) {
  const raw = feature?.properties?.borough || feature?.properties?.name || 'Unknown';
  return normalizeBoroughName(raw);
}

function isValidNycCoordinate(lat, lng) {
  return Number.isFinite(lat)
    && Number.isFinite(lng)
    && lat >= 40.45
    && lat <= 40.95
    && lng >= -74.3
    && lng <= -73.65;
}

function resolveCoordinates(request) {
  const lat = Number(request?.latitude);
  const lng = Number(request?.longitude);
  if (!isValidNycCoordinate(lat, lng)) {
    return { lat: null, lng: null, hasCoords: false };
  }
  return { lat, lng, hasCoords: true };
}

export default function RequestLocationPreview({ request }) {
  const colors = useAppColors();
  const { mode } = useColorMode();
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: MAP_HEIGHT });
  const [tooltip, setTooltip] = useState(null);

  const geoFeatures = useMemo(
    () => boroughGeoJson.features.map((feature) => ({
      ...feature,
      borough: getBoroughFromFeature(feature),
    })),
    [],
  );

  const { lat, lng, hasCoords } = useMemo(
    () => resolveCoordinates(request),
    [request?.latitude, request?.longitude],
  );

  const requestBorough = normalizeBoroughName(request?.borough);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return undefined;

    const updateSize = () => {
      const width = Math.max(node.clientWidth, 1);
      setDimensions({ width, height: MAP_HEIGHT });
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!svgRef.current || dimensions.width <= 0) return;

    const { width, height } = dimensions;
    const innerWidth = Math.max(width - MAP_PADDING.left - MAP_PADDING.right, 80);
    const innerHeight = Math.max(height - MAP_PADDING.top - MAP_PADDING.bottom, 80);

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    svg
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .style('width', '100%')
      .style('height', 'auto')
      .style('display', 'block')
      .attr('role', 'img')
      .attr('aria-label', hasCoords
        ? `Request location in ${requestBorough || 'NYC'}`
        : 'NYC borough map — location unavailable');

    const defs = svg.append('defs');
    const panelGradient = defs
      .append('linearGradient')
      .attr('id', 'location-preview-bg')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '100%');
    panelGradient
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', mode === 'light' ? colors.mapOceanStart : colors.chartPlotBg);
    panelGradient
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', mode === 'light' ? colors.mapOceanEnd : colors.cardElevated ?? colors.chartPlotBg);

    const glowFilter = defs.append('filter').attr('id', 'location-dot-glow');
    glowFilter.attr('x', '-50%').attr('y', '-50%').attr('width', '200%').attr('height', '200%');
    glowFilter.append('feGaussianBlur').attr('stdDeviation', '2.2').attr('result', 'blur');
    const glowMerge = glowFilter.append('feMerge');
    glowMerge.append('feMergeNode').attr('in', 'blur');
    glowMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    const root = svg
      .append('g')
      .attr('transform', `translate(${MAP_PADDING.left},${MAP_PADDING.top})`);

    root
      .append('rect')
      .attr('width', innerWidth)
      .attr('height', innerHeight)
      .attr('rx', 12)
      .attr('fill', 'url(#location-preview-bg)')
      .attr('stroke', colors.border)
      .attr('stroke-width', 1);

    const projection = d3.geoMercator();
    const path = d3.geoPath().projection(projection);
    projection.fitSize([innerWidth - 16, innerHeight - 16], boroughGeoJson);

    const mapLayer = root
      .append('g')
      .attr('transform', 'translate(8, 8)');

    mapLayer
      .selectAll('.borough-shape')
      .data(geoFeatures, (d) => d.borough)
      .join('path')
      .attr('class', 'borough-shape')
      .attr('d', (d) => path(d))
      .attr('fill', (d) => getBoroughShade(d.borough, mode, 'map'))
      .attr('fill-opacity', (d) => (
        requestBorough && d.borough === requestBorough ? 0.82 : 0.55
      ))
      .attr('stroke', (d) => getBoroughStrokeColor(d.borough, mode))
      .attr('stroke-width', (d) => (
        requestBorough && d.borough === requestBorough ? 1.8 : 1.1
      ))
      .attr('opacity', (d) => (
        requestBorough && d.borough !== requestBorough ? 0.72 : 0.94
      ));

    if (hasCoords) {
      const [x, y] = projection([lng, lat]);
      if (Number.isFinite(x) && Number.isFinite(y)) {
        const dotGroup = mapLayer
          .append('g')
          .attr('class', 'request-dot')
          .attr('transform', `translate(${x},${y})`)
          .style('cursor', 'default');

        dotGroup
          .append('circle')
          .attr('r', 10)
          .attr('fill', alpha(colors.accentPink, 0.18))
          .attr('stroke', 'none');

        dotGroup
          .append('circle')
          .attr('r', 5.5)
          .attr('fill', colors.accentPink)
          .attr('stroke', mode === 'light' ? '#ffffff' : colors.textPrimary)
          .attr('stroke-width', 1.5)
          .attr('filter', 'url(#location-dot-glow)')
          .on('mouseenter', (event) => {
            setTooltip({
              x: event.offsetX,
              y: event.offsetY,
              data: request,
            });
          })
          .on('mousemove', (event) => {
            setTooltip((prev) => (prev ? { ...prev, x: event.offsetX, y: event.offsetY } : prev));
          })
          .on('mouseleave', () => setTooltip(null));
      }
    } else {
      mapLayer
        .append('text')
        .attr('x', (innerWidth - 16) / 2)
        .attr('y', (innerHeight - 16) / 2)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('fill', colors.textSecondary)
        .attr('font-size', 13)
        .attr('font-weight', 600)
        .text('Location unavailable');
    }
  }, [
    dimensions,
    hasCoords,
    lat,
    lng,
    mode,
    colors,
    geoFeatures,
    request,
    requestBorough,
  ]);

  if (!request) {
    return null;
  }

  const address = request.incident_address?.trim() || 'Address unavailable';
  const boroughLabel = request.borough ?? '—';
  const zipLabel = request.incident_zip ?? '—';

  return (
    <DashboardCard
      sx={{ width: '100%', height: '100%' }}
      contentSx={{
        p: '22px',
        width: '100%',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: 1.25,
        '&:last-child': { pb: '22px' },
      }}
    >
      <Typography variant="subtitle2" sx={{ ...cardTitleSx, color: colors.textSecondary, flexShrink: 0 }}>
        Request Location
      </Typography>

      <Box
        ref={containerRef}
        sx={{
          position: 'relative',
          width: '100%',
          minWidth: 0,
          flexShrink: 0,
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <svg ref={svgRef} />
        {tooltip ? (
          <ChartTooltip
            x={tooltip.x}
            y={tooltip.y}
            title={tooltip.data?.complaint_type || 'Request'}
            rows={[
              { label: 'Borough', value: tooltip.data?.borough ?? '—' },
              { label: 'ZIP', value: tooltip.data?.incident_zip ?? '—' },
              { label: 'Agency', value: tooltip.data?.agency ?? '—' },
              { label: 'Status', value: tooltip.data?.status ?? '—' },
            ]}
            compact
          />
        ) : null}
      </Box>

      <Box sx={{ minWidth: 0 }}>
        <Typography
          variant="body1"
          noWrap
          title={address}
          sx={{
            color: colors.textPrimary,
            fontWeight: 600,
            fontSize: '0.9375rem',
            lineHeight: 1.35,
          }}
        >
          {address}
        </Typography>
        <Typography variant="body2" sx={{ ...cardSubtitleSx, color: colors.textSecondary, mt: 0.35 }}>
          {boroughLabel} · ZIP {zipLabel}
        </Typography>
        {request.complaint_type ? (
          <Typography variant="body2" sx={{ ...cardSubtitleSx, color: colors.textMuted, mt: 0.35 }}>
            {request.complaint_type}
            {request.agency ? ` · ${request.agency}` : ''}
            {request.status ? ` · ${request.status}` : ''}
          </Typography>
        ) : null}
      </Box>
    </DashboardCard>
  );
}
