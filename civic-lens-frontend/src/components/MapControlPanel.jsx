import { useMemo } from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  Switch,
  FormControlLabel,
} from '@mui/material';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { useAppColors } from '../ColorModeContext';
import {
  DEFAULT_MAP_FILTERS,
  DELAY_BUCKET_LABELS,
  deriveFilterOptions,
} from '../utils/mapHelpers';
import {
  filterRowGridSx,
  filterSecondaryRowSx,
  filterToolbarShellSx,
  getFilterFieldSx,
  getFilterResetButtonSx,
  getFilterSwitchSx,
  getFilterToggleGroupSx,
} from '../styles/filterControls';

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
    <Box sx={filterToolbarShellSx}>
      <Box sx={filterRowGridSx(5)}>
        {FILTER_KEYS.map(({ key, label }) => (
          <FormControl key={key} size="small" sx={getFilterFieldSx(colors, 'map')}>
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
          sx={getFilterResetButtonSx(colors, 'map')}
        >
          Reset
        </Button>
      </Box>

      <Box sx={filterSecondaryRowSx}>
        <ToggleButtonGroup
          exclusive
          size="small"
          value={colorMode}
          onChange={(_, value) => value && onColorModeChange?.(value)}
          sx={getFilterToggleGroupSx(colors, 'map')}
        >
          <ToggleButton value="delayBucket">Color by: Delay Bucket</ToggleButton>
          <ToggleButton value="complaintType">Color by: Complaint Type</ToggleButton>
        </ToggleButtonGroup>

        <FormControlLabel
          control={
            <Switch
              size="small"
              checked={highDelayOnly}
              onChange={(e) => onHighDelayOnlyChange?.(e.target.checked)}
              sx={getFilterSwitchSx(colors, 'map')}
            />
          }
          label="High Delay Only"
          sx={{
            m: 0,
            '& .MuiFormControlLabel-label': {
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: colors.textSecondary,
            },
          }}
        />
      </Box>
    </Box>
  );
}
