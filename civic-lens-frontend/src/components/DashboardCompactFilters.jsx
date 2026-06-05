import { useMemo } from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
} from '@mui/material';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { useAppColors } from '../ColorModeContext';
import { DEFAULT_FILTERS } from './FilterPanel';
import {
  filterRowGridSx,
  filterToolbarShellSx,
  getFilterFieldSx,
  getFilterResetButtonSx,
} from '../styles/filterControls';

const FILTER_KEYS = [
  { key: 'borough', field: 'borough', label: 'Borough' },
  { key: 'complaintType', field: 'complaint_type', label: 'Complaint Type' },
  { key: 'agency', field: 'agency', label: 'Agency' },
  { key: 'status', field: 'status', label: 'Status' },
  { key: 'year', field: 'year', label: 'Year', numeric: true },
];

function deriveOptions(requests, field, numeric = false) {
  const values = (Array.isArray(requests) ? requests : [])
    .map((record) => record?.[field])
    .filter((value) => value != null && value !== '');

  const unique = [...new Set(values.map(String))];
  if (numeric) unique.sort((a, b) => Number(b) - Number(a));
  else unique.sort((a, b) => a.localeCompare(b));

  return ['All', ...unique];
}

export default function DashboardCompactFilters({
  requests = [],
  filters = DEFAULT_FILTERS,
  onFiltersChange,
  onReset,
}) {
  const colors = useAppColors();

  const optionsByKey = useMemo(() => {
    const map = {};
    FILTER_KEYS.forEach(({ key, field, numeric }) => {
      map[key] = deriveOptions(requests, field, numeric);
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
          <FormControl key={key} size="small" sx={getFilterFieldSx(colors, 'dashboard')}>
            <InputLabel id={`dash-filter-${key}`}>{label}</InputLabel>
            <Select
              labelId={`dash-filter-${key}`}
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
          sx={getFilterResetButtonSx(colors, 'dashboard')}
        >
          Reset
        </Button>
      </Box>
    </Box>
  );
}
