import { Box, LinearProgress, alpha } from '@mui/material';
import { useAppColors } from '../ColorModeContext';
import { getPageAccentColor } from '../styles/pageAccents';

const BAR_HEIGHT = 3;

export default function PageLoadingBar({ loading = false, page = 'dashboard' }) {
  const colors = useAppColors();
  const accent = getPageAccentColor(colors, page);

  return (
    <Box
      sx={{
        height: BAR_HEIGHT,
        flexShrink: 0,
        overflow: 'hidden',
        borderRadius: '2px',
      }}
      aria-hidden={!loading}
    >
      {loading ? (
        <LinearProgress
          sx={{
            height: BAR_HEIGHT,
            borderRadius: '2px',
            bgcolor: alpha(accent, 0.14),
            '& .MuiLinearProgress-bar': {
              borderRadius: '2px',
              bgcolor: accent,
            },
          }}
        />
      ) : null}
    </Box>
  );
}
