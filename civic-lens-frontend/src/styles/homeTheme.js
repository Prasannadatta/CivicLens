import { paletteTokens } from '../theme';

/** Home page tokens aligned with global theme — no gradients. */
export function getHomeTokens(mode) {
  const c = paletteTokens[mode];
  const isLight = mode === 'light';
  return {
    isLight,
    ...c,
    pink: c.accentPink,
    gold: c.warning,
    cyan: c.secondary,
    cardBg: c.cardSurface,
    cardBorder: c.border,
    shadow: c.cardShadow,
    cardHoverShadow: c.cardHoverShadow,
    hoverBg: c.hoverBg,
  };
}

export const HOME_SECTION_GAP = { xs: '40px', md: '56px' };
/** Hero top padding handled by AppLayout CONTENT_TOP_SPACING */
export const HOME_HERO_PT = '0';
