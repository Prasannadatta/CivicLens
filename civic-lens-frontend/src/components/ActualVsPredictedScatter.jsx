import { useEffect, useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Typography, Box, Stack, alpha } from '@mui/material';
import ScatterPlotOutlinedIcon from '@mui/icons-material/ScatterPlotOutlined';
import { getChartPlotBox } from '../theme';
import ChartTooltip from './ChartTooltip';
import { getTooltipMetricColors, getTooltipStatusColor } from '../styles/chartTooltip';
import { useAppColors, useColorMode } from '../ColorModeContext';
import { formatHours } from '../utils/analytics';
import { getDelayBucketColorMap } from '../utils/mapHelpers';
import GlassChartCard from './GlassChartCard';
import VizSectionHeader from './VizSectionHeader';

export default function ActualVsPredictedScatter({
  points = [],
  title = 'Actual vs Predicted Delay',
  subtitle = 'Compares model estimates with observed response time for sampled requests.',
  plotHeight,
  onSelectRequest,
}) {
  const colors = useAppColors();
  const { mode } = useColorMode();
  const chartPlotBox = useMemo(() => getChartPlotBox(colors, mode), [colors, mode]);
  const bucketColors = useMemo(() => getDelayBucketColorMap(mode), [mode]);

  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 520, height: 340 });
  const [tooltip, setTooltip] = useState(null);

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
    if (!svgRef.current || !points.length) return;

    const margin = { top: 16, right: 16, bottom: 36, left: 44 };
    const innerWidth = Math.max(dimensions.width - margin.left - margin.right, 100);
    const innerHeight = Math.max(dimensions.height - margin.top - margin.bottom, 100);

    const allValues = points.flatMap((d) => [d.actual, d.predicted]);
    const maxVal = d3.max(allValues) || 1;
    const domainMax = maxVal * 1.05;

    const xScale = d3.scaleLinear().domain([0, domainMax]).range([0, innerWidth]);
    const yScale = d3.scaleLinear().domain([0, domainMax]).range([innerHeight, 0]);

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    svg
      .attr('width', dimensions.width)
      .attr('height', dimensions.height)
      .attr('role', 'img')
      .attr('aria-label', 'Actual versus predicted response time scatter plot');

    const root = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    root
      .append('rect')
      .attr('width', innerWidth)
      .attr('height', innerHeight)
      .attr('fill', colors.chartPlotBg)
      .attr('rx', 8);

    root
      .append('g')
      .attr('class', 'grid')
      .call(
        d3.axisLeft(yScale)
          .ticks(5)
          .tickSize(-innerWidth)
          .tickFormat(''),
      )
      .call((g) => g.select('.domain').remove())
      .call((g) => g.selectAll('.tick line').attr('stroke', colors.gridStroke).attr('stroke-dasharray', '3 3'));

    root
      .append('line')
      .attr('class', 'parity-line')
      .attr('x1', xScale(0))
      .attr('y1', yScale(0))
      .attr('x2', xScale(domainMax))
      .attr('y2', yScale(domainMax))
      .attr('stroke', alpha(colors.accentPink, 0.55))
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '6 4');

    root
      .selectAll('circle.scatter-point')
      .data(points, (d) => d.id)
      .join('circle')
      .attr('class', 'scatter-point')
      .attr('cx', (d) => xScale(d.actual))
      .attr('cy', (d) => yScale(d.predicted))
      .attr('r', 3.2)
      .attr('fill', (d) => bucketColors[d.bucket] || bucketColors.unknown)
      .attr('fill-opacity', 0.62)
      .attr('stroke', alpha(colors.textPrimary, 0.15))
      .attr('stroke-width', 0.5)
      .style('cursor', 'pointer')
      .on('mouseenter', function onEnter(event, d) {
        d3.select(this).attr('fill-opacity', 0.95).attr('r', 5);
        setTooltip({ x: event.offsetX, y: event.offsetY, data: d });
      })
      .on('mousemove', (event) => {
        setTooltip((prev) => (prev ? { ...prev, x: event.offsetX, y: event.offsetY } : prev));
      })
      .on('mouseleave', function onLeave() {
        d3.select(this).attr('fill-opacity', 0.62).attr('r', 3.2);
        setTooltip(null);
      })
      .on('click', (_, d) => {
        if (d.record) onSelectRequest?.(d.record);
      });

    root
      .append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).ticks(5).tickFormat((v) => `${v}h`))
      .call((g) => g.selectAll('text').attr('fill', colors.chartLabel).attr('font-size', 10))
      .call((g) => g.select('.domain').attr('stroke', colors.border))
      .call((g) => g.selectAll('.tick line').attr('stroke', colors.border));

    root
      .append('g')
      .call(d3.axisLeft(yScale).ticks(5).tickFormat((v) => `${v}h`))
      .call((g) => g.selectAll('text').attr('fill', colors.chartLabel).attr('font-size', 10))
      .call((g) => g.select('.domain').attr('stroke', colors.border))
      .call((g) => g.selectAll('.tick line').attr('stroke', colors.border));

    root
      .append('text')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + 28)
      .attr('text-anchor', 'middle')
      .attr('fill', colors.chartLabel)
      .attr('font-size', 11)
      .text('Actual response (hours)');

    root
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerHeight / 2)
      .attr('y', -32)
      .attr('text-anchor', 'middle')
      .attr('fill', colors.chartLabel)
      .attr('font-size', 11)
      .text('Predicted response (hours)');
  }, [points, dimensions, colors, bucketColors, onSelectRequest]);

  const legendBuckets = ['Same Day', '1–3 Days', '3–7 Days', 'More than 1 Week'];

  return (
    <GlassChartCard accent="dashboard" contentSx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <VizSectionHeader
        icon={ScatterPlotOutlinedIcon}
        iconColor={colors.warning}
        title={title}
        subtitle={subtitle}
        tooltip="Points above the diagonal are under-predicted; below are over-predicted. Color = predicted delay bucket."
      />

      <Box
        ref={containerRef}
        sx={{
          ...chartPlotBox,
          height: plotHeight ?? { xs: 300, md: 340 },
          mt: 0.5,
          flex: 1,
          minHeight: 0,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {points.length === 0 ? (
          <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="body2" sx={{ color: colors.textSecondary }}>
              No records with both actual and predicted response times.
            </Typography>
          </Box>
        ) : (
          <>
            <svg ref={svgRef} style={{ width: '100%', height: '100%', display: 'block' }} />
            {tooltip && (() => {
              const metric = getTooltipMetricColors(colors);
              const bucketColor = bucketColors[tooltip.data.bucket] || metric.unknown;
              return (
                <ChartTooltip
                  x={tooltip.x}
                  y={tooltip.y}
                  containerWidth={dimensions.width}
                  containerHeight={dimensions.height}
                  title={tooltip.data.complaintType}
                  subtitle={`${tooltip.data.borough} · ${tooltip.data.agency}`}
                  rows={[
                    { label: 'Actual response', value: formatHours(tooltip.data.actual), color: metric.response },
                    { label: 'Predicted response', value: formatHours(tooltip.data.predicted), color: metric.predicted },
                    { label: 'Delay bucket', value: tooltip.data.bucket, color: bucketColor },
                    { label: 'Status', value: tooltip.data.status, color: getTooltipStatusColor(tooltip.data.status, colors) },
                  ]}
                />
              );
            })()}
          </>
        )}
      </Box>

      {points.length > 0 && (
        <Stack direction="row" spacing={1.5} useFlexGap sx={{ flexWrap: 'wrap', mt: 1.25 }}>
          {legendBuckets.map((bucket) => (
            <Stack key={bucket} direction="row" spacing={0.6} sx={{ alignItems: 'center' }}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: bucketColors[bucket],
                }}
              />
              <Typography variant="caption" sx={{ color: colors.chartLabel, fontSize: '0.6875rem' }}>
                {bucket}
              </Typography>
            </Stack>
          ))}
          <Stack direction="row" spacing={0.6} sx={{ alignItems: 'center' }}>
            <Box sx={{ width: 14, height: 0, borderTop: `2px dashed ${alpha(colors.accentPink, 0.55)}` }} />
            <Typography variant="caption" sx={{ color: colors.chartLabel, fontSize: '0.6875rem' }}>
              y = x parity
            </Typography>
          </Stack>
        </Stack>
      )}
    </GlassChartCard>
  );
}
