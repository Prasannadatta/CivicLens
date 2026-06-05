export const TOOLTIP_DEFAULT_WIDTH = 220;
export const TOOLTIP_DEFAULT_HEIGHT = 132;
export const TOOLTIP_COMPACT_HEIGHT = 96;

export function getChartTooltipShellSx(isLight, compact = false) {
  return {
    bgcolor: isLight ? 'rgba(255, 255, 255, 0.94)' : 'rgba(31, 41, 55, 0.95)',
    border: isLight ? '1px solid rgba(15, 23, 42, 0.10)' : '1px solid rgba(255, 255, 255, 0.10)',
    boxShadow: isLight
      ? '0 12px 32px rgba(15, 23, 42, 0.12)'
      : '0 12px 32px rgba(0, 0, 0, 0.30)',
    borderRadius: '14px',
    p: compact ? '10px 12px' : '12px 14px',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    color: isLight ? '#0f172a' : '#f8fafc',
    pointerEvents: 'none',
    zIndex: 10,
    minWidth: compact ? 160 : 180,
    maxWidth: compact ? 240 : 260,
  };
}

export function getChartTooltipTextPrimary(isLight) {
  return isLight ? '#0f172a' : '#f8fafc';
}

export function getChartTooltipTextSecondary(isLight) {
  return isLight ? '#64748b' : '#cbd5e1';
}

/**
 * Semantic tooltip row colors — kept for optional accent dots only.
 * ChartTooltip renders row text neutrally by default.
 */
export function getTooltipMetricColors(colors) {
  return {
    count: colors.primary,
    volume: colors.primary,
    response: colors.warning,
    burden: colors.warning,
    predicted: colors.accentPink,
    unresolved: colors.error,
    highDelay: colors.error,
    risk: colors.error,
    spatial: colors.secondary,
    neutral: colors.textSecondary,
    model: colors.accentPink,
    unknown: colors.textMuted,
  };
}

export function getTooltipStatusColor(status, colors) {
  if (status == null || status === '') return colors.textSecondary;
  return /closed/i.test(String(status)) ? colors.textSecondary : colors.error;
}

/**
 * Clamp absolute tooltip position inside a chart container.
 */
export function clampTooltipPosition({
  x,
  y,
  containerWidth,
  containerHeight,
  tooltipWidth = TOOLTIP_DEFAULT_WIDTH,
  tooltipHeight = TOOLTIP_DEFAULT_HEIGHT,
  offsetX = 14,
  offsetY = 12,
}) {
  const safeWidth = Math.max(containerWidth ?? 0, tooltipWidth + 16);
  const safeHeight = Math.max(containerHeight ?? 0, tooltipHeight + 16);

  let left = x + offsetX;
  let top = y - offsetY;

  if (left + tooltipWidth > safeWidth - 8) {
    left = Math.max(8, x - tooltipWidth - offsetX);
  }
  if (left < 8) left = 8;

  if (top + tooltipHeight > safeHeight - 8) {
    top = Math.max(8, safeHeight - tooltipHeight - 8);
  }
  if (top < 8) top = 8;

  return { left, top };
}
