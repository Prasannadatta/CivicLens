import { Box, Typography } from '@mui/material';
import { useColorMode } from '../ColorModeContext';
import {
  clampTooltipPosition,
  getChartTooltipShellSx,
  getChartTooltipTextPrimary,
  getChartTooltipTextSecondary,
  TOOLTIP_COMPACT_HEIGHT,
  TOOLTIP_DEFAULT_HEIGHT,
  TOOLTIP_DEFAULT_WIDTH,
} from '../styles/chartTooltip';

function TooltipRow({ label, value, textPrimary, textSecondary, compact, emphasize }) {
  return (
    <Typography
      component="div"
      sx={{
        fontSize: compact ? '12px' : '13px',
        lineHeight: 1.45,
        fontWeight: emphasize ? 600 : 400,
        display: 'flex',
        justifyContent: 'space-between',
        gap: 1.25,
        alignItems: 'baseline',
      }}
    >
      <Box component="span" sx={{ color: textSecondary, flexShrink: 0 }}>
        {label}
      </Box>
      <Box
        component="span"
        sx={{
          color: textPrimary,
          textAlign: 'right',
          fontWeight: emphasize ? 600 : 500,
        }}
      >
        {value}
      </Box>
    </Typography>
  );
}

/**
 * Floating tooltip card content — use inside Recharts custom tooltips or standalone.
 */
export function ChartTooltipPanel({
  title,
  subtitle,
  rows = [],
  footer,
  compact = false,
  neutral = true,
  sx,
}) {
  const { mode } = useColorMode();
  const isLight = mode === 'light';
  const textPrimary = getChartTooltipTextPrimary(isLight);
  const textSecondary = getChartTooltipTextSecondary(isLight);

  return (
    <Box sx={{ ...getChartTooltipShellSx(isLight, compact), ...sx }}>
      {title && (
        <Typography
          sx={{
            fontSize: compact ? '13px' : '14px',
            fontWeight: 700,
            lineHeight: 1.3,
            color: textPrimary,
            mb: subtitle || rows.length || footer ? 0.5 : 0,
          }}
        >
          {title}
        </Typography>
      )}
      {subtitle && (
        <Typography
          sx={{
            fontSize: '11px',
            lineHeight: 1.45,
            color: textSecondary,
            mb: rows.length || footer ? 0.5 : 0,
          }}
        >
          {subtitle}
        </Typography>
      )}
      {rows.length > 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25, mt: title || subtitle ? 0.25 : 0 }}>
          {rows.map((row, index) => (
            <TooltipRow
              key={`${row.label}-${index}`}
              label={row.label}
              value={row.value}
              textPrimary={neutral ? textPrimary : (row.color || textPrimary)}
              textSecondary={textSecondary}
              compact={compact}
              emphasize={row.emphasize}
            />
          ))}
        </Box>
      )}
      {footer && (
        <Typography
          sx={{
            fontSize: '11px',
            lineHeight: 1.45,
            color: textSecondary,
            mt: rows.length ? 0.35 : 0,
          }}
        >
          {footer}
        </Typography>
      )}
    </Box>
  );
}

/**
 * Absolutely positioned chart/map hover tooltip.
 */
export default function ChartTooltip({
  visible = true,
  title,
  subtitle,
  rows = [],
  footer,
  x = 0,
  y = 0,
  containerWidth,
  containerHeight,
  compact = false,
  neutral = true,
  tooltipWidth,
  tooltipHeight,
  sx,
}) {
  if (!visible) return null;

  const width = tooltipWidth ?? TOOLTIP_DEFAULT_WIDTH;
  const height = tooltipHeight ?? (compact ? TOOLTIP_COMPACT_HEIGHT : TOOLTIP_DEFAULT_HEIGHT);
  const position = clampTooltipPosition({
    x,
    y,
    containerWidth,
    containerHeight,
    tooltipWidth: width,
    tooltipHeight: height,
  });

  return (
    <Box
      sx={{
        position: 'absolute',
        left: position.left,
        top: position.top,
        ...sx,
      }}
    >
      <ChartTooltipPanel
        title={title}
        subtitle={subtitle}
        rows={rows}
        footer={footer}
        compact={compact}
        neutral={neutral}
      />
    </Box>
  );
}
