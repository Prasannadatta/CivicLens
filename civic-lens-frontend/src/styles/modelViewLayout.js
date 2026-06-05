/** Shared layout tokens for Model, Dashboard, and app pages. */

export const PAGE_MAX_WIDTH_HOME = 1180;
/** Shared max width for header, main, and footer inner containers */
export const CONTENT_MAX_WIDTH = 1440;
export const PAGE_MAX_WIDTH_APP = CONTENT_MAX_WIDTH;

export const LAYOUT_HEADER_HEIGHT = 88;
export const LAYOUT_FOOTER_HEIGHT = 52;
/** Mobile bottom nav height + gap above footer */
export const LAYOUT_BOTTOM_NAV_RESERVE = '76px';

export const MODEL_ROW_HEIGHT = 400;
export const MODEL_BOTTOM_ROW_HEIGHT = 360;
export const SHAP_CHART_HEIGHT = 268;
export const SHAP_FACTOR_LIMIT = 7;

export const PAGE_PADDING_X = { xs: '14px', sm: '20px', md: '32px', lg: '36px' };
/** Right padding for main content; slight lg+ inset to balance fixed side nav */
export const PAGE_PADDING_RIGHT = { xs: '14px', sm: '20px', md: '32px', lg: '45px' };
export const PAGE_PADDING_Y = { xs: '14px', sm: '20px', md: '32px' };
/** Gap from sticky header bottom to first page content — matches landing rhythm */
export const CONTENT_TOP_SPACING = { xs: '24px', sm: '32px', md: '48px' };
export const PAGE_HEADER_GAP = '28px';
export const PAGE_SECTION_GAP = '32px';
export const PAGE_GRID_GAP = '24px';
/** @deprecated use LAYOUT_FOOTER_HEIGHT + LAYOUT_BOTTOM_NAV_RESERVE via AppLayout */
export const PAGE_BOTTOM_PADDING = '96px';
/** @deprecated no longer applied to left padding — use PAGE_PADDING_RIGHT for nav clearance */
export const PAGE_NAV_RESERVE = '92px';

/** Shared inner container for header, main, and footer */
export const contentContainerSx = {
  width: '100%',
  maxWidth: PAGE_MAX_WIDTH_APP,
  mx: 'auto',
  boxSizing: 'border-box',
};

export const cardTitleSx = {
  fontSize: '0.6875rem',
  fontWeight: 700,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  lineHeight: 1.2,
};

export const sectionLabelSx = {
  fontSize: '0.6875rem',
  fontWeight: 700,
  letterSpacing: '0.07em',
  textTransform: 'uppercase',
  lineHeight: 1.2,
};

export const pageTitleSx = {
  fontWeight: 800,
  fontSize: { xs: '1.75rem', sm: '2.125rem', md: '2.5rem', lg: '2.625rem' },
  letterSpacing: '-0.03em',
  lineHeight: 1.12,
};

export const pageIntroEyebrowSx = {
  display: 'block',
  fontWeight: 700,
  fontSize: '0.75rem',
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  lineHeight: 1.2,
  mb: 0.75,
};

export const pageIntroDescriptionSx = {
  mt: 1,
  maxWidth: 760,
  fontSize: { xs: '0.9375rem', md: '1.0625rem' },
  lineHeight: 1.55,
};

export const PAGE_INTRO_MB = '24px';
