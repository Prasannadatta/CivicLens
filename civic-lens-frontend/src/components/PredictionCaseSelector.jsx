import {
  Box,
  Typography,
  TextField,
  Autocomplete,
  alpha,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useAppColors } from '../ColorModeContext';
import { cardTitleSx } from '../styles/modelViewLayout';
import DashboardCard from './DashboardCard';

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

  return (
    <DashboardCard
      sx={{ height: 'auto', width: '100%' }}
      contentSx={{
        p: '18px 22px',
        '&:last-child': { pb: '18px' },
      }}
    >
      <Typography
        variant="subtitle2"
        sx={{ ...cardTitleSx, color: colors.textSecondary, mb: 1 }}
      >
        Select Case
      </Typography>

      <Autocomplete
        size="small"
        options={requests}
        value={selectedRequest}
        onChange={(_, value) => onSelectRequest?.(value)}
        getOptionLabel={(option) => formatCaseOptionLabel(option)}
        isOptionEqualToValue={(option, value) => option.unique_key === value?.unique_key}
        filterOptions={(options, { inputValue }) =>
          options.filter((record) => caseMatchesQuery(record, inputValue))
        }
        noOptionsText={requests.length ? 'No matching cases' : 'No requests available'}
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
            sx={{
              '& .MuiOutlinedInput-root': {
                minHeight: 44,
                fontSize: '0.875rem',
              },
            }}
          />
        )}
        renderOption={(props, option) => {
          const { key, ...optionProps } = props;
          return (
            <Box component="li" key={key} {...optionProps} sx={{ py: 0.75 }}>
              <Typography variant="body2" sx={{ fontSize: '0.8125rem', color: colors.textPrimary, fontWeight: 600 }}>
                {formatCaseOptionLabel(option)}
              </Typography>
            </Box>
          );
        }}
        sx={{ mb: selectedRequest ? 0.75 : 0 }}
      />

      {selectedRequest ? (
        <Typography
          variant="body2"
          noWrap
          title={formatSelectedSummary(selectedRequest)}
          sx={{
            color: colors.textSecondary,
            fontSize: '0.8125rem',
            fontWeight: 600,
            px: 1.25,
            py: 0.5,
            lineHeight: 1.35,
            borderRadius: 1.5,
            bgcolor: alpha(colors.primary, 0.05),
            border: `1px solid ${alpha(colors.primary, 0.14)}`,
          }}
        >
          {formatSelectedSummary(selectedRequest)}
        </Typography>
      ) : null}
    </DashboardCard>
  );
}
