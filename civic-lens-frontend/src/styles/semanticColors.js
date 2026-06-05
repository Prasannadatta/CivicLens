/** Semantic color tokens — same concept = same color app-wide */
export const SEMANTIC_COLORS = {
  light: {
    cyan: '#0891b2',
    blue: '#2563eb',
    yellow: '#f59e0b',
    pink: '#ec4899',
    red: '#dc2626',
    gray: '#64748b',
  },
  dark: {
    cyan: '#22d3ee',
    blue: '#60a5fa',
    yellow: '#fbbf24',
    pink: '#f472b6',
    red: '#f87171',
    gray: '#94a3b8',
  },
};

export function getSemanticColors(mode = 'light') {
  return SEMANTIC_COLORS[mode] ?? SEMANTIC_COLORS.light;
}
