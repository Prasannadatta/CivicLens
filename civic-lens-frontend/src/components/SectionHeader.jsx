import { Box, Typography } from '@mui/material';
import { useAppColors } from '../ColorModeContext';
import { cardSubtitleSx, cardTitleSx, smallMetaSx } from '../styles/modelViewLayout';

export default function SectionHeader({ label, title, subtitle, sx }) {
  const colors = useAppColors();

  return (
    <Box sx={{ mb: 1.75, ...sx }}>
      {label ? (
        <Typography
          variant="overline"
          sx={{
            ...smallMetaSx,
            display: 'block',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: colors.sectionLabel,
          }}
        >
          {label}
        </Typography>
      ) : null}
      <Typography
        variant="h6"
        sx={{
          ...cardTitleSx,
          color: colors.textPrimary,
          mt: label ? 0.35 : 0,
          minWidth: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {title}
      </Typography>
      {subtitle ? (
        <Typography variant="body2" sx={{ ...cardSubtitleSx, color: colors.textSecondary, mt: 0.45 }}>
          {subtitle}
        </Typography>
      ) : null}
    </Box>
  );
}
