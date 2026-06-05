import { Grid, Typography, Box, alpha } from '@mui/material';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import { formatHours } from '../utils/analytics';
import { useAppColors, useColorMode } from '../ColorModeContext';
import { resolveAppAccent } from './AppCard';

const STAT_CONFIG = [
  {
    key: 'visibleRequests',
    label: 'Visible Requests',
    icon: VisibilityOutlinedIcon,
    format: (s) => Number(s?.visibleRequests ?? 0).toLocaleString(),
  },
  {
    key: 'avgPredictedDelay',
    label: 'Average Predicted Delay',
    icon: ScheduleOutlinedIcon,
    format: (s) => formatHours(s?.avgPredictedDelay ?? 0),
  },
  {
    key: 'highDelayCount',
    label: 'High Delay Requests',
    icon: WarningAmberOutlinedIcon,
    format: (s) => Number(s?.highDelayCount ?? 0).toLocaleString(),
  },
  {
    key: 'unresolvedRate',
    label: 'Unresolved Rate',
    icon: ErrorOutlineOutlinedIcon,
    format: (s) => `${((s?.unresolvedRate ?? 0) * 100).toFixed(1)}%`,
  },
];

export default function MapStatsBar({ stats }) {
  const colors = useAppColors();
  const { mode } = useColorMode();
  const isLight = mode === 'light';
  const accentColor = resolveAppAccent('map', colors);

  return (
    <Grid container spacing={{ xs: 1.5, md: 2 }}>
      {STAT_CONFIG.map((card) => {
        const Icon = card.icon;
        const value = card.format(stats);

        return (
          <Grid key={card.key} size={{ xs: 6, md: 3 }}>
            <Box
              sx={{
                width: '100%',
                height: '100%',
                p: '22px',
                borderRadius: '22px',
                bgcolor: colors.cardSurface,
                border: `1px solid ${colors.border}`,
                boxShadow: colors.cardShadow,
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: 112,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0, mb: 1.5 }}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    bgcolor: alpha(accentColor, isLight ? 0.08 : 0.14),
                    border: `1px solid ${alpha(accentColor, isLight ? 0.16 : 0.22)}`,
                    color: accentColor,
                  }}
                >
                  <Icon sx={{ fontSize: 18 }} />
                </Box>
                <Typography
                  noWrap
                  sx={{
                    color: accentColor,
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    lineHeight: 1.25,
                    minWidth: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {card.label}
                </Typography>
              </Box>
              <Typography
                component="p"
                sx={{
                  fontWeight: 800,
                  color: colors.textPrimary,
                  fontSize: '1.25rem',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.1,
                }}
              >
                {value}
              </Typography>
            </Box>
          </Grid>
        );
      })}
    </Grid>
  );
}
