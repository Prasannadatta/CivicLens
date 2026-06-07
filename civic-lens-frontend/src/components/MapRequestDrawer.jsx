import {
  Drawer,
  Box,
  Typography,
  Stack,
  IconButton,
  Divider,
  Chip,
  alpha,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useAppColors } from '../ColorModeContext';
import { formatDate, formatHours } from '../utils/analytics';
import { getRequestDelayBucket } from '../utils/mapHelpers';

function Field({ label, value, mono, colors }) {
  return (
    <Box>
      <Typography
        variant="caption"
        sx={{
          color: colors.textSecondary,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          fontSize: '0.65rem',
          display: 'block',
        }}
      >
        {label}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          fontWeight: 500,
          color: colors.textPrimary,
          fontFamily: mono ? '"JetBrains Mono", ui-monospace, monospace' : 'inherit',
          mt: 0.35,
          wordBreak: 'break-word',
        }}
      >
        {value ?? '—'}
      </Typography>
    </Box>
  );
}

function chipOutline(accent) {
  return {
    bgcolor: alpha(accent, 0.1),
    border: `1px solid ${alpha(accent, 0.28)}`,
    color: accent,
    fontWeight: 600,
  };
}

function bucketAccent(bucket, colors) {
  if (bucket === 'Same Day') return colors.secondary;
  if (bucket === '1–3 Days') return colors.primary;
  if (bucket === '3–7 Days') return colors.warning;
  if (bucket === 'More than 1 Week') return colors.error;
  return colors.textMuted;
}

function statusAccent(status, colors) {
  if (status === 'Closed') return colors.secondary;
  if (status === 'In Progress' || status === 'Open' || status === 'Pending') return colors.error;
  return colors.textMuted;
}

function riskAccent(level, colors) {
  if (level === 'Critical' || level === 'High') return colors.error;
  if (level === 'Medium') return colors.warning;
  return colors.secondary;
}

function ShapFactorRow({ factor, colors }) {
  const shap = Number(factor?.shap_value) || 0;
  const isPositive = shap >= 0;
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 1,
        py: 0.5,
      }}
    >
      <Typography variant="body2" sx={{ color: colors.textSecondary, flex: 1, fontSize: '0.8rem' }}>
        {factor?.label || factor?.feature}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          fontWeight: 700,
          fontFamily: 'monospace',
          fontSize: '0.78rem',
          color: isPositive ? colors.error : colors.secondary,
          flexShrink: 0,
        }}
      >
        {isPositive ? '+' : ''}{shap.toFixed(2)}h
      </Typography>
    </Box>
  );
}

export default function MapRequestDrawer({ request, open, onClose }) {
  const colors = useAppColors();
  const bucket = request ? getRequestDelayBucket(request) : null;
  const riskLevel = request?.prediction_risk_level;
  const factors = request?.shap_explanation?.factors
    ?? request?.shap_explanation?.top_features;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        backdrop: { sx: { bgcolor: alpha('#000', 0.55) } },
      }}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 440 },
          maxWidth: '100vw',
          background: `linear-gradient(165deg, ${alpha(colors.tooltipBg, 0.98)} 0%, ${colors.background} 45%, ${alpha(colors.background, 0.99)} 100%)`,
          backdropFilter: 'blur(20px)',
          borderLeft: `1px solid ${colors.border}`,
          boxShadow: `-12px 0 40px ${alpha('#000', 0.15)}`,
        },
      }}
    >
      <Box sx={{ p: { xs: 2.5, sm: 3 }, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Stack direction="row" spacing={1} sx={{ justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="overline"
              sx={{ color: colors.primary, letterSpacing: '0.1em', fontWeight: 700 }}
            >
              Map request
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 800, color: colors.textPrimary, mt: 0.25, lineHeight: 1.25 }}>
              {request?.complaint_type ?? 'Details'}
            </Typography>
          </Box>
          <IconButton
            onClick={onClose}
            aria-label="Close drawer"
            sx={{
              color: colors.textSecondary,
              '&:hover': { color: colors.textPrimary, bgcolor: alpha(colors.primary, 0.08) },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Stack>

        {!request ? (
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 2,
              border: `1px dashed ${colors.border}`,
              color: colors.textSecondary,
              py: 6,
            }}
          >
            <Typography variant="body2">No request selected.</Typography>
          </Box>
        ) : (
          <Stack spacing={2} sx={{ flex: 1, overflow: 'auto', pr: 0.5 }}>
            <Stack direction="row" spacing={0.75} useFlexGap sx={{ flexWrap: 'wrap' }}>
              {bucket && (
                <Chip size="small" label={bucket} sx={chipOutline(bucketAccent(bucket, colors))} />
              )}
              {riskLevel && (
                <Chip size="small" label={`${riskLevel} risk`} sx={chipOutline(riskAccent(riskLevel, colors))} />
              )}
              {request.status && (
                <Chip size="small" label={request.status} sx={chipOutline(statusAccent(request.status, colors))} />
              )}
            </Stack>

            <Box>
              <Typography
                variant="caption"
                sx={{
                  color: colors.textSecondary,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                }}
              >
                Prediction
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 1 }}>
                <Field label="Predicted response" value={formatHours(request.predicted_response_hours)} colors={colors} />
                <Field label="Actual response" value={formatHours(request.response_hours)} colors={colors} />
                <Field
                  label="Delay risk score"
                  value={Number.isFinite(Number(request.delay_risk_score))
                    ? Number(request.delay_risk_score).toFixed(3)
                    : '—'}
                  mono
                  colors={colors}
                />
              </Stack>
            </Box>

            <Divider sx={{ borderColor: colors.border }} />

            <Box>
              <Typography
                variant="caption"
                sx={{
                  color: colors.textSecondary,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                }}
              >
                Request info
              </Typography>
              <Stack spacing={1.5} sx={{ mt: 1 }}>
                <Field label="Agency" value={`${request.agency} · ${request.agency_name ?? ''}`} colors={colors} />
                <Field label="Descriptor" value={request.descriptor} colors={colors} />
                <Stack direction="row" spacing={2}>
                  <Field label="Borough" value={request.borough} colors={colors} />
                  <Field label="ZIP" value={request.incident_zip} mono colors={colors} />
                </Stack>
                <Field label="Address" value={request.incident_address} colors={colors} />
                <Stack direction="row" spacing={2}>
                  <Field label="Created" value={formatDate(request.created_date)} colors={colors} />
                  <Field label="Closed" value={formatDate(request.closed_date)} colors={colors} />
                </Stack>
                <Field label="Resolution" value={request.resolution_description} colors={colors} />
              </Stack>
            </Box>

            <Divider sx={{ borderColor: colors.border }} />

            <Box>
              <Typography
                variant="caption"
                sx={{
                  color: colors.textSecondary,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                }}
              >
                Model info
              </Typography>
              {Array.isArray(factors) && factors.length > 0 ? (
                <Box sx={{ mt: 1 }}>
                  {factors.slice(0, 5).map((factor) => (
                    <ShapFactorRow key={factor.feature} factor={factor} colors={colors} />
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" sx={{ color: colors.textSecondary, mt: 1, fontSize: '0.84rem' }}>
                  Model explanation available in Model View.
                </Typography>
              )}
            </Box>
          </Stack>
        )}
      </Box>
    </Drawer>
  );
}
