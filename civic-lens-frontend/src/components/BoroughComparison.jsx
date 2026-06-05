import { useEffect, useMemo, useState } from 'react';
import {
  Typography,
  Box,
  Stack,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  alpha,
  Tooltip as MuiTooltip,
} from '@mui/material';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  Tooltip as RechartsTooltip,
} from 'recharts';
import { useAppColors } from '../ColorModeContext';
import { formatHours, getBoroughStats } from '../utils/analytics';
import GlassChartCard from './GlassChartCard';
import VizSectionHeader from './VizSectionHeader';

const BOROUGHS = ['Manhattan', 'Brooklyn', 'Queens', 'Bronx', 'Staten Island'];

const KPI_FIELDS = [
  { key: 'count', label: 'Total Requests', format: (v) => Number(v).toLocaleString() },
  { key: 'avgResponseHours', label: 'Avg Response Hours', format: (v) => formatHours(v) },
  { key: 'unresolvedRate', label: 'Unresolved Rate', format: (v) => `${(Number(v) * 100).toFixed(1)}%` },
  { key: 'avgPredictedHours', label: 'Avg Predicted Hours', format: (v) => formatHours(v) },
  { key: 'burdenScore', label: 'Burden Score', format: (v) => Number(v).toFixed(2) },
];

function getBoroughOptions(requests) {
  const fromData = [...new Set((requests || []).map((r) => r?.borough).filter(Boolean))];
  return fromData.length ? BOROUGHS.filter((b) => fromData.includes(b)) : BOROUGHS;
}

function computeBoroughSnapshot(requests, boroughName, boroughStats) {
  const stats = boroughStats.find((entry) => entry.borough === boroughName) || {
    borough: boroughName,
    count: 0,
    avgResponseHours: 0,
    unresolvedRate: 0,
    avgPredictedHours: 0,
    avgRisk: 0,
    burdenScore: 0,
  };

  const boroughRequests = (requests || []).filter((record) => record?.borough === boroughName);
  const avgUrgency = boroughRequests.length
    ? boroughRequests.reduce((sum, record) => sum + Number(record?.urgency_score ?? 0), 0) / boroughRequests.length
    : 0;

  return {
    ...stats,
    avgUrgency: Math.round(avgUrgency * 100) / 100,
  };
}

function normalizePair(valueA, valueB) {
  const max = Math.max(valueA, valueB, 0.0001);
  return {
    a: Math.round((valueA / max) * 100),
    b: Math.round((valueB / max) * 100),
  };
}

function buildRadarData(snapshotA, snapshotB) {
  const axes = [
    { label: 'Volume', valueA: snapshotA.count, valueB: snapshotB.count },
    { label: 'Delay', valueA: snapshotA.avgResponseHours, valueB: snapshotB.avgResponseHours },
    { label: 'Unresolved', valueA: snapshotA.unresolvedRate, valueB: snapshotB.unresolvedRate },
    { label: 'Risk', valueA: snapshotA.avgRisk, valueB: snapshotB.avgRisk },
    { label: 'Urgency', valueA: snapshotA.avgUrgency, valueB: snapshotB.avgUrgency },
  ];

  return axes.map(({ label, valueA, valueB }) => {
    const normalized = normalizePair(valueA, valueB);
    return {
      metric: label,
      [snapshotA.borough]: normalized.a,
      [snapshotB.borough]: normalized.b,
      fullMark: 100,
      rawA: valueA,
      rawB: valueB,
    };
  });
}

function KpiColumn({ title, accent, snapshot, highlighted, colors }) {
  return (
    <Box
      sx={{
        p: 1.5,
        borderRadius: 2,
        bgcolor: alpha(accent, 0.08),
        border: `1px solid ${alpha(accent, highlighted ? 0.42 : 0.22)}`,
        boxShadow: highlighted ? `0 0 22px ${alpha(accent, 0.14)}` : 'none',
        transition: 'box-shadow 0.25s ease, border-color 0.25s ease',
        height: '100%',
      }}
    >
      <Typography variant="caption" sx={{ color: accent, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
        {title}
      </Typography>
      <Stack spacing={1.1} sx={{ mt: 1.25 }}>
        {KPI_FIELDS.map(({ key, label, format }) => (
          <Box key={key}>
            <Typography variant="caption" sx={{ color: colors.chartLabel, display: 'block', fontSize: '0.65rem' }}>
              {label}
            </Typography>
            <Typography variant="body2" sx={{ color: colors.textPrimary, fontWeight: 700 }}>
              {format(snapshot[key] ?? 0)}
            </Typography>
          </Box>
        ))}
      </Stack>
    </Box>
  );
}

function RadarTooltip({ active, payload, label, boroughA, boroughB, colors }) {
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
      }}
    >
      <Typography variant="subtitle2" sx={{ color: colors.textPrimary, mb: 0.75 }}>
        {label}
      </Typography>
      <Typography variant="caption" sx={{ display: 'block', color: colors.primary }}>
        {boroughA}: {Number(row?.rawA ?? 0).toFixed(2)}
      </Typography>
      <Typography variant="caption" sx={{ display: 'block', color: colors.secondary }}>
        {boroughB}: {Number(row?.rawB ?? 0).toFixed(2)}
      </Typography>
    </Box>
  );
}

export default function BoroughComparison({ requests = [], selectedBorough = null }) {
  const colors = useAppColors();
  const boroughOptions = useMemo(() => getBoroughOptions(requests), [requests]);
  const boroughStats = useMemo(() => getBoroughStats(requests), [requests]);

  const [boroughA, setBoroughA] = useState(selectedBorough || 'Manhattan');
  const [boroughB, setBoroughB] = useState('Brooklyn');

  useEffect(() => {
    if (selectedBorough && boroughOptions.includes(selectedBorough)) {
      setBoroughA(selectedBorough);
    }
  }, [selectedBorough, boroughOptions]);

  useEffect(() => {
    if (boroughA === boroughB) {
      const alternative = boroughOptions.find((borough) => borough !== boroughA) || 'Brooklyn';
      setBoroughB(alternative);
    }
  }, [boroughA, boroughB, boroughOptions]);

  const snapshotA = useMemo(
    () => computeBoroughSnapshot(requests, boroughA, boroughStats),
    [requests, boroughA, boroughStats],
  );
  const snapshotB = useMemo(
    () => computeBoroughSnapshot(requests, boroughB, boroughStats),
    [requests, boroughB, boroughStats],
  );

  const radarData = useMemo(() => buildRadarData(snapshotA, snapshotB), [snapshotA, snapshotB]);
  const hasData = requests.length > 0;
  const mapLinked = Boolean(selectedBorough && (boroughA === selectedBorough || boroughB === selectedBorough));

  return (
    <GlassChartCard selected={mapLinked} accent={colors.warning}>
      <VizSectionHeader
        icon={CompareArrowsIcon}
        iconColor={colors.warning}
        title="Borough Comparison"
        subtitle="Normalized radar overlay plus raw KPI columns — benchmark two boroughs across volume, delay, backlog, risk, and urgency."
        tooltip="Radar axes are normalized to 0–100 within the selected pair. Use KPI cards below for absolute values."
      />

      <Grid container spacing={1.5} mb={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <MuiTooltip title="Pinned to map-selected borough when available" arrow>
            <FormControl size="small" fullWidth>
              <InputLabel id="borough-a-label">Borough A</InputLabel>
              <Select
                labelId="borough-a-label"
                value={boroughA}
                label="Borough A"
                onChange={(event) => setBoroughA(event.target.value)}
              >
                {boroughOptions.map((borough) => (
                  <MenuItem key={borough} value={borough} disabled={borough === boroughB}>
                    {borough}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </MuiTooltip>
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <MuiTooltip title="Automatically excludes Borough A" arrow>
            <FormControl size="small" fullWidth>
              <InputLabel id="borough-b-label">Borough B</InputLabel>
              <Select
                labelId="borough-b-label"
                value={boroughB}
                label="Borough B"
                onChange={(event) => setBoroughB(event.target.value)}
              >
                {boroughOptions.map((borough) => (
                  <MenuItem key={borough} value={borough} disabled={borough === boroughA}>
                    {borough}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </MuiTooltip>
        </Grid>
      </Grid>

      <Grid container spacing={1.5} mb={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <KpiColumn title={boroughA} accent={colors.primary} snapshot={snapshotA} highlighted={selectedBorough === boroughA} colors={colors} />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <KpiColumn title={boroughB} accent={colors.secondary} snapshot={snapshotB} highlighted={selectedBorough === boroughB} colors={colors} />
        </Grid>
      </Grid>

      <Divider sx={{ borderColor: colors.border, mb: 2 }} />

      <Typography variant="caption" sx={{ color: colors.chartLabel, display: 'block', mb: 1 }}>
        Radar legend · normalized 0–100 scale relative to selected pair
      </Typography>

      <Box sx={{ width: '100%', height: 300, minWidth: 0 }}>
        {!hasData ? (
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
            <Typography variant="body2">No borough data for the current filters.</Typography>
          </Box>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData} outerRadius="72%">
              <PolarGrid stroke={colors.gridStroke} />
              <PolarAngleAxis dataKey="metric" tick={{ fill: colors.textSecondary, fontSize: 11 }} />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 100]}
                tick={{ fill: colors.chartLabel, fontSize: 10 }}
                stroke={colors.border}
              />
              <RechartsTooltip content={<RadarTooltip boroughA={boroughA} boroughB={boroughB} colors={colors} />} />
              <Legend wrapperStyle={{ fontSize: 12, color: colors.textSecondary }} />
              <Radar
                name={boroughA}
                dataKey={boroughA}
                stroke={colors.primary}
                fill={alpha(colors.primary, 0.28)}
                fillOpacity={0.65}
                strokeWidth={2}
              />
              <Radar
                name={boroughB}
                dataKey={boroughB}
                stroke={colors.secondary}
                fill={alpha(colors.secondary, 0.22)}
                fillOpacity={0.55}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        )}
      </Box>
    </GlassChartCard>
  );
}
