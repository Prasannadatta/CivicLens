import { useEffect, useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Box, Stack, Typography, Tooltip, alpha } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useAppColors } from '../ColorModeContext';
import { buildShapContributions } from '../utils/mlExplanation';
import {
  MODEL_ROW_HEIGHT,
  SHAP_CHART_HEIGHT,
  SHAP_FACTOR_LIMIT,
  cardTitleSx,
} from '../styles/modelViewLayout';
import DashboardCard from './DashboardCard';

const FEATURE_LABELS = {
  agency_complaint_median: 'Agency + complaint historical delay',
  agency_zip_median: 'Agency + ZIP historical delay',
  agency_workload_24h: 'Recent agency workload',
  complaint_type: 'Complaint type',
  month: 'Month / seasonality',
  borough: 'Borough effect',
  agency: 'Agency effect',
  open_data_channel_type: 'Submission channel',
};

function resolveLabel(row) {
  return row?.label || FEATURE_LABELS[row?.feature] || row?.feature || 'Unknown factor';
}

function truncateLabel(text, max = 28) {
  const value = String(text ?? '');
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}

function formatShapValue(value) {
  const n = Number(value) || 0;
  const sign = n >= 0 ? '+' : '';
  return `${sign}${n.toFixed(2)}`;
}

function formatAdjustment(value) {
  const n = Number(value) || 0;
  const sign = n >= 0 ? '+' : '';
  return `${sign}${n.toFixed(2)}`;
}

function plainEnglish(row) {
  const magnitude = Math.abs(row.shap).toFixed(2);
  if (row.shap > 0) {
    return `Pushes the prediction higher by about ${magnitude} hours compared with the baseline.`;
  }
  if (row.shap < 0) {
    return `Pulls the prediction lower by about ${magnitude} hours compared with the baseline.`;
  }
  return 'Has little effect on this prediction.';
}

function SummaryMetric({ label, value, accent, colors, emphasize }) {
  return (
    <Box
      sx={{
        flex: 1,
        minWidth: 0,
        height: 58,
        maxHeight: 58,
        px: 1.25,
        py: 0.75,
        borderRadius: 1.5,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        border: `1px solid ${emphasize ? alpha(accent, 0.35) : colors.border}`,
        bgcolor: emphasize ? alpha(accent, 0.08) : alpha(colors.textPrimary, 0.03),
      }}
    >
      <Typography
        variant="caption"
        sx={{
          color: colors.textSecondary,
          fontWeight: 600,
          fontSize: '0.625rem',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          lineHeight: 1.1,
        }}
      >
        {label}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          fontWeight: 800,
          color: emphasize ? accent : colors.textPrimary,
          mt: 0.15,
          fontSize: '0.875rem',
          fontVariantNumeric: 'tabular-nums',
          lineHeight: 1.2,
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

const cardShellSx = {
  p: '22px',
  height: MODEL_ROW_HEIGHT,
  width: '100%',
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
  '&:last-child': { pb: '22px' },
};

export default function ShapExplanationPanel({ request }) {
  const colors = useAppColors();
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [width, setWidth] = useState(720);
  const [tooltip, setTooltip] = useState(null);

  const shap = request?.shap_explanation;
  const baseline = Number(shap?.baseline_value ?? 0);
  const predicted = Number(shap?.prediction_value ?? request?.predicted_response_hours ?? 0);

  const factors = useMemo(() => {
    const rows = buildShapContributions(request)
      .map((row) => ({
        ...row,
        label: resolveLabel(row),
        shap: Number(row.shap) || 0,
      }))
      .sort((a, b) => Math.abs(b.shap) - Math.abs(a.shap))
      .slice(0, SHAP_FACTOR_LIMIT);
    return rows;
  }, [request]);

  const modelAdjustment = useMemo(() => {
    const fromFactors = factors.reduce((sum, row) => sum + row.shap, 0);
    if (factors.length) return fromFactors;
    return predicted - baseline;
  }, [factors, predicted, baseline]);

  const positiveColor = colors.warning;
  const negativeColor = colors.secondary;

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
    if (!svgRef.current || !factors.length) return;

    const margin = { top: 26, right: 52, bottom: 22, left: 14 };
    const labelColWidth = Math.min(220, Math.max(168, width * 0.38));
    const plotLeft = margin.left + labelColWidth;
    const plotWidth = Math.max(120, width - plotLeft - margin.right);
    const plotHeight = SHAP_CHART_HEIGHT - margin.top - margin.bottom;
    const rowStep = plotHeight / factors.length;
    const barHeight = Math.min(20, Math.max(10, rowStep - 8));

    const maxAbs = d3.max(factors, (d) => Math.abs(d.shap)) || 1;
    const paddedMax = maxAbs * 1.12;
    const xScale = d3.scaleLinear().domain([-paddedMax, paddedMax]).range([0, plotWidth]);
    const zeroX = xScale(0);

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    svg
      .attr('width', '100%')
      .attr('height', SHAP_CHART_HEIGHT)
      .attr('viewBox', `0 0 ${width} ${SHAP_CHART_HEIGHT}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .attr('role', 'img')
      .attr('aria-label', 'SHAP diverging bar chart');

    const defs = svg.append('defs');
    const posGrad = defs.append('linearGradient').attr('id', 'shap-positive-gradient').attr('x1', '0%').attr('x2', '100%');
    posGrad.append('stop').attr('offset', '0%').attr('stop-color', positiveColor).attr('stop-opacity', 0.55);
    posGrad.append('stop').attr('offset', '100%').attr('stop-color', positiveColor).attr('stop-opacity', 0.95);

    const negGrad = defs.append('linearGradient').attr('id', 'shap-negative-gradient').attr('x1', '100%').attr('x2', '0%');
    negGrad.append('stop').attr('offset', '0%').attr('stop-color', negativeColor).attr('stop-opacity', 0.55);
    negGrad.append('stop').attr('offset', '100%').attr('stop-color', negativeColor).attr('stop-opacity', 0.95);

    const plot = svg.append('g').attr('transform', `translate(${plotLeft},${margin.top})`);

    plot
      .append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', plotWidth)
      .attr('height', plotHeight)
      .attr('rx', 6)
      .attr('fill', colors.chartPlotBg)
      .attr('stroke', colors.border);

    const ticks = xScale.ticks(5).filter((t) => Math.abs(t) > 0.001);
    plot
      .selectAll('line.grid')
      .data(ticks)
      .join('line')
      .attr('class', 'grid')
      .attr('x1', (t) => xScale(t))
      .attr('x2', (t) => xScale(t))
      .attr('y1', 0)
      .attr('y2', plotHeight)
      .attr('stroke', colors.gridStroke)
      .attr('stroke-width', 1);

    plot
      .append('line')
      .attr('class', 'zero-line')
      .attr('x1', zeroX)
      .attr('x2', zeroX)
      .attr('y1', 0)
      .attr('y2', plotHeight)
      .attr('stroke', colors.chartLabel)
      .attr('stroke-width', 2)
      .attr('opacity', 0.85);

    plot
      .append('text')
      .attr('x', 4)
      .attr('y', -8)
      .attr('fill', negativeColor)
      .attr('font-size', 9)
      .attr('font-weight', 700)
      .text('← Reduces');

    plot
      .append('text')
      .attr('x', plotWidth - 4)
      .attr('y', -8)
      .attr('text-anchor', 'end')
      .attr('fill', positiveColor)
      .attr('font-size', 9)
      .attr('font-weight', 700)
      .text('Increases →');

    const labelGroup = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const rowGroup = plot
      .selectAll('g.shap-row')
      .data(factors, (d) => d.feature)
      .join('g')
      .attr('class', 'shap-row')
      .attr('transform', (_, i) => `translate(0,${i * rowStep + (rowStep - barHeight) / 2})`);

    labelGroup
      .selectAll('text.factor-label')
      .data(factors, (d) => d.feature)
      .join('text')
      .attr('class', 'factor-label')
      .attr('x', labelColWidth - 6)
      .attr('y', (_, i) => i * rowStep + rowStep / 2)
      .attr('dy', '0.32em')
      .attr('text-anchor', 'end')
      .attr('fill', colors.textSecondary)
      .attr('font-size', 10)
      .attr('font-weight', 600)
      .text((d) => truncateLabel(d.label));

    rowGroup.each(function drawRow(d) {
      const g = d3.select(this);
      const positive = d.shap >= 0;
      const x0 = positive ? zeroX : xScale(d.shap);
      const barW = Math.max(0, positive ? xScale(d.shap) - zeroX : zeroX - xScale(d.shap));

      g.append('rect')
        .attr('class', 'shap-bar')
        .attr('x', x0)
        .attr('y', 0)
        .attr('width', barW)
        .attr('height', barHeight)
        .attr('rx', 4)
        .attr('fill', positive ? 'url(#shap-positive-gradient)' : 'url(#shap-negative-gradient)')
        .attr('stroke', positive ? alpha(positiveColor, 0.65) : alpha(negativeColor, 0.65))
        .attr('stroke-width', 1)
        .style('cursor', 'pointer')
        .on('mouseenter', function onEnter(event) {
          d3.select(this).attr('opacity', 0.88);
          setTooltip({ x: event.offsetX, y: event.offsetY, row: d });
        })
        .on('mousemove', (event) => {
          setTooltip((prev) => (prev ? { ...prev, x: event.offsetX, y: event.offsetY } : prev));
        })
        .on('mouseleave', function onLeave() {
          d3.select(this).attr('opacity', 1);
          setTooltip(null);
        });

      const labelText = formatShapValue(d.shap);
      const labelX = positive ? xScale(d.shap) + 5 : xScale(d.shap) - 5;
      const anchor = positive ? 'start' : 'end';

      g.append('text')
        .attr('class', 'shap-value-label')
        .attr('x', labelX)
        .attr('y', barHeight / 2)
        .attr('dy', '0.32em')
        .attr('text-anchor', anchor)
        .attr('fill', positive ? positiveColor : negativeColor)
        .attr('font-size', 10)
        .attr('font-weight', 800)
        .attr('pointer-events', 'none')
        .text(labelText);
    });
  }, [factors, width, colors, positiveColor, negativeColor]);

  return (
    <DashboardCard sx={{ width: '100%' }} contentSx={cardShellSx}>
      <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', mb: 0.75, flexShrink: 0 }}>
        <Typography variant="subtitle2" sx={{ ...cardTitleSx, color: colors.textSecondary }}>
          Explanation
        </Typography>
        <Tooltip title="Positive SHAP values increase predicted delay; negative values reduce it." arrow placement="top">
          <InfoOutlinedIcon sx={{ fontSize: 14, color: colors.textSecondary, cursor: 'help' }} />
        </Tooltip>
      </Stack>

      {!request ? (
        <Typography variant="body2" sx={{ color: colors.textSecondary, fontSize: '0.8125rem', py: 2, textAlign: 'center' }}>
          No case selected.
        </Typography>
      ) : (
        <>
          <Stack direction="row" spacing={0.75} sx={{ mb: 0.75, flexShrink: 0 }}>
            <SummaryMetric label="Baseline" value={baseline.toFixed(2)} colors={colors} />
            <SummaryMetric
              label="Adjustment"
              value={formatAdjustment(modelAdjustment)}
              accent={modelAdjustment >= 0 ? positiveColor : negativeColor}
              colors={colors}
            />
            <SummaryMetric
              label="Predicted"
              value={`${Math.round(predicted)} h`}
              accent={colors.primary}
              colors={colors}
              emphasize
            />
          </Stack>

          <Box
            ref={containerRef}
            sx={{
              position: 'relative',
              width: '100%',
              flex: 1,
              minHeight: 0,
              height: SHAP_CHART_HEIGHT,
              maxHeight: SHAP_CHART_HEIGHT,
              borderRadius: '14px',
              border: `1px solid ${colors.border}`,
              bgcolor: colors.chartPlotBg,
              overflow: 'visible',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <svg ref={svgRef} style={{ width: '100%', height: '100%', display: 'block' }} />
            {tooltip && (
              <Box
                sx={{
                  position: 'absolute',
                  left: Math.min(tooltip.x + 14, width - 252),
                  top: Math.max(tooltip.y - 12, 8),
                  maxWidth: 248,
                  p: 1.4,
                  borderRadius: 2,
                  bgcolor: alpha(colors.tooltipBg, 0.98),
                  border: `1px solid ${alpha(tooltip.row.shap >= 0 ? positiveColor : negativeColor, 0.35)}`,
                  boxShadow: `0 8px 20px ${alpha('#000', 0.14)}`,
                  pointerEvents: 'none',
                  zIndex: 3,
                }}
              >
                <Typography variant="caption" sx={{ color: colors.textSecondary, display: 'block', fontFamily: 'monospace', fontSize: '0.68rem' }}>
                  {tooltip.row.feature}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 800, color: colors.textPrimary, lineHeight: 1.35, mt: 0.35, fontSize: '0.8125rem' }}>
                  {tooltip.row.label}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    display: 'block',
                    fontWeight: 700,
                    color: tooltip.row.shap >= 0 ? positiveColor : negativeColor,
                    mt: 0.5,
                    fontSize: '0.75rem',
                  }}
                >
                  SHAP value: {formatShapValue(tooltip.row.shap)}
                </Typography>
                <Typography variant="caption" sx={{ color: colors.textSecondary, display: 'block', mt: 0.6, lineHeight: 1.45, fontSize: '0.75rem' }}>
                  {plainEnglish(tooltip.row)}
                </Typography>
              </Box>
            )}
          </Box>
        </>
      )}
    </DashboardCard>
  );
}
