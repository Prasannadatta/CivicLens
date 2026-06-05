import { useMemo, useState } from 'react';
import {
  Typography,
  Box,
  Stack,
  FormControlLabel,
  Switch,
  alpha,
  Tooltip,
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
} from 'recharts';
import { useAppColors, useColorMode } from '../ColorModeContext';
import {
  getDashboardSemanticColors,
  getTimelineLineColors,
  getTimelineRequestBarColor,
} from '../styles/dashboardColors';
import { formatHours } from '../utils/analytics';
import GlassChartCard from './GlassChartCard';
import VizSectionHeader from './VizSectionHeader';

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

function CustomTooltip({ active, payload, label, colors }) {
  if (!active || !payload?.length) return null;

  const row = payload[0]?.payload || {};
  return (
    <ChartTooltipPanel
      title={label}
      rows={[
        { label: 'Requests', value: Number(row.count ?? 0).toLocaleString() },
        { label: 'Avg response', value: formatHours(row.avgResponseHours ?? row.avgActual ?? 0) },
        { label: 'Avg predicted', value: formatHours(row.avgPredictedHours ?? row.avgPredicted ?? 0) },
        { label: 'Unresolved rate', value: `${((row.unresolvedRate ?? 0) * 100).toFixed(1)}%` },
      ]}
    />
  );
}

export default function DelayTimeline({
  timelineData = [],
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
  const [showUnresolved, setShowUnresolved] = useState(!compactFooter);

  const chartData = useMemo(
    () => (timelineData || []).map((entry) => ({
      ...entry,
      xLabel: formatMonthYear(entry),
      unresolvedPct: Number(((entry.unresolvedRate ?? 0) * 100).toFixed(1)),
      avgResponseHours: entry.avgResponseHours ?? entry.avgActual ?? 0,
      avgPredictedHours: entry.avgPredictedHours ?? entry.avgPredicted ?? 0,
    })),
    [timelineData],
  );

  const brushStartIndex = chartData.length > 8 ? chartData.length - 8 : 0;
  const brushEndIndex = chartData.length > 0 ? chartData.length - 1 : 0;
  const chartHeight = resolveChartHeight(plotHeight);

  return (
    <GlassChartCard accent="dashboard">
      <VizSectionHeader
        icon={TimelineIcon}
        iconColor={colors.warning}
        title={title}
        subtitle={subtitle}
        tooltip="Use the brush at the bottom to zoom a time window. Toggle unresolved to compare backlog pressure against delay."
        actions={(
          <Tooltip title="Overlay the share of open or in-progress requests per month" arrow>
            <FormControlLabel
              control={
                <Switch
                  size="small"
                  checked={showUnresolved}
                  onChange={(event) => setShowUnresolved(event.target.checked)}
                />
              }
              label={
                <Typography variant="caption" sx={{ color: showUnresolved ? lineColors.unresolved : colors.textSecondary }}>
                  Unresolved rate
                </Typography>
              }
              sx={{ m: 0 }}
            />
          </Tooltip>
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
                margin={{ top: 8, right: showUnresolved ? 12 : 6, left: 2, bottom: compactFooter ? 4 : 8 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={semantic.grid} vertical={false} />

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
                  width={42}
                  allowDecimals={false}
                />

                <YAxis
                  yAxisId="hours"
                  orientation="right"
                  tick={{ fill: semantic.muted, fontSize: 11 }}
                  axisLine={{ stroke: alpha(lineColors.response, 0.35) }}
                  tickLine={false}
                  width={48}
                  tickFormatter={(value) => `${value}h`}
                />

                {showUnresolved && (
                  <YAxis
                    yAxisId="rate"
                    orientation="right"
                    domain={[0, 100]}
                    tick={{ fill: alpha(lineColors.unresolved, 0.85), fontSize: 10 }}
                    axisLine={{ stroke: alpha(lineColors.unresolved, 0.35) }}
                    tickLine={false}
                    width={42}
                    tickFormatter={(value) => `${value}%`}
                  />
                )}

                <RechartsTooltip content={<CustomTooltip colors={colors} />} cursor={{ fill: alpha(requestCountBarColor, 0.08) }} />

                <Legend
                  verticalAlign="top"
                  height={compactFooter ? (showUnresolved ? 36 : 30) : (showUnresolved ? 44 : 36)}
                  wrapperStyle={{
                    fontSize: 11,
                    color: colors.textSecondary,
                    paddingBottom: 2,
                    lineHeight: '14px',
                  }}
                  formatter={(value) => <span style={{ color: colors.textSecondary }}>{value}</span>}
                />

                <Bar
                  yAxisId="count"
                  dataKey="count"
                  name="Request Count"
                  fill={requestCountBarColor}
                  radius={[6, 6, 0, 0]}
                  maxBarSize={42}
                />

                <Line
                  yAxisId="hours"
                  type="monotone"
                  dataKey="avgResponseHours"
                  name="Avg Response Hours"
                  stroke={lineColors.response}
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: lineColors.response, strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: lineColors.response }}
                />

                <Line
                  yAxisId="hours"
                  type="monotone"
                  dataKey="avgPredictedHours"
                  name="Avg Predicted Hours"
                  stroke={lineColors.predicted}
                  strokeWidth={2.5}
                  strokeDasharray="6 4"
                  dot={{ r: 3, fill: lineColors.predicted, strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: lineColors.predicted }}
                />

                {showUnresolved && (
                  <Line
                    yAxisId="rate"
                    type="monotone"
                    dataKey="unresolvedPct"
                    name="Unresolved Rate"
                    stroke={lineColors.unresolved}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: lineColors.unresolved }}
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

        {!compactFooter && (
          <Stack direction="row" spacing={2} useFlexGap sx={{ flexWrap: 'wrap', mt: 1.5 }}>
            {[
              { label: 'Request count', swatch: requestCountBarColor },
              { label: 'Avg response (actual)', swatch: lineColors.response },
              { label: 'Avg predicted', swatch: lineColors.predicted },
              ...(showUnresolved ? [{ label: 'Unresolved %', swatch: lineColors.unresolved }] : []),
            ].map((item) => (
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
