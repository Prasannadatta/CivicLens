import { Box, Typography, alpha } from '@mui/material';
import { getHomeTokens } from '../styles/homeTheme';

function MiniMapVisual({ t }) {
  return (
    <Box
      component="svg"
      viewBox="0 0 120 80"
      sx={{ width: '100%', maxWidth: 140, height: 80 }}
    >
      <path
        d="M12 18 C28 10, 48 14, 58 28 C72 22, 92 26, 98 42 C108 38, 112 54, 102 62 C108 72, 94 76, 82 72 C72 78, 56 80, 44 72 C32 76, 18 70, 14 58 C8 54, 6 42, 12 34 C6 28, 8 22, 12 18 Z"
        fill={alpha(t.primary, 0.1)}
        stroke={alpha(t.primary, 0.25)}
      />
      <circle cx="44" cy="42" r="4" fill={t.pink} />
      <circle cx="72" cy="34" r="3.5" fill={t.cyan} />
      <circle cx="58" cy="54" r="3" fill={t.gold} />
    </Box>
  );
}

function MiniShapVisual({ t }) {
  return (
    <Box sx={{ width: '100%', maxWidth: 140, py: 0.5 }}>
      {[
        { w: '85%', c: t.primary, dir: 'right' },
        { w: '60%', c: t.cyan, dir: 'right' },
        { w: '45%', c: t.pink, dir: 'left' },
      ].map((bar, i) => (
        <Box key={i} sx={{ display: 'flex', justifyContent: bar.dir === 'left' ? 'flex-end' : 'flex-start', mb: 0.6 }}>
          <Box sx={{ width: bar.w, height: 7, borderRadius: 99, bgcolor: bar.c, opacity: 0.85 }} />
        </Box>
      ))}
    </Box>
  );
}

function MiniBurdenVisual({ t }) {
  return (
    <Box
      component="svg"
      viewBox="0 0 120 80"
      sx={{ width: '100%', maxWidth: 140, height: 80 }}
    >
      {[32, 48, 28, 56, 40].map((h, i) => (
        <rect
          key={i}
          x={14 + i * 20}
          y={68 - h}
          width="12"
          height={h}
          rx="4"
          fill={i === 3 ? t.gold : i % 2 === 0 ? t.primary : t.cyan}
          opacity="0.8"
        />
      ))}
    </Box>
  );
}

const VISUALS = {
  map: MiniMapVisual,
  model: MiniShapVisual,
  burden: MiniBurdenVisual,
};

const ACCENT = {
  map: 'cyan',
  model: 'pink',
  burden: 'gold',
};

export default function HomeFeatureBlock({ title, text, variant = 'map', offset = 0, mode }) {
  const t = getHomeTokens(mode);
  const Visual = VISUALS[variant] ?? MiniMapVisual;
  const accent = t[ACCENT[variant] ?? 'primary'];

  return (
    <Box
      sx={{
        position: 'relative',
        mt: offset ? { xs: 0, md: offset } : 0,
        ml: offset ? { xs: 0, md: offset > 0 ? 2 : 0 } : 0,
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          width: 120,
          height: 120,
          top: -24,
          right: -16,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(accent, 0.14)} 0%, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />
      <Box
        sx={{
          position: 'relative',
          p: { xs: 2.5, md: 3 },
          borderRadius: '28px',
          bgcolor: t.cardBg,
          border: `1px solid ${t.cardBorder}`,
          boxShadow: t.shadow,
          backdropFilter: 'blur(8px)',
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: { xs: 2, sm: 3 },
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            flexShrink: 0,
            width: { xs: '100%', sm: 148 },
            p: 1.5,
            borderRadius: '20px',
            bgcolor: alpha(accent, t.isLight ? 0.06 : 0.12),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Visual t={t} />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography
            sx={{
              fontWeight: 800,
              fontSize: '1.05rem',
              letterSpacing: '-0.02em',
              color: t.textPrimary,
              mb: 0.75,
            }}
          >
            {title}
          </Typography>
          <Typography sx={{ fontSize: '0.875rem', lineHeight: 1.55, color: t.textSecondary, maxWidth: 420 }}>
            {text}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
