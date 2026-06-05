import { Box, Typography, Tooltip, Chip, alpha } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useAppColors, useColorMode } from '../ColorModeContext';
import { cardSubtitleSx, cardTitleSx } from '../styles/modelViewLayout';

const ACCENT_KEYS = {
  map: 'secondary',
  dashboard: 'warning',
  model: 'accentPink',
  risk: 'error',
  blue: 'primary',
  neutral: 'textMuted',
};

export function resolveAppAccent(accent, colors) {
  if (!accent) return colors.primary;
  if (typeof accent === 'string' && accent.startsWith('#')) return accent;
  const colorKey = ACCENT_KEYS[accent] ?? 'primary';
  return colors[colorKey] ?? colors.primary;
}

export function getAppCardShellSx(colors, { clickable = false, selected = false, accentColor, isLight, compact = false } = {}) {
  const resolvedAccent = accentColor ?? colors.primary;

  return {
    width: '100%',
    height: '100%',
    textAlign: 'left',
    p: compact ? '18px 20px' : '24px',
    borderRadius: '22px',
    bgcolor: colors.cardSurface,
    border: `1px solid ${selected ? alpha(resolvedAccent, isLight ? 0.4 : 0.45) : colors.border}`,
    boxShadow: selected ? colors.cardHoverShadow : colors.cardShadow,
    cursor: clickable ? 'pointer' : 'default',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease',
    ...(clickable && {
      '&:hover': {
        borderColor: alpha(resolvedAccent, isLight ? 0.45 : 0.5),
        boxShadow: colors.cardHoverShadow,
        transform: 'translateY(-2px)',
        '& .app-card-icon-pill': {
          color: resolvedAccent,
          borderColor: alpha(resolvedAccent, 0.35),
        },
        '& .app-card-title': {
          color: resolvedAccent,
        },
      },
    }),
  };
}

export function AppCardIconPill({
  icon: Icon,
  accentColor,
  colors,
  size = 'md',
  selected = false,
  className = 'app-card-icon-pill',
}) {
  const isLight = colors.background === '#f8fafc';
  const dim = size === 'sm' ? 36 : 40;
  const iconSize = size === 'sm' ? 17 : 20;
  const radius = '12px';

  return (
    <Box
      className={className}
      sx={{
        width: dim,
        height: dim,
        borderRadius: radius,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        bgcolor: alpha(accentColor, isLight ? 0.08 : 0.14),
        border: `1px solid ${alpha(accentColor, selected ? 0.35 : isLight ? 0.16 : 0.22)}`,
        color: accentColor,
        transition: 'color 0.2s ease, border-color 0.2s ease',
      }}
    >
      <Icon sx={{ fontSize: iconSize }} />
    </Box>
  );
}

export function CardHeaderRow({
  icon: Icon,
  iconColor,
  title,
  subtitle,
  tooltip,
  actions = null,
  chips = [],
  selected = false,
  compact = false,
  colors: colorsProp,
  sx,
}) {
  const themeColors = useAppColors();
  const colors = colorsProp ?? themeColors;
  const resolvedIconColor = iconColor ?? colors.primary;

  return (
    <Box sx={{ mb: 1.25, flexShrink: 0, minWidth: 0, ...sx }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1.5,
          minWidth: 0,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.25,
            minWidth: 0,
            flex: 1,
          }}
        >
          {Icon && (
            <AppCardIconPill
              icon={Icon}
              accentColor={resolvedIconColor}
              colors={colors}
              size={compact ? 'sm' : 'md'}
              selected={selected}
            />
          )}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              minWidth: 0,
              flex: 1,
            }}
          >
            {title && (
              <Typography
                component="h2"
                className="app-card-title"
                title={typeof title === 'string' ? title : undefined}
                sx={{
                  ...cardTitleSx,
                  color: colors.textPrimary,
                  letterSpacing: '-0.02em',
                  minWidth: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  transition: 'color 0.2s ease',
                }}
              >
                {title}
              </Typography>
            )}
            {tooltip && (
              <Tooltip title={tooltip} arrow placement="top">
                <InfoOutlinedIcon
                  sx={{
                    fontSize: 15,
                    color: colors.textSecondary,
                    cursor: 'help',
                    flexShrink: 0,
                    '&:hover': { color: colors.primary },
                  }}
                />
              </Tooltip>
            )}
          </Box>
        </Box>

        {actions && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              flexShrink: 0,
              flexWrap: 'wrap',
            }}
          >
            {actions}
          </Box>
        )}
      </Box>

      {subtitle && (
        <Typography
          sx={{
            ...cardSubtitleSx,
            color: colors.textSecondary,
            mt: 0.5,
            maxWidth: 560,
          }}
        >
          {subtitle}
        </Typography>
      )}

      {chips.length > 0 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 0.75 }}>
          {chips.map((chip) => (
            <Chip key={chip.key || chip.label} size="small" {...chip} />
          ))}
        </Box>
      )}
    </Box>
  );
}

export default function AppCard({
  accent = 'blue',
  title,
  subtitle,
  icon: Icon,
  children,
  clickable = false,
  selected = false,
  compact = false,
  sx,
  contentSx,
  onClick,
  className,
}) {
  const colors = useAppColors();
  const { mode } = useColorMode();
  const isLight = mode === 'light';
  const accentColor = resolveAppAccent(accent, colors);
  const hasHeader = Boolean(Icon || title || subtitle);

  return (
    <Box
      component={clickable ? 'button' : 'div'}
      type={clickable ? 'button' : undefined}
      onClick={clickable ? onClick : undefined}
      className={className}
      sx={{
        ...getAppCardShellSx(colors, { clickable, selected, accentColor, isLight, compact }),
        display: 'flex',
        flexDirection: 'column',
        ...contentSx,
        ...sx,
      }}
    >
      {hasHeader && (
        <CardHeaderRow
          icon={Icon}
          iconColor={accentColor}
          title={title}
          subtitle={subtitle}
          compact={compact}
          colors={colors}
          sx={{ mb: children ? (compact ? 1 : 1.25) : 0 }}
        />
      )}
      {children}
    </Box>
  );
}
