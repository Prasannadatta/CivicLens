import { Box, Stack, Typography, Chip, alpha } from '@mui/material';
import { useAppColors } from '../ColorModeContext';
import { getPredictionSummary } from '../utils/mlExplanation';
import { formatHours } from '../utils/analytics';
import { MODEL_ROW_HEIGHT, cardTitleSx } from '../styles/modelViewLayout';
import DashboardCard from './DashboardCard';

function riskColor(level, colors) {
  switch (level) {
    case 'Critical':
    case 'High':
      return colors.error;
    case 'Medium':
      return colors.warning;
    default:
      return colors.secondary;
  }
}

function riskLabel(level) {
  if (!level) return '—';
  return String(level).toLowerCase().includes('risk') ? level : `${level} Risk`;
}

const cardShellSx = {
  p: '22px',
  height: MODEL_ROW_HEIGHT,
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
  '&:last-child': { pb: '22px' },
};

export default function PredictionOverviewCard({ request, onViewRecord }) {
  const colors = useAppColors();

  if (!request) {
    return (
      <DashboardCard contentSx={{ ...cardShellSx, justifyContent: 'center' }}>
        <Typography variant="subtitle2" sx={{ ...cardTitleSx, color: colors.textMuted, mb: 1 }}>
          Prediction
        </Typography>
        <Typography variant="body2" sx={{ color: colors.textMuted, fontSize: '0.8125rem' }}>
          No case selected.
        </Typography>
      </DashboardCard>
    );
  }

  const summary = getPredictionSummary(request);
  const riskAccent = riskColor(summary.riskLevel, colors);
  const predictedLabel = `${Math.round(summary.predictedHours)} hours`;
  const actualLabel = formatHours(summary.actualHours);
  const agency = request.agency || request.agency_name || '—';
  const location = [request.borough, request.incident_zip].filter(Boolean).join(' ');

  return (
    <DashboardCard contentSx={cardShellSx}>
      <Typography variant="subtitle2" sx={{ ...cardTitleSx, color: colors.textMuted, mb: 1.25 }}>
        Prediction
      </Typography>

      <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
        <Typography
          component="p"
          sx={{
            fontWeight: 800,
            letterSpacing: '-0.03em',
            color: colors.textPrimary,
            lineHeight: 1,
            fontSize: '2.5rem',
          }}
        >
          {predictedLabel}
        </Typography>
        <Stack direction="row" spacing={0.5} useFlexGap sx={{ flexWrap: 'wrap', pb: 0.25 }}>
          <Chip
            size="small"
            label={summary.delayBucket}
            sx={{
              height: 22,
              fontWeight: 700,
              fontSize: '0.6875rem',
              bgcolor: alpha(colors.primary, 0.1),
              color: colors.primary,
              border: `1px solid ${alpha(colors.primary, 0.28)}`,
            }}
          />
          <Chip
            size="small"
            label={riskLabel(summary.riskLevel)}
            sx={{
              height: 22,
              fontWeight: 700,
              fontSize: '0.6875rem',
              bgcolor: alpha(riskAccent, 0.14),
              color: riskAccent,
              border: `1px solid ${alpha(riskAccent, 0.35)}`,
            }}
          />
        </Stack>
      </Stack>

      <Stack
        direction="row"
        spacing={2}
        useFlexGap
        sx={{
          flexWrap: 'wrap',
          mt: 1.25,
          pt: 1,
          borderTop: `1px solid ${colors.border}`,
        }}
      >
        <Typography variant="body2" sx={{ color: colors.textSecondary, fontSize: '0.8125rem' }}>
          <Box component="span" sx={{ color: colors.textMuted, fontWeight: 600 }}>Actual: </Box>
          {actualLabel}
        </Typography>
        <Typography variant="body2" sx={{ color: colors.textSecondary, fontSize: '0.8125rem' }}>
          <Box component="span" sx={{ color: colors.textMuted, fontWeight: 600 }}>Status: </Box>
          {request.status ?? '—'}
        </Typography>
      </Stack>

      <Typography
        variant="body2"
        noWrap
        title={[request.complaint_type, agency, location].filter(Boolean).join(' · ')}
        sx={{
          color: colors.textPrimary,
          fontWeight: 600,
          mt: 1,
          fontSize: '0.8125rem',
        }}
      >
        {[request.complaint_type, agency, location].filter(Boolean).join(' · ')}
      </Typography>

      {onViewRecord && (
        <Typography
          component="button"
          type="button"
          onClick={onViewRecord}
          sx={{
            mt: 'auto',
            alignSelf: 'flex-start',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            color: colors.primary,
            fontWeight: 600,
            fontSize: '0.8125rem',
            p: 0,
            '&:hover': { textDecoration: 'underline' },
          }}
        >
          View full record →
        </Typography>
      )}
    </DashboardCard>
  );
}
