import { useMemo } from 'react';
import {
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Box,
  alpha,
} from '@mui/material';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { useAppColors } from '../ColorModeContext';
import DashboardCard from './DashboardCard';
import { DEFAULT_FILTERS } from './FilterPanel';

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
    <DashboardCard contentSx={{ p: '16px 20px', '&:last-child': { pb: '16px' } }}>
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
              flex: { lg: '1 1 140px' },
              maxWidth: { lg: 200 },
            }}
          >
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
          sx={{
            height: 40,
            px: 1.75,
            borderColor: colors.border,
            color: colors.textSecondary,
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.8125rem',
            whiteSpace: 'nowrap',
            '&:hover': {
              borderColor: colors.warning,
              color: colors.warning,
              bgcolor: colors.neutralHoverBg,
            },
          }}
        >
          Reset
        </Button>
      </Stack>
    </DashboardCard>
  );
}
