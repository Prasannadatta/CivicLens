import { CardHeaderRow } from './AppCard';
import { useAppColors } from '../ColorModeContext';

export default function VizSectionHeader({
  icon: Icon,
  iconColor,
  title,
  subtitle,
  tooltip,
  chips = [],
  actions = null,
  selected = false,
  compact = false,
}) {
  const colors = useAppColors();
  const resolvedIconColor = iconColor ?? colors.primary;

  return (
    <CardHeaderRow
      icon={Icon}
      iconColor={resolvedIconColor}
      title={title}
      subtitle={subtitle}
      tooltip={tooltip}
      chips={chips}
      actions={actions}
      selected={selected}
      compact={compact}
      colors={colors}
      sx={{ mb: compact ? 0.75 : 1.25 }}
    />
  );
}
