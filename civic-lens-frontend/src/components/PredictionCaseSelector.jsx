import {
  Box,
  Typography,
  TextField,
  Autocomplete,
  Chip,
  alpha,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useAppColors } from '../ColorModeContext';
import { cardSubtitleSx, cardTitleSx } from '../styles/modelViewLayout';
import {
  filterToolbarShellSx,
  getFilterAutocompleteSx,
} from '../styles/filterControls';

function truncate(text, max = 32) {
  const value = String(text ?? '');
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}

export function formatCaseOptionLabel(record) {
  if (!record) return '';
  const complaint = truncate(record.complaint_type, 28);
  const borough = record.borough ?? '—';
  const zip = record.incident_zip ?? '—';
  const bucket = record.predicted_delay_bucket ?? '—';
  return `${complaint} | ${borough} | ${zip} | ${bucket}`;
}

function formatSelectedSummary(record) {
  if (!record) return '';
  const parts = [
    truncate(record.complaint_type, 36),
    record.borough ?? '—',
    record.incident_zip ?? '—',
    record.predicted_delay_bucket ?? '—',
  ];
  return parts.join(' | ');
}

function caseMatchesQuery(record, query) {
  if (!query) return true;
  const haystack = [
    record.complaint_type,
    record.borough,
    record.incident_zip,
    record.predicted_delay_bucket,
    record.unique_key,
    record.agency,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return haystack.includes(query.toLowerCase());
}

export default function PredictionCaseSelector({
  requests = [],
  selectedRequest = null,
  onSelectRequest,
}) {
  const colors = useAppColors();
  const accent = colors.accentPink;

  return (
    <Box sx={filterToolbarShellSx}>
      <Typography
        variant="subtitle2"
        component="label"
        sx={{ ...cardTitleSx, color: colors.textSecondary, display: 'block', mb: 1 }}
      >
        Select Case
      </Typography>

      <Autocomplete
        size="small"
        fullWidth
        options={requests}
        value={selectedRequest}
        onChange={(_, value) => onSelectRequest?.(value)}
        getOptionLabel={(option) => formatCaseOptionLabel(option)}
        isOptionEqualToValue={(option, value) => option.unique_key === value?.unique_key}
        filterOptions={(options, { inputValue }) =>
          options.filter((record) => caseMatchesQuery(record, inputValue))
        }
        noOptionsText={requests.length ? 'No matching cases' : 'No requests available'}
        slotProps={{
          paper: {
            sx: {
              bgcolor: colors.cardSurface,
              border: `1px solid ${colors.border}`,
              boxShadow: colors.cardShadow,
              '& .MuiAutocomplete-option': {
                color: colors.textPrimary,
                '&[aria-selected="true"]': {
                  bgcolor: alpha(accent, 0.1),
                },
                '&.Mui-focused': {
                  bgcolor: alpha(accent, 0.06),
                },
              },
            },
          },
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder="Search case…"
            slotProps={{
              ...params.slotProps,
              input: {
                ...params.slotProps?.input,
                startAdornment: (
                  <>
                    <SearchIcon sx={{ color: colors.textSecondary, fontSize: 18, ml: 0.5, mr: 0.5 }} />
                    {params.slotProps?.input?.startAdornment}
                  </>
                ),
              },
            }}
            sx={getFilterAutocompleteSx(colors, 'model')}
          />
        )}
        renderOption={(props, option) => {
          const { key, ...optionProps } = props;
          return (
            <Box component="li" key={key} {...optionProps} sx={{ py: 0.75 }}>
              <Typography variant="body2" sx={{ ...cardSubtitleSx, color: colors.textPrimary, fontWeight: 600 }}>
                {formatCaseOptionLabel(option)}
              </Typography>
            </Box>
          );
        }}
      />

      {selectedRequest ? (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 1.25 }}>
          <Chip
            size="small"
            label={formatSelectedSummary(selectedRequest)}
            title={formatSelectedSummary(selectedRequest)}
            sx={{
              maxWidth: '100%',
              height: 'auto',
              py: 0.5,
              '& .MuiChip-label': {
                ...cardSubtitleSx,
                fontWeight: 600,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: 'block',
                color: colors.textSecondary,
              },
              bgcolor: alpha(accent, 0.06),
              border: `1px solid ${alpha(accent, 0.2)}`,
            }}
          />
        </Box>
      ) : null}
    </Box>
  );
}
