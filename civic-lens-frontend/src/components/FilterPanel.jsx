import { useMemo } from 'react';
import {
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Chip,
  Box,
  Tooltip,
  alpha,
} from '@mui/material';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { getActiveFilterChipSx, getSelectedFilterChipSx } from '../theme';
import { useAppColors } from '../ColorModeContext';
import {
  filterRowGridSx,
  filterToolbarShellSx,
  getFilterFieldSx,
  getFilterResetButtonSx,
} from '../styles/filterControls';

export const DEFAULT_FILTERS = {
  borough: 'All',
  complaintType: 'All',
  agency: 'All',
  status: 'All',
  season: 'All',
  year: 'All',
};

const FILTER_CONFIG = [
  { key: 'borough', field: 'borough', label: 'Borough', crossFilter: true },
  { key: 'complaintType', field: 'complaint_type', label: 'Complaint Type', crossFilter: true },
  { key: 'agency', field: 'agency', label: 'Agency' },
  { key: 'status', field: 'status', label: 'Status' },
  { key: 'season', field: 'season', label: 'Season' },
  { key: 'year', field: 'year', label: 'Year', numeric: true },
];

const FILTER_LABELS = Object.fromEntries(FILTER_CONFIG.map(({ key, label }) => [key, label]));

function deriveOptions(requests, field, numeric = false) {
  const values = (Array.isArray(requests) ? requests : [])
    .map((record) => record?.[field])
    .filter((value) => value != null && value !== '');

  const unique = [...new Set(values.map(String))];

  if (numeric) {
    unique.sort((a, b) => Number(b) - Number(a));
  } else {
    unique.sort((a, b) => a.localeCompare(b));
  }

  return ['All', ...unique];
}

function truncateLabel(value, max = 26) {
  const text = String(value);
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

export default function FilterPanel({ requests = [], filters = DEFAULT_FILTERS, onFiltersChange, onReset }) {
  const colors = useAppColors();

  const optionsByKey = useMemo(() => {
    const map = {};
    FILTER_CONFIG.forEach(({ key, field, numeric }) => {
      map[key] = deriveOptions(requests, field, numeric);
    });
    return map;
  }, [requests]);

  const activeFilters = useMemo(
    () => Object.entries(filters).filter(([, value]) => value && value !== 'All'),
    [filters],
  );

  const handleChange = (field) => (event) => {
    onFiltersChange?.({ ...filters, [field]: event.target.value });
  };

  const handleRemoveFilter = (field) => {
    onFiltersChange?.({ ...filters, [field]: 'All' });
  };

  const getChipSx = (key) => {
    const config = FILTER_CONFIG.find((item) => item.key === key);
    if (config?.crossFilter) {
      return { ...getActiveFilterChipSx(colors, colors.warning), ...getSelectedFilterChipSx(colors) };
    }
    return getActiveFilterChipSx(colors, colors.primary);
  };

  return (
    <Box sx={filterToolbarShellSx}>
      <Box sx={filterRowGridSx(6)}>
        {FILTER_CONFIG.map(({ key, label }) => {
          const isActive = filters[key] && filters[key] !== 'All';
          return (
            <Tooltip key={key} title={`Filter by ${label.toLowerCase()}`} arrow placement="top">
              <FormControl
                size="small"
                sx={{
                  ...getFilterFieldSx(colors, 'dashboard'),
                  ...(isActive && {
                    '& .MuiOutlinedInput-root fieldset': {
                      borderColor: alpha(colors.warning, 0.45),
                    },
                  }),
                }}
              >
                <InputLabel id={`filter-${key}-label`}>{label}</InputLabel>
                <Select
                  labelId={`filter-${key}-label`}
                  value={filters[key] ?? 'All'}
                  label={label}
                  onChange={handleChange(key)}
                >
                  {(optionsByKey[key] || ['All']).map((option) => (
                    <MenuItem key={option} value={option}>
                      {option === 'All' ? 'All' : truncateLabel(option)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Tooltip>
          );
        })}

        <Tooltip title="Clear all filters and cross-chart selections" arrow>
          <Button
            variant="outlined"
            size="small"
            startIcon={<RestartAltIcon />}
            onClick={onReset}
            sx={getFilterResetButtonSx(colors, 'dashboard')}
          >
            Reset
          </Button>
        </Tooltip>
      </Box>

      {activeFilters.length > 0 && (
        <Stack direction="row" spacing={0.75} useFlexGap sx={{ flexWrap: 'wrap', mt: 1.25 }}>
          {activeFilters.map(([key, value]) => (
            <Chip
              key={key}
              label={`${FILTER_LABELS[key]}: ${truncateLabel(value, 22)}`}
              size="small"
              onDelete={() => handleRemoveFilter(key)}
              sx={getChipSx(key)}
            />
          ))}
        </Stack>
      )}
    </Box>
  );
}
