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

function navChildrenInherit() {
  return {
    '& .MuiSvgIcon-root': { color: 'inherit' },
    '& .MuiTypography-root': { color: 'inherit' },
  };
}

function navChildrenAccent(accent) {
  return {
    '& .MuiSvgIcon-root': { color: accent },
    '& .MuiTypography-root': { color: accent },
  };
}

/** Header nav — hover/active: accent text; active: optional subtle tint, no border */
export function getHeaderNavSx(colors, viewId, isActive) {
  const accent = getPageAccentColor(colors, viewId);
  const isLight = isLightFromColors(colors);
  const activeBg = activeNavBg(accent, isLight);
  const idleColor = colors.textSecondary;

  return {
    minWidth: 0,
    minHeight: 40,
    px: 1.5,
    py: 0.5,
    fontSize: '0.875rem',
    fontWeight: isActive ? 700 : 500,
    textTransform: 'none',
    color: isActive ? accent : idleColor,
    bgcolor: isActive ? activeBg : 'transparent',
    borderRadius: '8px',
    border: 'none',
    outline: 'none',
    boxShadow: 'none',
    transition: 'color 0.15s ease',
    ...(isActive ? navChildrenAccent(accent) : {}),
    '&:hover': {
      bgcolor: isActive ? activeBg : 'transparent',
      backgroundColor: isActive ? activeBg : 'transparent',
      color: accent,
      border: 'none',
      outline: 'none',
      boxShadow: 'none',
      ...navChildrenAccent(accent),
    },
  };
}

/** Right nav item — hover/active: accent icon + text; active: subtle tint, no border */
export function getSideNavItemSx(colors, viewId, isActive, isDisabled) {
  const accent = getPageAccentColor(colors, viewId);
  const isLight = isLightFromColors(colors);
  const activeBg = activeNavBg(accent, isLight);
  const idleColor = colors.textSecondary;

  return {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0.25,
    width: '100%',
    px: 0.25,
    py: 0.65,
    border: 'none',
    borderRadius: '10px',
    cursor: isDisabled ? 'default' : 'pointer',
    bgcolor: isActive ? activeBg : 'transparent',
    color: isActive ? accent : idleColor,
    opacity: isDisabled ? 0.55 : 1,
    transition: 'color 0.15s ease',
    ...navChildrenInherit(),
    ...(isActive ? navChildrenAccent(accent) : {}),
    '&:hover': isDisabled
      ? undefined
      : {
          bgcolor: isActive ? activeBg : 'transparent',
          backgroundColor: isActive ? activeBg : 'transparent',
          color: accent,
          border: 'none',
          outline: 'none',
          boxShadow: 'none',
          ...navChildrenAccent(accent),
        },
  };
}

/** Mobile bottom nav item */
export function getMobileNavItemSx(colors, viewId, isActive, isDisabled) {
  const accent = getPageAccentColor(colors, viewId);
  const isLight = isLightFromColors(colors);
  const activeBg = activeNavBg(accent, isLight);
  const idleColor = colors.textSecondary;

  return {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0.5,
    minWidth: 48,
    px: 0.85,
    py: 0.55,
    border: 'none',
    borderRadius: '10px',
    cursor: isDisabled ? 'default' : 'pointer',
    bgcolor: isActive ? activeBg : 'transparent',
    color: isActive ? accent : idleColor,
    opacity: isDisabled ? 0.55 : 1,
    transition: 'color 0.15s ease',
    ...navChildrenInherit(),
    ...(isActive ? navChildrenAccent(accent) : {}),
    '&:hover': isDisabled
      ? undefined
      : {
          bgcolor: isActive ? activeBg : 'transparent',
          backgroundColor: isActive ? activeBg : 'transparent',
          color: accent,
          border: 'none',
          outline: 'none',
          boxShadow: 'none',
          ...navChildrenAccent(accent),
        },
  };
}
