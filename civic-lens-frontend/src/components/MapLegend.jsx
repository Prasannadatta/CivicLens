import { Box, Stack, Typography, alpha } from '@mui/material';
import { useAppColors } from '../ColorModeContext';
import {
  DELAY_BUCKET_COLORS,
  DELAY_BUCKET_LABELS,
  getDelayBucketColor,
} from '../utils/mapHelpers';

function truncateLabel(text, max = 22) {
  const value = String(text ?? '');
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}

function LegendItem({ color, label, colors }) {
  return (
    <Stack direction="row" spacing={0.75} alignItems="center">
      <Box
        sx={{
          width: 10,
          height: 10,
          borderRadius: '50%',
          bgcolor: color,
          border: `1px solid ${alpha(colors.textPrimary, 0.18)}`,
          boxShadow: `0 0 0 1px ${alpha('#fff', 0.4)}`,
          flexShrink: 0,
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

export default function MapLegend({ colorMode, complaintLegend = [], otherColor = '#64748b' }) {
  const colors = useAppColors();

  const items = colorMode === 'complaintType'
    ? [
        ...complaintLegend.map(({ type, color }) => ({ color, label: type })),
        { color: otherColor, label: 'Other' },
      ]
    : [
        ...DELAY_BUCKET_LABELS.map((label) => ({
          color: getDelayBucketColor(label),
          label,
        })),
        { color: DELAY_BUCKET_COLORS.unknown, label: 'Unknown' },
      ];

  return (
    <Box
      sx={{
        position: 'absolute',
        bottom: 14,
        left: 14,
        zIndex: 1000,
        px: 1.25,
        py: 1,
        borderRadius: '12px',
        bgcolor: alpha(colors.cardSurface, 0.97),
        border: `1px solid ${alpha(colors.border, 0.9)}`,
        boxShadow: `0 2px 12px ${alpha('#000', 0.12)}`,
        backdropFilter: 'blur(10px)',
        maxWidth: 'calc(100% - 28px)',
        pointerEvents: 'none',
      }}
    >
      <Typography
        variant="caption"
        sx={{
          display: 'block',
          mb: 0.75,
          fontWeight: 700,
          fontSize: '0.62rem',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: colors.textSecondary,
        }}
      >
        {colorMode === 'complaintType' ? 'Complaint Type' : 'Delay Bucket'}
      </Typography>
      <Stack
        direction="row"
        spacing={1.5}
        useFlexGap
        sx={{ flexWrap: 'wrap', rowGap: 0.5, columnGap: 1.5 }}
      >
        {items.map(({ color, label }) => (
          <LegendItem key={label} color={color} label={label} colors={colors} />
        ))}
      </Stack>
    </Box>
  );
}
