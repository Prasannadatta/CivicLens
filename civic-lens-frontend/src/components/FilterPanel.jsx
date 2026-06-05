import { useMemo } from 'react';
import {
  Typography,
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
import FilterListIcon from '@mui/icons-material/FilterList';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { getActiveFilterChipSx, getSelectedFilterChipSx } from '../theme';
import { useAppColors } from '../ColorModeContext';
import DashboardCard from './DashboardCard';

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
    <DashboardCard
      sx={{ mb: 2 }}
      contentSx={{ p: { xs: 2, md: 2.1 }, '&:last-child': { pb: { xs: 2, md: 2.1 } } }}
    >
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1.25 }}>
        <Box>
          <Stack direction="row" spacing={0.9} sx={{ alignItems: 'center' }}>
            <FilterListIcon sx={{ color: colors.primary, fontSize: 18 }} />
            <Typography
              variant="subtitle2"
              sx={{ color: colors.textPrimary, letterSpacing: '0.06em', fontWeight: 800 }}
            >
              Filters Toolbar
            </Typography>
          </Stack>
          <Typography variant="body2" sx={{ color: colors.textMuted, fontSize: '0.78rem', mt: 0.4, pl: 3, mb: 2 }}>
            Compact controls for borough, complaint, agency, status, season, and year.
          </Typography>
        </Box>
        {activeFilters.length > 0 && (
          <Chip
            label={`${activeFilters.length} active`}
            size="small"
            sx={{
              ...getActiveFilterChipSx(colors, colors.secondary),
              height: 24,
            }}
          />
        )}
      </Stack>

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1}
        useFlexGap
        sx={{
          flexWrap: 'wrap',
          alignItems: { xs: 'stretch', sm: 'flex-end' },
          mb: activeFilters.length ? 1.3 : 0,
        }}
      >
        {FILTER_CONFIG.map(({ key, label }) => {
          const isActive = filters[key] && filters[key] !== 'All';
          return (
            <Tooltip key={key} title={`Filter by ${label.toLowerCase()}`} arrow placement="top">
              <FormControl
                size="small"
                sx={{
                  minWidth: { xs: '100%', sm: 132 },
                  flex: { sm: '1 1 132px' },
                  maxWidth: { sm: 178 },
                  '& .MuiOutlinedInput-root': isActive
                    ? {
                        boxShadow: `0 0 0 1px ${alpha(colors.warning, 0.35)}`,
                        '& fieldset': { borderColor: alpha(colors.warning, 0.45) },
                      }
                    : undefined,
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
            sx={{
              minWidth: { xs: '100%', sm: 'auto' },
              height: 38,
              px: 1.8,
              borderColor: colors.border,
              color: colors.textSecondary,
              whiteSpace: 'nowrap',
              '&:hover': {
                borderColor: colors.primary,
                color: colors.primary,
                bgcolor: alpha(colors.primary, 0.06),
                transform: 'translateY(-1px)',
              },
              transition: 'all 0.2s ease',
            }}
          >
            Reset Filters
          </Button>
        </Tooltip>
      </Stack>

      {activeFilters.length > 0 && (
        <Box
          sx={{
            pt: 1.2,
            borderTop: `1px solid ${colors.border}`,
          }}
        >
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              mb: 1,
              color: colors.textMuted,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              fontSize: '0.62rem',
              fontWeight: 700,
            }}
          >
            Active filter chips
          </Typography>
          <Stack direction="row" spacing={0.75} useFlexGap sx={{ flexWrap: 'wrap' }}>
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
        </Box>
      )}
    </DashboardCard>
  );
}
