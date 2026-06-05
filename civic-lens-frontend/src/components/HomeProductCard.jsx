import { Box, Typography, alpha } from '@mui/material';
import MapOutlinedIcon from '@mui/icons-material/MapOutlined';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import PsychologyOutlinedIcon from '@mui/icons-material/PsychologyOutlined';
import { getHomeTokens } from '../styles/homeTheme';

const CONFIG = {
  map: { icon: MapOutlinedIcon, accentKey: 'cyan' },
  dashboard: { icon: DashboardOutlinedIcon, accentKey: 'gold' },
  model: { icon: PsychologyOutlinedIcon, accentKey: 'pink' },
};

export default function HomeProductCard({ label, title, text, variant = 'map', mode, onClick }) {
  const t = getHomeTokens(mode);
  const { icon: Icon, accentKey } = CONFIG[variant] ?? CONFIG.map;
  const accent = t[accentKey] ?? t.primary;

  return (
    <Box
      component={onClick ? 'button' : 'div'}
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      sx={{
        width: '100%',
        height: '100%',
        textAlign: 'left',
        p: 2.5,
        borderRadius: '20px',
        bgcolor: t.cardBg,
        border: `1px solid ${t.cardBorder}`,
        boxShadow: t.shadow,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease',
        ...(onClick && {
          '&:hover': {
            borderColor: alpha(accent, t.isLight ? 0.45 : 0.5),
            boxShadow: t.cardHoverShadow,
            transform: 'translateY(-2px)',
            '& .product-card-icon': {
              color: accent,
              borderColor: alpha(accent, 0.35),
            },
            '& .product-card-title': {
              color: accent,
            },
          },
        }),
      }}
    >
      {label && (
        <Typography
          sx={{
            fontSize: '0.65rem',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: accent,
            mb: 1,
          }}
        >
          {label}
        </Typography>
      )}
      <Box
        className="product-card-icon"
        sx={{
          width: 40,
          height: 40,
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 1.5,
          bgcolor: alpha(accent, t.isLight ? 0.08 : 0.14),
          border: `1px solid ${alpha(accent, t.isLight ? 0.16 : 0.22)}`,
          color: accent,
          transition: 'color 0.2s ease, border-color 0.2s ease',
        }}
      >
        <Icon sx={{ fontSize: 20 }} />
      </Box>
      <Typography
        className="product-card-title"
        sx={{
          fontWeight: 700,
          fontSize: '0.95rem',
          color: t.textPrimary,
          mb: 0.75,
          letterSpacing: '-0.01em',
          transition: 'color 0.2s ease',
        }}
      >
        {title}
      </Typography>
      <Typography sx={{ fontSize: '0.8125rem', lineHeight: 1.55, color: t.textSecondary }}>
        {text}
      </Typography>
    </Box>
  );
}
