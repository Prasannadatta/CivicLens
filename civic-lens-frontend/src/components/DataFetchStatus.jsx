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

export function DataErrorState({
  error,
  onRetry,
  message = 'Unable to load data. Please check the backend connection.',
}) {
  const colors = useAppColors();
  const detail = error?.message || (error ? String(error) : null);

  return (
    <Box
      sx={{
        p: '24px',
        borderRadius: '22px',
        bgcolor: colors.cardSurface,
        border: `1px solid ${alpha(colors.error, 0.35)}`,
        boxShadow: colors.cardShadow,
      }}
    >
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
          border: 'none',
          p: 0,
          bgcolor: 'transparent',
          color: colors.textPrimary,
          '& .MuiAlert-icon': { color: colors.error },
          '& .MuiAlert-message': { width: '100%' },
        }}
      >
        {message}
        {detail ? (
          <Typography variant="caption" display="block" sx={{ mt: 0.75, color: colors.textSecondary }}>
            {detail}
          </Typography>
        ) : null}
      </Alert>
    </Box>
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
