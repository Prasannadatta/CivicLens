import { Grid, Typography, Box, Skeleton, Tooltip, alpha } from '@mui/material';
import BarChartIcon from '@mui/icons-material/BarChart';
import ScheduleIcon from '@mui/icons-material/Schedule';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { formatHours } from '../utils/analytics';
import { useAppColors } from '../ColorModeContext';
import DashboardCard from './DashboardCard';

const KPI_CONFIG = [
  {
    key: 'totalRequests',
    label: 'Total Requests',
    icon: BarChartIcon,
    accentKey: 'primary',
    format: (k) => Number(k?.totalRequests ?? 0).toLocaleString(),
    tooltip: 'Count of 311 requests in the current filter slice.',
  },
  {
    key: 'avgResponseHours',
    label: 'Average Response Time',
    icon: ScheduleIcon,
    accentKey: 'warning',
    format: (k) => formatHours(k?.avgResponseHours ?? 0),
    tooltip: 'Mean hours from creation to closure.',
  },
  {
    key: 'unresolvedRate',
    label: 'Unresolved Rate',
    icon: ErrorOutlineOutlinedIcon,
    accentKey: 'error',
    format: (k) => `${((k?.unresolvedRate ?? 0) * 100).toFixed(1)}%`,
    tooltip: 'Share of requests not yet closed.',
  },
  {
    key: 'highRiskCount',
    label: 'High Risk Requests',
    icon: WarningAmberIcon,
    accentKey: 'secondary',
    format: (k) => Number(k?.highRiskCount ?? 0).toLocaleString(),
    tooltip: 'Requests with delay risk score ≥ 0.75.',
  },
];

export default function DashboardKpis({ kpis, showValueSkeleton = false }) {
  const colors = useAppColors();

  return (
    <Grid container spacing={{ xs: 1.5, md: 2 }}>
      {KPI_CONFIG.map((card) => {
        const Icon = card.icon;
        const accent = colors[card.accentKey] ?? colors.primary;
        const value = card.format(kpis);

        return (
          <Grid key={card.key} size={{ xs: 6, md: 3 }}>
            <Tooltip title={card.tooltip} arrow placement="top">
              <Box component="span" sx={{ display: 'block', height: '100%' }}>
                <DashboardCard
                  contentSx={{
                    p: '18px 20px',
                    height: 100,
                    boxSizing: 'border-box',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    '&:last-child': { pb: '18px' },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.85 }}>
                    <Box
                      sx={{
                        width: 28,
                        height: 28,
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
                        textTransform: 'uppercase',
                        letterSpacing: '0.07em',
                        fontSize: '0.625rem',
                        fontWeight: 600,
                        lineHeight: 1.2,
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
                      lineHeight: 1.1,
                      letterSpacing: '-0.02em',
                    }}
                  >
                    {showValueSkeleton ? (
                      <Skeleton variant="rounded" width="60%" height={26} sx={{ bgcolor: alpha(colors.textPrimary, 0.06) }} />
                    ) : (
                      value
                    )}
                  </Typography>
                </DashboardCard>
              </Box>
            </Tooltip>
          </Grid>
        );
      })}
    </Grid>
  );
}
