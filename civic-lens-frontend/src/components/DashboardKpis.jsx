import { Grid, Typography, Box, Skeleton, Tooltip } from '@mui/material';
import BarChartIcon from '@mui/icons-material/BarChart';
import ScheduleIcon from '@mui/icons-material/Schedule';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { formatHours } from '../utils/analytics';
import { useAppColors } from '../ColorModeContext';
import AppCard, { AppCardIconPill, resolveAppAccent } from './AppCard';

const KPI_CONFIG = [
  {
    key: 'totalRequests',
    label: 'Total Requests',
    icon: BarChartIcon,
    accent: 'blue',
    format: (k) => Number(k?.totalRequests ?? 0).toLocaleString(),
    tooltip: 'Count of 311 requests in the current filter slice.',
  },
  {
    key: 'avgResponseHours',
    label: 'Average Response Time',
    icon: ScheduleIcon,
    accent: 'dashboard',
    format: (k) => formatHours(k?.avgResponseHours ?? 0),
    tooltip: 'Mean hours from creation to closure.',
  },
  {
    key: 'unresolvedRate',
    label: 'Unresolved Rate',
    icon: ErrorOutlineOutlinedIcon,
    accent: 'risk',
    format: (k) => `${((k?.unresolvedRate ?? 0) * 100).toFixed(1)}%`,
    tooltip: 'Share of requests not yet closed.',
  },
  {
    key: 'highRiskCount',
    label: 'High Risk Requests',
    icon: WarningAmberIcon,
    accent: 'risk',
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
        const accentColor = resolveAppAccent(card.accent, colors);
        const value = card.format(kpis);

        return (
          <Grid key={card.key} size={{ xs: 6, md: 3 }}>
            <Tooltip title={card.tooltip} arrow placement="top">
              <Box component="span" sx={{ display: 'block', height: '100%' }}>
                <AppCard
                  accent={card.accent}
                  compact
                  contentSx={{
                    height: 112,
                    justifyContent: 'space-between',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0 }}>
                    <AppCardIconPill icon={Icon} accentColor={accentColor} colors={colors} size="sm" />
                    <Typography
                      variant="caption"
                      noWrap
                      sx={{
                        color: colors.textSecondary,
                        textTransform: 'uppercase',
                        letterSpacing: '0.07em',
                        fontSize: '0.625rem',
                        fontWeight: 600,
                        lineHeight: 1.2,
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
                      lineHeight: 1.1,
                      letterSpacing: '-0.02em',
                    }}
                  >
                    {showValueSkeleton ? (
                      <Skeleton variant="rounded" width="60%" height={26} />
                    ) : (
                      value
                    )}
                  </Typography>
                </AppCard>
              </Box>
            </Tooltip>
          </Grid>
        );
      })}
    </Grid>
  );
}
