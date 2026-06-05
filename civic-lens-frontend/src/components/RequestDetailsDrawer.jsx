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
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined';
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined';
import { useAppColors } from '../ColorModeContext';
import { formatDate, formatHours } from '../utils/analytics';

function Field({ label, value, mono, colors }) {
  return (
    <Box>
      <Typography
        variant="caption"
        sx={{
          color: colors.textMuted,
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

export default function RequestDetailsDrawer({ request, open, onClose }) {
  const colors = useAppColors();
  const isClosed = request?.status === 'Closed';
  const isWeekend = Boolean(request?.is_weekend);
  const isHoliday = Boolean(request?.is_holiday);
  const isVague = Boolean(request?.is_vague_resolution);
  const risk = Number(request?.delay_risk_score);
  const highRisk = Number.isFinite(risk) && risk > 0.7;

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
              Service request
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 800, color: colors.textPrimary, mt: 0.25, lineHeight: 1.25 }}>
              {request?.complaint_type ?? 'Details'}
            </Typography>
          </Box>
          <IconButton
            onClick={onClose}
            aria-label="Close drawer"
            sx={{
              color: colors.textMuted,
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
              color: colors.textMuted,
              py: 6,
            }}
          >
            <Typography variant="body2">No request selected.</Typography>
          </Box>
        ) : (
          <>
            <Stack direction="row" spacing={0.75} useFlexGap sx={{ flexWrap: 'wrap', mb: 2 }}>
              <Chip
                size="small"
                label={isClosed ? 'Closed' : 'Open'}
                sx={chipOutline(isClosed ? colors.secondary : colors.warning)}
              />
              <Chip
                size="small"
                label={isWeekend ? 'Weekend' : 'Weekday'}
                sx={chipOutline(colors.primary)}
              />
              {isHoliday && (
                <Chip size="small" label="Holiday" sx={chipOutline(colors.warning)} />
              )}
              {request.season && (
                <Chip size="small" label={request.season} sx={chipOutline('#8b9dff')} />
              )}
              {isVague && (
                <Chip size="small" label="Vague resolution" sx={chipOutline(colors.error)} />
              )}
              {highRisk && (
                <Chip size="small" label="High risk" sx={chipOutline(colors.error)} />
              )}
            </Stack>

            <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 2, lineHeight: 1.65 }}>
              {request.descriptor}
            </Typography>

            <Divider sx={{ borderColor: colors.border, mb: 2 }} />

            <Stack spacing={2} sx={{ flex: 1, overflow: 'auto', pr: 0.5 }}>
              <Field label="Unique key" value={request.unique_key} mono colors={colors} />

              <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
                <BusinessOutlinedIcon sx={{ color: colors.secondary, fontSize: 22, mt: 0.25 }} />
                <Box flex={1} minWidth={0}>
                  <Field label="Agency name" value={request.agency_name} colors={colors} />
                  <Typography variant="caption" sx={{ color: colors.textMuted, display: 'block', mt: 0.5 }}>
                    Code: <Box component="span" sx={{ fontFamily: 'monospace', color: colors.textSecondary }}>{request.agency}</Box>
                  </Typography>
                </Box>
              </Stack>

              <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
                <LocationOnOutlinedIcon sx={{ color: colors.primary, fontSize: 22, mt: 0.25 }} />
                <Box flex={1} minWidth={0}>
                  <Field label="Address" value={request.incident_address} colors={colors} />
                  <Stack direction="row" spacing={1.5} useFlexGap sx={{ flexWrap: 'wrap', mt: 1 }}>
                    <Field label="Borough" value={request.borough} colors={colors} />
                    <Field label="ZIP" value={request.incident_zip} mono colors={colors} />
                  </Stack>
                </Box>
              </Stack>

              <Divider sx={{ borderColor: colors.border }} />

              <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
                <ScheduleOutlinedIcon sx={{ color: colors.warning, fontSize: 22, mt: 0.25 }} />
                <Box flex={1}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <Field label="Status" value={request.status} colors={colors} />
                    <Field label="Response hours" value={formatHours(request.response_hours)} colors={colors} />
                    <Field label="Predicted response hours" value={formatHours(request.predicted_response_hours)} colors={colors} />
                  </Stack>
                </Box>
              </Stack>

              <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
                <InsightsOutlinedIcon sx={{ color: colors.error, fontSize: 22, mt: 0.25 }} />
                <Field
                  label="Delay risk score"
                  value={
                    Number.isFinite(risk)
                      ? risk.toFixed(3)
                      : '—'
                  }
                  mono
                  colors={colors}
                />
              </Stack>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Field label="Created" value={formatDate(request.created_date)} colors={colors} />
                <Field label="Closed" value={formatDate(request.closed_date)} colors={colors} />
              </Stack>

              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    color: colors.textMuted,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    fontSize: '0.65rem',
                  }}
                >
                  Resolution description
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    mt: 0.75,
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: alpha(colors.textPrimary, 0.04),
                    border: `1px solid ${colors.border}`,
                    color: colors.textSecondary,
                    lineHeight: 1.65,
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {request.resolution_description ?? '—'}
                </Typography>
              </Box>
            </Stack>
          </>
        )}
      </Box>
    </Drawer>
  );
}
