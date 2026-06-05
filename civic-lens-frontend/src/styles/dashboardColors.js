import { alpha, darken, lighten } from '@mui/material/styles';

export const ALL_BOROUGHS = ['Bronx', 'Manhattan', 'Queens', 'Brooklyn', 'Staten Island'];

const BOROUGH_ALIASES = {
  bronx: 'Bronx',
  manhattan: 'Manhattan',
  queens: 'Queens',
  brooklyn: 'Brooklyn',
  'staten island': 'Staten Island',
  'staten is': 'Staten Island',
  'staten isle': 'Staten Island',
};

/** Borough identity palette — soft pastels, distinct from theme cyan/yellow/pink/blue. */
const BOROUGH_COLORS = {
  light: {
    Manhattan: '#8b8cf6',
    Brooklyn: '#5ecfb1',
    Queens: '#c49a6c',
    Bronx: '#e88ab1',
    'Staten Island': '#9aa7b8',
  },
  dark: {
    Manhattan: '#a5b4fc',
    Brooklyn: '#7dd3c7',
    Queens: '#d6b184',
    Bronx: '#f0a3c4',
    'Staten Island': '#cbd5e1',
  },
};

export const DASHBOARD_NEUTRAL_YELLOW = {
  light: '#f59e0b',
  dark: '#fbbf24',
};

/** Default all-borough yellow shades — softest (map) → strongest (complaint). */
const DEFAULT_YELLOW_SHADES = {
  light: {
    map: alpha('#f59e0b', 0.35),
    timeline: '#f7c85f',
    complaint: '#f59e0b',
  },
  dark: {
    map: alpha('#fbbf24', 0.35),
    timeline: alpha('#fbbf24', 0.72),
    complaint: '#fbbf24',
  },
};

/** Risk/urgency red — distinct from Bronx borough pastel rose (#e88ab1). */
export const RISK_RED = {
  light: '#dc2626',
  dark: '#f87171',
};

const BOROUGH_LEGEND_SHORT = {
  Manhattan: 'Man.',
  Brooklyn: 'Bkln',
  Queens: 'Qns',
  Bronx: 'Bronx',
  'Staten Island': 'Staten',
};

export function normalizeBoroughName(name) {
  const key = String(name ?? '')
    .trim()
    .toLowerCase()
    .replace(/\./g, '')
    .replace(/\s+/g, ' ');
  return BOROUGH_ALIASES[key] || String(name ?? '').trim() || 'Unknown';
}

export function getBoroughColor(borough, mode = 'light') {
  const key = normalizeBoroughName(borough);
  const palette = mode === 'dark' ? BOROUGH_COLORS.dark : BOROUGH_COLORS.light;
  return palette[key] ?? (mode === 'dark' ? '#cbd5e1' : '#9aa7b8');
}

/**
 * Derived borough shade for coordinated dashboard visuals.
 * @param {'map'|'timeline'|'complaint'} variant
 */
export function getBoroughShade(borough, mode = 'light', variant = 'map') {
  const key = normalizeBoroughName(borough);
  const base = getBoroughColor(key, mode);
  const isLight = mode === 'light';

  if (variant === 'map') {
    return isLight ? alpha(lighten(base, 0.2), 0.65) : alpha(base, 0.45);
  }
  if (variant === 'timeline') {
    return isLight ? alpha(base, 0.68) : alpha(base, 0.76);
  }
  if (variant === 'complaint') {
    return isLight ? darken(base, 0.08) : base;
  }
  return base;
}

export function getDefaultBoroughShade(mode = 'light', variant = 'map') {
  const shades = mode === 'dark' ? DEFAULT_YELLOW_SHADES.dark : DEFAULT_YELLOW_SHADES.light;
  return shades[variant] ?? shades.complaint;
}

export function getSelectedBoroughShade(selectedBorough, mode = 'light', variant = 'map') {
  const raw = String(selectedBorough ?? '').trim();
  if (!raw || raw === 'All') return getDefaultBoroughShade(mode, variant);

  const key = normalizeBoroughName(raw);
  if (!ALL_BOROUGHS.includes(key)) return getDefaultBoroughShade(mode, variant);

  return getBoroughShade(key, mode, variant);
}

export function getSelectedBoroughColor(selectedBorough, mode = 'light', fallback = null) {
  const raw = String(selectedBorough ?? '').trim();
  if (!raw || raw === 'All') {
    if (fallback != null) return fallback;
    return mode === 'dark' ? DASHBOARD_NEUTRAL_YELLOW.dark : DASHBOARD_NEUTRAL_YELLOW.light;
  }
  const key = normalizeBoroughName(raw);
  if (!ALL_BOROUGHS.includes(key)) {
    if (fallback != null) return fallback;
    return mode === 'dark' ? DASHBOARD_NEUTRAL_YELLOW.dark : DASHBOARD_NEUTRAL_YELLOW.light;
  }
  return getBoroughColor(key, mode);
}

export function getComplaintBarColors(selectedBorough, mode = 'light') {
  const barColor = getSelectedBoroughShade(selectedBorough, mode, 'complaint');
  const isLight = mode === 'light';
  return {
    barFill: barColor,
    barTrack: alpha(barColor, isLight ? 0.14 : 0.22),
    barStroke: barColor,
  };
}

/** Medium borough shade for Delay Timeline request count bars. */
export function getTimelineRequestBarColor(selectedBorough, mode = 'light') {
  return getSelectedBoroughShade(selectedBorough, mode, 'timeline');
}

const TIMELINE_LINE_COLORS = {
  light: {
    response: '#2563eb',
    predicted: '#db2777',
    unresolved: '#dc2626',
  },
  dark: {
    response: '#93c5fd',
    predicted: '#f9a8d4',
    unresolved: '#fca5a5',
  },
};

export function getTimelineLineColors(mode = 'light') {
  return mode === 'dark' ? TIMELINE_LINE_COLORS.dark : TIMELINE_LINE_COLORS.light;
}

export function getBoroughStrokeColor(borough, mode = 'light') {
  const base = getBoroughColor(borough, mode);
  return alpha(base, mode === 'light' ? 0.88 : 0.92);
}

export function getBoroughLegendShort(borough) {
  const key = normalizeBoroughName(borough);
  return BOROUGH_LEGEND_SHORT[key] ?? key;
}

export function matchBoroughInText(text) {
  const value = String(text ?? '');
  return ALL_BOROUGHS.find((borough) => {
    const normalized = normalizeBoroughName(value);
    return normalized === borough || value.includes(borough);
  }) ?? null;
}

export function getRiskColor(mode = 'light') {
  return mode === 'dark' ? RISK_RED.dark : RISK_RED.light;
}

/** Neutral dashboard card/chart typography */
export function getDashboardCardText(mode = 'light') {
  return {
    title: mode === 'light' ? '#0f172a' : '#f8fafc',
    value: mode === 'light' ? '#0f172a' : '#f8fafc',
    muted: mode === 'light' ? '#64748b' : '#cbd5e1',
  };
}

/** Semantic Civic Lens colors for Dashboard charts/maps only. */
export function getDashboardSemanticColors(colors, mode) {
  const isLight = mode === 'light';
  const cardText = getDashboardCardText(mode);

  return {
    volume: colors.primary,
    spatial: colors.secondary,
    burden: colors.warning,
    predicted: colors.accentPink,
    urgent: getRiskColor(mode),
    text: cardText.value,
    title: cardText.title,
    muted: cardText.muted,
    grid: isLight ? 'rgba(100, 116, 139, 0.14)' : 'rgba(255, 255, 255, 0.12)',
    gridDiag: isLight ? 'rgba(100, 116, 139, 0.08)' : 'rgba(255, 255, 255, 0.06)',
    track: isLight ? 'rgba(100, 116, 139, 0.14)' : 'rgba(255, 255, 255, 0.12)',
    waterFill: isLight ? 'rgba(8, 145, 178, 0.08)' : 'rgba(34, 211, 238, 0.08)',
    waterStroke: isLight ? 'rgba(8, 145, 178, 0.14)' : 'rgba(34, 211, 238, 0.12)',
    mapPanelBg: isLight ? '#f8fafc' : '#1f2937',
    mapPanelBorder: isLight ? 'rgba(15, 23, 42, 0.08)' : 'rgba(148, 163, 184, 0.14)',
    shadowFloodColor: isLight ? '#0f172a' : '#000000',
    shadowFloodOpacity: isLight ? 0.16 : 0.28,
    barTrack: alpha(DASHBOARD_NEUTRAL_YELLOW[isLight ? 'light' : 'dark'], isLight ? 0.12 : 0.14),
    barFill: alpha(DASHBOARD_NEUTRAL_YELLOW[isLight ? 'light' : 'dark'], isLight ? 0.82 : 0.85),
    volumeBar: alpha(colors.primary, isLight ? 0.72 : 0.78),
    selectedOutline: colors.warning,
  };
}

/** Metric intensity → fill opacity for borough choropleth (hue = borough). */
export function getMetricFillOpacity(value, min, max) {
  const domainMin = min ?? 0;
  const domainMax = max === domainMin ? domainMin + 1 : max ?? 1;
  const t = (Number(value) - domainMin) / (domainMax - domainMin);
  const clamped = Math.max(0, Math.min(1, t));
  return 0.25 + clamped * 0.55;
}

/** Driver value color — borough names use borough hue; urgent metrics use risk red. */
export function getDriverValueColor(driver, mode, semantic) {
  const borough = matchBoroughInText(driver?.value);
  if (borough) return getBoroughColor(borough, mode);
  if (driver?.key === 'unresolved') return semantic.urgent;
  return semantic.text;
}

/** @deprecated use getDriverValueColor */
export function getDriverMetricColor(driverKey, semantic) {
  if (driverKey === 'unresolved') return semantic.urgent;
  return semantic.text;
}
