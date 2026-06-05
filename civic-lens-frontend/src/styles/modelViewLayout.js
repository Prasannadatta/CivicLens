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

/** Shared typography scale — page intros, cards, and metadata */
export const typography = {
  pageEyebrow: {
    fontSize: '12px',
    lineHeight: 1.4,
    fontWeight: 700,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
  },
  pageTitle: {
    fontWeight: 800,
    fontSize: { xs: '30px', sm: '34px', md: '42px' },
    lineHeight: 1.1,
    letterSpacing: '-0.03em',
  },
  pageSubtitle: {
    fontSize: { xs: '14px', md: '15px' },
    lineHeight: 1.6,
    fontWeight: 400,
  },
  heroBodySecondary: {
    fontSize: '13px',
    fontStyle: 'italic',
    lineHeight: 1.6,
    fontWeight: 400,
  },
  dataSource: {
    fontSize: '11px',
    lineHeight: 1.5,
    fontWeight: 600,
  },
  cardTitle: {
    fontSize: '15px',
    fontWeight: 700,
    lineHeight: 1.3,
  },
  cardSubtitle: {
    fontSize: '13px',
    lineHeight: 1.5,
    fontWeight: 400,
  },
  smallMeta: {
    fontSize: '12px',
    lineHeight: 1.4,
    fontWeight: 600,
  },
};

export const pageEyebrowSx = {
  display: 'block',
  mb: 0.75,
  ...typography.pageEyebrow,
};

export const pageTitleSx = {
  ...typography.pageTitle,
};

export const pageSubtitleSx = {
  mt: 1,
  maxWidth: 760,
  ...typography.pageSubtitle,
};

export const heroBodyPrimarySx = {
  ...typography.pageSubtitle,
  mt: 0,
  maxWidth: 520,
};

export const heroBodySecondarySx = {
  ...typography.heroBodySecondary,
  maxWidth: 520,
};

export const dataSourceSx = {
  ...typography.dataSource,
};

export const cardTitleSx = {
  ...typography.cardTitle,
};

export const cardSubtitleSx = {
  ...typography.cardSubtitle,
};

export const smallMetaSx = {
  ...typography.smallMeta,
};

export const sectionLabelSx = {
  ...typography.smallMeta,
  letterSpacing: '0.07em',
  textTransform: 'uppercase',
};

/** @deprecated use pageEyebrowSx */
export const pageIntroEyebrowSx = pageEyebrowSx;

/** @deprecated use pageSubtitleSx */
export const pageIntroDescriptionSx = pageSubtitleSx;

export const PAGE_INTRO_MB = '24px';
