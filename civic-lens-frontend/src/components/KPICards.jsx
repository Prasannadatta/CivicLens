import { useMemo } from 'react';
import { Grid, Typography, Box, alpha, Skeleton, Tooltip } from '@mui/material';
import BarChartIcon from '@mui/icons-material/BarChart';
import ScheduleIcon from '@mui/icons-material/Schedule';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import { formatHours } from '../utils/analytics';
import { useAppColors } from '../ColorModeContext';
import DashboardCard from './DashboardCard';

const KPI_TOOLTIPS = {
  totalRequests: 'Count of 311 requests in the current filter slice.',
  avgResponseHours: 'Mean hours from creation to closure (or last update for open cases).',
  unresolvedRate: 'Share of requests not yet closed in this slice.',
  avgPredictedHours: 'Mean model-estimated hours to resolve (mock heuristic).',
  highRiskCount: 'Requests with delay risk score ≥ 0.75 in this slice.',
  topComplaintType: 'Most frequent complaint type in the filtered dataset.',
};

const defaultKpis = {
  totalRequests: 0,
  avgResponseHours: 0,
  unresolvedRate: 0,
  avgPredictedHours: 0,
  highRiskCount: 0,
  topComplaintType: '—',
};

export default function KPICards({ kpis = defaultKpis, showValueSkeleton = false }) {
  const colors = useAppColors();

  const cardConfig = useMemo(
    () => [
      {
        key: 'totalRequests',
        label: 'Total Requests',
        icon: BarChartIcon,
        accent: colors.primary,
        format: (k) => Number(k?.totalRequests ?? 0).toLocaleString(),
      },
      {
        key: 'avgResponseHours',
        label: 'Avg Response Hours',
        icon: ScheduleIcon,
        accent: colors.warning,
        format: (k) => formatHours(k?.avgResponseHours ?? 0),
      },
      {
        key: 'unresolvedRate',
        label: 'Unresolved Rate',
        icon: ErrorOutlineOutlinedIcon,
        accent: colors.error,
        format: (k) => `${((k?.unresolvedRate ?? 0) * 100).toFixed(1)}%`,
      },
      {
        key: 'avgPredictedHours',
        label: 'Avg Predicted Hours',
        icon: AutoGraphIcon,
        accent: colors.secondary,
        format: (k) => formatHours(k?.avgPredictedHours ?? 0),
      },
      {
        key: 'highRiskCount',
        label: 'High Risk Requests',
        icon: WarningAmberIcon,
        accent: '#a78bfa',
        format: (k) => Number(k?.highRiskCount ?? 0).toLocaleString(),
      },
      {
        key: 'topComplaintType',
        label: 'Top Complaint Type',
        icon: CategoryOutlinedIcon,
        accent: '#34d399',
        format: (k) => {
          const value = k?.topComplaintType ?? '—';
          return value.length > 22 ? `${value.slice(0, 20)}…` : value;
        },
        compact: true,
      },
    ],
    [colors],
  );

  return (
    <Grid container spacing={{ xs: 1.2, sm: 1.5, md: 1.8 }}>
      {cardConfig.map((card) => {
        const Icon = card.icon;
        const value = card.format(kpis);

        return (
          <Grid key={card.key} size={{ xs: 6, sm: 4, lg: 4, xl: 2 }}>
            <Tooltip title={KPI_TOOLTIPS[card.key] || ''} arrow placement="top">
              <Box component="span" sx={{ display: 'block', height: '100%' }}>
                <DashboardCard
                  hover
                  selectedColor={card.accent}
                  contentSx={{ p: 1.9, '&:last-child': { pb: 1.9 } }}
                  sx={{
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 3,
                      background: `linear-gradient(90deg, ${card.accent}, ${alpha(card.accent, 0.35)})`,
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 34,
                      height: 34,
                      borderRadius: 1.6,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 1.1,
                      bgcolor: alpha(card.accent, 0.14),
                      border: `1px solid ${alpha(card.accent, 0.24)}`,
                    }}
                  >
                    <Icon sx={{ fontSize: 18, color: card.accent }} />
                  </Box>

                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      color: colors.textMuted,
                      textTransform: 'uppercase',
                      letterSpacing: '0.07em',
                      fontSize: '0.61rem',
                      fontWeight: 600,
                      mb: 0.55,
                    }}
                  >
                    {card.label}
                  </Typography>

                  <Typography
                    variant="h6"
                    component="p"
                    title={card.key === 'topComplaintType' ? kpis?.topComplaintType : undefined}
                    sx={{
                      fontWeight: 800,
                      color: colors.textPrimary,
                      lineHeight: 1.2,
                      fontSize: card.compact ? { xs: '0.9rem', sm: '0.98rem' } : { xs: '1.15rem', sm: '1.26rem' },
                      letterSpacing: card.compact ? '-0.01em' : '-0.02em',
                    }}
                  >
                    {showValueSkeleton ? (
                      <Skeleton
                        variant="rounded"
                        width={card.compact ? '88%' : '72%'}
                        height={card.compact ? 28 : 36}
                        sx={{ bgcolor: alpha(colors.textPrimary, 0.08) }}
                      />
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
