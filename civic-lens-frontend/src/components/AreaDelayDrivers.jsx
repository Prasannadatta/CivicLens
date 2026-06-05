import { Box, Typography, alpha } from '@mui/material';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import { useAppColors, useColorMode } from '../ColorModeContext';
import AppCard, { AppCardIconPill } from './AppCard';
import { getDashboardSemanticColors, getDriverValueColor } from '../styles/dashboardColors';

export default function AreaDelayDrivers({ drivers = [] }) {
  const colors = useAppColors();
  const { mode } = useColorMode();
  const semantic = getDashboardSemanticColors(colors, mode);

  return (
    <AppCard
      accent="dashboard"
      compact
      contentSx={{ display: 'flex', flexDirection: 'column', gap: 1.25, flex: 1 }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
        <AppCardIconPill icon={TrendingUpOutlinedIcon} accentColor={semantic.burden} colors={colors} size="sm" />
        <Box sx={{ minWidth: 0 }}>
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: '0.9375rem',
              color: semantic.title,
              letterSpacing: '-0.01em',
            }}
          >
            Dashboard-level delay drivers
          </Typography>
          <Typography variant="caption" sx={{ color: semantic.muted, display: 'block', mt: 0.25 }}>
            Proxy signals from volume, delay, and backlog in the current slice.
          </Typography>
        </Box>
      </Box>

      {drivers.length === 0 ? (
        <Typography variant="body2" sx={{ color: semantic.muted, fontSize: '0.8125rem' }}>
          No driver signals for the current filters.
        </Typography>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {drivers.map((driver, index) => (
            <Box
              key={driver.key}
              sx={{
                display: 'flex',
                gap: 1.25,
                alignItems: 'flex-start',
                py: 0.75,
                borderBottom: index < drivers.length - 1 ? `1px solid ${alpha(semantic.track, 0.85)}` : 'none',
              }}
            >
              <Typography
                sx={{
                  fontWeight: 800,
                  fontSize: '0.6875rem',
                  color: semantic.muted,
                  minWidth: 16,
                  pt: 0.15,
                }}
              >
                {index + 1}
              </Typography>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography
                  sx={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: semantic.muted,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  {driver.label}
                </Typography>
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.8125rem',
                    color: getDriverValueColor(driver, mode, semantic),
                    mt: 0.25,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {driver.value}
                </Typography>
                <Typography variant="caption" sx={{ color: semantic.muted, display: 'block', mt: 0.15 }}>
                  {driver.detail}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </AppCard>
  );
}
