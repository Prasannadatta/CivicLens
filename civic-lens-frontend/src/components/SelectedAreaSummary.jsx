import { Box, Typography, Chip, alpha } from '@mui/material';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import { useAppColors, useColorMode } from '../ColorModeContext';
import { formatHours } from '../utils/analytics';
import AppCard, { AppCardIconPill } from './AppCard';
import {
  getBoroughColor,
  getDashboardSemanticColors,
  normalizeBoroughName,
} from '../styles/dashboardColors';

function MetricRow({ label, value, valueColor, semantic }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 1 }}>
      <Typography variant="caption" sx={{ color: semantic.muted, fontSize: '0.75rem' }}>
        {label}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          fontWeight: 700,
          color: valueColor ?? semantic.text,
          fontSize: '0.8125rem',
          textAlign: 'right',
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

export default function SelectedAreaSummary({ summary }) {
  const colors = useAppColors();
  const { mode } = useColorMode();
  const isLight = mode === 'light';
  const semantic = getDashboardSemanticColors(colors, mode);
  const boroughColor = getBoroughColor(normalizeBoroughName(summary?.areaName), mode);

  const {
    areaName = '—',
    isDefault = true,
    totalRequests = 0,
    avgResponseHours = 0,
    unresolvedRate = 0,
    highDelayCount = 0,
    topComplaintType = '—',
    topAgency = '—',
    insight = '',
  } = summary ?? {};

  return (
    <AppCard
      accent="dashboard"
      compact
      contentSx={{ display: 'flex', flexDirection: 'column', gap: 1.5, flex: 1 }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0 }}>
          <AppCardIconPill icon={PlaceOutlinedIcon} accentColor={boroughColor} colors={colors} size="sm" />
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: '0.9375rem',
              color: boroughColor,
              letterSpacing: '-0.01em',
              minWidth: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {areaName}
          </Typography>
        </Box>
        {isDefault && areaName !== '—' && (
          <Chip
            label="Highest burden"
            size="small"
            sx={{
              height: 22,
              fontSize: '0.625rem',
              fontWeight: 600,
              bgcolor: alpha(semantic.burden, isLight ? 0.1 : 0.16),
              color: semantic.title,
              border: `1px solid ${alpha(semantic.burden, 0.22)}`,
            }}
          />
        )}
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
        <MetricRow label="Total requests" value={totalRequests.toLocaleString()} semantic={semantic} />
        <MetricRow label="Avg response time" value={formatHours(avgResponseHours)} semantic={semantic} />
        <MetricRow label="Unresolved rate" value={`${(unresolvedRate * 100).toFixed(1)}%`} valueColor={semantic.urgent} semantic={semantic} />
        <MetricRow label="High delay requests" value={highDelayCount.toLocaleString()} valueColor={semantic.urgent} semantic={semantic} />
        <MetricRow label="Top complaint" value={topComplaintType} semantic={semantic} />
        <MetricRow label="Top agency" value={topAgency} semantic={semantic} />
      </Box>

      <Typography
        sx={{
          fontSize: '0.8125rem',
          lineHeight: 1.55,
          color: semantic.muted,
          fontStyle: 'italic',
          borderTop: `1px solid ${alpha(semantic.track, 0.85)}`,
          pt: 1.25,
          mt: 0.25,
        }}
      >
        {insight}
      </Typography>
    </AppCard>
  );
}
