import { Box, CircularProgress, alpha } from '@mui/material';
import { useAppColors } from '../ColorModeContext';

export default function ChartLoadingOverlay({ loading = false, children }) {
  const colors = useAppColors();

  return (
    <Box sx={{ position: 'relative', height: '100%', width: '100%' }}>
      {children}
      {loading && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            zIndex: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: alpha(colors.cardSurface, 0.72),
            backdropFilter: 'blur(1px)',
          }}
        >
          <CircularProgress size={28} thickness={4} />
        </Box>
      )}
    </Box>
  );
}
