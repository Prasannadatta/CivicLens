import { Box, Button, Typography, alpha } from '@mui/material';

function MiniShapIllustration({ tokens }) {
  const bars = [
    { w: '78%', color: tokens.primary },
    { w: '56%', color: tokens.primary },
    { w: '38%', color: tokens.cyan },
    { w: '24%', color: tokens.cyan },
  ];

  return (
    <Box
      sx={{
        mt: 2.5,
        p: 1.5,
        borderRadius: '14px',
        border: `1px solid ${tokens.cardBorder}`,
        bgcolor: tokens.isLight ? '#f8fafc' : 'rgba(15, 23, 42, 0.35)',
      }}
    >
      <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: tokens.textSecondary, mb: 1 }}>
        Top delay factors
      </Typography>
      {bars.map((bar, i) => (
        <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.65 }}>
          <Box sx={{ width: 52, height: 6, borderRadius: 99, bgcolor: tokens.isLight ? '#e2e8f0' : 'rgba(148,163,184,0.12)' }}>
            <Box sx={{ width: bar.w, height: '100%', borderRadius: 99, bgcolor: bar.color, opacity: 0.85 }} />
          </Box>
          <Box sx={{ flex: 1, height: 1, bgcolor: tokens.cardBorder }} />
        </Box>
      ))}
      <Box sx={{ display: 'flex', gap: 0.75, mt: 1 }}>
        <Box sx={{ px: 0.75, py: 0.25, borderRadius: 1, fontSize: '0.6rem', fontWeight: 700, bgcolor: alpha(tokens.primary, 0.1), color: tokens.primary }}>
          3–7 Days
        </Box>
        <Box sx={{ px: 0.75, py: 0.25, borderRadius: 1, fontSize: '0.6rem', fontWeight: 600, color: tokens.textSecondary }}>
          85h pred.
        </Box>
      </Box>
    </Box>
  );
}

function MiniDashboardIllustration({ tokens }) {
  return (
    <Box
      sx={{
        mt: 2.5,
        p: 1.5,
        borderRadius: '14px',
        border: `1px solid ${tokens.cardBorder}`,
        bgcolor: tokens.isLight ? '#f8fafc' : 'rgba(15, 23, 42, 0.35)',
        display: 'grid',
        gridTemplateColumns: '1.2fr 1fr',
        gap: 1,
      }}
    >
      <Box
        sx={{
          borderRadius: '10px',
          border: `1px solid ${tokens.cardBorder}`,
          bgcolor: tokens.isLight ? '#fff' : 'rgba(30, 41, 59, 0.5)',
          p: 1,
          minHeight: 72,
        }}
      >
        <Box
          component="svg"
          viewBox="0 0 80 56"
          sx={{ width: '100%', height: 56 }}
        >
          <path
            d="M8 12 C18 6, 28 10, 34 18 C42 14, 52 16, 56 26 C64 24, 70 30, 68 38 C72 44, 66 50, 58 48 C52 54, 42 56, 34 50 C26 54, 16 50, 12 42 C6 40, 4 32, 8 26 C4 20, 6 14, 8 12 Z"
            fill={alpha(tokens.primary, 0.08)}
            stroke={alpha(tokens.primary, 0.25)}
            strokeWidth="1"
          />
          <circle cx="28" cy="30" r="2" fill={tokens.primary} opacity="0.5" />
          <circle cx="44" cy="24" r="2" fill={tokens.primary} opacity="0.7" />
          <circle cx="52" cy="36" r="2" fill={tokens.cyan} opacity="0.6" />
        </Box>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
        {[0.7, 0.45, 0.55].map((w, i) => (
          <Box key={i}>
            <Box sx={{ height: 5, width: `${w * 100}%`, borderRadius: 99, bgcolor: i === 0 ? tokens.primary : alpha(tokens.primary, 0.35) }} />
          </Box>
        ))}
        <Box sx={{ flex: 1, borderRadius: '8px', border: `1px solid ${tokens.cardBorder}`, mt: 0.25, position: 'relative', overflow: 'hidden' }}>
          <Box
            component="svg"
            viewBox="0 0 60 24"
            sx={{ width: '100%', height: '100%' }}
          >
            <polyline
              points="4,18 14,14 24,16 34,10 44,12 54,6"
              fill="none"
              stroke={tokens.cyan}
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default function HomePreviewCard({
  title,
  description,
  buttonLabel,
  onClick,
  variant = 'model',
  tokens,
}) {
  return (
    <Box
      sx={{
        p: { xs: 2.5, md: 3 },
        borderRadius: '18px',
        border: `1px solid ${tokens.cardBorder}`,
        bgcolor: tokens.cardBg,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Typography
        variant="h6"
        sx={{
          fontWeight: 700,
          fontSize: '1.05rem',
          color: tokens.textPrimary,
          letterSpacing: '-0.02em',
        }}
      >
        {title}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          mt: 1,
          color: tokens.textSecondary,
          fontSize: '0.875rem',
          lineHeight: 1.55,
          maxWidth: 420,
        }}
      >
        {description}
      </Typography>

      {variant === 'model' ? (
        <MiniShapIllustration tokens={tokens} />
      ) : (
        <MiniDashboardIllustration tokens={tokens} />
      )}

      <Box sx={{ mt: 'auto', pt: 2.5 }}>
        <Button
          variant={variant === 'dashboard' ? 'contained' : 'outlined'}
          onClick={onClick}
          sx={{
            borderRadius: '10px',
            px: 2,
            py: 0.85,
            fontSize: '0.84rem',
            textTransform: 'none',
            fontWeight: 600,
            ...(variant !== 'dashboard' && {
              borderColor: alpha(tokens.primary, 0.35),
              color: tokens.textPrimary,
              '&:hover': {
                borderColor: tokens.primary,
                bgcolor: alpha(tokens.primary, 0.06),
              },
            }),
          }}
        >
          {buttonLabel}
        </Button>
      </Box>
    </Box>
  );
}
