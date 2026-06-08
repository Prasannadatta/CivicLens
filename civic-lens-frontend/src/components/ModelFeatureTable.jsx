import { Box, Stack, Typography, alpha } from '@mui/material';
import { useAppColors } from '../ColorModeContext';
import { MODEL_BOTTOM_ROW_HEIGHT, cardSubtitleSx, cardTitleSx, sectionLabelSx } from '../styles/modelViewLayout';
import { buildShapContributions } from '../utils/mlExplanation';
import DashboardCard from './DashboardCard';

const MONTH_NAMES = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatFeatureValue(feature, value) {
  if (value == null || value === '' || value === '—') return '—';
  if (feature === 'month') return MONTH_NAMES[Number(value)] ?? String(value);
  if (feature === 'agency_workload_24h') return `${Number(value).toFixed(0)} reqs`;
  if (feature?.includes('median')) return `${Number(value).toFixed(1)} h`;
  return String(value);
}

// Sourced from top-level record fields (not in model_features)
const CONTEXT_ROWS = [
  { key: 'is_weekend', label: 'Weekend', format: (v) => (Number(v) === 1 ? 'Yes' : 'No') },
  { key: 'is_holiday', label: 'Holiday', format: (v) => (Number(v) === 1 ? 'Yes' : 'No') },
  { key: 'urgency_score', label: 'Urgency score', format: (v) => `${(Number(v) * 100).toFixed(0)}%` },
  { key: 'delay_risk_score', label: 'Delay risk', format: (v) => `${(Number(v) * 100).toFixed(0)}%` },
];

function FeatureRow({ label, value, shap, positiveColor, negativeColor, colors }) {
  const positive = Number(shap) >= 0;
  return (
    <Stack
      direction="row"
      sx={{
        alignItems: 'center',
        py: 0.45,
        borderBottom: `1px solid ${colors.border}`,
        '&:last-child': { borderBottom: 0 },
        '&:hover': { bgcolor: alpha(colors.textPrimary, 0.025) },
      }}
    >
      <Typography
        sx={{
          flex: 1,
          minWidth: 0,
          color: colors.textSecondary,
          fontWeight: 500,
          fontSize: '0.8rem',
          lineHeight: 1.3,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          color: colors.textPrimary,
          fontWeight: 600,
          fontSize: '0.8125rem',
          fontVariantNumeric: 'tabular-nums',
          mx: 0.75,
          flexShrink: 0,
        }}
      >
        {value}
      </Typography>
      {shap != null && (
        <Typography
          sx={{
            color: positive ? positiveColor : negativeColor,
            fontWeight: 700,
            fontSize: '0.7rem',
            fontVariantNumeric: 'tabular-nums',
            minWidth: 50,
            textAlign: 'right',
            flexShrink: 0,
          }}
        >
          {positive ? '+' : ''}{Number(shap).toFixed(2)}h
        </Typography>
      )}
    </Stack>
  );
}

export default function ModelFeatureTable({ request }) {
  const colors = useAppColors();
  const positiveColor = colors.warning;
  const negativeColor = colors.secondary;
  const shapRows = buildShapContributions(request);

  return (
    <DashboardCard
      sx={{ width: '100%' }}
      contentSx={{
        p: '22px',
        height: MODEL_BOTTOM_ROW_HEIGHT,
        width: '100%',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        '&:last-child': { pb: '22px' },
      }}
    >
      <Stack direction="row" sx={{ alignItems: 'baseline', justifyContent: 'space-between', mb: 0.75, flexShrink: 0 }}>
        <Typography variant="subtitle2" sx={{ ...cardTitleSx, color: colors.textSecondary }}>
          Model Inputs
        </Typography>
        {/* Column guide: value on left, SHAP contribution on right */}
        <Typography variant="caption" sx={{ color: colors.textMuted, fontSize: '0.65rem', letterSpacing: '0.04em' }}>
          Value · SHAP
        </Typography>
      </Stack>

      {!request ? (
        <Typography variant="body2" sx={{ ...cardSubtitleSx, color: colors.textSecondary }}>
          No case selected.
        </Typography>
      ) : (
        <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
          {/* SHAP features — same features and order as the waterfall above */}
          <Typography
            variant="caption"
            sx={{ ...sectionLabelSx, color: colors.textSecondary, display: 'block', mb: 0.35 }}
          >
            SHAP Features
          </Typography>
          {shapRows.map((row) => (
            <FeatureRow
              key={row.feature}
              label={row.label}
              value={formatFeatureValue(row.feature, row.value)}
              shap={row.shap}
              positiveColor={positiveColor}
              negativeColor={negativeColor}
              colors={colors}
            />
          ))}

          {/* Additional context features from top-level record fields */}
          <Typography
            variant="caption"
            sx={{ ...sectionLabelSx, color: colors.textSecondary, display: 'block', mt: 1, mb: 0.35 }}
          >
            Context
          </Typography>
          {CONTEXT_ROWS.map((row) => {
            const raw = request?.[row.key];
            return (
              <FeatureRow
                key={row.key}
                label={row.label}
                value={raw != null ? row.format(raw) : '—'}
                colors={colors}
                positiveColor={positiveColor}
                negativeColor={negativeColor}
              />
            );
          })}
        </Box>
      )}
    </DashboardCard>
  );
}
