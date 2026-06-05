import { Box, Typography, alpha } from '@mui/material';
import { getHomeTokens } from '../styles/homeTheme';

/** primary = normal, gold = medium delay, pink = high delay, cyan = open/unresolved */
const PINS = [
  { cx: 88, cy: 118, color: 'primary' },
  { cx: 128, cy: 92, color: 'primary' },
  { cx: 162, cy: 78, color: 'cyan' },
  { cx: 198, cy: 96, color: 'gold' },
  { cx: 238, cy: 112, color: 'pink' },
  { cx: 268, cy: 138, color: 'gold' },
  { cx: 148, cy: 132, color: 'primary' },
  { cx: 118, cy: 158, color: 'cyan' },
  { cx: 178, cy: 168, color: 'gold' },
  { cx: 222, cy: 152, color: 'primary' },
  { cx: 252, cy: 88, color: 'pink' },
  { cx: 210, cy: 124, color: 'gold', selected: true },
];

const SHAP_BARS = [
  { label: 'Agency history', w: '82%', color: 'primary' },
  { label: 'ZIP delay', w: '58%', color: 'gold' },
  { label: 'Workload', w: '42%', color: 'pink' },
];

const floatingCardSx = (t) => ({
  borderRadius: '12px',
  bgcolor: t.cardBg,
  border: `1px solid ${t.cardBorder}`,
  boxShadow: t.isLight
    ? '0 6px 24px rgba(15, 23, 42, 0.09)'
    : '0 6px 24px rgba(0, 0, 0, 0.32)',
});

function Pin({ pin, t }) {
  const color = t[pin.color] ?? t.primary;
  if (pin.selected) {
    return (
      <g>
        <circle cx={pin.cx} cy={pin.cy} r="14" fill="none" stroke={color} strokeWidth="2" opacity="0.45" />
        <circle cx={pin.cx} cy={pin.cy} r="10" fill="none" stroke={color} strokeWidth="1.5" opacity="0.7" />
        <circle cx={pin.cx} cy={pin.cy + 2} r="6.5" fill={alpha('#000', 0.1)} />
        <circle cx={pin.cx} cy={pin.cy} r="6" fill={color} />
        <circle cx={pin.cx} cy={pin.cy} r="2.2" fill="#fff" />
      </g>
    );
  }
  return (
    <g>
      <circle cx={pin.cx} cy={pin.cy + 1.5} r="5" fill={alpha('#000', 0.07)} />
      <circle cx={pin.cx} cy={pin.cy} r="4.5" fill={color} />
      <circle cx={pin.cx} cy={pin.cy} r="1.6" fill="#fff" />
    </g>
  );
}

export default function CivicLensHeroVisual({ mode = 'light' }) {
  const t = getHomeTokens(mode);
  const mapFill = alpha(t.primary, t.isLight ? 0.06 : 0.12);
  const mapStroke = alpha(t.primary, 0.2);

  return (
    <Box
      aria-hidden
      sx={{
        position: 'relative',
        width: '100%',
        maxWidth: { xs: 420, sm: 520, md: 580, lg: 620 },
        height: { xs: 330, sm: 360, md: 380 },
        mx: { xs: 'auto', md: 'auto' },
        ml: { md: 'auto' },
        mr: { md: 0 },
      }}
    >
      {/* Map layer — soft borough shapes + grid, no heavy outer box */}
      <Box
        sx={{
          position: 'absolute',
          inset: { xs: '6% 2% 6% 0', md: '4% 4% 4% 2%' },
          borderRadius: '18px',
          bgcolor: alpha(t.cardBg, t.isLight ? 0.55 : 0.35),
          border: `1px solid ${alpha(t.cardBorder, 0.7)}`,
          overflow: 'hidden',
        }}
      >
        <Box
          component="svg"
          viewBox="0 0 320 220"
          preserveAspectRatio="xMidYMid meet"
          sx={{ width: '100%', height: '100%', display: 'block' }}
        >
          {/* Coordinate grid */}
          {Array.from({ length: 7 }).map((_, i) => (
            <line
              key={`h${i}`}
              x1="12"
              y1={28 + i * 28}
              x2="308"
              y2={28 + i * 28}
              stroke={alpha(t.textMuted, 0.08)}
              strokeWidth="1"
            />
          ))}
          {Array.from({ length: 9 }).map((_, i) => (
            <line
              key={`v${i}`}
              x1={12 + i * 37}
              y1="28"
              x2={12 + i * 37}
              y2="192"
              stroke={alpha(t.textMuted, 0.08)}
              strokeWidth="1"
            />
          ))}

          {/* Simplified borough silhouettes */}
          <path
            d="M52 48 C62 38, 78 42, 84 58 C90 52, 98 56, 96 72 C102 88, 94 108, 82 118 C78 132, 64 128, 58 112 C48 98, 44 62, 52 48 Z"
            fill={mapFill}
            stroke={mapStroke}
            strokeWidth="1"
          />
          <path
            d="M98 44 C118 36, 148 40, 162 58 C178 48, 208 52, 218 72 C232 66, 252 74, 258 94 C268 88, 282 100, 276 118 C286 132, 272 148, 252 144 C238 162, 208 168, 188 154 C168 166, 138 160, 122 142 C104 148, 88 132, 92 112 C84 96, 88 58, 98 44 Z"
            fill={alpha(t.cyan, t.isLight ? 0.05 : 0.1)}
            stroke={alpha(t.cyan, 0.18)}
            strokeWidth="1"
          />
          <path
            d="M108 148 C132 138, 168 142, 188 158 C212 152, 242 160, 258 178 C268 192, 248 204, 222 198 C198 210, 162 206, 142 190 C118 196, 98 178, 104 158 Z"
            fill={alpha(t.primary, t.isLight ? 0.04 : 0.08)}
            stroke={alpha(t.primary, 0.15)}
            strokeWidth="1"
          />
          <path
            d="M24 158 C34 148, 52 152, 58 168 C54 182, 38 188, 28 176 C20 168, 18 166, 24 158 Z"
            fill={alpha(t.textMuted, 0.06)}
            stroke={alpha(t.textMuted, 0.12)}
            strokeWidth="0.8"
          />

          {PINS.map((pin, i) => (
            <Pin key={i} pin={pin} t={t} />
          ))}
        </Box>

        <Typography
          sx={{
            position: 'absolute',
            top: 10,
            left: 12,
            fontSize: '0.58rem',
            fontWeight: 700,
            letterSpacing: '0.07em',
            textTransform: 'uppercase',
            color: t.textMuted,
          }}
        >
          NYC 311 · Map
        </Typography>
      </Box>

      {/* Selected request tooltip */}
      <Box
        sx={{
          position: 'absolute',
          top: { xs: '22%', md: '20%' },
          left: { xs: '38%', md: '42%' },
          zIndex: 4,
          px: 1.1,
          py: 0.75,
          maxWidth: 118,
          ...floatingCardSx(t),
        }}
      >
        <Typography
          sx={{
            fontSize: '0.58rem',
            fontWeight: 800,
            letterSpacing: '0.04em',
            color: t.pink,
            lineHeight: 1.2,
            mb: 0.25,
          }}
        >
          HEAT/HOT WATER
        </Typography>
        <Typography sx={{ fontSize: '0.58rem', fontWeight: 600, color: t.textPrimary, lineHeight: 1.3 }}>
          Bronx 10457
        </Typography>
        <Typography sx={{ fontSize: '0.55rem', fontWeight: 600, color: t.textMuted }}>
          HPD
        </Typography>
      </Box>

      {/* Prediction card */}
      <Box
        sx={{
          position: 'absolute',
          top: { xs: 0, md: 4 },
          right: { xs: 0, md: -4 },
          zIndex: 5,
          width: { xs: 128, md: 138 },
          p: 1.25,
          ...floatingCardSx(t),
        }}
      >
        <Typography
          sx={{
            fontSize: '0.55rem',
            fontWeight: 700,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            color: t.textMuted,
            mb: 0.5,
          }}
        >
          Predicted delay
        </Typography>
        <Typography
          sx={{
            fontSize: '1.15rem',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            color: t.textPrimary,
            lineHeight: 1,
          }}
        >
          85 hours
        </Typography>
        <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: t.gold, mt: 0.35 }}>
          3–7 Days
        </Typography>
        <Box
          sx={{
            mt: 0.75,
            display: 'inline-block',
            px: 0.75,
            py: 0.2,
            borderRadius: '6px',
            bgcolor: alpha(t.pink, t.isLight ? 0.1 : 0.18),
            border: `1px solid ${alpha(t.pink, 0.35)}`,
          }}
        >
          <Typography sx={{ fontSize: '0.55rem', fontWeight: 700, color: t.pink }}>
            High Risk
          </Typography>
        </Box>
      </Box>

      {/* SHAP explanation card */}
      <Box
        sx={{
          position: 'absolute',
          bottom: { xs: 10, md: 6 },
          left: { xs: -4, md: -8 },
          zIndex: 5,
          width: { xs: 138, md: 152 },
          p: 1.25,
          ...floatingCardSx(t),
        }}
      >
        <Typography
          sx={{
            fontSize: '0.55rem',
            fontWeight: 700,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            color: t.textMuted,
            mb: 0.75,
          }}
        >
          Delay drivers
        </Typography>
        {SHAP_BARS.map((bar) => (
          <Box key={bar.label} sx={{ mb: 0.55 }}>
            <Typography sx={{ fontSize: '0.52rem', fontWeight: 600, color: t.textSecondary, mb: 0.2 }}>
              {bar.label}
            </Typography>
            <Box sx={{ height: 4, borderRadius: 99, bgcolor: alpha(t.textMuted, 0.1) }}>
              <Box
                sx={{
                  width: bar.w,
                  height: '100%',
                  borderRadius: 99,
                  bgcolor: t[bar.color],
                }}
              />
            </Box>
          </Box>
        ))}
      </Box>

      {/* Dashboard mini-card */}
      <Box
        sx={{
          position: 'absolute',
          bottom: { xs: 10, md: 6 },
          right: { xs: 0, md: -6 },
          zIndex: 4,
          width: { xs: 132, md: 148 },
          p: 1.25,
          ...floatingCardSx(t),
        }}
      >
        <Typography
          sx={{
            fontSize: '0.55rem',
            fontWeight: 700,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            color: t.textMuted,
            mb: 0.6,
          }}
        >
          Service burden
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.35 }}>
          <Typography sx={{ fontSize: '0.58rem', color: t.textSecondary }}>Unresolved</Typography>
          <Typography sx={{ fontSize: '0.58rem', fontWeight: 700, color: t.cyan }}>18%</Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
          <Typography sx={{ fontSize: '0.58rem', color: t.textSecondary }}>Avg response</Typography>
          <Typography sx={{ fontSize: '0.58rem', fontWeight: 700, color: t.textPrimary }}>4.6d</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 0.4, height: 22 }}>
          {[6, 10, 8, 14, 11, 16, 12].map((h, i) => (
            <Box
              key={i}
              sx={{
                flex: 1,
                height: h,
                borderRadius: '2px',
                bgcolor: i === 5 ? t.gold : alpha(t.primary, 0.35),
              }}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
}
