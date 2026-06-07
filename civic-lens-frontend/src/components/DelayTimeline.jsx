import { useMemo, useState } from 'react';
import {
  Typography,
  Box,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  alpha,
} from '@mui/material';
import { ChartTooltipPanel } from './ChartTooltip';
import TimelineIcon from '@mui/icons-material/Timeline';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  Brush,
  ReferenceArea,
} from 'recharts';
import { useAppColors, useColorMode } from '../ColorModeContext';
import {
  getDashboardSemanticColors,
  getTimelineLineColors,
  getTimelineRequestBarColor,
} from '../styles/dashboardColors';
import { getDelayBucketColorMap } from '../utils/mapHelpers';
import { formatHours } from '../utils/analytics';
import GlassChartCard from './GlassChartCard';
import VizSectionHeader from './VizSectionHeader';

const MODE_SUBTITLES = {
  resolved: 'Monthly volume and actual resolution time for closed requests.',
  unresolved: 'Monthly volume and model-predicted resolution time for open requests.',
};

const HOURS_BANDS = [
  { y1: 0, y2: 24, colorKey: 'Same Day', label: 'Same Day', opacity: 0.06 },
  { y1: 24, y2: 72, colorKey: '1–3 Days', label: '1-3 Days', opacity: 0.08 },
  { y1: 72, y2: 168, colorKey: '3–7 Days', label: '3-7 Days', opacity: 0.1 },
  { y1: 168, colorKey: 'More than 1 Week', label: '7+ Days', opacity: 0.12 },
];

function formatCountTick(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return '';
  if (Math.abs(numeric) >= 1000) return `${Math.round(numeric / 1000)}k`;
  return String(Math.round(numeric));
}

// TODO: Backend delay-trend aggregation must supply per-bucket monthly counts
// (count_same_day, count_1_3, count_3_7, count_7plus) for stacked volume bars.
const STACK_BUCKETS = [
  { dataKey: 'count_same_day', name: 'Same Day', colorKey: 'Same Day', tooltipLabel: 'Same Day' },
  { dataKey: 'count_1_3', name: '1-3 Days', colorKey: '1–3 Days', tooltipLabel: '1-3 Days' },
  { dataKey: 'count_3_7', name: '3-7 Days', colorKey: '3–7 Days', tooltipLabel: '3-7 Days' },
  { dataKey: 'count_7plus', name: '7+ Days', colorKey: 'More than 1 Week', tooltipLabel: '7+ Days' },
];

function resolveChartHeight(plotHeight) {
  if (typeof plotHeight === 'number' && plotHeight > 0) return plotHeight;
  return 360;
}

function formatMonthYear(entry) {
  if (entry?.label) return entry.label;
  if (entry?.month && entry?.year) {
    const date = new Date(entry.year, entry.month - 1, 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  }
  return '';
}

export function detectAnomalies(data, key, threshold = 2) {
  const values = data
    .map((entry) => entry[key])
    .filter((value) => value != null && Number.isFinite(Number(value)))
    .map(Number);

  if (!values.length) {
    return data.map((entry) => ({ ...entry, [`${key}_anomaly`]: false }));
  }

  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const variance = values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length;
  const std = Math.sqrt(variance);

  return data.map((entry) => {
    const raw = entry[key];
    const numeric = Number(raw);
    const isAnomaly = Number.isFinite(numeric)
      && std > 0
      && Math.abs((numeric - mean) / std) > threshold;

    return { ...entry, [`${key}_anomaly`]: isAnomaly };
  });
}

function hasBucketBreakdown(entries) {
  return (entries || []).some((entry) => STACK_BUCKETS.some(
    ({ dataKey }) => entry[dataKey] != null && Number(entry[dataKey]) > 0,
  ));
}

function normalizeResolvedEntry(entry) {
  return {
    ...entry,
    xLabel: formatMonthYear(entry),
    count: entry.resolvedCount ?? entry.count ?? 0,
    avgResponseHours: entry.avgResponseHours ?? entry.avgActual ?? 0,
    count_same_day: entry.count_same_day,
    count_1_3: entry.count_1_3,
    count_3_7: entry.count_3_7,
    count_7plus: entry.count_7plus,
    top_complaint_type: entry.top_complaint_type ?? entry.topComplaintType,
  };
}

function normalizeUnresolvedEntry(entry) {
  const totalCount = entry.count ?? 0;
  const unresolvedCount = entry.unresolvedCount ?? (
    entry.unresolvedRate != null
      ? Math.round(totalCount * entry.unresolvedRate)
      : totalCount
  );

  return {
    ...entry,
    xLabel: formatMonthYear(entry),
    count: unresolvedCount,
    avgPredictedHours: entry.avgPredictedHours ?? entry.avgPredicted ?? 0,
    count_same_day: entry.count_same_day,
    count_1_3: entry.count_1_3,
    count_3_7: entry.count_3_7,
    count_7plus: entry.count_7plus,
    top_complaint_type: entry.top_complaint_type ?? entry.topComplaintType,
  };
}

function CustomTooltip({ active, payload, label, viewMode, bucketColors, useStackedBars }) {
  if (!active || !payload?.length) return null;

  const row = payload[0]?.payload || {};
  const rows = [];

  if (row.count != null) {
    rows.push({
      label: 'Total requests',
      value: Number(row.count ?? 0).toLocaleString(),
      emphasize: true,
    });
  }

  if (useStackedBars) {
    STACK_BUCKETS.forEach(({ dataKey, tooltipLabel, colorKey }) => {
      const value = row[dataKey];
      if (value == null) return;
      rows.push({
        label: tooltipLabel,
        value: Number(value).toLocaleString(),
        color: bucketColors[colorKey],
      });
    });
  }

  if (viewMode === 'resolved' && row.avgResponseHours != null) {
    rows.push({
      label: 'Avg actual',
      value: formatHours(row.avgResponseHours ?? 0),
    });
  } else if (viewMode === 'unresolved' && row.avgPredictedHours != null) {
    rows.push({
      label: 'Avg predicted',
      value: formatHours(row.avgPredictedHours ?? 0),
    });
  }

  if (row.unresolvedRate != null) {
    rows.push({
      label: 'Unresolved rate',
      value: `${(Number(row.unresolvedRate) * 100).toFixed(1)}%`,
    });
  }

  const topComplaint = row.top_complaint_type;
  if (topComplaint) {
    rows.push({
      label: 'Top complaint',
      value: String(topComplaint),
    });
  }

  return (
    <ChartTooltipPanel
      title={label}
      rows={rows}
      neutral={!useStackedBars}
    />
  );
}

function AnomalyLineDot({ cx, cy, payload, hoursKey, lineColor, anomalyColor, strokeColor }) {
  if (cx == null || cy == null) return null;

  const isAnomaly = payload?.[`${hoursKey}_anomaly`];
  if (isAnomaly) {
    return (
      <circle
        cx={cx}
        cy={cy}
        r={6}
        fill={anomalyColor}
        stroke={strokeColor}
        strokeWidth={1.5}
      />
    );
  }

  return <circle cx={cx} cy={cy} r={3} fill={lineColor} strokeWidth={0} />;
}

export default function DelayTimeline({
  timelineData = [],
  resolvedData,
  unresolvedData,
  selectedBorough = null,
  title = 'Delay & Complaint Timeline',
  subtitle = 'Tracks monthly request volume, actual response time, predicted response time, and unresolved rate.',
  plotHeight,
  compactFooter = false,
}) {
  const colors = useAppColors();
  const { mode } = useColorMode();
  const semantic = useMemo(() => getDashboardSemanticColors(colors, mode), [colors, mode]);
  const requestCountBarColor = useMemo(
    () => getTimelineRequestBarColor(selectedBorough, mode),
    [selectedBorough, mode],
  );
  const lineColors = useMemo(() => getTimelineLineColors(mode), [mode]);
  const bucketColors = useMemo(() => getDelayBucketColorMap(mode), [mode]);
  const [viewMode, setViewMode] = useState('resolved');

  const resolvedSource = resolvedData ?? timelineData;
  const unresolvedSource = unresolvedData ?? timelineData;

  const chartData = useMemo(() => {
    const source = viewMode === 'resolved' ? resolvedSource : unresolvedSource;
    const normalized = (source || []).map(
      viewMode === 'resolved' ? normalizeResolvedEntry : normalizeUnresolvedEntry,
    );

    const hoursKey = viewMode === 'resolved' ? 'avgResponseHours' : 'avgPredictedHours';
    return detectAnomalies(normalized, hoursKey);
  }, [viewMode, resolvedSource, unresolvedSource]);

  const useStackedBars = useMemo(() => hasBucketBreakdown(chartData), [chartData]);

  const hoursKey = viewMode === 'resolved' ? 'avgResponseHours' : 'avgPredictedHours';
  const lineColor = viewMode === 'resolved' ? lineColors.response : lineColors.predicted;
  const hasLineAnomalies = chartData.some((entry) => entry[`${hoursKey}_anomaly`]);
  const dotStrokeColor = mode === 'light' ? '#ffffff' : colors.background;

  const hoursDomainMax = useMemo(() => {
    const values = chartData
      .map((entry) => Number(entry[hoursKey]))
      .filter((value) => Number.isFinite(value));
    const dataMax = values.length ? Math.max(...values) : 0;
    return Math.max(180, Math.ceil(Math.max(dataMax, 168) / 45) * 45);
  }, [chartData, hoursKey]);

  const brushStartIndex = chartData.length > 8 ? chartData.length - 8 : 0;
  const brushEndIndex = chartData.length > 0 ? chartData.length - 1 : 0;
  const chartHeight = resolveChartHeight(plotHeight);
  const activeSubtitle = MODE_SUBTITLES[viewMode] ?? subtitle;
  const legendHeight = compactFooter
    ? (useStackedBars ? 44 : 30)
    : (useStackedBars ? 52 : 36);

  return (
    <GlassChartCard accent="dashboard">
      <VizSectionHeader
        icon={TimelineIcon}
        iconColor={colors.warning}
        title={title}
        subtitle={activeSubtitle}
        tooltip="Switch between resolved and unresolved views. Resolved shows actual response times; unresolved shows model-predicted delays for open requests."
        actions={(
          <ToggleButtonGroup
            exclusive
            size="small"
            value={viewMode}
            onChange={(_, value) => value && setViewMode(value)}
            sx={{
              '& .MuiToggleButton-root': {
                px: 1.25,
                py: 0.25,
                fontSize: '0.75rem',
                fontWeight: 600,
                textTransform: 'none',
                color: colors.textSecondary,
                borderColor: colors.border,
                '&.Mui-selected': {
                  color: colors.textPrimary,
                  bgcolor: alpha(colors.primary, 0.08),
                },
              },
            }}
          >
            <ToggleButton value="resolved">Resolved</ToggleButton>
            <ToggleButton value="unresolved">Unresolved</ToggleButton>
          </ToggleButtonGroup>
        )}
      />

      <Box
        sx={{
          width: '100%',
          height: chartHeight,
          minHeight: chartHeight,
          minWidth: 0,
          mt: 0.5,
          flexShrink: 0,
        }}
      >
        {chartData.length === 0 ? (
          <Box
            sx={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 2,
              border: `1px dashed ${colors.border}`,
              color: colors.chartLabel,
            }}
          >
            <Typography variant="body2">No timeline data for the current filters.</Typography>
          </Box>
        ) : (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <ComposedChart
              data={chartData}
              margin={{ top: 8, right: 6, left: 10, bottom: compactFooter ? 4 : 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={semantic.grid} vertical={false} />

              {HOURS_BANDS.map(({ y1, y2, colorKey, label, opacity }) => (
                <ReferenceArea
                  key={`hours-band-${label}`}
                  yAxisId="hours"
                  y1={y1}
                  y2={y2 ?? hoursDomainMax}
                  fill={alpha(bucketColors[colorKey], opacity)}
                  fillOpacity={1}
                  strokeOpacity={0}
                  ifOverflow="extendDomain"
                />
              ))}

              <XAxis
                dataKey="xLabel"
                tick={{ fill: semantic.muted, fontSize: 11 }}
                axisLine={{ stroke: colors.border }}
                tickLine={{ stroke: colors.border }}
                interval="preserveStartEnd"
                minTickGap={24}
              />

              <YAxis
                yAxisId="count"
                orientation="left"
                tick={{ fill: semantic.muted, fontSize: 11 }}
                axisLine={{ stroke: alpha(requestCountBarColor, 0.35) }}
                tickLine={false}
                width={56}
                allowDecimals={false}
                tickFormatter={formatCountTick}
              />

              <YAxis
                yAxisId="hours"
                orientation="right"
                domain={[0, hoursDomainMax]}
                tick={{ fill: semantic.muted, fontSize: 11 }}
                axisLine={{ stroke: alpha(lineColor, 0.35) }}
                tickLine={false}
                width={48}
                tickFormatter={(value) => `${value}h`}
              />

              <RechartsTooltip
                content={(
                  <CustomTooltip
                    viewMode={viewMode}
                    bucketColors={bucketColors}
                    useStackedBars={useStackedBars}
                  />
                )}
                cursor={{ fill: alpha(requestCountBarColor, 0.08) }}
              />

              <Legend
                verticalAlign="top"
                height={legendHeight}
                wrapperStyle={{
                  fontSize: 11,
                  color: colors.textSecondary,
                  paddingBottom: 2,
                  lineHeight: '14px',
                }}
                formatter={(value) => <span style={{ color: colors.textSecondary }}>{value}</span>}
              />

              {useStackedBars ? (
                STACK_BUCKETS.map(({ dataKey, name, colorKey }, index) => (
                  <Bar
                    key={dataKey}
                    yAxisId="count"
                    dataKey={dataKey}
                    name={name}
                    stackId="volume"
                    fill={bucketColors[colorKey]}
                    maxBarSize={42}
                    radius={index === STACK_BUCKETS.length - 1 ? [6, 6, 0, 0] : [0, 0, 0, 0]}
                    isAnimationActive={false}
                  />
                ))
              ) : (
                <Bar
                  yAxisId="count"
                  dataKey="count"
                  name={viewMode === 'resolved' ? 'Resolved Requests' : 'Open Requests'}
                  fill={requestCountBarColor}
                  radius={[6, 6, 0, 0]}
                  maxBarSize={42}
                  isAnimationActive={false}
                />
              )}

              {viewMode === 'resolved' ? (
                <Line
                  yAxisId="hours"
                  type="monotone"
                  dataKey="avgResponseHours"
                  name="Avg Response Hours"
                  stroke={lineColors.response}
                  strokeWidth={2.5}
                  dot={(props) => (
                    <AnomalyLineDot
                      {...props}
                      hoursKey="avgResponseHours"
                      lineColor={lineColors.response}
                      anomalyColor={colors.error}
                      strokeColor={dotStrokeColor}
                    />
                  )}
                  activeDot={{ r: 5, fill: lineColors.response }}
                  isAnimationActive={false}
                />
              ) : (
                <Line
                  yAxisId="hours"
                  type="monotone"
                  dataKey="avgPredictedHours"
                  name="Avg Predicted Hours"
                  stroke={lineColors.predicted}
                  strokeWidth={2.5}
                  strokeDasharray="6 4"
                  dot={(props) => (
                    <AnomalyLineDot
                      {...props}
                      hoursKey="avgPredictedHours"
                      lineColor={lineColors.predicted}
                      anomalyColor={colors.error}
                      strokeColor={dotStrokeColor}
                    />
                  )}
                  activeDot={{ r: 5, fill: lineColors.predicted }}
                  isAnimationActive={false}
                />
              )}

              {chartData.length > 4 && !compactFooter && (
                <Brush
                  dataKey="xLabel"
                  height={20}
                  stroke={alpha(requestCountBarColor, 0.45)}
                  fill={alpha(requestCountBarColor, 0.08)}
                  travellerWidth={8}
                  startIndex={brushStartIndex}
                  endIndex={brushEndIndex}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </Box>

      {chartData.length > 0 && (
        <Stack direction="row" spacing={1.5} useFlexGap sx={{ flexWrap: 'wrap', mt: 0.75, alignItems: 'center' }}>
          <Typography variant="caption" sx={{ color: colors.textSecondary, mr: 0.25 }}>
            Delay bands:
          </Typography>
          {HOURS_BANDS.map(({ label, colorKey, opacity }) => (
            <Stack key={label} direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
              <Box
                sx={{
                  width: 12,
                  height: 8,
                  borderRadius: 0.5,
                  bgcolor: alpha(bucketColors[colorKey], Math.min(opacity * 2.2, 0.35)),
                  border: `1px solid ${alpha(bucketColors[colorKey], 0.25)}`,
                }}
              />
              <Typography variant="caption" sx={{ color: colors.chartLabel }}>
                {label}
              </Typography>
            </Stack>
          ))}
        </Stack>
      )}

      {hasLineAnomalies && (
        <Typography variant="caption" sx={{ color: colors.textSecondary, mt: 0.75, display: 'block' }}>
          Anomalous months (±2sigma from mean)
        </Typography>
      )}

      {!compactFooter && (
        <Stack direction="row" spacing={2} useFlexGap sx={{ flexWrap: 'wrap', mt: 1.5 }}>
          {(useStackedBars
            ? [
              ...STACK_BUCKETS.map(({ name, colorKey }) => ({
                label: name,
                swatch: bucketColors[colorKey],
              })),
              viewMode === 'resolved'
                ? { label: 'Avg response (actual)', swatch: lineColors.response }
                : { label: 'Avg predicted', swatch: lineColors.predicted },
            ]
            : [
              { label: 'Request count', swatch: requestCountBarColor },
              viewMode === 'resolved'
                ? { label: 'Avg response (actual)', swatch: lineColors.response }
                : { label: 'Avg predicted', swatch: lineColors.predicted },
            ]
          ).map((item) => (
            <Stack key={item.label} direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
              <Box sx={{ width: 10, height: 10, borderRadius: 0.5, bgcolor: item.swatch, boxShadow: `0 0 8px ${alpha(item.swatch, 0.45)}` }} />
              <Typography variant="caption" sx={{ color: colors.chartLabel }}>
                {item.label}
              </Typography>
            </Stack>
          ))}
        </Stack>
      )}
    </GlassChartCard>
  );
}
