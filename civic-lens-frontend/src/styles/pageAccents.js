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

