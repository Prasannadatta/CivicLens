import DashboardCard from './DashboardCard';

/**
 * Glassmorphism chart container with subtle lift-on-hover and optional selected ring.
 */
export default function GlassChartCard({
  children,
  selected = false,
  accent = '#4da3ff',
  contentSx,
  sx,
}) {
  return (
    <DashboardCard
      hover
      selected={selected}
      selectedColor={accent}
      sx={sx}
      contentSx={contentSx}
    >
      {children}
    </DashboardCard>
  );
}
