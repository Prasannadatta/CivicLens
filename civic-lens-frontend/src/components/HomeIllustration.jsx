import { Box, Chip, Typography, alpha } from '@mui/material';

function useIllustrationColors(mode) {
  const isLight = mode === 'light';
  return {
    surface: isLight ? 'rgba(255, 255, 255, 0.92)' : 'rgba(30, 41, 59, 0.65)',
    border: isLight ? 'rgba(15, 23, 42, 0.08)' : 'rgba(148, 163, 184, 0.14)',
    primary: isLight ? '#2563eb' : '#60a5fa',
    cyan: isLight ? '#0891b2' : '#22d3ee',
    muted: isLight ? '#94a3b8' : '#64748b',
    text: isLight ? '#0f172a' : '#e2e8f0',
    textSoft: isLight ? '#64748b' : '#94a3b8',
    dot: isLight ? '#2563eb' : '#60a5fa',
    barLow: isLight ? '#dbeafe' : 'rgba(96, 165, 250, 0.25)',
    barMid: isLight ? '#93c5fd' : 'rgba(96, 165, 250, 0.45)',
    barHigh: isLight ? '#2563eb' : '#60a5fa',
    line: isLight ? '#0891b2' : '#22d3ee',
    mapFill: isLight ? 'rgba(37, 99, 235, 0.06)' : 'rgba(96, 165, 250, 0.08)',
    mapStroke: isLight ? 'rgba(37, 99, 235, 0.22)' : 'rgba(96, 165, 250, 0.35)',
    shapPos: isLight ? '#2563eb' : '#60a5fa',
    shapNeg: isLight ? '#0891b2' : '#22d3ee',
  };
}

export default function HomeIllustration({ mode = 'light' }) {
  const c = useIllustrationColors(mode);

  return (
    <Box
      aria-hidden
      sx={{
        position: 'relative',
        width: '100%',
        maxWidth: 480,
        mx: { xs: 'auto', md: 0 },
        aspectRatio: { xs: '4 / 3.2', md: '5 / 4' },
        borderRadius: '22px',
        border: `1px solid ${c.border}`,
        bgcolor: c.surface,
        overflow: 'hidden',
        boxShadow: mode === 'light' ? '0 1px 3px rgba(15, 23, 42, 0.04)' : 'none',
      }}
    >
      <Box
        component="svg"
        viewBox="0 0 400 320"
        sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      >
        <rect x="0" y="0" width="400" height="320" fill="transparent" />

        {/* Map outline */}
        <path
          d="M72 88 C95 72, 118 78, 132 96 C148 82, 168 86, 178 104 C196 98, 214 108, 220 128 C238 122, 256 132, 258 152 C272 158, 280 176, 268 192 C276 210, 262 228, 242 224 C228 242, 204 248, 186 236 C168 248, 142 242, 128 224 C108 230, 88 218, 84 198 C68 188, 62 168, 72 152 C60 136, 58 108, 72 88 Z"
          fill={c.mapFill}
          stroke={c.mapStroke}
          strokeWidth="1.5"
        />

        {/* Coordinate dots */}
        {[
          [118, 132], [156, 148], [198, 126], [224, 168], [170, 188], [142, 196],
        ].map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r={3.5} fill={c.dot} opacity={0.35 + (i % 3) * 0.15} />
        ))}

        {/* Mini bar chart */}
        <rect x="48" y="248" width="108" height="52" rx="10" fill={mode === 'light' ? '#f8fafc' : 'rgba(15, 23, 42, 0.4)'} stroke={c.border} />
        {[28, 42, 18, 48, 34].map((h, i) => (
          <rect
            key={i}
            x={58 + i * 18}
            y={286 - h}
            width="10"
            height={h}
            rx="3"
            fill={i === 3 ? c.barHigh : i % 2 === 0 ? c.barMid : c.barLow}
          />
        ))}

        {/* Timeline line */}
        <rect x="168" y="248" width="108" height="52" rx="10" fill={mode === 'light' ? '#f8fafc' : 'rgba(15, 23, 42, 0.4)'} stroke={c.border} />
        <polyline
          points="182,282 202,268 222,274 242,256 262,262"
          fill="none"
          stroke={c.line}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="262" cy="262" r="3" fill={c.line} />
      </Box>

      {/* Prediction chip */}
      <Chip
        label="85h predicted"
        size="small"
        sx={{
          position: 'absolute',
          top: 28,
          right: 28,
          height: 26,
          fontSize: '0.7rem',
          fontWeight: 700,
          bgcolor: alpha(c.primary, mode === 'light' ? 0.1 : 0.18),
          color: c.primary,
          border: `1px solid ${alpha(c.primary, 0.25)}`,
          boxShadow: 'none',
        }}
      />

      {/* SHAP mock card */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 28,
          right: 24,
          width: 148,
          p: 1.25,
          borderRadius: '14px',
          border: `1px solid ${c.border}`,
          bgcolor: mode === 'light' ? 'rgba(255,255,255,0.95)' : 'rgba(15, 23, 42, 0.55)',
        }}
      >
        <Typography sx={{ fontSize: '0.62rem', fontWeight: 700, color: c.textSoft, mb: 0.75, letterSpacing: '0.04em' }}>
          SHAP factors
        </Typography>
        {[
          { label: 'Agency load', w: '72%', color: c.shapPos },
          { label: 'Borough avg', w: '48%', color: c.shapPos },
          { label: 'Hour of day', w: '32%', color: c.shapNeg },
        ].map((row) => (
          <Box key={row.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
            <Box sx={{ flex: 1, height: 5, borderRadius: 99, bgcolor: mode === 'light' ? '#e2e8f0' : 'rgba(148,163,184,0.15)' }}>
              <Box sx={{ width: row.w, height: '100%', borderRadius: 99, bgcolor: row.color }} />
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
