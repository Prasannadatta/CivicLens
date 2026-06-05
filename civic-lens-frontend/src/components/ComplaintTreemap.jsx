import { useEffect, useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';
import {
  Typography,
  Box,
  Stack,
  Chip,
  alpha,
} from '@mui/material';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import { getChartPlotBox, getChartTooltipBox, getSelectedFilterChipSx } from '../theme';
import { useAppColors, useColorMode } from '../ColorModeContext';
import { formatHours } from '../utils/analytics';
import GlassChartCard from './GlassChartCard';
import VizSectionHeader from './VizSectionHeader';

function truncateText(text, max = 22) {
  const value = String(text ?? '');
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}

function buildHierarchy(topComplaints) {
  return {
    name: 'root',
    children: (topComplaints || [])
      .filter((entry) => entry?.count > 0)
      .map((entry) => ({
        name: entry.complaintType || entry.type || 'Unknown',
        value: entry.count,
        avgResponseHours: Number(entry.avgResponseHours ?? 0),
      })),
  };
}

export default function ComplaintTreemap({
  topComplaints = [],
  selectedComplaint = null,
  onSelectComplaint,
  title = 'Complaint Type Landscape',
  subtitle = 'Rectangles are sized by 311 volume in the filtered slice; saturation encodes slower average resolution.',
  plotHeight,
  compactFooter = false,
}) {
  const colors = useAppColors();
  const { mode } = useColorMode();
  const chartPlotBox = useMemo(() => getChartPlotBox(colors, mode), [colors, mode]);
  const chartTooltipBox = useMemo(() => getChartTooltipBox(colors), [colors]);
  const selectedFilterChipSx = useMemo(() => getSelectedFilterChipSx(colors), [colors]);

  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [tooltip, setTooltip] = useState(null);
  const [dimensions, setDimensions] = useState({ width: 640, height: 360 });

  const leaves = useMemo(() => {
    const hierarchyData = buildHierarchy(topComplaints);
    if (!hierarchyData.children.length) return [];

    const root = d3
      .hierarchy(hierarchyData)
      .sum((d) => d.value || 0)
      .sort((a, b) => b.value - a.value);

    d3
      .treemap()
      .size([dimensions.width, dimensions.height])
      .paddingInner(4)
      .paddingOuter(6)
      .round(true)(root);

    return root.leaves();
  }, [topComplaints, dimensions]);

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

    // D3 treemap: area encodes complaint volume; sequential color encodes average delay (response hours).
    const svg = d3.select(svgRef.current);
    svg
      .attr('width', dimensions.width)
      .attr('height', dimensions.height)
      .attr('viewBox', `0 0 ${dimensions.width} ${dimensions.height}`)
      .attr('role', 'img')
      .attr('aria-label', 'Complaint type treemap');

    const responseValues = leaves.map((d) => d.data.avgResponseHours);
    const [minResponse, maxResponse] = d3.extent(responseValues);
    const domainMin = minResponse ?? 0;
    const domainMax = maxResponse === domainMin ? domainMin + 1 : maxResponse ?? 1;

    const colorScale = d3
      .scaleSequential(d3.interpolateRgb(colors.chartScaleLow, colors.warning))
      .domain([domainMin, domainMax]);

    let defs = svg.select('defs');
    if (defs.empty()) defs = svg.append('defs');

    const legendWidth = 180;
    const gradient = defs.selectAll('#treemap-color-legend').data([0]).join('linearGradient').attr('id', 'treemap-color-legend');
    gradient
      .attr('x1', '0%')
      .attr('x2', '100%')
      .attr('y1', '0%')
      .attr('y2', '0%');
    gradient.selectAll('stop').data([
      { offset: '0%', color: colorScale(domainMin) },
      { offset: '100%', color: colorScale(domainMax) },
    ]).join('stop').attr('offset', (d) => d.offset).attr('stop-color', (d) => d.color);

    const layer = svg.selectAll('g.treemap-layer').data([0]).join('g').attr('class', 'treemap-layer');

    const cells = layer
      .selectAll('g.treemap-cell')
      .data(leaves, (d) => d.data.name)
      .join(
        (enter) => {
          const group = enter
            .append('g')
            .attr('class', 'treemap-cell')
            .style('cursor', 'pointer');
          group.append('rect').attr('class', 'treemap-rect');
          group.append('text').attr('class', 'treemap-label').attr('pointer-events', 'none');
          group.append('text').attr('class', 'treemap-count').attr('pointer-events', 'none');
          return group;
        },
        (update) => update,
        (exit) => exit.remove(),
      );

    cells
      .transition()
      .duration(650)
      .ease(d3.easeCubicInOut)
      .attr('transform', (d) => `translate(${d.x0},${d.y0})`);

    cells
      .select('.treemap-rect')
      .transition()
      .duration(650)
      .ease(d3.easeCubicInOut)
      .attr('width', (d) => Math.max(0, d.x1 - d.x0))
      .attr('height', (d) => Math.max(0, d.y1 - d.y0))
      .attr('rx', 6)
      .attr('fill', (d) => colorScale(d.data.avgResponseHours))
      .attr('stroke', (d) => (selectedComplaint === d.data.name ? colors.warning : colors.treemapStroke))
      .attr('stroke-width', (d) => (selectedComplaint === d.data.name ? 3 : 1))
      .attr('opacity', (d) => (selectedComplaint && selectedComplaint !== d.data.name ? 0.42 : 0.94))
      .attr('filter', (d) => (selectedComplaint === d.data.name ? 'drop-shadow(0 0 6px rgba(245,158,11,0.35))' : null));

    cells.select('.treemap-rect').each(function attachHandlers(d) {
      const rect = d3.select(this);
      rect
        .on('mouseenter', function onEnter(event) {
          d3.select(this).attr('opacity', 1).attr('stroke-width', selectedComplaint === d.data.name ? 3 : 2);
          setTooltip({
            x: event.offsetX,
            y: event.offsetY,
            name: d.data.name,
            count: d.data.value,
            avgResponseHours: d.data.avgResponseHours,
          });
        })
        .on('mousemove', (event) => {
          setTooltip((prev) => (prev ? { ...prev, x: event.offsetX, y: event.offsetY } : prev));
        })
        .on('mouseleave', function onLeave() {
          const dimmed = selectedComplaint && selectedComplaint !== d.data.name;
          d3.select(this)
            .attr('opacity', dimmed ? 0.42 : 0.94)
            .attr('stroke-width', selectedComplaint === d.data.name ? 3 : 1);
          setTooltip(null);
        })
        .on('click', () => {
          onSelectComplaint?.(d.data.name === selectedComplaint ? null : d.data.name);
        });
    });

    cells
      .select('.treemap-label')
      .attr('x', 8)
      .attr('y', 18)
      .attr('fill', colors.textPrimary)
      .attr('font-size', 11)
      .attr('font-weight', 700)
      .text((d) => {
        const width = d.x1 - d.x0;
        const maxChars = width > 140 ? 24 : width > 90 ? 18 : width > 60 ? 12 : 0;
        return maxChars ? truncateText(d.data.name, maxChars) : '';
      });

    cells
      .select('.treemap-count')
      .attr('x', 8)
      .attr('y', 34)
      .attr('fill', colors.textSecondary)
      .attr('font-size', 10)
      .text((d) => {
        const width = d.x1 - d.x0;
        const height = d.y1 - d.y0;
        return width > 50 && height > 36 ? `${d.data.value.toLocaleString()} requests` : '';
      });

    const legend = layer
      .selectAll('g.treemap-legend')
      .data([0])
      .join('g')
      .attr('class', 'treemap-legend')
      .attr('transform', `translate(${Math.max(dimensions.width - legendWidth - 12, 12)}, 10)`);

    legend.selectAll('*').remove();
    legend
      .append('text')
      .attr('y', -10)
      .attr('fill', colors.chartLabel)
      .attr('font-size', 11)
      .attr('font-weight', 600)
      .text('Legend · Avg delay (color)');

    legend
      .append('rect')
      .attr('y', 4)
      .attr('width', legendWidth)
      .attr('height', 8)
      .attr('rx', 4)
      .attr('fill', 'url(#treemap-color-legend)')
      .attr('stroke', colors.border);
    legend
      .append('text')
      .attr('y', 26)
      .attr('fill', alpha(colors.textPrimary, 0.5))
      .attr('font-size', 9)
      .text(formatHours(domainMin));
    legend
      .append('text')
      .attr('x', legendWidth)
      .attr('y', 26)
      .attr('text-anchor', 'end')
      .attr('fill', alpha(colors.textPrimary, 0.5))
      .attr('font-size', 9)
      .text(formatHours(domainMax));
  }, [leaves, dimensions, selectedComplaint, onSelectComplaint, colors]);

  return (
    <GlassChartCard selected={Boolean(selectedComplaint)} accent={colors.warning}>
      <VizSectionHeader
        icon={AccountTreeOutlinedIcon}
        iconColor={colors.secondary}
        title={title}
        subtitle={subtitle}
        tooltip="Click any tile to apply a complaint-type filter across the dashboard. Click again or use the chip to clear."
        selected={Boolean(selectedComplaint)}
        actions={
          selectedComplaint ? (
            <Chip
              label={truncateText(selectedComplaint, 20)}
              size="small"
              onDelete={() => onSelectComplaint?.(null)}
              sx={selectedFilterChipSx}
            />
          ) : null
        }
      />

      <Box
        ref={containerRef}
        sx={{
          ...chartPlotBox,
          height: plotHeight ?? { xs: 300, md: 360 },
          mt: 0.5,
          flex: 1,
          minHeight: 0,
          overflow: 'hidden',
        }}
      >
          {leaves.length === 0 ? (
            <Box
              sx={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: colors.textSecondary,
              }}
            >
              <Typography variant="body2">No complaint data for the current filters.</Typography>
            </Box>
          ) : (
            <svg ref={svgRef} style={{ width: '100%', height: '100%', display: 'block' }} />
          )}

          {tooltip && (
            <Box
              sx={{
                ...chartTooltipBox,
                position: 'absolute',
                left: Math.min(tooltip.x + 14, dimensions.width - 220),
                top: Math.max(tooltip.y - 10, 8),
                maxWidth: 240,
              }}
            >
              <Typography variant="subtitle2" sx={{ color: colors.textPrimary, fontSize: '0.82rem', mb: 0.5 }}>
                {tooltip.name}
              </Typography>
              <Typography variant="caption" sx={{ display: 'block', color: colors.textSecondary }}>
                Count: {tooltip.count.toLocaleString()}
              </Typography>
              <Typography variant="caption" sx={{ color: colors.warning }}>
                Avg response: {formatHours(tooltip.avgResponseHours)}
              </Typography>
            </Box>
          )}
        </Box>

        {!compactFooter && (
          <Stack direction="row" spacing={2} useFlexGap sx={{ flexWrap: 'wrap', mt: 1.5 }}>
            <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
              <Box sx={{ width: 22, height: 14, borderRadius: 0.5, bgcolor: alpha(colors.warning, 0.35), border: `1px solid ${alpha(colors.warning, 0.5)}` }} />
              <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                Tile area = request count
              </Typography>
            </Stack>
            <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
              <Box sx={{ width: 22, height: 8, borderRadius: 4, background: `linear-gradient(90deg, ${colors.chartScaleLow}, ${colors.warning})` }} />
              <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                Fill = avg response time (see in-chart gradient)
              </Typography>
            </Stack>
          </Stack>
        )}

        {!compactFooter && (
          <Typography variant="caption" sx={{ display: 'block', mt: 1, color: colors.textSecondary }}>
            Click a complaint type to filter the dashboard · Selected tiles use a glowing stroke
          </Typography>
        )}
      </GlassChartCard>
    );
}
