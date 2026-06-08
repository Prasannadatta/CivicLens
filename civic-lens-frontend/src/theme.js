import { createTheme, alpha } from '@mui/material/styles';
import { typography as civicTypography } from './styles/modelViewLayout';

export const paletteTokens = {
  dark: {
    background: '#141827',
    backgroundAlt: '#171c2b',
    card: '#1f2937',
    cardSurface: '#1f2937',
    cardElevated: '#243044',
    primary: '#60a5fa',
    secondary: '#22d3ee',
    accentPink: '#f472b6',
    warning: '#fbbf24',
    error: '#f87171',
    textPrimary: '#f8fafc',
    textSecondary: '#cbd5e1',
    textMuted: '#94a3b8',
    border: 'rgba(255, 255, 255, 0.10)',
    hoverBg: 'rgba(96, 165, 250, 0.14)',
    selectedBg: 'rgba(96, 165, 250, 0.18)',
    neutralHoverBg: 'rgba(255, 255, 255, 0.06)',
    neutralSelectedBg: 'rgba(255, 255, 255, 0.08)',
    shellBg: 'rgba(31, 41, 55, 0.88)',
    chartLabel: '#cbd5e1',
    chartScaleLow: '#243044',
    chartPlotBg: '#1a2333',
    tooltipBg: '#243044',
    headerGradientStart: '#1f2937',
    headerGradientEnd: '#141827',
    chartBgStart: '#1f2937',
    chartBgEnd: '#171c2b',
    mapOceanStart: '#1a2333',
    mapOceanEnd: '#243044',
    sectionLabel: '#60a5fa',
    inputBg: 'rgba(255, 255, 255, 0.04)',
    cardShadow: '0 16px 40px rgba(0, 0, 0, 0.24)',
    cardHoverShadow: '0 16px 40px rgba(0, 0, 0, 0.28)',
    glassShadow: '0 16px 40px rgba(0, 0, 0, 0.24)',
    gridStroke: 'rgba(148, 163, 184, 0.10)',
    treemapStroke: 'rgba(148, 163, 184, 0.16)',
  },
  light: {
    background: '#f8fafc',
    card: '#ffffff',
    cardSurface: '#ffffff',
    primary: '#2563eb',
    secondary: '#0891b2',
    accentPink: '#ec4899',
    warning: '#f59e0b',
    error: '#dc2626',
    textPrimary: '#0f172a',
    textSecondary: '#475569',
    textMuted: '#94a3b8',
    border: 'rgba(15, 23, 42, 0.08)',
    hoverBg: 'rgba(37, 99, 235, 0.08)',
    selectedBg: 'rgba(37, 99, 235, 0.12)',
    neutralHoverBg: 'rgba(15, 23, 42, 0.04)',
    neutralSelectedBg: 'rgba(15, 23, 42, 0.06)',
    shellBg: 'rgba(255, 255, 255, 0.86)',
    chartLabel: '#475569',
    chartScaleLow: '#eef2f7',
    chartPlotBg: '#f8fafc',
    tooltipBg: '#ffffff',
    headerGradientStart: '#ffffff',
    headerGradientEnd: '#f8fafc',
    chartBgStart: '#f8fafc',
    chartBgEnd: '#f1f5f9',
    mapOceanStart: '#eef2f7',
    mapOceanEnd: '#e2e8f0',
    sectionLabel: '#2563eb',
    inputBg: 'rgba(15, 23, 42, 0.02)',
    cardShadow: '0 18px 45px rgba(15, 23, 42, 0.08)',
    cardHoverShadow: '0 18px 45px rgba(15, 23, 42, 0.12)',
    glassShadow: '0 16px 40px rgba(15, 23, 42, 0.06)',
    gridStroke: 'rgba(15, 23, 42, 0.07)',
    treemapStroke: 'rgba(15, 23, 42, 0.10)',
  },
};

export function getChartPlotBox(c, mode) {
  const insetBorder = mode === 'light' ? alpha('#0f172a', 0.07) : alpha('#94a3b8', 0.12);
  return {
    position: 'relative',
    width: '100%',
    borderRadius: '14px',
    overflow: 'visible',
    border: `1px solid ${insetBorder}`,
    bgcolor: mode === 'light' ? c.cardSurface : c.chartPlotBg,
  };
}

function isLightPalette(c) {
  return c.background === paletteTokens.light.background;
}

export function getActiveFilterChipSx(c, accent = c.primary, isLight = isLightPalette(c)) {
  return {
    height: 26,
    fontSize: '0.7rem',
    fontWeight: 700,
    bgcolor: alpha(accent, isLight ? 0.1 : 0.16),
    border: `1px solid ${alpha(accent, isLight ? 0.28 : 0.35)}`,
    color: accent,
    '& .MuiChip-deleteIcon': {
      color: accent,
      opacity: 0.85,
      '&:hover': { color: accent, opacity: 1 },
    },
  };
}

export function getSelectedFilterChipSx(c, isLight = isLightPalette(c)) {
  return {
    fontWeight: 700,
    color: isLight ? '#b45309' : c.warning,
    border: `1px solid ${alpha(c.warning, isLight ? 0.35 : 0.4)}`,
    bgcolor: alpha(c.warning, isLight ? 0.12 : 0.16),
  };
}

function getBodyBackground(c) {
  return c.background;
}

export function createAppTheme(mode = 'dark') {
  const c = paletteTokens[mode];
  const isLight = mode === 'light';

  return createTheme({
    civicTypography,
    palette: {
      mode,
      primary: {
        main: c.primary,
        light: isLight ? '#60a5fa' : '#7dbaff',
        dark: isLight ? '#1d4ed8' : '#2d7fd4',
        contrastText: isLight ? '#ffffff' : '#111827',
      },
      secondary: {
        main: c.secondary,
        light: isLight ? '#22d3ee' : '#6af0e4',
        dark: isLight ? '#0e7490' : '#1fb8aa',
        contrastText: isLight ? '#ffffff' : '#111827',
      },
      background: {
        default: c.background,
        paper: c.card,
      },
      text: {
        primary: c.textPrimary,
        secondary: c.textSecondary,
        disabled: c.textMuted,
      },
      success: { main: c.secondary },
      warning: { main: c.warning },
      error: { main: c.error },
      info: { main: c.primary },
      divider: c.border,
      action: {
        active: c.textPrimary,
        hover: c.neutralHoverBg,
        selected: c.neutralSelectedBg,
        disabled: alpha(c.textMuted, 0.85),
        disabledBackground: alpha(isLight ? '#0f172a' : '#ffffff', isLight ? 0.04 : 0.06),
      },
    },
    typography: {
      fontFamily: '"DM Sans", "Segoe UI", system-ui, sans-serif',
      h1: { fontWeight: 700, letterSpacing: '-0.03em', color: c.textPrimary },
      h2: { fontWeight: 700, letterSpacing: '-0.025em', color: c.textPrimary },
      h3: { fontWeight: 700, color: c.textPrimary },
      h4: { fontWeight: 700, color: c.textPrimary },
      h5: { fontWeight: 600, color: c.textPrimary },
      h6: { fontWeight: 600, color: c.textPrimary },
      subtitle1: { fontWeight: 500, color: c.textSecondary },
      subtitle2: {
        fontWeight: 600,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        fontSize: '0.68rem',
        color: c.textMuted,
      },
      body1: { color: c.textSecondary, lineHeight: 1.6 },
      body2: { color: c.textSecondary, lineHeight: 1.55 },
      caption: {
        fontFamily: '"DM Sans", "Segoe UI", system-ui, sans-serif',
        fontSize: '0.75rem',
        fontWeight: 500,
        color: c.textMuted,
        letterSpacing: '0.01em',
      },
      button: { fontWeight: 600, textTransform: 'none' },
    },
    shape: { borderRadius: 14 },
    shadows: isLight
      ? [
          'none',
          '0 2px 8px rgba(15, 23, 42, 0.06)',
          '0 4px 12px rgba(15, 23, 42, 0.08)',
          '0 8px 20px rgba(15, 23, 42, 0.10)',
          '0 12px 28px rgba(15, 23, 42, 0.12)',
          ...Array(20).fill('0 16px 36px rgba(15, 23, 42, 0.14)'),
        ]
      : [
          'none',
          '0 4px 16px rgba(0, 0, 0, 0.18)',
          '0 8px 24px rgba(0, 0, 0, 0.22)',
          '0 12px 32px rgba(0, 0, 0, 0.26)',
          '0 16px 40px rgba(0, 0, 0, 0.3)',
          ...Array(20).fill('0 20px 48px rgba(0, 0, 0, 0.34)'),
        ],
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          html: { height: '100%', scrollBehavior: 'smooth' },
          body: {
            minHeight: '100%',
            margin: 0,
            backgroundColor: getBodyBackground(c),
            color: c.textPrimary,
          },
          '#root': { minHeight: '100vh', width: '100%' },
          '*::selection': {
            backgroundColor: alpha(c.primary, isLight ? 0.22 : 0.35),
            color: c.textPrimary,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backgroundColor: c.cardSurface,
            border: `1px solid ${c.border}`,
          },
          rounded: { borderRadius: 22 },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: c.cardSurface,
            border: `1px solid ${c.border}`,
            borderRadius: 22,
            boxShadow: c.cardShadow,
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            paddingInline: 18,
            fontWeight: 600,
            textTransform: 'none',
            boxShadow: 'none',
          },
          contained: {
            boxShadow: 'none',
            '&:hover': { boxShadow: 'none' },
          },
          containedPrimary: {
            backgroundColor: isLight ? '#2563eb' : c.primary,
            color: '#ffffff',
            '&:hover': {
              backgroundColor: isLight ? '#1d4ed8' : '#3b82f6',
              boxShadow: 'none',
            },
          },
          outlined: {
            borderColor: alpha(c.primary, isLight ? 0.35 : 0.4),
            color: c.primary,
            backgroundColor: c.cardSurface,
            '&:hover': {
              borderColor: c.primary,
              backgroundColor: c.neutralHoverBg,
              color: c.primary,
              boxShadow: 'none',
            },
          },
          outlinedPrimary: {
            borderColor: alpha(c.primary, isLight ? 0.35 : 0.4),
            color: c.primary,
            backgroundColor: c.cardSurface,
            '&:hover': {
              borderColor: c.primary,
              backgroundColor: c.neutralHoverBg,
              color: c.primary,
            },
          },
          sizeLarge: {
            minHeight: 44,
            paddingInline: 22,
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 600,
            borderRadius: 10,
            color: c.textPrimary,
          },
          outlined: { borderColor: c.border },
          colorPrimary: {
            bgcolor: alpha(c.primary, isLight ? 0.1 : 0.16),
            color: c.primary,
          },
          colorSecondary: {
            bgcolor: alpha(c.secondary, isLight ? 0.1 : 0.16),
            color: c.secondary,
          },
          colorError: {
            bgcolor: alpha(c.accentPink, isLight ? 0.1 : 0.16),
            color: c.accentPink,
          },
          colorWarning: {
            bgcolor: alpha(c.warning, isLight ? 0.12 : 0.16),
            color: isLight ? '#b45309' : c.warning,
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            color: c.textSecondary,
            '&:hover': {
              bgcolor: c.neutralHoverBg,
              color: c.textPrimary,
            },
          },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            fontSize: '0.875rem',
            color: c.textPrimary,
            '&:hover': {
              bgcolor: c.neutralHoverBg,
              color: c.textPrimary,
            },
            '&.Mui-selected': {
              bgcolor: c.neutralSelectedBg,
              color: c.textPrimary,
              fontWeight: 600,
              '&:hover': { bgcolor: c.neutralSelectedBg },
            },
          },
        },
      },
      MuiAutocomplete: {
        styleOverrides: {
          paper: {
            border: `1px solid ${c.border}`,
            boxShadow: c.cardShadow,
            bgcolor: c.cardSurface,
          },
          option: {
            fontSize: '0.875rem',
            color: c.textPrimary,
            '&[aria-selected="true"]': {
              bgcolor: `${c.neutralSelectedBg} !important`,
            },
            '&.Mui-focused': {
              bgcolor: `${c.neutralHoverBg} !important`,
            },
          },
        },
      },
      MuiToggleButton: {
        styleOverrides: {
          root: {
            color: c.textSecondary,
            borderColor: c.border,
            textTransform: 'none',
            '&:hover': {
              bgcolor: c.neutralHoverBg,
              color: c.textPrimary,
            },
            '&.Mui-selected': {
              bgcolor: c.neutralSelectedBg,
              color: c.textPrimary,
              borderColor: c.border,
              '&:hover': { bgcolor: c.neutralSelectedBg },
            },
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            '&:hover': { bgcolor: c.neutralHoverBg },
            '&.Mui-selected': {
              bgcolor: c.neutralSelectedBg,
              '&:hover': { bgcolor: c.neutralSelectedBg },
            },
          },
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: {
            color: c.textSecondary,
            fontSize: '0.875rem',
            '&.Mui-focused': { color: c.primary },
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            backgroundColor: c.inputBg,
            '& .MuiOutlinedInput-notchedOutline': { borderColor: c.border },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: alpha(c.primary, isLight ? 0.35 : 0.45),
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: c.primary,
            },
          },
        },
      },
      MuiSelect: {
        styleOverrides: { root: { borderRadius: 12 } },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: alpha(c.cardSurface, 0.98),
            borderLeft: `1px solid ${c.border}`,
            backdropFilter: 'blur(20px)',
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: alpha(c.tooltipBg, 0.96),
            border: `1px solid ${c.border}`,
            backdropFilter: 'blur(10px)',
            fontSize: '0.75rem',
            borderRadius: 10,
            color: c.textPrimary,
            boxShadow: isLight
              ? '0 8px 24px rgba(15, 23, 42, 0.12)'
              : '0 12px 32px rgba(0, 0, 0, 0.35)',
          },
        },
      },
      MuiContainer: {
        styleOverrides: {
          root: {
            paddingLeft: 16,
            paddingRight: 16,
            '@media (min-width: 600px)': {
              paddingLeft: 24,
              paddingRight: 24,
            },
          },
        },
      },
      MuiLinearProgress: {
        styleOverrides: {
          root: {
            borderRadius: 999,
            backgroundColor: alpha(isLight ? '#0f172a' : '#ffffff', isLight ? 0.06 : 0.08),
          },
        },
      },
      MuiDivider: {
        styleOverrides: { root: { borderColor: c.border } },
      },
    },
  });
}

export default createAppTheme('dark');
