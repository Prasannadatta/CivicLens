import { Box, Typography } from '@mui/material';
import { useAppColors } from '../ColorModeContext';

export default function SectionHeader({ label, title, subtitle, sx }) {
  const colors = useAppColors();

  return (
    <Box sx={{ mb: 1.75, ...sx }}>
      {label ? (
        <Typography
          variant="overline"
          sx={{
            display: 'block',
            letterSpacing: '0.12em',
            fontWeight: 700,
            color: colors.sectionLabel,
            fontSize: '0.62rem',
          }}
        >
          {label}
        </Typography>
      ) : null}
      <Typography variant="h6" sx={{ fontWeight: 700, color: colors.textPrimary, lineHeight: 1.2, mt: 0.35 }}>
        {title}
      </Typography>
      {subtitle ? (
        <Typography variant="body2" sx={{ color: colors.textSecondary, mt: 0.45, fontSize: '0.84rem' }}>
          {subtitle}
        </Typography>
      ) : null}
    </Box>
  );
}
