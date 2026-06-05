import { useEffect, useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';
import {
  Typography,
  Box,
  Stack,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  alpha,
} from '@mui/material';
import MapOutlinedIcon from '@mui/icons-material/MapOutlined';
import { getChartPlotBox, getSelectedFilterChipSx } from '../theme';
import ChartTooltip from './ChartTooltip';
import { getTooltipMetricColors } from '../styles/chartTooltip';
import { useAppColors, useColorMode } from '../ColorModeContext';
import { formatHours } from '../utils/analytics';
import GlassChartCard from './GlassChartCard';
import VizSectionHeader from './VizSectionHeader';

const VIEWBOX = { width: 1000, height: 680 };

const ALL_BOROUGHS = ['Bronx', 'Manhattan', 'Queens', 'Brooklyn', 'Staten Island'];

const BOROUGH_PATHS = {
  Bronx: 'M 390 52 L 585 34 Q 655 42 668 118 L 648 192 Q 560 215 472 188 L 382 148 Q 358 96 390 52 Z',
  Manhattan: 'M 452 182 L 548 176 L 558 572 Q 502 592 462 578 L 452 182 Z',
  Queens: 'M 562 128 L 905 96 Q 968 168 948 372 L 886 518 Q 718 548 588 486 L 552 348 Q 536 218 562 128 Z',
  Brooklyn: 'M 418 508 L 758 492 Q 828 538 798 652 L 518 678 Q 388 658 418 508 Z',
  'Staten Island': 'M 88 538 L 258 522 Q 312 558 292 642 L 118 662 Q 68 618 88 538 Z',
};

const LABEL_CENTERS = {
  Bronx: [520, 118],
  Manhattan: [505, 380],
  Queens: [760, 320],
  Brooklyn: [610, 590],
  'Staten Island': [190, 595],
};

const METRICS = [
  { key: 'burdenScore', label: 'Burden Score', format: (v) => Number(v).toFixed(2) },
  { key: 'avgResponseHours', label: 'Avg Response Time', format: (v) => formatHours(v) },
  { key: 'unresolvedRate', label: 'Unresolved Rate', format: (v) => `${(Number(v) * 100).toFixed(1)}%` },
  { key: 'count', label: 'Request Volume', format: (v) => Number(v).toLocaleString() },
];

function getMetricColors(c) {
  return {
    burdenScore: [c.chartScaleLow, c.warning],
    count: [c.chartScaleLow, c.primary],
    avgResponseHours: [c.chartScaleLow, c.warning],
    unresolvedRate: [c.chartScaleLow, c.error],
  };
}

const DEFAULT_STAT = (borough) => ({
  borough,
  count: 0,
  avgResponseHours: 0,
  unresolvedRate: 0,
  avgPredictedHours: 0,
  avgRisk: 0,
  burdenScore: 0,
});

function mergeBoroughStats(boroughStats) {
  const lookup = Object.fromEntries((boroughStats || []).map((entry) => [entry.borough, entry]));
  return ALL_BOROUGHS.map((borough) => ({ ...DEFAULT_STAT(borough), ...lookup[borough] }));
}

function getMetricValue(entry, metricKey) {
  const value = Number(entry?.[metricKey] ?? 0);
  return Number.isFinite(value) ? value : 0;
}

function getMetricMeta(metricKey) {
  return METRICS.find((metric) => metric.key === metricKey) || METRICS[0];
}

function shortBoroughName(name) {
  return name === 'Staten Island' ? 'Staten Is.' : name;
}

function buildColorScale(metricKey, stats, c) {
  const metricColors = getMetricColors(c);
  const values = stats.map((entry) => getMetricValue(entry, metricKey));
  const [minValue, maxValue] = d3.extent(values);
  const domainMin = minValue ?? 0;
  const domainMax = maxValue === domainMin ? domainMin + 1 : maxValue ?? 1;
  const [colorStart, colorEnd] = metricColors[metricKey] || metricColors.burdenScore;

  return {
    scale: d3.scaleSequential(d3.interpolateRgb(colorStart, colorEnd)).domain([domainMin, domainMax]),
    domainMin,
    domainMax,
  };
}

export default function ServiceBurdenMap({
  boroughStats = [],
  selectedBorough = null,
  onSelectBorough,
  metric: metricProp,
  onMetricChange,
  title = 'Service Burden Map',
  subtitle = 'Highlights areas with higher request volume, slower response, and unresolved cases.',
  plotHeight,
  compactFooter = false,
  densePlot = false,
}) {
  const colors = useAppColors();
  const { mode } = useColorMode();
  const chartPlotBox = useMemo(() => getChartPlotBox(colors, mode), [colors, mode]);
  const selectedFilterChipSx = useMemo(() => getSelectedFilterChipSx(colors), [colors]);

  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [tooltip, setTooltip] = useState(null);
  const [internalMetric, setInternalMetric] = useState('burdenScore');
  const [dimensions, setDimensions] = useState({ width: 800, height: 420 });

  const metric = metricProp ?? internalMetric;
  const stats = useMemo(() => mergeBoroughStats(boroughStats), [boroughStats]);
  const metricMeta = getMetricMeta(metric);

  const handleMetricChange = (event) => {
    const next = event.target.value;
    if (onMetricChange) onMetricChange(next);
    else setInternalMetric(next);
  };

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

    // D3 choropleth: borough paths are filled by a sequential scale for the active metric.
    // Hover shows KPI tooltips; click toggles borough cross-filtering across the dashboard.
    const svg = d3.select(svgRef.current);
    let root = svg.select('g.map-root');

    if (root.empty()) {
      svg.selectAll('*').remove();
      svg
        .attr('viewBox', `0 0 ${VIEWBOX.width} ${VIEWBOX.height}`)
        .attr('role', 'img')
        .attr('aria-label', 'Service burden map by NYC borough');

      const defs = svg.append('defs');

      const oceanGradient = defs.append('linearGradient').attr('id', 'burden-ocean-gradient');
      oceanGradient.append('stop').attr('offset', '0%').attr('class', 'ocean-stop-start');
      oceanGradient.append('stop').attr('offset', '100%').attr('class', 'ocean-stop-end');

      const glowFilter = defs.append('filter').attr('id', 'borough-glow');
      glowFilter.attr('x', '-40%').attr('y', '-40%').attr('width', '180%').attr('height', '180%');
      glowFilter.append('feGaussianBlur').attr('stdDeviation', '2').attr('result', 'blur');
      const merge = glowFilter.append('feMerge');
      merge.append('feMergeNode').attr('in', 'blur');
      merge.append('feMergeNode').attr('in', 'SourceGraphic');

      defs.append('linearGradient').attr('id', 'burden-legend-gradient');

      root = svg.append('g').attr('class', 'map-root');

      root
        .append('rect')
        .attr('class', 'map-bg')
        .attr('width', VIEWBOX.width)
        .attr('height', VIEWBOX.height)
        .attr('rx', 24)
        .attr('fill', 'url(#burden-ocean-gradient)');

      root
        .append('ellipse')
        .attr('class', 'map-glow-a')
        .attr('cx', 760)
        .attr('cy', 120)
        .attr('rx', 220)
        .attr('ry', 120);

      root
        .append('ellipse')
        .attr('class', 'map-glow-b')
        .attr('cx', 220)
        .attr('cy', 560)
        .attr('rx', 180)
        .attr('ry', 90);

      root.append('g').attr('class', 'borough-layer');
      root.append('g').attr('class', 'legend-layer');
    }

    svg.attr('width', dimensions.width).attr('height', dimensions.height);

    d3.select(svgRef.current)
      .select('#burden-ocean-gradient')
      .selectAll('stop')
      .attr('stop-color', (_, i) => (i === 0 ? colors.mapOceanStart : colors.mapOceanEnd));

    root.select('.map-glow-a').attr('fill', alpha(colors.primary, 0.04));
    root.select('.map-glow-b').attr('fill', alpha(colors.secondary, 0.03));

    const { scale: colorScale, domainMin, domainMax } = buildColorScale(metric, stats, colors);

    d3.select(svgRef.current)
      .select('#burden-legend-gradient')
      .selectAll('stop')
      .data([
        { offset: '0%', color: colorScale(domainMin) },
        { offset: '100%', color: colorScale(domainMax) },
      ])
      .join('stop')
      .attr('offset', (d) => d.offset)
      .attr('stop-color', (d) => d.color);

    const boroughLayer = root.select('.borough-layer');

    const boroughGroups = boroughLayer
      .selectAll('.borough-group')
      .data(stats, (d) => d.borough)
      .join(
        (enter) => {
          const group = enter.append('g').attr('class', 'borough-group').style('cursor', 'pointer');
          group.append('path').attr('class', 'borough-shape');
          group.append('text').attr('class', 'borough-label').attr('pointer-events', 'none');
          group.append('text').attr('class', 'borough-metric').attr('pointer-events', 'none');
          return group;
        },
        (update) => update,
        (exit) => exit.remove(),
      );

    boroughGroups
      .select('.borough-shape')
      .attr('d', (d) => BOROUGH_PATHS[d.borough])
      .transition()
      .duration(650)
      .ease(d3.easeCubicInOut)
      .attr('fill', (d) => colorScale(getMetricValue(d, metric)))
      .attr('stroke', (d) => (selectedBorough === d.borough ? colors.warning : alpha(colors.secondary, 0.45)))
      .attr('stroke-width', (d) => (selectedBorough === d.borough ? 4 : 1.5))
      .attr('opacity', (d) => (selectedBorough && selectedBorough !== d.borough ? 0.38 : 0.92))
      .attr('filter', (d) => (selectedBorough === d.borough ? 'url(#borough-glow)' : null))
      .on('end', function endTransition(_, d) {
        d3.select(this).attr('fill', colorScale(getMetricValue(d, metric)));
      });

    boroughGroups.select('.borough-shape').each(function attachHandlers(d) {
      const shape = d3.select(this);
      shape
        .on('mouseenter', function onEnter(event) {
          const dimmed = selectedBorough && selectedBorough !== d.borough;
          d3.select(this).attr('opacity', 1).attr('stroke-width', selectedBorough === d.borough ? 4 : 2.5);
          setTooltip({ x: event.offsetX, y: event.offsetY, data: d });
        })
        .on('mousemove', (event) => {
          setTooltip((prev) => (prev ? { ...prev, x: event.offsetX, y: event.offsetY } : prev));
        })
        .on('mouseleave', function onLeave() {
          const dimmed = selectedBorough && selectedBorough !== d.borough;
          d3.select(this)
            .attr('opacity', dimmed ? 0.38 : 0.92)
            .attr('stroke-width', selectedBorough === d.borough ? 4 : 1.5);
          setTooltip(null);
        })
        .on('click', () => {
          onSelectBorough?.(d.borough === selectedBorough ? null : d.borough);
        });
    });

    boroughGroups
      .select('.borough-label')
      .attr('x', (d) => LABEL_CENTERS[d.borough][0])
      .attr('y', (d) => LABEL_CENTERS[d.borough][1])
      .attr('text-anchor', 'middle')
      .attr('fill', colors.textPrimary)
      .attr('font-size', 18)
      .attr('font-weight', 700)
      .text((d) => shortBoroughName(d.borough));

    boroughGroups
      .select('.borough-metric')
      .transition()
      .duration(650)
      .attr('x', (d) => LABEL_CENTERS[d.borough][0])
      .attr('y', (d) => LABEL_CENTERS[d.borough][1] + 18)
      .attr('text-anchor', 'middle')
      .attr('fill', alpha(colors.textPrimary, 0.72))
      .attr('font-size', 13)
      .text((d) => metricMeta.format(getMetricValue(d, metric)));

    const legendWidth = 260;
    const legendHeight = 12;
    const legend = root
      .select('.legend-layer')
      .attr('transform', `translate(${VIEWBOX.width - legendWidth - 36}, ${VIEWBOX.height - 42})`);

    legend
      .selectAll('*')
      .data([0])
      .join('g')
      .attr('class', 'legend-group')
      .each(function buildLegend() {
        const group = d3.select(this);
        group.selectAll('*').remove();

        group
          .append('text')
          .attr('y', -8)
          .attr('fill', alpha(colors.textPrimary, 0.72))
          .attr('font-size', 12)
          .attr('font-weight', 600)
          .text(`Legend · ${metricMeta.label}`);

        group
          .append('rect')
          .attr('y', 4)
          .attr('width', legendWidth)
          .attr('height', legendHeight)
          .attr('rx', 6)
          .attr('fill', 'url(#burden-legend-gradient)')
          .attr('stroke', colors.border);

        group
          .append('text')
          .attr('y', 30)
          .attr('fill', colors.chartLabel)
          .attr('font-size', 11)
          .text(metricMeta.format(domainMin));

        group
          .append('text')
          .attr('x', legendWidth)
          .attr('y', 30)
          .attr('text-anchor', 'end')
          .attr('fill', colors.chartLabel)
          .attr('font-size', 11)
          .text(metricMeta.format(domainMax));

        group
          .append('text')
          .attr('y', 46)
          .attr('fill', colors.textSecondary)
          .attr('font-size', 10)
          .text('Low → High (within filtered data)');
      });
  }, [stats, selectedBorough, metric, dimensions, metricMeta, onSelectBorough, colors]);

  return (
    <GlassChartCard
      selected={Boolean(selectedBorough)}
      accent="dashboard"
      contentSx={densePlot ? { p: '18px 20px' } : undefined}
    >
      <VizSectionHeader
        icon={MapOutlinedIcon}
        iconColor={colors.warning}
        title={title}
        subtitle={subtitle}
        tooltip="Burden score blends request volume, response delay, unresolved rate, and risk. Click a borough to filter all panels."
        selected={Boolean(selectedBorough)}
        compact={densePlot}
        actions={(
          <>
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel id="burden-metric-label">Metric</InputLabel>
              <Select
                labelId="burden-metric-label"
                value={metric}
                label="Metric"
                onChange={handleMetricChange}
              >
                {METRICS.map(({ key, label }) => (
                  <MenuItem key={key} value={key}>
                    {label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {selectedBorough && (
              <Chip
                label={selectedBorough}
                size="small"
                onDelete={() => onSelectBorough?.(null)}
                sx={selectedFilterChipSx}
              />
            )}
          </>
        )}
      />

      <Box
        ref={containerRef}
        sx={{
          ...chartPlotBox,
          ...(densePlot && {
            border: 'none',
            bgcolor: 'transparent',
            borderRadius: '12px',
          }),
          height: plotHeight ?? { xs: 320, sm: 380, md: 420 },
          mt: densePlot ? 0 : 0.5,
          flex: 1,
          minHeight: 0,
          overflow: 'hidden',
        }}
      >
        <svg ref={svgRef} style={{ width: '100%', height: '100%', display: 'block' }} />

        {tooltip && (() => {
          const metric = getTooltipMetricColors(colors);
          return (
            <ChartTooltip
              x={tooltip.x}
              y={tooltip.y}
              containerWidth={dimensions.width}
              containerHeight={dimensions.height}
              title={tooltip.data.borough}
              rows={[
                { label: 'Count', value: tooltip.data.count.toLocaleString(), color: metric.count },
                { label: 'Avg response', value: formatHours(tooltip.data.avgResponseHours), color: metric.response },
                { label: 'Unresolved', value: `${(tooltip.data.unresolvedRate * 100).toFixed(1)}%`, color: metric.unresolved },
                {
                  label: 'High delay',
                  value: `${Number(tooltip.data.highDelayCount ?? 0).toLocaleString()} (${((tooltip.data.highDelayRate ?? 0) * 100).toFixed(1)}%)`,
                  color: metric.highDelay,
                },
                { label: 'Burden score', value: tooltip.data.burdenScore.toFixed(2), color: metric.burden },
              ]}
            />
          );
        })()}
      </Box>

      {!compactFooter && (
        <Typography variant="caption" sx={{ display: 'block', mt: 1.5, color: colors.textSecondary, fontFamily: 'inherit' }}>
          Click a borough to filter · Hover for KPIs · Legend shows {metricMeta.label.toLowerCase()} scale
        </Typography>
      )}
    </GlassChartCard>
  );
}
