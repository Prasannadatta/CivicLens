import { Box, Chip, Stack, Typography, IconButton, Tooltip, alpha } from '@mui/material';
import LensBlurIcon from '@mui/icons-material/LensBlur';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import ScheduleIcon from '@mui/icons-material/Schedule';
import SpeedIcon from '@mui/icons-material/Speed';
import BubbleChartIcon from '@mui/icons-material/BubbleChart';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { useAppColors, useColorMode } from '../ColorModeContext';
import DashboardCard from './DashboardCard';

function FeatureBadge({ label, icon: Icon, color, textPrimary }) {
  return (
    <Chip
      icon={<Icon sx={{ fontSize: '16px !important', color: `${color} !important` }} />}
      label={label}
      size="small"
      sx={{
        height: 30,
        fontWeight: 600,
        fontSize: '0.72rem',
        color: textPrimary,
        bgcolor: alpha(color, 0.12),
        border: `1px solid ${alpha(color, 0.28)}`,
        backdropFilter: 'blur(8px)',
        '& .MuiChip-icon': { ml: '8px' },
      }}
    />
  );
}

export default function AppHeader({ totalRequests = 0, activeFilters = {}, compact = false }) {
  const colors = useAppColors();
  const { mode, toggleColorMode } = useColorMode();

  const featureBadges = [
    { label: 'NYC 311', icon: LocationCityIcon, color: colors.primary },
    { label: 'Delay Prediction', icon: ScheduleIcon, color: colors.secondary },
    { label: 'Burden Score', icon: SpeedIcon, color: colors.warning },
    { label: 'D3 Visual Analytics', icon: BubbleChartIcon, color: colors.error },
  ];

  return (
    <DashboardCard
      sx={{
        mb: compact ? 0 : 1.6,
        position: 'relative',
        overflow: 'hidden',
        background: `linear-gradient(145deg, ${alpha(colors.headerGradientStart, 0.92)} 0%, ${alpha(colors.headerGradientEnd, 0.9)} 100%)`,
      }}
      contentSx={{
        p: compact ? '16px 20px' : { xs: 2.2, md: 2.5 },
        '&:last-child': { pb: compact ? '16px' : { xs: 2.2, md: 2.5 } },
      }}
    >
      <Box
        sx={{
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            background: `
              radial-gradient(circle at 8% 20%, ${alpha(colors.primary, 0.18)} 0%, transparent 34%),
              radial-gradient(circle at 92% 0%, ${alpha(colors.secondary, 0.12)} 0%, transparent 30%)
            `,
            pointerEvents: 'none',
          },
        }}
      >
        <Stack
          sx={{
            position: 'relative',
            zIndex: 1,
            gap: compact ? 0 : 1.6,
          }}
        >
          <Stack
            direction={{ xs: 'column', lg: 'row' }}
            spacing={compact ? 1.5 : 2.5}
            sx={{
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%',
              minHeight: compact ? 52 : undefined,
            }}
          >
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', flex: 1, minWidth: 0 }}>
              <Box
                sx={{
                  width: compact ? 36 : 44,
                  height: compact ? 36 : 44,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  background: `linear-gradient(145deg, ${alpha(colors.primary, 0.28)}, ${alpha(colors.secondary, 0.18)})`,
                  border: `1px solid ${alpha(colors.textPrimary, 0.12)}`,
                  boxShadow: `0 6px 18px ${alpha(colors.primary, 0.2)}`,
                }}
              >
                <LensBlurIcon sx={{ color: colors.primary, fontSize: compact ? 22 : 24 }} />
              </Box>

              <Box sx={{ minWidth: 0 }}>
                <Typography
                  variant={compact ? 'h6' : 'h5'}
                  component="h1"
                  sx={{
                    fontWeight: 800,
                    letterSpacing: '-0.02em',
                    lineHeight: 1.15,
                    fontSize: compact ? '1.5rem' : undefined,
                    background: `linear-gradient(90deg, ${colors.textPrimary} 0%, ${alpha(colors.primary, 0.95)} 100%)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Civic Lens
                </Typography>

                <Typography
                  variant="body2"
                  noWrap={compact}
                  sx={{
                    color: colors.textSecondary,
                    maxWidth: 760,
                    lineHeight: 1.35,
                    fontSize: compact ? '0.875rem' : { xs: '0.88rem', md: '0.95rem' },
                    mt: 0.25,
                    overflow: compact ? 'hidden' : 'visible',
                    textOverflow: compact ? 'ellipsis' : 'unset',
                  }}
                >
                  {compact
                    ? 'NYC 311 service delay analytics'
                    : 'Visual Analytics for NYC 311 Service Delays and Neighborhood Infrastructure Stress'}
                </Typography>
              </Box>
            </Stack>

            <Tooltip title={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
              <IconButton
                onClick={toggleColorMode}
                size="small"
                aria-label="Toggle color mode"
                sx={{
                  color: colors.textSecondary,
                  border: `1px solid ${colors.border}`,
                  bgcolor: alpha(colors.primary, 0.06),
                  '&:hover': {
                    bgcolor: alpha(colors.primary, 0.12),
                    color: colors.primary,
                  },
                }}
              >
                {mode === 'dark' ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
          </Stack>

          {!compact && (
            <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
              {featureBadges.map((badge) => (
                <FeatureBadge key={badge.label} {...badge} textPrimary={colors.textPrimary} />
              ))}
            </Stack>
          )}
        </Stack>
      </Box>
    </DashboardCard>
  );
}
