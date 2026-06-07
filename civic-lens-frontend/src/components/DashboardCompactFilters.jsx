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
import { DEFAULT_FILTERS } from '../context/FilterContext';
import {
  filterRowGridSx,
  filterToolbarShellSx,
  getFilterFieldSx,
  getFilterResetButtonSx,
} from '../styles/filterControls';
import { facetToOptionsWithSelection } from '../utils/facetOptions';

const FILTER_KEYS = [
  { key: 'borough', field: 'borough', label: 'Borough' },
  { key: 'complaint_type', field: 'complaint_type', label: 'Complaint Type' },
  { key: 'agency', field: 'agency', label: 'Agency' },
  { key: 'delay_bucket', field: 'delay_bucket', label: 'Delay Bucket' },
  { key: 'status', field: 'status', label: 'Status' },
];

export default function DashboardCompactFilters({
  facets = {},
  filters = DEFAULT_FILTERS,
  onFilterChange,
  onReset,
}) {
  const colors = useAppColors();

  const optionsByKey = useMemo(() => {
    const map = {};
    FILTER_KEYS.forEach(({ key, field }) => {
      map[key] = facetToOptionsWithSelection(facets, field, filters[key]);
    });
    return map;
  }, [facets, filters]);

  const handleChange = (key) => (event) => {
    onFilterChange?.(key, event.target.value);
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
