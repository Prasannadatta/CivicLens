import { Box, CircularProgress } from '@mui/material';

export default function ChartLoadingOverlay({ loading = false, children }) {
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
            bgcolor: 'rgba(255,255,255,0.55)',
          }}
        >
          <CircularProgress size={28} thickness={4} />
        </Box>
      )}
    </Box>
  );
}
