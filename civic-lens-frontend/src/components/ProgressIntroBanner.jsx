import { Box, Chip, Stack, Typography, alpha } from '@mui/material';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import InsightsIcon from '@mui/icons-material/Insights';
import MapOutlinedIcon from '@mui/icons-material/MapOutlined';
import { useAppColors } from '../ColorModeContext';

const PROGRESS_ITEMS = [
  {
    label: 'XGBoost delay prediction',
    icon: CheckCircleOutlinedIcon,
    status: 'done',
    colorKey: 'primary',
  },
  {
    label: 'SHAP-ready explanation',
    icon: InsightsIcon,
    status: 'done',
    colorKey: 'secondary',
  },
  {
    label: 'Map integration next',
    icon: MapOutlinedIcon,
    status: 'upcoming',
    colorKey: 'warning',
  },
];

function ProgressChip({ item, colors }) {
  const accent = colors[item.colorKey] ?? colors.primary;
  const isUpcoming = item.status === 'upcoming';
  const Icon = item.icon;

  return (
    <Chip
      icon={<Icon sx={{ fontSize: '15px !important' }} />}
      label={item.label}
      size="small"
      variant="outlined"
      sx={{
        height: 26,
        fontSize: '0.7rem',
        fontWeight: 600,
        color: isUpcoming ? colors.textSecondary : colors.textPrimary,
        borderColor: alpha(accent, isUpcoming ? 0.28 : 0.4),
        bgcolor: alpha(accent, isUpcoming ? 0.04 : 0.1),
        '& .MuiChip-icon': {
          ml: '7px',
          color: `${accent} !important`,
        },
      }}
    />
  );
}

export default function ProgressIntroBanner() {
  const colors = useAppColors();

  return (
    <Box
      sx={{
        mt: 1.25,
        mb: 1.5,
        px: { xs: 1.25, sm: 1.5 },
        py: { xs: 1.1, sm: 1.25 },
        borderRadius: 2,
        border: `1px solid ${colors.border}`,
        bgcolor: alpha(colors.textPrimary, 0.03),
        borderLeft: `3px solid ${colors.primary}`,
      }}
    >
      <Typography
        variant="subtitle2"
        sx={{
          fontWeight: 800,
          color: colors.textPrimary,
          fontSize: { xs: '0.84rem', sm: '0.9rem' },
          lineHeight: 1.35,
        }}
      >
        Current Progress: Delay Prediction + Explanation
      </Typography>

      <Typography
        variant="body2"
        sx={{
          mt: 0.65,
          color: colors.textSecondary,
          fontSize: { xs: '0.78rem', sm: '0.82rem' },
          lineHeight: 1.55,
          maxWidth: 920,
        }}
      >
        This version focuses on the machine-learning output for individual 311 requests. Users can
        select a case, inspect its predicted response time, see the delay bucket, and understand
        which features pushed the prediction higher or lower. The next step is connecting these
        predictions to the full NYC map and service burden views.
      </Typography>

      <Stack
        direction="row"
        useFlexGap
        spacing={0.75}
        sx={{ mt: 1.1, rowGap: 0.75, flexWrap: 'wrap' }}
      >
        {PROGRESS_ITEMS.map((item) => (
          <ProgressChip key={item.label} item={item} colors={colors} />
        ))}
      </Stack>
    </Box>
  );
}
