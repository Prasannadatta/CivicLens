import AppCard from './AppCard';
import { useAppColors } from '../ColorModeContext';

const ACCENT_ALIASES = {
  map: 'map',
  dashboard: 'dashboard',
  model: 'model',
  risk: 'risk',
  blue: 'blue',
  neutral: 'neutral',
};

function normalizeAccent(accent, colors) {
  if (!accent) return 'dashboard';
  if (typeof accent === 'string' && ACCENT_ALIASES[accent]) return accent;
  if (typeof accent === 'string' && accent.startsWith('#')) {
    const entries = [
      ['map', colors.secondary],
      ['dashboard', colors.warning],
      ['model', colors.accentPink],
      ['risk', colors.error],
      ['blue', colors.primary],
    ];
    const match = entries.find(([, value]) => value === accent);
    return match ? match[0] : 'blue';
  }
  return 'dashboard';
}

/**
 * Chart container for Dashboard/Map pages — landing-quality AppCard shell.
 */
export default function GlassChartCard({
  children,
  selected = false,
  accent = 'dashboard',
  contentSx,
  sx,
}) {
  const colors = useAppColors();
  const resolvedAccent = normalizeAccent(accent, colors);

  return (
    <AppCard
      accent={resolvedAccent}
      selected={selected}
      sx={{ height: '100%', ...sx }}
      contentSx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        ...contentSx,
      }}
    >
      {children}
    </AppCard>
  );
}
