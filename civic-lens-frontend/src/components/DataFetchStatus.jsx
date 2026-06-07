import { Alert, Box, CircularProgress, Typography, alpha } from '@mui/material';
import { useAppColors } from '../ColorModeContext';

export function DataLoadingState({ message = 'Loading requests from API…' }) {
  const colors = useAppColors();
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        py: 2,
        color: colors.textSecondary,
      }}
    >
      <CircularProgress size={18} thickness={5} />
      <Typography variant="body2">{message}</Typography>
    </Box>
  );
}

export function DataErrorState({ error, onRetry }) {
  const colors = useAppColors();
  const message = error?.message || String(error || 'Failed to load data');

  return (
    <Alert
      severity="error"
      variant="outlined"
      action={onRetry ? (
        <Typography
          component="button"
          type="button"
          onClick={onRetry}
          sx={{
            border: 0,
            background: 'none',
            cursor: 'pointer',
            color: colors.error,
            fontWeight: 600,
            fontSize: '0.8125rem',
          }}
        >
          Retry
        </Typography>
      ) : null}
      sx={{
        borderColor: alpha(colors.error, 0.35),
        bgcolor: alpha(colors.error, 0.05),
        color: colors.textPrimary,
        '& .MuiAlert-icon': { color: colors.error },
      }}
    >
      Backend unavailable — start the API server on port 5001 and ensure MongoDB is running.
      {' '}
      {message}
    </Alert>
  );
}

export function DataEmptyState({ message = 'No requests returned from the API.' }) {
  const colors = useAppColors();
  return (
    <Alert
      severity="info"
      variant="outlined"
      sx={{
        borderColor: alpha(colors.primary, 0.35),
        bgcolor: alpha(colors.primary, 0.05),
        color: colors.textPrimary,
        '& .MuiAlert-icon': { color: colors.primary },
      }}
    >
      {message}
    </Alert>
  );
}
