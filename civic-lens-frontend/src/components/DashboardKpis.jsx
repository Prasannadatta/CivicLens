import { Grid } from '@mui/material';
import BarChartIcon from '@mui/icons-material/BarChart';
import ScheduleIcon from '@mui/icons-material/Schedule';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { formatHours } from '../utils/analytics';
import { StatCard } from './AppCard';

const KPI_CONFIG = [
  {
    key: 'totalRequests',
    label: 'Total Requests',
    icon: BarChartIcon,
    format: (k) => Number(k?.totalRequests ?? 0).toLocaleString(),
  },
  {
    key: 'avgResponseHours',
    label: 'Average Response Time',
    icon: ScheduleIcon,
    format: (k) => formatHours(k?.avgResponseHours ?? 0),
  },
  {
    key: 'unresolvedRate',
    label: 'Unresolved Rate',
    icon: ErrorOutlineOutlinedIcon,
    format: (k) => `${((k?.unresolvedRate ?? 0) * 100).toFixed(1)}%`,
  },
  {
    key: 'highDelayCount',
    label: 'High Delay Requests',
    icon: WarningAmberIcon,
    format: (k) => Number(k?.highDelayCount ?? 0).toLocaleString(),
  },
];

export default function DashboardKpis({ kpis, showValueSkeleton = false }) {
  return (
    <Grid container spacing={{ xs: 1.5, md: 2 }}>
      {KPI_CONFIG.map((card) => {
        const Icon = card.icon;
        return (
          <Grid key={card.key} size={{ xs: 6, md: 3 }}>
            <StatCard
              accent="dashboard"
              neutralLabels
              icon={Icon}
              label={card.label}
              value={card.format(kpis)}
              showValueSkeleton={showValueSkeleton}
            />
          </Grid>
        );
      })}
    </Grid>
  );
}
