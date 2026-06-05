import { useEffect, useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Typography, Box, Chip, alpha } from '@mui/material';
import FormatListNumberedOutlinedIcon from '@mui/icons-material/FormatListNumberedOutlined';
import { getChartPlotBox, getSelectedFilterChipSx } from '../theme';
import ChartTooltip from './ChartTooltip';
import { useAppColors, useColorMode } from '../ColorModeContext';
import { formatHours } from '../utils/analytics';
import GlassChartCard from './GlassChartCard';
import VizSectionHeader from './VizSectionHeader';
import {
  getBoroughColor,
  getComplaintBarColors,
  getDashboardSemanticColors,
  normalizeBoroughName,
} from '../styles/dashboardColors';

const COUNT_COL_WIDTH = 44;
const UNRESOLVED_COL_WIDTH = 78;
const COLUMN_GAP = 10;
const BAR_HEIGHT = 20;
const BAR_RADIUS = 9;
const UNRESOLVED_HIGH_THRESHOLD = 0.2;

function getLabelColWidth(containerWidth) {
  if (containerWidth < 400) return 108;
  if (containerWidth < 560) return 148;
  return Math.min(190, Math.max(160, Math.round(containerWidth * 0.28)));
}

function truncateText(text, max = 28) {
  const value = String(text ?? '');
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}

function estimateMaxChars(colWidth, fontSize = 12) {
  return Math.max(8, Math.floor(colWidth / (fontSize * 0.52)));
}

export default function ComplaintTypeRanking({
  complaintStats = [],
  selectedBorough = null,
  selectedComplaint = null,
  onSelectComplaint,
  title = 'Top Complaint Drivers',
  subtitle = 'Ranks complaint types by request volume, delay, and unresolved rate.',
  plotHeight,
  compactFooter = false,
  maxItems = 8,
}) {
  const colors = useAppColors();
  const { mode } = useColorMode();
  const chartPlotBox = useMemo(() => getChartPlotBox(colors, mode), [colors, mode]);
  const selectedFilterChipSx = useMemo(() => getSelectedFilterChipSx(colors), [colors]);
  const semantic = useMemo(() => getDashboardSemanticColors(colors, mode), [colors, mode]);
  const barColors = useMemo(
    () => getComplaintBarColors(selectedBorough, mode),
    [selectedBorough, mode],
  );
  const boroughContextName = selectedBorough ? normalizeBoroughName(selectedBorough) : null;
  const boroughContextColor = boroughContextName
    ? getBoroughColor(boroughContextName, mode)
    : null;

  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [tooltip, setTooltip] = useState(null);
  const [dimensions, setDimensions] = useState({ width: 560, height: 360 });

  const data = useMemo(
    () => (complaintStats || []).slice(0, maxItems).filter((entry) => entry.count > 0),
    [complaintStats, maxItems],
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

    const labelColWidth = getLabelColWidth(dimensions.width);
    const rightReserved = COUNT_COL_WIDTH + COLUMN_GAP + UNRESOLVED_COL_WIDTH + 10;
    const margin = { top: 10, right: rightReserved, bottom: 10, left: labelColWidth + 12 };
    const innerWidth = Math.max(dimensions.width - margin.left - margin.right, 80);
    const innerHeight = Math.max(dimensions.height - margin.top - margin.bottom, 80);
    const countColX = innerWidth + 6;
    const unresolvedColX = innerWidth + COUNT_COL_WIDTH + COLUMN_GAP;
    const labelFontSize = dimensions.width < 480 ? 11 : 12;
    const maxLabelChars = estimateMaxChars(labelColWidth, labelFontSize);

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    svg
      .attr('width', dimensions.width)
      .attr('height', dimensions.height)
      .attr('viewBox', `0 0 ${dimensions.width} ${dimensions.height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .attr('role', 'img')
      .attr('aria-label', 'Ranked complaint types by request volume');

    const root = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    if (!data.length) return;

    const maxCount = d3.max(data, (d) => d.count) || 1;
    const xScale = d3.scaleLinear().domain([0, maxCount]).range([0, innerWidth]);
    const yScale = d3.scaleBand()
      .domain(data.map((d) => d.complaintType))
      .range([0, innerHeight])
      .paddingInner(0.38);

    const barFill = barColors.barFill;
    const trackFill = barColors.barTrack;
    const countColor = semantic.text;
    const mutedUnresolved = semantic.muted;
    const barYOffset = (yScale.bandwidth() - BAR_HEIGHT) / 2;

    const groups = root
      .selectAll('.bar-group')
      .data(data, (d) => d.complaintType)
      .join('g')
      .attr('class', 'bar-group')
      .attr('transform', (d) => `translate(0,${yScale(d.complaintType)})`)
      .style('cursor', 'pointer');

    groups
      .append('rect')
      .attr('class', 'bar-bg')
      .attr('x', 0)
      .attr('y', barYOffset)
      .attr('width', innerWidth)
      .attr('height', BAR_HEIGHT)
      .attr('rx', BAR_RADIUS)
      .attr('fill', trackFill);

    groups
      .append('rect')
      .attr('class', 'bar-fill')
      .attr('x', 0)
      .attr('y', barYOffset)
      .attr('height', BAR_HEIGHT)
      .attr('rx', BAR_RADIUS)
      .attr('fill', barFill)
      .attr('opacity', (d) => (selectedComplaint && selectedComplaint !== d.complaintType ? 0.38 : 0.92))
      .attr('stroke', (d) => (selectedComplaint === d.complaintType ? barColors.barStroke : 'none'))
      .attr('stroke-width', (d) => (selectedComplaint === d.complaintType ? 1.5 : 0))
      .attr('width', 0)
      .transition()
      .duration(480)
      .attr('width', (d) => Math.max(xScale(d.count), BAR_RADIUS * 2));

    groups.each(function renderLabels(d) {
      const group = d3.select(this);
      const truncated = truncateText(d.complaintType, maxLabelChars);
      const isTruncated = truncated !== d.complaintType;

      group
        .append('text')
        .attr('class', 'bar-label')
        .attr('x', -10)
        .attr('y', yScale.bandwidth() / 2)
        .attr('dy', '0.35em')
        .attr('text-anchor', 'end')
        .attr('fill', semantic.title)
        .attr('font-size', labelFontSize)
        .attr('font-weight', 600)
        .text(truncated);

      if (isTruncated) {
        group.append('title').text(d.complaintType);
      }

      const barEnd = xScale(d.count);
      const countText = d.count.toLocaleString();
      const countWidth = countText.length * 6.5;
      const inlineCountFits = barEnd + countWidth + 12 < countColX - 4;

      group
        .append('text')
        .attr('class', 'bar-count')
        .attr('x', inlineCountFits ? barEnd + 8 : countColX)
        .attr('y', yScale.bandwidth() / 2)
        .attr('dy', '0.35em')
        .attr('text-anchor', inlineCountFits ? 'start' : 'start')
        .attr('fill', countColor)
        .attr('font-size', 11)
        .attr('font-weight', 600)
        .text(countText);

      const unresolvedRate = d.unresolvedRate ?? 0;
      const isHighUnresolved = unresolvedRate >= UNRESOLVED_HIGH_THRESHOLD;

      group
        .append('text')
        .attr('class', 'bar-unresolved')
        .attr('x', unresolvedColX)
        .attr('y', yScale.bandwidth() / 2)
        .attr('dy', '0.35em')
        .attr('text-anchor', 'start')
        .attr('fill', isHighUnresolved ? semantic.urgent : mutedUnresolved)
        .attr('font-size', 10)
        .attr('font-weight', isHighUnresolved ? 700 : 500)
        .text(`${(unresolvedRate * 100).toFixed(0)}% unres.`);
    });

    groups.each(function attachHandlers(d) {
      d3.select(this)
        .on('mouseenter', (event) => {
          setTooltip({ x: event.offsetX, y: event.offsetY, data: d });
        })
        .on('mousemove', (event) => {
          setTooltip((prev) => (prev ? { ...prev, x: event.offsetX, y: event.offsetY } : prev));
        })
        .on('mouseleave', () => setTooltip(null))
        .on('click', () => {
          onSelectComplaint?.(d.complaintType === selectedComplaint ? null : d.complaintType);
        });
    });
  }, [data, dimensions, colors, mode, semantic, barColors, selectedComplaint, onSelectComplaint]);

  const plotBorderColor = mode === 'light' ? alpha('#0f172a', 0.05) : alpha('#94a3b8', 0.1);

  return (
    <GlassChartCard selected={Boolean(selectedComplaint)} accent="dashboard">
      <VizSectionHeader
        icon={FormatListNumberedOutlinedIcon}
        iconColor={colors.warning}
        title={title}
        subtitle={subtitle}
        tooltip="Bar length = request volume. Click a bar to filter by complaint type."
        selected={Boolean(selectedComplaint)}
        actions={
          selectedComplaint ? (
            <Chip
              label={truncateText(selectedComplaint, 24)}
              size="small"
              onDelete={() => onSelectComplaint?.(null)}
              sx={selectedFilterChipSx}
            />
          ) : null
        }
      />

      {data.length > 0 && (
        <Typography
          variant="caption"
          sx={{ color: semantic.muted, display: 'block', mt: -0.25, mb: 0.25, lineHeight: 1.4 }}
        >
          {boroughContextName ? (
            <>
              Showing complaint drivers for{' '}
              <Box component="span" sx={{ color: boroughContextColor, fontWeight: 600 }}>
                {boroughContextName}
              </Box>
            </>
          ) : (
            'Showing complaint drivers across all boroughs'
          )}
        </Typography>
      )}

      <Box
        ref={containerRef}
        sx={{
          ...chartPlotBox,
          border: `1px solid ${plotBorderColor}`,
          height: plotHeight ?? { xs: 300, md: 360 },
          mt: 0.5,
          flex: 1,
          minHeight: 0,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {data.length === 0 ? (
          <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="body2" sx={{ color: colors.textSecondary }}>
              No complaint data for the current filters.
            </Typography>
          </Box>
        ) : (
          <>
            <svg ref={svgRef} style={{ width: '100%', height: '100%', display: 'block' }} />
            {tooltip && (() => {
              return (
                <ChartTooltip
                  x={tooltip.x}
                  y={tooltip.y}
                  containerWidth={dimensions.width}
                  containerHeight={dimensions.height}
                  title={tooltip.data.complaintType}
                  rows={[
                    { label: 'Requests', value: tooltip.data.count.toLocaleString() },
                    { label: 'Avg response', value: formatHours(tooltip.data.avgResponseHours) },
                    { label: 'Unresolved rate', value: `${((tooltip.data.unresolvedRate ?? 0) * 100).toFixed(1)}%` },
                    { label: 'High delay requests', value: Number(tooltip.data.highDelayCount ?? 0).toLocaleString() },
                  ]}
                />
              );
            })()}
          </>
        )}
      </Box>

      {!compactFooter && data.length > 0 && (
        <Typography variant="caption" sx={{ display: 'block', mt: 1.25, color: colors.textSecondary }}>
          Bar length = request volume · Red unresolved % ≥ 20% · Click to filter
        </Typography>
      )}
    </GlassChartCard>
  );
}
