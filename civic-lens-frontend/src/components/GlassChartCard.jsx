import DashboardCard from './DashboardCard';

/**
 * Chart container card — minimal surface, optional selected ring.
 */
export default function GlassChartCard({
  children,
  selected = false,
  accent,
  contentSx,
  sx,
}) {
  return (
    <DashboardCard
      selected={selected}
      selectedColor={accent}
      sx={{ height: '100%', ...sx }}
      contentSx={{
        p: '22px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        '&:last-child': { pb: '22px' },
        ...contentSx,
      }}
    >
      {children}
    </DashboardCard>
  );
}
