import { alpha } from '@mui/material/styles';

/** Semantic page/view accent mapping — Home=blue, Map=cyan, Dashboard=yellow, Model=pink */
export function getPageAccentColor(colors, viewId) {
  switch (viewId) {
    case 'map':
      return colors.secondary;
    case 'dashboard':
      return colors.warning;
    case 'model':
      return colors.accentPink;
    case 'home':
    default:
      return colors.primary;
  }
}

function isLightFromColors(colors) {
  return colors.background === '#f8fafc';
}

function activeNavBg(accent, isLight) {
  return alpha(accent, isLight ? 0.06 : 0.1);
}

/** Header nav — hover: accent text only; active: subtle tinted pill */
export function getHeaderNavSx(colors, viewId, isActive) {
  const accent = getPageAccentColor(colors, viewId);
  const isLight = isLightFromColors(colors);
  const activeBg = activeNavBg(accent, isLight);

  return {
    minWidth: 0,
    minHeight: 40,
    px: 1.5,
    py: 0.5,
    fontSize: '0.875rem',
    fontWeight: isActive ? 700 : 500,
    textTransform: 'none',
    color: isActive ? accent : colors.textSecondary,
    bgcolor: isActive ? activeBg : 'transparent',
    borderRadius: '8px',
    border: 'none',
    boxShadow: 'none',
    transition: 'color 0.15s ease',
    '&:hover': {
      bgcolor: isActive ? activeBg : 'transparent',
      color: accent,
      border: 'none',
      boxShadow: 'none',
    },
  };
}

/** Right nav item — hover: accent icon/text only; active: subtle tint + border */
export function getSideNavItemSx(colors, viewId, isActive, isDisabled) {
  const accent = getPageAccentColor(colors, viewId);
  const isLight = isLightFromColors(colors);
  const activeBg = activeNavBg(accent, isLight);
  const activeBorder = `1px solid ${alpha(accent, isLight ? 0.3 : 0.35)}`;

  return {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0.25,
    width: '100%',
    px: 0.25,
    py: 0.65,
    border: isActive ? activeBorder : '1px solid transparent',
    borderRadius: '10px',
    cursor: isDisabled ? 'default' : 'pointer',
    bgcolor: isActive ? activeBg : 'transparent',
    color: isActive ? accent : colors.textSecondary,
    opacity: isDisabled ? 0.55 : 1,
    transition: 'color 0.15s ease',
    '&:hover': isDisabled
      ? undefined
      : {
          bgcolor: isActive ? activeBg : 'transparent',
          color: accent,
          border: isActive ? activeBorder : '1px solid transparent',
        },
  };
}

/** Mobile bottom nav item */
export function getMobileNavItemSx(colors, viewId, isActive, isDisabled) {
  const accent = getPageAccentColor(colors, viewId);
  const isLight = isLightFromColors(colors);
  const activeBg = activeNavBg(accent, isLight);
  const activeBorder = `1px solid ${alpha(accent, isLight ? 0.3 : 0.35)}`;

  return {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0.5,
    minWidth: 48,
    px: 0.85,
    py: 0.55,
    border: isActive ? activeBorder : '1px solid transparent',
    borderRadius: '10px',
    cursor: isDisabled ? 'default' : 'pointer',
    bgcolor: isActive ? activeBg : 'transparent',
    color: isActive ? accent : colors.textSecondary,
    opacity: isDisabled ? 0.55 : 1,
    transition: 'color 0.15s ease',
    '&:hover': isDisabled
      ? undefined
      : {
          bgcolor: isActive ? activeBg : 'transparent',
          color: accent,
          border: isActive ? activeBorder : '1px solid transparent',
        },
  };
}
