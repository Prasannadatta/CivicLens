import { Box, Stack, Typography } from '@mui/material';
import { useAppColors } from '../ColorModeContext';
import { LAYOUT_FOOTER_HEIGHT, PAGE_PADDING_X, contentContainerSx } from '../styles/modelViewLayout';

export default function AppFooter() {
  const colors = useAppColors();

  const shellBg = colors.shellBg;

  return (
    <Box
      component="footer"
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1090,
        height: LAYOUT_FOOTER_HEIGHT,
        flexShrink: 0,
        bgcolor: shellBg,
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderTop: `1px solid ${colors.border}`,
      }}
    >
      <Box
        sx={{
          height: '100%',
          ...contentContainerSx,
          px: PAGE_PADDING_X,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Stack
          direction="row"
          spacing={1}
          sx={{
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          <Typography
            sx={{
              fontSize: { xs: '0.72rem', sm: '0.78rem' },
              color: colors.textSecondary,
              letterSpacing: '0.02em',
              whiteSpace: 'nowrap',
            }}
          >
            Civic Lens · Team 18 · ECS 273
          </Typography>
          <Typography
            sx={{
              display: { xs: 'none', sm: 'block' },
              fontSize: '0.72rem',
              color: colors.textSecondary,
              letterSpacing: '0.02em',
              whiteSpace: 'nowrap',
            }}
          >
            NYC 311 Visual Analytics
          </Typography>
        </Stack>
      </Box>
    </Box>
  );
}
