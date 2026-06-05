import { createTheme, alpha } from '@mui/material/styles';

export const paletteTokens = {
  dark: {
    background: '#07111f',
    card: 'rgba(255, 255, 255, 0.08)',
    cardSurface: 'rgba(15, 25, 45, 0.82)',
    primary: '#4da3ff',
    secondary: '#35e0d0',
    warning: '#ffb74d',
    error: '#ff5c8a',
    textPrimary: '#f5f7fb',
    textSecondary: 'rgba(245, 247, 251, 0.72)',
    textMuted: 'rgba(245, 247, 251, 0.52)',
    border: 'rgba(255, 255, 255, 0.1)',
    chartScaleLow: '#0b1a30',
    chartPlotBg: 'rgba(0, 0, 0, 0.12)',
    tooltipBg: '#07111f',
    headerGradientStart: '#172744',
    headerGradientEnd: '#12223a',
    chartBgStart: '#0c1929',
    chartBgEnd: '#06101d',
    mapOceanStart: '#06101d',
    mapOceanEnd: '#0c1a2d',
    sectionLabel: '#7dbaff',
    inputBg: 'rgba(255, 255, 255, 0.04)',
    cardShadow: '0 18px 50px rgba(0, 0, 0, 0.28)',
    cardHoverShadow: '0 20px 55px rgba(0, 0, 0, 0.32)',
    glassShadow:
      '0 12px 40px rgba(0, 0, 0, 0.35), 0 2px 8px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
    gridStroke: 'rgba(255, 255, 255, 0.06)',
    treemapStroke: 'rgba(255, 255, 255, 0.18)',
  },
  light: {
    background: '#f5f7fb',
    card: 'rgba(255, 255, 255, 0.92)',
    cardSurface: 'rgba(255, 255, 255, 0.92)',
    primary: '#2563eb',
    secondary: '#0891b2',
    warning: '#f59e0b',
    error: '#e11d48',
    textPrimary: '#0f172a',
    textSecondary: '#475569',
    textMuted: 'rgba(71, 85, 105, 0.75)',
    border: 'rgba(15, 23, 42, 0.10)',
    chartScaleLow: '#e2e8f0',
    chartPlotBg: 'rgba(15, 23, 42, 0.04)',
    tooltipBg: '#ffffff',
    headerGradientStart: '#ffffff',
    headerGradientEnd: '#f8fafc',
    chartBgStart: '#f1f5f9',
    chartBgEnd: '#e2e8f0',
    mapOceanStart: '#e8eef5',
    mapOceanEnd: '#dce4ef',
    sectionLabel: '#2563eb',
    inputBg: 'rgba(15, 23, 42, 0.03)',
    cardShadow: '0 8px 24px rgba(15, 23, 42, 0.08), 0 2px 6px rgba(15, 23, 42, 0.04)',
    cardHoverShadow: '0 12px 32px rgba(15, 23, 42, 0.10), 0 2px 8px rgba(15, 23, 42, 0.05)',
    glassShadow:
      '0 8px 24px rgba(15, 23, 42, 0.08), 0 2px 6px rgba(15, 23, 42, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
    gridStroke: 'rgba(15, 23, 42, 0.08)',
    treemapStroke: 'rgba(15, 23, 42, 0.12)',
  },
};

/** @deprecated use useAppColors() — kept for any static imports */
export const colors = paletteTokens.dark;

export function getChartColors(c) {
  return [
    c.primary,
    c.secondary,
    c.warning,
    c.error,
    '#8b9dff',
    '#5eead4',
    '#ffd166',
    '#ff8fab',
  ];
}

export function getGlassCard(c) {
  return {
    background: c.card,
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: `1px solid ${c.border}`,
    borderRadius: 16,
    boxShadow: c.glassShadow,
  };
}

export function getChartPlotBox(c, mode) {
  const insetBorder = mode === 'light' ? alpha('#0f172a', 0.08) : alpha('#ffffff', 0.06);
  return {
    position: 'relative',
    width: '100%',
    borderRadius: 2,
    overflow: 'hidden',
    boxShadow: `inset 0 0 0 1px ${insetBorder}`,
    bgcolor: c.chartPlotBg,
  };
}

export function getChartTooltipBox(c) {
  return {
    bgcolor: alpha(c.tooltipBg, 0.96),
    border: `1px solid ${alpha(c.primary, 0.28)}`,
    borderRadius: 2,
    p: 1.5,
    pointerEvents: 'none',
    zIndex: 5,
    boxShadow: `0 12px 32px ${alpha('#000', 0.12)}, 0 0 24px ${alpha(c.primary, 0.08)}`,
  };
}

export function getActiveFilterChipSx(c, accent = c.primary) {
  return {
    height: 26,
    fontSize: '0.7rem',
    fontWeight: 700,
    bgcolor: alpha(accent, 0.14),
    border: `1px solid ${alpha(accent, 0.35)}`,
    color: c.textPrimary,
    boxShadow: `0 0 16px ${alpha(accent, 0.12)}`,
    '& .MuiChip-deleteIcon': {
      color: alpha(accent, 0.85),
      '&:hover': { color: accent },
    },
  };
}

export function getSelectedFilterChipSx(c) {
  return {
    fontWeight: 700,
    color: c.warning,
    border: `1px solid ${alpha(c.warning, 0.45)}`,
    bgcolor: alpha(c.warning, 0.14),
    boxShadow: `0 0 18px ${alpha(c.warning, 0.18)}`,
  };
}

function getBodyBackground(c, mode) {
  if (mode === 'light') {
    return `
      radial-gradient(ellipse 80% 50% at 15% -10%, ${alpha(c.primary, 0.08)} 0%, transparent 55%),
      radial-gradient(ellipse 60% 45% at 95% 5%, ${alpha(c.secondary, 0.06)} 0%, transparent 50%),
      linear-gradient(165deg, #eef3f8 0%, ${c.background} 40%, #f5f7fb 100%)
    `;
  }
  return `
    radial-gradient(ellipse 80% 50% at 15% -10%, ${alpha(c.primary, 0.18)} 0%, transparent 55%),
    radial-gradient(ellipse 60% 45% at 95% 5%, ${alpha(c.secondary, 0.12)} 0%, transparent 50%),
    radial-gradient(ellipse 70% 40% at 50% 105%, ${alpha(c.primary, 0.08)} 0%, transparent 45%),
    radial-gradient(circle at 70% 40%, ${alpha('#a78bfa', 0.04)} 0%, transparent 30%),
    linear-gradient(165deg, #050c16 0%, #07111f 35%, #0a1628 55%, #07111f 100%)
  `;
}

export function createAppTheme(mode = 'dark') {
  const c = paletteTokens[mode];
  const isLight = mode === 'light';

  return createTheme({
    palette: {
      mode,
      primary: {
        main: c.primary,
        light: isLight ? '#60a5fa' : '#7dbaff',
        dark: isLight ? '#1d4ed8' : '#2d7fd4',
        contrastText: isLight ? '#ffffff' : '#07111f',
      },
      secondary: {
        main: c.secondary,
        light: isLight ? '#22d3ee' : '#6af0e4',
        dark: isLight ? '#0e7490' : '#1fb8aa',
        contrastText: isLight ? '#ffffff' : '#07111f',
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
        hover: alpha(c.primary, isLight ? 0.06 : 0.08),
        selected: alpha(c.primary, isLight ? 0.1 : 0.14),
        disabled: c.textMuted,
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
            backgroundColor: c.background,
            backgroundImage: getBodyBackground(c, mode),
            backgroundAttachment: 'fixed',
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
            backgroundColor: c.card,
            border: `1px solid ${c.border}`,
            backdropFilter: 'blur(16px)',
          },
          rounded: { borderRadius: 16 },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: c.card,
            border: `1px solid ${c.border}`,
            borderRadius: 16,
            boxShadow: c.cardShadow,
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: { borderRadius: 12, paddingInline: 18 },
          containedPrimary: {
            boxShadow: `0 8px 24px ${alpha(c.primary, isLight ? 0.18 : 0.28)}`,
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { fontWeight: 600, borderRadius: 10 },
          outlined: { borderColor: c.border },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            backgroundColor: c.inputBg,
            '& .MuiOutlinedInput-notchedOutline': { borderColor: c.border },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: alpha(c.primary, 0.45),
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
            backgroundColor: alpha(c.background, 0.96),
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
