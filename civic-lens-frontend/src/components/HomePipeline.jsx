import { Box, Typography, alpha } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { getHomeTokens } from '../styles/homeTheme';

const STEPS = [
  'NYC 311 Data',
  'Features',
  'CatBoost Model',
  'SHAP Explanation',
  'Map + Dashboard',
];

export default function HomePipeline({ mode }) {
  const t = getHomeTokens(mode);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', lg: 'row' },
        alignItems: { xs: 'stretch', lg: 'center' },
        gap: { xs: 0.75, lg: 0 },
        flexWrap: 'wrap',
      }}
    >
      {STEPS.map((label, i) => (
        <Box
          key={label}
          sx={{
            display: 'flex',
            alignItems: 'center',
            flex: { xs: '1 1 auto', lg: '0 1 auto' },
          }}
        >
          <Box
            sx={{
              px: 1.5,
              py: 0.75,
              borderRadius: '99px',
              bgcolor: t.cardBg,
              border: `1px solid ${t.cardBorder}`,
            }}
          >
            <Typography
              sx={{
                fontWeight: 600,
                fontSize: '0.75rem',
                color: t.textPrimary,
                whiteSpace: 'nowrap',
              }}
            >
              {label}
            </Typography>
          </Box>
          {i < STEPS.length - 1 && (
            <ArrowForwardIcon
              sx={{
                display: { xs: 'none', lg: 'block' },
                mx: 0.75,
                fontSize: 14,
                color: alpha(t.textMuted, 0.7),
              }}
            />
          )}
        </Box>
      ))}
    </Box>
  );
}
