import { Grid, Typography, Box, alpha } from '@mui/material';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import { formatHours } from '../utils/analytics';
import { useAppColors } from '../ColorModeContext';
import DashboardCard from './DashboardCard';

const STAT_CONFIG = [
  {
    key: 'visibleRequests',
    label: 'Visible Requests',
    icon: VisibilityOutlinedIcon,
    accentKey: 'primary',
    format: (s) => Number(s?.visibleRequests ?? 0).toLocaleString(),
  },
  {
    key: 'avgPredictedDelay',
    label: 'Average Predicted Delay',
    icon: ScheduleOutlinedIcon,
    accentKey: 'warning',
    format: (s) => formatHours(s?.avgPredictedDelay ?? 0),
  },
  {
    key: 'highDelayCount',
    label: 'High Delay Requests',
    icon: WarningAmberOutlinedIcon,
    accentKey: 'error',
    format: (s) => Number(s?.highDelayCount ?? 0).toLocaleString(),
  },
  {
    key: 'unresolvedRate',
    label: 'Unresolved Rate',
    icon: ErrorOutlineOutlinedIcon,
    accentKey: 'secondary',
    format: (s) => `${((s?.unresolvedRate ?? 0) * 100).toFixed(1)}%`,
  },
];

export default function MapStatsBar({ stats }) {
  const colors = useAppColors();

  return (
    <Grid container spacing={{ xs: 1.5, md: 2 }}>
      {STAT_CONFIG.map((card) => {
        const Icon = card.icon;
        const accent = colors[card.accentKey] ?? colors.primary;
        const value = card.format(stats);

        return (
          <Grid key={card.key} size={{ xs: 6, md: 3 }}>
            <DashboardCard
              contentSx={{
                p: '14px 18px',
                height: 88,
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                '&:last-child': { pb: '14px' },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <Box
                  sx={{
                    width: 26,
                    height: 26,
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: alpha(accent, 0.08),
                    border: `1px solid ${alpha(accent, 0.16)}`,
                  }}
                >
                  <Icon sx={{ fontSize: 15, color: accent }} />
                </Box>
                <Typography
                  variant="caption"
                  sx={{
                    color: colors.textSecondary,
                    fontWeight: 600,
                    fontSize: '0.65rem',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    lineHeight: 1.2,
                  }}
                >
                  {card.label}
                </Typography>
              </Box>
              <Typography
                variant="h6"
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
            </DashboardCard>
          </Grid>
        );
      })}
    </Grid>
  );
}
