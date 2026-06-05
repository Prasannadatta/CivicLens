import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Box, Typography, alpha } from '@mui/material';
import ScatterPlotOutlinedIcon from '@mui/icons-material/ScatterPlotOutlined';
import { useAppColors, useColorMode } from '../ColorModeContext';
import { formatHours } from '../utils/analytics';
import { getChartPlotBox, getChartTooltipBox } from '../theme';
import GlassChartCard from './GlassChartCard';
import VizSectionHeader from './VizSectionHeader';

const NYC_BOUNDS = {
  lat: [40.49, 40.92],
  lng: [-74.26, -73.68],
};

function projectPoint(lat, lng, width, height, padding) {
  const xScale = d3
    .scaleLinear()
    .domain(NYC_BOUNDS.lng)
    .range([padding.left, width - padding.right]);
  const yScale = d3
    .scaleLinear()
    .domain(NYC_BOUNDS.lat)
    .range([height - padding.bottom, padding.top]);
  return [xScale(lng), yScale(lat)];
}

export default function DashboardHotspotPreview({
  points = [],
  onSelectRequest,
  title = 'Hotspot Preview',
  subtitle = 'Request-level coordinate preview for spatial clusters.',
  plotHeight = 310,
}) {
  const colors = useAppColors();
  const { mode } = useColorMode();
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [width, setWidth] = useState(480);
  const [tooltip, setTooltip] = useState(null);
  const chartPlotBox = getChartPlotBox(colors, mode);
  const chartTooltipBox = getChartTooltipBox(colors);

  useEffect(() => {
    if (!containerRef.current) return undefined;
    const observer = new ResizeObserver(([entry]) => {
      const nextWidth = entry.contentRect.width;
      if (nextWidth > 0) setWidth(nextWidth);
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!svgRef.current) return;

    const height = plotHeight;
    const padding = { top: 14, right: 14, bottom: 18, left: 14 };
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    svg
      .attr('width', '100%')
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    const plot = svg.append('g');

    plot
      .append('rect')
      .attr('x', padding.left)
      .attr('y', padding.top)
      .attr('width', width - padding.left - padding.right)
      .attr('height', height - padding.top - padding.bottom)
      .attr('rx', 8)
      .attr('fill', colors.chartPlotBg)
      .attr('stroke', colors.border);

    const dots = plot
      .selectAll('circle.hotspot')
      .data(points, (d) => d.id)
      .join('circle')
      .attr('class', 'hotspot')
      .attr('cx', (d) => projectPoint(d.latitude, d.longitude, width, height, padding)[0])
      .attr('cy', (d) => projectPoint(d.latitude, d.longitude, width, height, padding)[1])
      .attr('r', (d) => (d.risk >= 0.75 ? 4.2 : 3))
      .attr('fill', (d) => {
        if (d.risk >= 0.75) return colors.error;
        if (d.status && !/closed/i.test(d.status)) return colors.warning;
        return colors.secondary;
      })
      .attr('fill-opacity', 0.72)
      .attr('stroke', alpha(colors.chartLabel, 0.65))
      .attr('stroke-width', 0.6)
      .style('cursor', 'pointer')
      .on('mouseenter', function onEnter(event, d) {
        d3.select(this).attr('fill-opacity', 1).attr('r', 5.5);
        setTooltip({ x: event.offsetX, y: event.offsetY, data: d });
      })
      .on('mousemove', (event) => {
        setTooltip((prev) => (prev ? { ...prev, x: event.offsetX, y: event.offsetY } : prev));
      })
      .on('mouseleave', function onLeave() {
        d3.select(this).attr('fill-opacity', 0.72).attr('r', (d) => (d.risk >= 0.75 ? 4.2 : 3));
        setTooltip(null);
      })
      .on('click', (_, d) => {
        if (d.record) onSelectRequest?.(d.record);
      });

    dots.lower();
  }, [points, width, plotHeight, colors, onSelectRequest]);

  return (
    <GlassChartCard contentSx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <VizSectionHeader
        icon={ScatterPlotOutlinedIcon}
        iconColor={colors.secondary}
        title={title}
        subtitle={subtitle}
        tooltip="Orange = open requests, red = high risk, teal = other. Click a point for details."
      />

      <Box
        ref={containerRef}
        sx={{
          ...chartPlotBox,
          height: plotHeight,
          flex: 1,
          minHeight: plotHeight,
          mt: 0.5,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {points.length === 0 ? (
          <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="body2" sx={{ color: colors.textSecondary, fontSize: '0.8125rem' }}>
              No coordinate data for current filters.
            </Typography>
          </Box>
        ) : (
          <>
            <svg ref={svgRef} style={{ width: '100%', height: '100%', display: 'block' }} />
            {tooltip && (
              <Box
                sx={{
                  ...chartTooltipBox,
                  position: 'absolute',
                  left: Math.min(tooltip.x + 12, width - 210),
                  top: Math.max(tooltip.y - 10, 8),
                  minWidth: 180,
                  pointerEvents: 'none',
                }}
              >
                <Typography variant="subtitle2" sx={{ color: colors.textPrimary, fontSize: '0.8rem', mb: 0.35 }}>
                  {tooltip.data.complaintType}
                </Typography>
                <Typography variant="caption" sx={{ display: 'block', color: colors.textSecondary }}>
                  {tooltip.data.borough} · {tooltip.data.status}
                </Typography>
                <Typography variant="caption" sx={{ display: 'block', color: colors.textSecondary }}>
                  Response: {formatHours(tooltip.data.responseHours)}
                </Typography>
                <Typography variant="caption" sx={{ color: colors.warning }}>
                  Risk: {tooltip.data.risk.toFixed(2)}
                </Typography>
              </Box>
            )}
          </>
        )}
      </Box>
    </GlassChartCard>
  );
}
