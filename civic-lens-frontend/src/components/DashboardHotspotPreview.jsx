import { useEffect, useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Box, Typography, alpha } from '@mui/material';
import ScatterPlotOutlinedIcon from '@mui/icons-material/ScatterPlotOutlined';
import { useAppColors, useColorMode } from '../ColorModeContext';
import { formatHours } from '../utils/analytics';
import { isHighDelayRequest } from '../utils/mapHelpers';
import { getChartPlotBox } from '../theme';
import ChartTooltip from './ChartTooltip';
import { getTooltipMetricColors, getTooltipStatusColor } from '../styles/chartTooltip';
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

function isUnresolvedPoint(point) {
  if (point?.record?.is_unresolved != null) return Number(point.record.is_unresolved) === 1;
  return point?.status && !/closed/i.test(point.status);
}

function pointFill(point, colors) {
  if (isHighDelayRequest(point.record) || isUnresolvedPoint(point)) return colors.error;
  return colors.warning;
}

export default function DashboardHotspotPreview({
  points = [],
  onSelectRequest,
  title = 'Request Hotspots',
  subtitle = 'Shows coordinate-level clusters of 311 requests under the current filters.',
  plotHeight = 340,
}) {
  const colors = useAppColors();
  const { mode } = useColorMode();
  const isLight = mode === 'light';
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 480, height: plotHeight });
  const [tooltip, setTooltip] = useState(null);
  const chartPlotBox = useMemo(() => getChartPlotBox(colors, mode), [colors, mode]);
  const plotBg = isLight ? alpha('#f8fafc', 0.95) : alpha(colors.chartPlotBg, 0.85);

  useEffect(() => {
    if (!containerRef.current) return undefined;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (width > 0 && height > 0) {
        setDimensions({ width, height: height || plotHeight });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [plotHeight]);

  useEffect(() => {
    if (!svgRef.current || !points.length) return;

    const { width, height } = dimensions;
    const padding = { top: 14, right: 14, bottom: 18, left: 14 };
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    svg
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    const plot = svg.append('g');

    plot
      .append('rect')
      .attr('class', 'plot-bg')
      .attr('x', padding.left)
      .attr('y', padding.top)
      .attr('width', Math.max(width - padding.left - padding.right, 0))
      .attr('height', Math.max(height - padding.top - padding.bottom, 0))
      .attr('rx', 8)
      .attr('fill', plotBg)
      .attr('stroke', colors.border);

    plot
      .selectAll('circle.hotspot')
      .data(points, (d) => d.id)
      .join('circle')
      .attr('class', 'hotspot')
      .attr('cx', (d) => projectPoint(d.latitude, d.longitude, width, height, padding)[0])
      .attr('cy', (d) => projectPoint(d.latitude, d.longitude, width, height, padding)[1])
      .attr('r', (d) => (isHighDelayRequest(d.record) || isUnresolvedPoint(d) ? 4 : 3.2))
      .attr('fill', (d) => pointFill(d, colors))
      .attr('fill-opacity', 0.78)
      .attr('stroke', alpha(colors.primary, 0.2))
      .attr('stroke-width', 0.6)
      .style('cursor', 'pointer')
      .on('mouseenter', function onEnter(event, d) {
        d3.select(this)
          .attr('fill-opacity', 1)
          .attr('r', 5.5)
          .attr('stroke', colors.warning)
          .attr('stroke-width', 2);
        setTooltip({ x: event.offsetX, y: event.offsetY, data: d });
      })
      .on('mousemove', (event) => {
        setTooltip((prev) => (prev ? { ...prev, x: event.offsetX, y: event.offsetY } : prev));
      })
      .on('mouseleave', function onLeave(_, d) {
        d3.select(this)
          .attr('fill-opacity', 0.78)
          .attr('r', isHighDelayRequest(d.record) || isUnresolvedPoint(d) ? 4 : 3.2)
          .attr('stroke', alpha(colors.primary, 0.2))
          .attr('stroke-width', 0.6);
        setTooltip(null);
      })
      .on('click', (_, d) => {
        if (d.record) onSelectRequest?.(d.record);
      });
  }, [points, dimensions, plotHeight, colors, plotBg, onSelectRequest]);

  return (
    <GlassChartCard accent="dashboard" contentSx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <VizSectionHeader
        icon={ScatterPlotOutlinedIcon}
        iconColor={colors.warning}
        title={title}
        subtitle={subtitle}
        tooltip="Gold = typical requests, red = high delay or unresolved. Click a point for details."
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
              No valid coordinates for the current filters.
            </Typography>
          </Box>
        ) : (
          <>
            <svg ref={svgRef} style={{ width: '100%', height: '100%', display: 'block' }} />
            {tooltip && (() => {
              const metric = getTooltipMetricColors(colors);
              return (
                <ChartTooltip
                  x={tooltip.x}
                  y={tooltip.y}
                  containerWidth={dimensions.width}
                  containerHeight={dimensions.height}
                  title={tooltip.data.complaintType}
                  rows={[
                    {
                      label: 'Borough / ZIP',
                      value: `${tooltip.data.borough}${tooltip.data.record?.incident_zip ? ` · ${tooltip.data.record.incident_zip}` : ''}`,
                      color: metric.spatial,
                    },
                    { label: 'Agency', value: tooltip.data.agency, color: metric.neutral },
                    { label: 'Predicted delay', value: formatHours(tooltip.data.predictedHours), color: metric.predicted },
                    { label: 'Status', value: tooltip.data.status, color: getTooltipStatusColor(tooltip.data.status, colors) },
                  ]}
                />
              );
            })()}
          </>
        )}
      </Box>

      <Typography
        variant="caption"
        sx={{ display: 'block', mt: 1.25, color: colors.textSecondary, fontSize: '0.75rem' }}
      >
        Use the Map page for request-level spatial inspection.
      </Typography>
    </GlassChartCard>
  );
}
