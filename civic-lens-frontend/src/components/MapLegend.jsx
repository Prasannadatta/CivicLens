import { Box, Stack, Typography, alpha } from '@mui/material';
import { useAppColors, useColorMode } from '../ColorModeContext';
import { resolveAppAccent } from './AppCard';
import {
  DELAY_BUCKET_LABELS,
  getDelayBucketColor,
  getMapPalette,
} from '../utils/mapHelpers';

function truncateLabel(text, max = 22) {
  const value = String(text ?? '');
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}

function LegendItem({ color, label, colors }) {
  return (
    <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
      <Box
        sx={{
          width: 9,
          height: 9,
          borderRadius: '50%',
          bgcolor: color,
          border: `1.5px solid ${colors.cardSurface}`,
          boxShadow: `0 0 0 1px ${color}`,
          flexShrink: 0,
          opacity: 0.9,
        }}
      />
      <Typography
        variant="caption"
        title={label}
        sx={{ color: colors.textSecondary, fontSize: '0.68rem', lineHeight: 1.2 }}
      >
        {truncateLabel(label)}
      </Typography>
    </Stack>
  );
}

export default function MapLegend({ colorMode, complaintLegend = [], otherColor }) {
  const colors = useAppColors();
  const { mode } = useColorMode();
  const mapPalette = getMapPalette(mode);
  const cyanAccent = resolveAppAccent('map', colors);
  const resolvedOtherColor = otherColor ?? mapPalette.gray;

  const items = colorMode === 'complaintType'
    ? [
        ...complaintLegend.map(({ type, color }) => ({ color, label: type })),
        { color: resolvedOtherColor, label: 'Other' },
      ]
    : DELAY_BUCKET_LABELS.map((label) => ({
        color: getDelayBucketColor(label, mode),
        label,
      }));

  return (
    <Box
      sx={{
        position: 'absolute',
        bottom: 14,
        left: 14,
        zIndex: 1000,
        width: 'auto',
        maxWidth: 'calc(100% - 28px)',
        pointerEvents: 'none',
        p: '12px 14px',
        borderRadius: '14px',
        bgcolor: alpha(colors.cardSurface, 0.96),
        border: `1px solid ${colors.border}`,
        boxShadow: `0 4px 16px ${alpha('#000', mode === 'light' ? 0.08 : 0.2)}`,
        backdropFilter: 'blur(12px)',
      }}
    >
      <Typography
        variant="caption"
        sx={{
          display: 'block',
          mb: 0.75,
          fontWeight: 700,
          fontSize: '0.62rem',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: cyanAccent,
        }}
      >
        {colorMode === 'complaintType' ? 'Complaint Type' : 'Delay Bucket'}
      </Typography>
      <Stack
        direction="row"
        spacing={1.25}
        useFlexGap
        sx={{ flexWrap: 'wrap', rowGap: 0.5, columnGap: 1.25 }}
      >
        {items.map(({ color, label }) => (
          <LegendItem key={label} color={color} label={label} colors={colors} />
        ))}
      </Stack>
    </Box>
  );
}
