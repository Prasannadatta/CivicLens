import { useEffect, useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';
import {
  Typography,
  Box,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  alpha,
  Tooltip,
} from '@mui/material';
import ScatterPlotIcon from '@mui/icons-material/ScatterPlot';
import { getChartColors, getChartPlotBox, getChartTooltipBox, getSelectedFilterChipSx } from '../theme';
import { useAppColors, useColorMode } from '../ColorModeContext';
import { formatHours } from '../utils/analytics';
import GlassChartCard from './GlassChartCard';
import VizSectionHeader from './VizSectionHeader';

const MAX_POINTS = 1500;
const NYC = { lat: [40.49, 40.92], lng: [-74.26, -73.68] };

const COLOR_MODES = [
  { key: 'complaintType', label: 'Complaint Type' },
  { key: 'responseTime', label: 'Response Time' },
  { key: 'delayRisk', label: 'Delay Risk' },
  { key: 'unresolved', label: 'Unresolved' },
];

function getPointRecord(point) {
  return point?.record || point;
}

function isUnresolvedPoint(point) {
  const record = getPointRecord(point);
  if (record?.is_unresolved != null) return Number(record.is_unresolved) === 1;
  return ['Open', 'In Progress', 'Pending'].includes(record?.status);
}

function getRisk(point) {
  return Number(point?.risk ?? point?.record?.delay_risk_score ?? 0);
}

function getResponseHours(point) {
  return Number(point?.responseHours ?? point?.record?.response_hours ?? 0);
}

export default function HotspotExplorer({
  points = [],
  selectedComplaint = null,
  onSelectRequest,
}) {
  const colors = useAppColors();
  const { mode } = useColorMode();
  const chartColors = useMemo(() => getChartColors(colors), [colors]);
  const chartPlotBox = useMemo(() => getChartPlotBox(colors, mode), [colors, mode]);
  const chartTooltipBox = useMemo(() => getChartTooltipBox(colors), [colors]);
  const selectedFilterChipSx = useMemo(() => getSelectedFilterChipSx(colors), [colors]);

  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const zoomRef = useRef(null);
  const zoomLayerRef = useRef(null);
  const [tooltip, setTooltip] = useState(null);
  const [colorMode, setColorMode] = useState('complaintType');
  const [dimensions, setDimensions] = useState({ width: 720, height: 380 });

  const renderPoints = useMemo(
    () => points.slice(0, MAX_POINTS),
    [points],
  );

  useEffect(() => {
    if (!containerRef.current) return undefined;

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (width > 0 && height > 0) setDimensions({ width, height });
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!svgRef.current) return;

    // D3 scatter + zoom: lng/lat projected to screen; point radius encodes delay risk; color varies by mode dropdown.
    const { width, height } = dimensions;
    const margin = { top: 16, right: 16, bottom: 16, left: 16 };
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current);
    svg.attr('width', width).attr('height', height);

    let viewport = svg.select('g.viewport');
    if (viewport.empty()) {
      svg.selectAll('*').remove();
      svg.attr('role', 'img').attr('aria-label', 'Hotspot explorer scatter plot');

      const defs = svg.append('defs');
      const bgGradient = defs.append('radialGradient').attr('id', 'hotspot-bg-gradient');
      bgGradient.append('stop').attr('offset', '0%').attr('class', 'bg-stop-start');
      bgGradient.append('stop').attr('offset', '100%').attr('class', 'bg-stop-end');

      viewport = svg
        .append('g')
        .attr('class', 'viewport')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      viewport
        .append('rect')
        .attr('class', 'plot-bg')
        .attr('rx', 14)
        .attr('fill', 'url(#hotspot-bg-gradient)');

      const zoomLayer = viewport.append('g').attr('class', 'zoom-layer');
      zoomLayer.append('g').attr('class', 'grid-layer');
      zoomLayer.append('g').attr('class', 'points-layer');
      zoomLayerRef.current = zoomLayer.node();

      const zoomBehavior = d3
        .zoom()
        .scaleExtent([1, 10])
        .translateExtent([[0, 0], [innerW, innerH]])
        .extent([[0, 0], [innerW, innerH]])
        .on('zoom', (event) => {
          d3.select(zoomLayerRef.current).attr('transform', event.transform);
        });

      svg.call(zoomBehavior).call(zoomBehavior.transform, d3.zoomIdentity);
      zoomRef.current = zoomBehavior;
    }

    svg.select('#hotspot-bg-gradient .bg-stop-start').attr('stop-color', colors.chartBgStart);
    svg.select('#hotspot-bg-gradient .bg-stop-end').attr('stop-color', colors.chartBgEnd);

    viewport.select('.plot-bg').attr('width', innerW).attr('height', innerH);

    const zoomLayer = d3.select(zoomLayerRef.current);
    const xScale = d3.scaleLinear().domain(NYC.lng).range([0, innerW]);
    const yScale = d3.scaleLinear().domain(NYC.lat).range([innerH, 0]);

    const gridLayer = zoomLayer.select('.grid-layer');
    gridLayer.selectAll('*').remove();

    gridLayer
      .selectAll('line.h')
      .data(yScale.ticks(6))
      .join('line')
      .attr('x1', 0)
      .attr('x2', innerW)
      .attr('y1', (d) => yScale(d))
      .attr('y2', (d) => yScale(d))
      .attr('stroke', colors.gridStroke);

    gridLayer
      .selectAll('line.v')
      .data(xScale.ticks(7))
      .join('line')
      .attr('y1', 0)
      .attr('y2', innerH)
      .attr('x1', (d) => xScale(d))
      .attr('x2', (d) => xScale(d))
      .attr('stroke', colors.gridStroke);

    const complaintTypes = [...new Set(renderPoints.map((p) => p.complaintType))];
    const colorOrdinal = d3.scaleOrdinal(chartColors).domain(complaintTypes);

    const responseExtent = d3.extent(renderPoints, getResponseHours);
    const riskExtent = d3.extent(renderPoints, getRisk);
    const colorResponse = d3
      .scaleSequential(d3.interpolateRgb(colors.chartScaleLow, colors.warning))
      .domain(responseExtent[0] === responseExtent[1] ? [0, 1] : responseExtent);
    const colorRisk = d3
      .scaleSequential(d3.interpolateRgb(colors.chartScaleLow, colors.error))
      .domain(riskExtent[0] === riskExtent[1] ? [0, 1] : riskExtent);

    const maxRisk = d3.max(renderPoints, getRisk) || 1;
    const radiusScale = d3.scaleSqrt().domain([0, maxRisk]).range([1.8, 9]);

    const getColor = (point) => {
      switch (colorMode) {
        case 'responseTime':
          return colorResponse(getResponseHours(point));
        case 'delayRisk':
          return colorRisk(getRisk(point));
        case 'unresolved':
          return isUnresolvedPoint(point) ? colors.error : colors.secondary;
        default:
          return colorOrdinal(point.complaintType);
      }
    };

    const getOpacity = (point) => {
      if (selectedComplaint && point.complaintType !== selectedComplaint) return 0.08;
      return 0.42;
    };

    const getRadius = (point) => radiusScale(getRisk(point));

    const circles = zoomLayer
      .select('.points-layer')
      .selectAll('circle')
      .data(renderPoints, (d) => d.id)
      .join(
        (enter) => enter.append('circle').attr('class', 'hotspot-point').style('cursor', 'pointer'),
        (update) => update,
        (exit) => exit.remove(),
      );

    circles
      .transition()
      .duration(450)
      .ease(d3.easeCubicOut)
      .attr('cx', (d) => xScale(d.longitude))
      .attr('cy', (d) => yScale(d.latitude))
      .attr('r', getRadius)
      .attr('fill', getColor)
      .attr('stroke', colors.treemapStroke)
      .attr('stroke-width', 0.6)
      .attr('opacity', getOpacity);

    circles.each(function attachHandlers(d) {
      d3.select(this)
        .on('mouseenter', function onEnter(event) {
          d3.select(this).attr('opacity', 0.95).attr('stroke-width', 1.4);
          setTooltip({ x: event.offsetX, y: event.offsetY, point: d });
        })
        .on('mousemove', (event) => {
          setTooltip((prev) => (prev ? { ...prev, x: event.offsetX, y: event.offsetY } : prev));
        })
        .on('mouseleave', function onLeave() {
          d3.select(this).attr('opacity', getOpacity(d)).attr('stroke-width', 0.6);
          setTooltip(null);
        })
        .on('click', () => {
          onSelectRequest?.(getPointRecord(d));
        });
    });
  }, [renderPoints, colorMode, selectedComplaint, dimensions, onSelectRequest, colors, chartColors]);

  return (
    <GlassChartCard selected={Boolean(selectedComplaint)} accent="#fb923c">
      <VizSectionHeader
        icon={ScatterPlotIcon}
        iconColor="#fb923c"
        title="Hotspot Explorer"
        subtitle="Geocoded 311 requests over NYC bounds — pan and zoom to inspect dense corridors and outliers."
        tooltip="Point size reflects delay risk score. Color modes help separate complaint mix from timing and backlog signals."
        selected={Boolean(selectedComplaint)}
        chips={
          selectedComplaint
            ? [{ key: 'cc', label: `Filtered: ${selectedComplaint}`, size: 'small', sx: selectedFilterChipSx }]
            : []
        }
        actions={(
          <Stack direction="row" spacing={1} useFlexGap sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
            <Tooltip title="Choose how dots are tinted (ordinal complaint vs sequential delay)" arrow>
              <FormControl size="small" sx={{ minWidth: 170 }}>
                <InputLabel id="hotspot-color-mode">Color Mode</InputLabel>
                <Select
                  labelId="hotspot-color-mode"
                  value={colorMode}
                  label="Color Mode"
                  onChange={(event) => setColorMode(event.target.value)}
                >
                  {COLOR_MODES.map(({ key, label }) => (
                    <MenuItem key={key} value={key}>
                      {label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Tooltip>
            <Chip
              size="small"
              label={
                points.length > MAX_POINTS
                  ? `${renderPoints.length.toLocaleString()} of ${points.length.toLocaleString()} pts`
                  : `${renderPoints.length.toLocaleString()} pts`
              }
              sx={{ bgcolor: alpha(colors.primary, 0.1), border: `1px solid ${alpha(colors.primary, 0.22)}` }}
            />
          </Stack>
        )}
      />

      <Box
        ref={containerRef}
        sx={{
          ...chartPlotBox,
          height: { xs: 320, md: 380 },
          mt: 0.5,
          cursor: 'grab',
          '&:active': { cursor: 'grabbing' },
        }}
      >
          {renderPoints.length === 0 ? (
            <Box
              sx={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: colors.textMuted,
              }}
            >
              <Typography variant="body2">No geocoded requests for the current filters.</Typography>
            </Box>
          ) : (
            <svg ref={svgRef} style={{ width: '100%', height: '100%', display: 'block' }} />
          )}

          {tooltip && (
            <Box
              sx={{
                ...chartTooltipBox,
                position: 'absolute',
                left: Math.min(tooltip.x + 14, dimensions.width - 230),
                top: Math.max(tooltip.y - 10, 8),
                maxWidth: 240,
              }}
            >
              <Typography variant="subtitle2" sx={{ color: colors.textPrimary, fontSize: '0.82rem' }}>
                {tooltip.point.complaintType}
              </Typography>
              <Typography variant="caption" sx={{ display: 'block', color: colors.textSecondary }}>
                Borough: {tooltip.point.borough}
              </Typography>
              <Typography variant="caption" sx={{ display: 'block', color: colors.textSecondary }}>
                Response: {formatHours(getResponseHours(tooltip.point))}
              </Typography>
              <Typography variant="caption" sx={{ color: colors.warning }}>
                Status: {tooltip.point.status}
              </Typography>
            </Box>
          )}
        </Box>

        <Stack spacing={1.25} sx={{ mt: 1.5 }}>
          <Typography variant="caption" sx={{ color: colors.textMuted, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', fontSize: '0.6rem' }}>
            Legend · color by mode
          </Typography>
          <Stack direction="row" spacing={2} useFlexGap sx={{ flexWrap: 'wrap' }}>
            {colorMode === 'complaintType' && chartColors.slice(0, 4).map((c, i) => (
              <Stack key={c} direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
                <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: c, boxShadow: `0 0 10px ${alpha(c, 0.35)}` }} />
                <Typography variant="caption" sx={{ color: colors.textMuted }}>Category {i + 1}</Typography>
              </Stack>
            ))}
            {colorMode === 'responseTime' && (
              <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
                <Box sx={{ width: 36, height: 10, borderRadius: 1, background: `linear-gradient(90deg, ${colors.chartScaleLow}, ${colors.warning})` }} />
                <Typography variant="caption" sx={{ color: colors.textMuted }}>Faster ← → slower response</Typography>
              </Stack>
            )}
            {colorMode === 'delayRisk' && (
              <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
                <Box sx={{ width: 36, height: 10, borderRadius: 1, background: `linear-gradient(90deg, ${colors.chartScaleLow}, ${colors.error})` }} />
                <Typography variant="caption" sx={{ color: colors.textMuted }}>Lower ← → higher risk</Typography>
              </Stack>
            )}
            {colorMode === 'unresolved' && (
              <Stack direction="row" spacing={2}>
                <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: colors.secondary }} />
                  <Typography variant="caption" sx={{ color: colors.textMuted }}>Closed</Typography>
                </Stack>
                <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: colors.error }} />
                  <Typography variant="caption" sx={{ color: colors.textMuted }}>Unresolved</Typography>
                </Stack>
              </Stack>
            )}
          </Stack>
          <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: colors.textMuted }} />
            <Typography variant="caption" sx={{ color: colors.textMuted }}>Dot radius · delay risk score</Typography>
          </Stack>
        </Stack>

        <Typography variant="caption" sx={{ display: 'block', mt: 1, color: colors.textMuted }}>
          Scroll to zoom · drag to pan · click a dot to open detail drawer
        </Typography>
      </GlassChartCard>
    );
}
