import { Grid } from '@mui/material';
import MapOutlinedIcon from '@mui/icons-material/MapOutlined';
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import { formatHours } from '../utils/analytics';
import { StatCard } from './AppCard';

const STAT_CONFIG = [
  {
    key: 'mappedRequests',
    label: 'Mapped Requests',
    icon: MapOutlinedIcon,
    format: (s) => Number(s?.mappedRequests ?? 0).toLocaleString(),
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

export default function MapStatsBar({ stats, loading = false }) {
  return (
    <Grid container spacing={{ xs: 1.5, md: 2 }}>
      {STAT_CONFIG.map((card) => {
        const Icon = card.icon;
        return (
          <Grid key={card.key} size={{ xs: 6, md: 3 }}>
            <StatCard
              accent="map"
              icon={Icon}
              label={card.label}
              value={card.format(stats)}
              showValueSkeleton={loading}
            />
          </Grid>
        );
      })}
    </Grid>
  );
}
