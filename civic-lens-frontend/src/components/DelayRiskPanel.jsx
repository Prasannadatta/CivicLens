import { useMemo } from 'react';
import {
  Typography,
  Box,
  Stack,
  Chip,
  alpha,
} from '@mui/material';
import PsychologyOutlinedIcon from '@mui/icons-material/PsychologyOutlined';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';
import { getChartColors, getActiveFilterChipSx, getSelectedFilterChipSx } from '../theme';
import { useAppColors } from '../ColorModeContext';
import GlassChartCard from './GlassChartCard';
import VizSectionHeader from './VizSectionHeader';

const FACTOR_LABELS = {
  agency: 'Agency workload',
  complaint_type: 'Complaint type',
  borough: 'Borough',
  hour: 'Hour of day',
  is_weekend: 'Weekend / holiday',
  season: 'Season',
  urgency_score: 'Urgency score',
  is_vague_resolution: 'Vague resolution',
};

function getFactorLabel(factor) {
  return FACTOR_LABELS[factor.feature] || factor.label || factor.feature;
}

function computeRiskIndex(factors) {
  if (!factors?.length) return 0;
  const weighted = factors.slice(0, 4).reduce((sum, factor, index) => {
    const weight = 1 - index * 0.18;
    return sum + (factor.importance ?? 0) * weight;
  }, 0);
  return Math.min(99, Math.round(weighted * 140));
}

function getGaugeColor(score, c) {
  if (score >= 75) return c.error;
  if (score >= 50) return c.warning;
  if (score >= 30) return c.primary;
  return c.secondary;
}

function CustomTooltip({ active, payload, colors }) {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload;

  return (
    <Box
      sx={{
        bgcolor: alpha(colors.tooltipBg, 0.96),
        border: `1px solid ${alpha(colors.primary, 0.25)}`,
        borderRadius: 2,
        p: 1.5,
        minWidth: 180,
        boxShadow: `0 12px 32px ${alpha('#000', 0.12)}`,
      }}
    >
      <Typography variant="subtitle2" sx={{ color: colors.textPrimary, mb: 0.5 }}>
        {row?.label}
      </Typography>
      <Typography variant="caption" sx={{ color: colors.warning }}>
        Importance: {(row?.importance * 100).toFixed(1)}%
      </Typography>
    </Box>
  );
}

function RiskGauge({ score, colors }) {
  const gaugeColor = getGaugeColor(score, colors);
  const rotation = (score / 100) * 360;

  return (
    <Box
      sx={{
        position: 'relative',
        width: 132,
        height: 132,
        borderRadius: '50%',
        background: `conic-gradient(${gaugeColor} ${rotation}deg, ${alpha(colors.textPrimary, 0.08)} ${rotation}deg)`,
        boxShadow: `0 0 28px ${alpha(gaugeColor, 0.25)}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <Box
        sx={{
          width: 102,
          height: 102,
          borderRadius: '50%',
          bgcolor: alpha(colors.tooltipBg, 0.92),
          border: `1px solid ${alpha(gaugeColor, 0.35)}`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 800, color: gaugeColor, lineHeight: 1 }}>
          {score}
        </Typography>
        <Typography variant="caption" sx={{ color: colors.textMuted, fontSize: '0.62rem', mt: 0.25 }}>
          Risk Index
        </Typography>
      </Box>
    </Box>
  );
}

export default function DelayRiskPanel({
  delayFactors = [],
  selectedBorough = null,
  selectedComplaint = null,
}) {
  const colors = useAppColors();
  const chartColors = useMemo(() => getChartColors(colors), [colors]);

  const sortedFactors = useMemo(
    () => [...delayFactors].sort((a, b) => (b.importance ?? 0) - (a.importance ?? 0)),
    [delayFactors],
  );

  const chartData = useMemo(
    () => sortedFactors.slice(0, 6).map((factor) => ({
      ...factor,
      label: getFactorLabel(factor),
      importancePct: Math.round((factor.importance ?? 0) * 1000) / 10,
    })),
    [sortedFactors],
  );

  const riskIndex = useMemo(() => computeRiskIndex(sortedFactors), [sortedFactors]);
  const topDriver = chartData[0];

  const filterChips = useMemo(() => {
    const items = [];
    if (selectedBorough) {
      items.push({
        key: 'borough',
        label: `Borough: ${selectedBorough}`,
        size: 'small',
        sx: getActiveFilterChipSx(colors, colors.primary),
      });
    }
    if (selectedComplaint) {
      const short = selectedComplaint.length > 22 ? `${selectedComplaint.slice(0, 20)}…` : selectedComplaint;
      items.push({
        key: 'complaint',
        label: `Complaint: ${short}`,
        size: 'small',
        sx: getSelectedFilterChipSx(colors),
      });
    }
    return items;
  }, [selectedBorough, selectedComplaint, colors]);

  const crossFiltered = Boolean(selectedBorough || selectedComplaint);

  return (
    <GlassChartCard selected={crossFiltered} accent={colors.error}>
      <VizSectionHeader
        icon={PsychologyOutlinedIcon}
        iconColor={colors.error}
        title="Delay Risk Explainability"
        subtitle="These factors estimate why requests may take longer to resolve. Bar length shows normalized mock importance (SHAP-ready)."
        tooltip="Composite risk index summarizes top drivers. Bars encode relative contribution to delay risk in the filtered cohort."
        selected={crossFiltered}
        chips={filterChips}
      />

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{
          alignItems: { xs: 'stretch', sm: 'center' },
          mb: 2,
          p: 1.5,
          borderRadius: 2,
          bgcolor: alpha(colors.textPrimary, 0.03),
          border: `1px solid ${colors.border}`,
        }}
      >
        <RiskGauge score={riskIndex} colors={colors} />
        <Box flex={1}>
          <Typography variant="overline" sx={{ color: colors.textMuted, letterSpacing: '0.08em' }}>
            Model Readout
          </Typography>
          <Typography variant="body2" sx={{ color: colors.textPrimary, fontWeight: 600, mt: 0.5 }}>
            Top delay driver: {topDriver?.label || '—'}
          </Typography>
          <Typography variant="caption" sx={{ color: colors.textSecondary, display: 'block', mt: 0.75 }}>
            Mock feature importance today — ready to swap in Hetvi&apos;s SHAP output without changing this layout.
          </Typography>
        </Box>
      </Stack>

      <Typography variant="subtitle2" sx={{ color: colors.textPrimary, mb: 1, fontWeight: 700 }}>
        Top Delay Drivers
      </Typography>

      <Box sx={{ width: '100%', height: 220, minWidth: 0 }}>
        {chartData.length === 0 ? (
          <Box
            sx={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: colors.textMuted,
              borderRadius: 2,
              border: `1px dashed ${colors.border}`,
            }}
          >
            <Typography variant="body2">No factor data available.</Typography>
          </Box>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 4, right: 12, left: 4, bottom: 4 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={colors.gridStroke} horizontal={false} />
              <XAxis
                type="number"
                domain={[0, 'dataMax']}
                tick={{ fill: colors.textMuted, fontSize: 11 }}
                axisLine={{ stroke: colors.border }}
                tickFormatter={(value) => `${value}%`}
              />
              <YAxis
                type="category"
                dataKey="label"
                width={118}
                tick={{ fill: colors.textSecondary, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip colors={colors} />} cursor={{ fill: alpha(colors.primary, 0.06) }} />
              <Bar dataKey="importancePct" name="Importance" radius={[0, 6, 6, 0]} barSize={16}>
                {chartData.map((entry, index) => (
                  <Cell key={entry.feature} fill={chartColors[index % chartColors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </Box>

      <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap', mt: 1.25 }}>
        <Typography variant="caption" sx={{ color: colors.textMuted, width: '100%', mb: 0.25 }}>
          Legend · bar color
        </Typography>
        {chartData.slice(0, 4).map((factor, index) => (
          <Chip
            key={factor.feature}
            size="small"
            label={`${factor.label} (${(factor.importance * 100).toFixed(0)}%)`}
            sx={{
              border: `1px solid ${alpha(chartColors[index % chartColors.length], 0.45)}`,
              bgcolor: alpha(chartColors[index % chartColors.length], 0.12),
              color: colors.textPrimary,
              fontWeight: 600,
              fontSize: '0.68rem',
            }}
          />
        ))}
      </Stack>
    </GlassChartCard>
  );
}
