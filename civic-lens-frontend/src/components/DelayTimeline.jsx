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
import { getChartColors } from '../theme';
import { useAppColors } from '../ColorModeContext';
import { formatHours } from '../utils/analytics';
import GlassChartCard from './GlassChartCard';
import VizSectionHeader from './VizSectionHeader';

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
    <Box
      sx={{
        bgcolor: alpha(colors.tooltipBg, 0.96),
        border: `1px solid ${alpha(colors.primary, 0.28)}`,
        borderRadius: 2,
        p: 1.5,
        minWidth: 210,
        boxShadow: `0 12px 32px ${alpha('#000', 0.12)}`,
      }}
    >
      <Typography variant="subtitle2" sx={{ color: colors.textPrimary, mb: 1 }}>
        {label}
      </Typography>
      <Typography variant="caption" sx={{ display: 'block', color: colors.textSecondary }}>
        Requests: {Number(row.count ?? 0).toLocaleString()}
      </Typography>
      <Typography variant="caption" sx={{ display: 'block', color: colors.warning }}>
        Avg response: {formatHours(row.avgResponseHours ?? row.avgActual ?? 0)}
      </Typography>
      <Typography variant="caption" sx={{ display: 'block', color: colors.secondary }}>
        Avg predicted: {formatHours(row.avgPredictedHours ?? row.avgPredicted ?? 0)}
      </Typography>
      <Typography variant="caption" sx={{ display: 'block', color: colors.error }}>
        Unresolved rate: {((row.unresolvedRate ?? 0) * 100).toFixed(1)}%
      </Typography>
    </Box>
  );
}

export default function DelayTimeline({
  timelineData = [],
  title = 'Delay & Complaint Timeline',
  subtitle = 'Monthly request volume (bars) with rolling average response hours, predicted hours, and optional unresolved rate.',
  plotHeight,
  compactFooter = false,
}) {
  const colors = useAppColors();
  const chartColors = useMemo(() => getChartColors(colors), [colors]);
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

  return (
    <GlassChartCard>
      <VizSectionHeader
        icon={TimelineIcon}
        iconColor={colors.secondary}
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
                <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                  Unresolved rate
                </Typography>
              }
              sx={{ m: 0 }}
            />
          </Tooltip>
        )}
      />

      <Box sx={{ width: '100%', height: plotHeight ?? { xs: 340, md: 380 }, minWidth: 0, mt: 0.5 }}>
          {chartData.length === 0 ? (
            <Box
              sx={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 2,
                border: `1px dashed ${colors.border}`,
                color: colors.textMuted,
              }}
            >
              <Typography variant="body2">No timeline data for the current filters.</Typography>
            </Box>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={chartData}
                margin={{ top: 12, right: showUnresolved ? 18 : 8, left: 4, bottom: 8 }}
              >
                <defs>
                  <linearGradient id="timelineBarGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={colors.primary} stopOpacity={0.85} />
                    <stop offset="100%" stopColor={colors.primary} stopOpacity={0.25} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" stroke={colors.gridStroke} vertical={false} />

                <XAxis
                  dataKey="xLabel"
                  tick={{ fill: colors.textMuted, fontSize: 11 }}
                  axisLine={{ stroke: colors.border }}
                  tickLine={{ stroke: colors.border }}
                  interval="preserveStartEnd"
                  minTickGap={24}
                />

                <YAxis
                  yAxisId="count"
                  orientation="left"
                  tick={{ fill: colors.textMuted, fontSize: 11 }}
                  axisLine={{ stroke: alpha(colors.primary, 0.35) }}
                  tickLine={false}
                  width={42}
                  allowDecimals={false}
                />

                <YAxis
                  yAxisId="hours"
                  orientation="right"
                  tick={{ fill: colors.textMuted, fontSize: 11 }}
                  axisLine={{ stroke: alpha(colors.warning, 0.35) }}
                  tickLine={false}
                  width={48}
                  tickFormatter={(value) => `${value}h`}
                />

                {showUnresolved && (
                  <YAxis
                    yAxisId="rate"
                    orientation="right"
                    domain={[0, 100]}
                    tick={{ fill: alpha(colors.error, 0.85), fontSize: 10 }}
                    axisLine={{ stroke: alpha(colors.error, 0.35) }}
                    tickLine={false}
                    width={42}
                    tickFormatter={(value) => `${value}%`}
                  />
                )}

                <RechartsTooltip content={<CustomTooltip colors={colors} />} cursor={{ fill: alpha(colors.primary, 0.06) }} />

                <Legend
                  verticalAlign="top"
                  height={showUnresolved ? 44 : 36}
                  wrapperStyle={{
                    fontSize: 11,
                    color: colors.textSecondary,
                    paddingBottom: 4,
                  }}
                  formatter={(value) => <span style={{ color: colors.textSecondary }}>{value}</span>}
                />

                <Bar
                  yAxisId="count"
                  dataKey="count"
                  name="Request Count"
                  fill="url(#timelineBarGradient)"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={42}
                  opacity={0.9}
                />

                <Line
                  yAxisId="hours"
                  type="monotone"
                  dataKey="avgResponseHours"
                  name="Avg Response Hours"
                  stroke={colors.warning}
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: colors.warning, strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                />

                <Line
                  yAxisId="hours"
                  type="monotone"
                  dataKey="avgPredictedHours"
                  name="Avg Predicted Hours"
                  stroke={colors.secondary}
                  strokeWidth={2.5}
                  strokeDasharray="6 4"
                  dot={{ r: 3, fill: colors.secondary, strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                />

                {showUnresolved && (
                  <Line
                    yAxisId="rate"
                    type="monotone"
                    dataKey="unresolvedPct"
                    name="Unresolved Rate"
                    stroke={colors.error}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                )}

                {chartData.length > 4 && (
                  <Brush
                    dataKey="xLabel"
                    height={22}
                    stroke={alpha(colors.primary, 0.65)}
                    fill={alpha(colors.primary, 0.08)}
                    travellerWidth={10}
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
              { label: 'Request count', swatch: chartColors[0] },
              { label: 'Avg response (actual)', swatch: colors.warning },
              { label: 'Avg predicted', swatch: colors.secondary },
              ...(showUnresolved ? [{ label: 'Unresolved %', swatch: colors.error }] : []),
            ].map((item) => (
              <Stack key={item.label} direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
                <Box sx={{ width: 10, height: 10, borderRadius: 0.5, bgcolor: item.swatch, boxShadow: `0 0 8px ${alpha(item.swatch, 0.45)}` }} />
                <Typography variant="caption" sx={{ color: colors.textMuted }}>
                  {item.label}
                </Typography>
              </Stack>
            ))}
          </Stack>
        )}
      </GlassChartCard>
  );
}
