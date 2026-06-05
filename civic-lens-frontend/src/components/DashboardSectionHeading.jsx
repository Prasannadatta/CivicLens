import { Box, Typography } from '@mui/material';
import { useAppColors, useColorMode } from '../ColorModeContext';
import { getDashboardSemanticColors } from '../styles/dashboardColors';

export default function DashboardSectionHeading({ title, subtitle, sx }) {
  const colors = useAppColors();
  const { mode } = useColorMode();
  const semantic = getDashboardSemanticColors(colors, mode);

  return (
    <Box sx={{ mb: 0.25, ...sx }}>
      <Box sx={{ display: 'flex', alignItems: 'stretch', gap: 1.25 }}>
        <Box
          sx={{
            width: 3,
            borderRadius: 999,
            bgcolor: semantic.burden,
            flexShrink: 0,
            opacity: 0.85,
          }}
        />
        <Typography
          component="h2"
          sx={{
            fontWeight: 700,
            fontSize: { xs: '18px', md: '20px' },
            lineHeight: 1.25,
            letterSpacing: '-0.02em',
            color: colors.textPrimary,
          }}
        >
          {title}
        </Typography>
      </Box>
      {subtitle && (
        <Typography
          sx={{
            mt: 0.5,
            ml: 2.375,
            fontSize: { xs: '13px', md: '14px' },
            lineHeight: 1.5,
            color: semantic.muted,
            maxWidth: 720,
          }}
        >
          {subtitle}
        </Typography>
      )}
    </Box>
  );
}
