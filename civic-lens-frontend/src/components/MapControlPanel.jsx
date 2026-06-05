import { useMemo } from 'react';
import {
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Box,
  ToggleButton,
  ToggleButtonGroup,
  Switch,
  FormControlLabel,
  alpha,
} from '@mui/material';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { useAppColors } from '../ColorModeContext';
import DashboardCard from './DashboardCard';
import {
  DEFAULT_MAP_FILTERS,
  DELAY_BUCKET_LABELS,
  deriveFilterOptions,
} from '../utils/mapHelpers';

const FILTER_KEYS = [
  { key: 'borough', field: 'borough', label: 'Borough' },
  { key: 'complaintType', field: 'complaint_type', label: 'Complaint Type' },
  { key: 'agency', field: 'agency', label: 'Agency' },
  { key: 'delayBucket', field: null, label: 'Delay Bucket', staticOptions: ['All', ...DELAY_BUCKET_LABELS] },
  { key: 'status', field: 'status', label: 'Status' },
];

export default function MapControlPanel({
  requests = [],
  filters = DEFAULT_MAP_FILTERS,
  colorMode = 'delayBucket',
  highDelayOnly = false,
  onFiltersChange,
  onColorModeChange,
  onHighDelayOnlyChange,
  onReset,
}) {
  const colors = useAppColors();

  const optionsByKey = useMemo(() => {
    const map = {};
    FILTER_KEYS.forEach(({ key, field, staticOptions }) => {
      map[key] = staticOptions ?? deriveFilterOptions(requests, field);
    });
    return map;
  }, [requests]);

  const handleChange = (field) => (event) => {
    onFiltersChange?.({ ...filters, [field]: event.target.value });
  };

  return (
    <DashboardCard contentSx={{ p: '16px 20px', '&:last-child': { pb: '16px' } }}>
      <Stack spacing={1.5}>
        <Stack
          direction={{ xs: 'column', lg: 'row' }}
          spacing={1}
          useFlexGap
          sx={{ alignItems: { xs: 'stretch', lg: 'flex-end' }, flexWrap: 'wrap' }}
        >
          {FILTER_KEYS.map(({ key, label }) => (
            <FormControl
              key={key}
              size="small"
              sx={{
                minWidth: { xs: '100%', sm: 140 },
                flex: { lg: '1 1 130px' },
                maxWidth: { lg: 190 },
              }}
            >
              <InputLabel id={`map-filter-${key}`}>{label}</InputLabel>
              <Select
                labelId={`map-filter-${key}`}
                value={filters[key] ?? 'All'}
                label={label}
                onChange={handleChange(key)}
              >
                {(optionsByKey[key] || ['All']).map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ))}

          <Button
            variant="outlined"
            size="small"
            startIcon={<RestartAltIcon />}
            onClick={onReset}
            sx={{
              height: 40,
              px: 1.75,
              borderColor: colors.border,
              color: colors.textSecondary,
              flexShrink: 0,
              '&:hover': {
                borderColor: colors.secondary,
                bgcolor: colors.neutralHoverBg,
                color: colors.secondary,
              },
            }}
          >
            Reset
          </Button>
        </Stack>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.5}
          useFlexGap
          sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, flexWrap: 'wrap' }}
        >
          <Box>
            <ToggleButtonGroup
              exclusive
              size="small"
              value={colorMode}
              onChange={(_, value) => value && onColorModeChange?.(value)}
              sx={{
                '& .MuiToggleButton-root': {
                  px: 1.5,
                  py: 0.5,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  borderColor: colors.border,
                  color: colors.textSecondary,
                  '&:hover': {
                    bgcolor: colors.neutralHoverBg,
                    color: colors.secondary,
                  },
                  '&.Mui-selected': {
                    bgcolor: alpha(colors.secondary, 0.08),
                    color: colors.secondary,
                    borderColor: alpha(colors.secondary, 0.32),
                    '&:hover': { bgcolor: alpha(colors.secondary, 0.12) },
                  },
                },
              }}
            >
              <ToggleButton value="delayBucket">Color by: Delay Bucket</ToggleButton>
              <ToggleButton value="complaintType">Color by: Complaint Type</ToggleButton>
            </ToggleButtonGroup>
          </Box>

          <FormControlLabel
            control={
              <Switch
                size="small"
                checked={highDelayOnly}
                onChange={(e) => onHighDelayOnlyChange?.(e.target.checked)}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': { color: colors.error },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    bgcolor: alpha(colors.error, 0.5),
                  },
                }}
              />
            }
            label="High Delay Only"
            sx={{
              m: 0,
              '& .MuiFormControlLabel-label': {
                fontSize: '0.8rem',
                fontWeight: 600,
                color: colors.textSecondary,
              },
            }}
          />
        </Stack>
      </Stack>
    </DashboardCard>
  );
}
