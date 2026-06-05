import { Box } from '@mui/material';

const PALETTE = {
  light: {
    ring: '#2563eb',
    handle: '#0891b2',
    cyan: '#0891b2',
    pink: '#ec4899',
    yellow: '#f59e0b',
  },
  dark: {
    ring: '#60a5fa',
    handle: '#22d3ee',
    cyan: '#22d3ee',
    pink: '#f472b6',
    yellow: '#fbbf24',
  },
};

/**
 * Minimal Civic Lens mark — lens ring, handle, data dots. No background.
 */
export default function CivicLensLogo({ size = 38, mode = 'light' }) {
  const p = PALETTE[mode === 'light' ? 'light' : 'dark'];

  return (
    <Box
      component="span"
      sx={{
        width: size,
        height: size,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
      aria-hidden
    >
      <Box
        component="svg"
        viewBox="0 0 64 64"
        fill="none"
        sx={{ width: size, height: size, display: 'block' }}
      >
        <circle cx="29" cy="29" r="17" stroke={p.ring} strokeWidth="5" fill="none" />
        <path
          d="M41.5 41.5L54 54"
          stroke={p.handle}
          strokeWidth="5"
          strokeLinecap="round"
        />
        <circle cx="23" cy="23" r="3.6" fill={p.cyan} />
        <circle cx="35" cy="22" r="3.3" fill={p.pink} />
        <circle cx="32" cy="36" r="3.5" fill={p.yellow} />
      </Box>
    </Box>
  );
}
