import { Box, Typography } from '@mui/material';
import { useAppColors } from '../ColorModeContext';
import { getPageAccentColor } from '../styles/pageAccents';
import {
  PAGE_INTRO_MB,
  pageEyebrowSx,
  pageSubtitleSx,
  pageTitleSx,
} from '../styles/modelViewLayout';

export default function PageIntro({ eyebrow, title, description, action, page, sx }) {
  const colors = useAppColors();
  const accent = page ? getPageAccentColor(colors, page) : colors.primary;

  return (
    <Box
      component="header"
      sx={{
        width: '100%',
        maxWidth: '100%',
        mb: PAGE_INTRO_MB,
        px: 0,
        py: 0,
        minWidth: 0,
        boxSizing: 'border-box',
        ...sx,
      }}
    >
      {eyebrow ? (
        <Typography
          variant="overline"
          sx={{
            ...pageEyebrowSx,
            color: accent,
          }}
        >
          {eyebrow}
        </Typography>
      ) : null}

      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 1.5,
          minWidth: 0,
        }}
      >
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            component="h1"
            sx={{
              ...pageTitleSx,
              color: colors.textPrimary,
            }}
          >
            {title}
          </Typography>

          {description ? (
            <Typography
              sx={{
                ...pageSubtitleSx,
                color: colors.textSecondary,
              }}
            >
              {description}
            </Typography>
          ) : null}
        </Box>

        {action ? (
          <Box sx={{ flexShrink: 0 }}>{action}</Box>
        ) : null}
      </Box>
    </Box>
  );
}
