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
  cardSubtitleSx,
  cardTitleSx,
} from '../styles/modelViewLayout';
import DashboardCard from './DashboardCard';

// Pink ramp — increasing bars
const PINK_LIGHT = '#F9A8D4';
const PINK_MID = '#EC4899';
const PINK_DEEP = '#DB2777';

// Violet ramp — reducing bars
const PURPLE_LIGHT = '#C4B5FD';
const PURPLE_MID = '#8B5CF6';
const PURPLE_DEEP = '#7C3AED';

// Full descriptive labels — used in the tooltip
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

// Short labels — used on the y-axis pills (kept brief and similar in length)
const FEATURE_SHORT_LABELS = {
  agency_complaint_median: 'Complaint history',
  agency_zip_median: 'ZIP history',
  agency_workload_24h: 'Agency workload',
  complaint_type: 'Complaint type',
  month: 'Seasonality',
  borough: 'Borough',
  agency: 'Agency',
  open_data_channel_type: 'Channel',
};

const MONTH_NAMES = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function resolveLabel(row) {
  return row?.label || FEATURE_LABELS[row?.feature] || row?.feature || 'Unknown factor';
}

function truncateLabel(text, max = 26) {
  const value = String(text ?? '');
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}

function resolveShortLabel(row) {
  return FEATURE_SHORT_LABELS[row?.feature] || row?.shortLabel || truncateLabel(resolveLabel(row), 18);
}

function formatShapValue(value) {
  const n = Number(value) || 0;
  const sign = n >= 0 ? '+' : '';
  return `${sign}${n.toFixed(2)}`;
}

function formatFeatureValue(feature, value) {
  if (value == null || value === '' || value === '—') return null;
  if (feature === 'month') return MONTH_NAMES[Number(value)] ?? String(value);
  if (feature === 'agency_workload_24h') return `${Number(value).toFixed(0)} requests`;
  if (feature?.includes('median')) return `${Number(value).toFixed(1)} h`;
  return String(value);
}

// Detects whether a color token is dark, so the label pills can flip for the theme
function isDarkColor(c) {
  if (!c || typeof c !== 'string') return true;
  let r = 0, g = 0, b = 0;
  if (c[0] === '#') {
    const h = c.slice(1);
    const v = h.length === 3 ? h.split('').map((x) => x + x).join('') : h;
    r = parseInt(v.slice(0, 2), 16);
    g = parseInt(v.slice(2, 4), 16);
    b = parseInt(v.slice(4, 6), 16);
  } else {
    const m = c.match(/\d+(\.\d+)?/g);
    if (m) [r, g, b] = m.map(Number);
  }
  return (0.299 * r + 0.587 * g + 0.114 * b) < 140;
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
  // Measure both width AND height so the chart fills the card; the leftover
  // space below the axis then matches the card's 22px side padding.
  const [dims, setDims] = useState({ width: 720, height: SHAP_CHART_HEIGHT });
  const [tooltip, setTooltip] = useState(null);

  const shap = request?.shap_explanation;
  const baseline = Number(shap?.baseline_value ?? 0);
  const predicted = Number(shap?.prediction_value ?? request?.predicted_response_hours ?? 0);

  const factors = useMemo(() => {
    return buildShapContributions(request)
      .map((row) => ({
        ...row,
        label: resolveLabel(row),
        shortLabel: resolveShortLabel(row),
        shap: Number(row.shap) || 0,
      }))
      .sort((a, b) => Math.abs(b.shap) - Math.abs(a.shap))
      .slice(0, SHAP_FACTOR_LIMIT);
  }, [request]);

  // Cumulative waterfall steps: each bar walks from its runStart to runEnd
  const steps = useMemo(() => {
    let running = baseline;
    return factors.map((d) => {
      const runStart = running;
      running += d.shap;
      return { ...d, runStart, runEnd: running };
    });
  }, [factors, baseline]);

  const modelAdjustment = useMemo(() => {
    if (factors.length) return factors.reduce((s, r) => s + r.shap, 0);
    return predicted - baseline;
  }, [factors, predicted, baseline]);

  const positiveColor = PINK_MID;    // pink — increases
  const negativeColor = PURPLE_MID;  // violet — reduces

  useEffect(() => {
    if (!containerRef.current) return undefined;
    const observer = new ResizeObserver(([entry]) => {
      const { width: w, height: h } = entry.contentRect;
      if (w > 0 && h > 0) setDims({ width: w, height: h });
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!svgRef.current || !steps.length) return;

    const { width, height } = dims;
    // Symmetric bottom: small bottom margin so the axis sits near the chart
    // edge, leaving only the card's 22px padding below it (matches the sides).
    const margin = { top: 28, right: 60, bottom: 24, left: 14 };
    const labelColWidth = Math.min(186, Math.max(136, width * 0.3));
    const plotLeft = margin.left + labelColWidth;
    const plotWidth = Math.max(120, width - plotLeft - margin.right);
    const plotHeight = Math.max(80, height - margin.top - margin.bottom);
    const rowStep = plotHeight / steps.length;
    const barHeight = Math.min(26, Math.max(12, rowStep - 10));

    // X domain spans all intermediate cumulative values + baseline + predicted
    const allX = [baseline, predicted, ...steps.flatMap((s) => [s.runStart, s.runEnd])];
    const xMin = Math.min(...allX);
    const xMax = Math.max(...allX);
    const xPad = Math.max((xMax - xMin) * 0.1, 4);
    const xScale = d3.scaleLinear()
      .domain([xMin - xPad, xMax + xPad])
      .range([0, plotWidth]);

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    svg
      .attr('width', '100%')
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .attr('role', 'img')
      .attr('aria-label', 'SHAP waterfall chart: cumulative feature contributions from baseline to prediction');

    const defs = svg.append('defs');
    // Pink gradient — increases, light → deep
    const posGrad = defs.append('linearGradient').attr('id', 'wf-pos').attr('x1', '0%').attr('x2', '100%');
    posGrad.append('stop').attr('offset', '0%').attr('stop-color', PINK_LIGHT).attr('stop-opacity', 0.9);
    posGrad.append('stop').attr('offset', '100%').attr('stop-color', PINK_DEEP).attr('stop-opacity', 0.95);
    // Violet gradient — reduces, light → deep
    const negGrad = defs.append('linearGradient').attr('id', 'wf-neg').attr('x1', '100%').attr('x2', '0%');
    negGrad.append('stop').attr('offset', '0%').attr('stop-color', PURPLE_LIGHT).attr('stop-opacity', 0.9);
    negGrad.append('stop').attr('offset', '100%').attr('stop-color', PURPLE_DEEP).attr('stop-opacity', 0.95);

    const plot = svg.append('g').attr('transform', `translate(${plotLeft},${margin.top})`);

    // Plot background
    plot.append('rect')
      .attr('width', plotWidth).attr('height', plotHeight)
      .attr('rx', 6)
      .attr('fill', colors.chartPlotBg)
      .attr('stroke', colors.border);

    // Grid + x-axis ticks
    const ticks = xScale.ticks(5);
    ticks.forEach((t) => {
      plot.append('line')
        .attr('x1', xScale(t)).attr('x2', xScale(t))
        .attr('y1', 0).attr('y2', plotHeight)
        .attr('stroke', colors.gridStroke)
        .attr('stroke-width', 1);
      plot.append('text')
        .attr('x', xScale(t)).attr('y', plotHeight + 17)
        .attr('text-anchor', 'middle')
        .attr('fill', colors.chartLabel)
        .attr('font-size', 12)
        .text(`${t}h`);
    });

    // Baseline dashed marker — E[f(x)]
    const bx = xScale(baseline);
    const px = xScale(predicted);
    const baselineIsLeft = baseline <= predicted;
    plot.append('line')
      .attr('x1', bx).attr('x2', bx)
      .attr('y1', 0).attr('y2', plotHeight)
      .attr('stroke', colors.chartLabel)
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '4,3')
      .attr('opacity', 0.75);
    plot.append('text')
      .attr('x', bx + (baselineIsLeft ? 4 : -4))
      .attr('y', 13)
      .attr('text-anchor', baselineIsLeft ? 'start' : 'end')
      .attr('fill', colors.chartLabel)
      .attr('font-size', 11)
      .attr('font-weight', 700)
      .text(`E[f(x)] = ${baseline.toFixed(1)}h`);

    // Prediction solid marker — f(x)
    plot.append('line')
      .attr('x1', px).attr('x2', px)
      .attr('y1', 0).attr('y2', plotHeight)
      .attr('stroke', colors.primary)
      .attr('stroke-width', 2)
      .attr('opacity', 0.9);
    plot.append('text')
      .attr('x', px + (baselineIsLeft ? -4 : 4))
      .attr('y', 26)
      .attr('text-anchor', baselineIsLeft ? 'end' : 'start')
      .attr('fill', colors.primary)
      .attr('font-size', 11)
      .attr('font-weight', 700)
      .text(`f(x) = ${predicted.toFixed(1)}h`);

    // Feature labels (left column) — uniform-width pink pills, centered, theme-aware
    const darkMode = isDarkColor(colors.chartPlotBg);
    const pillFill = darkMode ? 'rgba(236,72,153,0.18)' : 'rgba(236,72,153,0.12)';
    const pillStroke = darkMode ? 'rgba(236,72,153,0.34)' : 'rgba(219,39,119,0.30)';
    const pillText = darkMode ? '#F9A8D4' : '#BE185D';
    const pillW = labelColWidth - 12;
    const pillH = Math.min(30, Math.max(20, rowStep - 8));
    const pillRight = labelColWidth - 4; // right edge sits just left of the plot
    const labelGroup = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);
    steps.forEach((d, i) => {
      const cy = i * rowStep + rowStep / 2;
      labelGroup.append('rect')
        .attr('x', pillRight - pillW)
        .attr('y', cy - pillH / 2)
        .attr('width', pillW)
        .attr('height', pillH)
        .attr('rx', 8)
        .attr('fill', pillFill)
        .attr('stroke', pillStroke)
        .attr('stroke-width', 1);
      labelGroup.append('text')
        .attr('x', pillRight - pillW / 2)
        .attr('y', cy)
        .attr('dy', '0.32em')
        .attr('text-anchor', 'middle')
        .attr('fill', pillText)
        .attr('font-size', 13)
        .attr('font-weight', 600)
        .text(truncateLabel(d.shortLabel, 18));
    });

    // Step connectors — thin vertical lines linking the end of bar i-1 to start of bar i
    steps.forEach((d, i) => {
      if (i === 0) return;
      const cx = xScale(d.runStart);
      const y1 = (i - 1) * rowStep + (rowStep - barHeight) / 2 + barHeight / 2;
      const y2 = i * rowStep + (rowStep - barHeight) / 2 + barHeight / 2;
      plot.append('line')
        .attr('x1', cx).attr('x2', cx)
        .attr('y1', y1).attr('y2', y2)
        .attr('stroke', colors.border)
        .attr('stroke-width', 1)
        .attr('opacity', 0.85);
    });

    // Waterfall bars
    steps.forEach((d, i) => {
      const positive = d.shap >= 0;
      const x0 = xScale(Math.min(d.runStart, d.runEnd));
      const barW = Math.max(2, Math.abs(xScale(d.runEnd) - xScale(d.runStart)));
      const yTop = i * rowStep + (rowStep - barHeight) / 2;
      const featureVal = formatFeatureValue(d.feature, d.value);

      const g = plot.append('g').attr('transform', `translate(0,${yTop})`);

      g.append('rect')
        .attr('x', x0).attr('y', 0)
        .attr('width', barW).attr('height', barHeight)
        .attr('rx', 4)
        .attr('fill', positive ? 'url(#wf-pos)' : 'url(#wf-neg)')
        .attr('stroke', positive ? alpha(positiveColor, 0.65) : alpha(negativeColor, 0.65))
        .attr('stroke-width', 1)
        .attr('tabindex', '0')
        .attr('role', 'button')
        .attr('aria-label', `${d.label}: ${formatShapValue(d.shap)} hours, running total ${d.runEnd.toFixed(2)} hours`)
        .style('cursor', 'pointer')
        .style('outline', 'none')
        .on('mouseenter', function onEnter(event) {
          d3.select(this).attr('opacity', 0.82);
          setTooltip({ x: event.offsetX, y: event.offsetY, row: { ...d, featureVal } });
        })
        .on('mousemove', (event) => {
          setTooltip((prev) => (prev ? { ...prev, x: event.offsetX, y: event.offsetY } : prev));
        })
        .on('mouseleave', function onLeave() {
          d3.select(this).attr('opacity', 1);
          setTooltip(null);
        })
        .on('focus', function onFocus() {
          d3.select(this).attr('opacity', 0.82);
          setTooltip({ x: plotLeft + x0 + barW / 2, y: margin.top + yTop, row: { ...d, featureVal } });
        })
        .on('blur', function onBlur() {
          d3.select(this).attr('opacity', 1);
          setTooltip(null);
        });

      // Signed contribution label next to bar — larger
      const labelX = positive ? x0 + barW + 5 : x0 - 5;
      g.append('text')
        .attr('x', labelX).attr('y', barHeight / 2)
        .attr('dy', '0.32em')
        .attr('text-anchor', positive ? 'start' : 'end')
        .attr('fill', positive ? positiveColor : negativeColor)
        .attr('font-size', 13)
        .attr('font-weight', 800)
        .attr('pointer-events', 'none')
        .text(formatShapValue(d.shap));
    });
  }, [steps, dims, colors, positiveColor, negativeColor, baseline, predicted]);

  return (
    <DashboardCard sx={{ width: '100%' }} contentSx={cardShellSx}>
      <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', mb: 0.75, flexShrink: 0 }}>
        <Typography variant="subtitle2" sx={{ ...cardTitleSx, color: colors.textSecondary }}>
          Explanation
        </Typography>
        <Tooltip
          title="Each bar shifts the prediction from the model baseline. Bars walk cumulatively from E[f(x)] to f(x)."
          arrow
          placement="top"
        >
          <InfoOutlinedIcon sx={{ fontSize: 14, color: colors.textSecondary, cursor: 'help' }} />
        </Tooltip>
      </Stack>

      {!request ? (
        <Typography variant="body2" sx={{ ...cardSubtitleSx, color: colors.textSecondary, py: 2, textAlign: 'center' }}>
          No case selected.
        </Typography>
      ) : (
        <>
          {/* Compact summary strip — same numbers the waterfall encodes, shown once */}
          <Stack
            direction="row"
            spacing={1}
            divider={<Box sx={{ width: '1px', height: 10, bgcolor: colors.border, alignSelf: 'center' }} />}
            sx={{ mb: 0.75, flexShrink: 0, alignItems: 'center' }}
          >
            <Typography
              variant="caption"
              sx={{ fontSize: '0.72rem', fontVariantNumeric: 'tabular-nums', color: colors.textSecondary }}
            >
              <Box component="span" sx={{ fontWeight: 700, color: colors.textMuted, mr: 0.3 }}>Baseline</Box>
              {baseline.toFixed(2)} h
            </Typography>
            <Typography
              variant="caption"
              sx={{
                fontSize: '0.72rem',
                fontWeight: 700,
                fontVariantNumeric: 'tabular-nums',
                color: modelAdjustment >= 0 ? positiveColor : negativeColor,
              }}
            >
              Adj {formatShapValue(modelAdjustment)} h
            </Typography>
            <Typography
              variant="caption"
              sx={{ fontSize: '0.72rem', fontWeight: 800, fontVariantNumeric: 'tabular-nums', color: colors.primary }}
            >
              Predicted {Math.round(predicted)} h
            </Typography>
          </Stack>

          <Box
            ref={containerRef}
            sx={{
              position: 'relative',
              width: '100%',
              flex: 1,
              minHeight: 0,
              borderRadius: '14px',
              border: `1px solid ${colors.border}`,
              bgcolor: colors.chartPlotBg,
              overflow: 'visible',
              display: 'flex',
              alignItems: 'stretch',
            }}
          >
            <svg ref={svgRef} style={{ width: '100%', height: '100%', display: 'block' }} />

            {tooltip && (
              <Box
                sx={{
                  position: 'absolute',
                  left: Math.min(tooltip.x + 14, dims.width - 264),
                  top: Math.max(tooltip.y - 14, 4),
                  maxWidth: 260,
                  p: 1.4,
                  borderRadius: 2,
                  bgcolor: alpha(colors.tooltipBg, 0.98),
                  border: `1px solid ${alpha(tooltip.row.shap >= 0 ? positiveColor : negativeColor, 0.35)}`,
                  boxShadow: `0 8px 20px ${alpha('#000', 0.14)}`,
                  pointerEvents: 'none',
                  zIndex: 3,
                }}
              >
                {/* Tooltip starts directly at the human-readable label (raw feature key removed) */}
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 800, color: colors.textPrimary, lineHeight: 1.35, fontSize: '0.8125rem' }}
                >
                  {tooltip.row.label}
                </Typography>
                {tooltip.row.featureVal != null && (
                  <Typography variant="caption" sx={{ display: 'block', color: colors.textSecondary, mt: 0.4, fontSize: '0.72rem' }}>
                    {'Value: '}
                    <Box component="span" sx={{ fontWeight: 700, color: colors.textPrimary }}>
                      {tooltip.row.featureVal}
                    </Box>
                  </Typography>
                )}
                <Typography
                  variant="caption"
                  sx={{
                    display: 'block',
                    fontWeight: 700,
                    color: tooltip.row.shap >= 0 ? positiveColor : negativeColor,
                    mt: 0.4,
                    fontSize: '0.75rem',
                  }}
                >
                  Contribution: {formatShapValue(tooltip.row.shap)} h
                </Typography>
                <Typography variant="caption" sx={{ display: 'block', color: colors.textSecondary, mt: 0.25, fontSize: '0.72rem' }}>
                  {'Running total: '}
                  <Box component="span" sx={{ fontWeight: 700, color: colors.textPrimary, fontVariantNumeric: 'tabular-nums' }}>
                    {tooltip.row.runEnd.toFixed(2)} h
                  </Box>
                </Typography>
              </Box>
            )}
          </Box>
        </>
      )}
    </DashboardCard>
  );
}