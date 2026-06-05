import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
  Button,
  Collapse,
  alpha,
} from '@mui/material';
import { Box } from '@mui/material';
import { useAppColors } from '../ColorModeContext';
import { MODEL_BOTTOM_ROW_HEIGHT, cardTitleSx, sectionLabelSx } from '../styles/modelViewLayout';
import DashboardCard from './DashboardCard';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const COMPACT_SECTIONS = [
  {
    title: 'Request',
    rows: [
      { key: 'complaint_type', label: 'Complaint' },
      { key: 'agency', label: 'Agency' },
      { key: 'borough', label: 'Borough' },
      { key: 'incident_zip', label: 'ZIP' },
      { key: 'open_data_channel_type', label: 'Channel' },
    ],
  },
  {
    title: 'Timing',
    rows: [
      { key: 'day_of_week', label: 'Day', format: (v) => DAY_NAMES[v] ?? v },
      { key: 'month', label: 'Month', format: (v) => MONTH_NAMES[v] ?? v },
    ],
  },
  {
    title: 'Workload / history',
    rows: [
      { key: 'agency_workload_24h', label: 'Workload (24h)', format: (v) => `${v}` },
      { key: 'agency_complaint_median', label: 'Agency + complaint', format: (v) => `${v} h` },
      { key: 'agency_zip_median', label: 'Agency + ZIP', format: (v) => `${v} h` },
      { key: 'complaint_median_hours', label: 'Complaint median', format: (v) => `${v} h` },
    ],
  },
];

const EXTRA_SECTIONS = [
  {
    title: 'Additional',
    rows: [
      { key: 'agency_median_hours', label: 'Agency median', format: (v) => `${v} h` },
      { key: 'agency_volume', label: 'Agency volume', format: (v) => Number(v).toLocaleString() },
      { key: 'agency_dow_median', label: 'Agency + DOW', format: (v) => `${v} h` },
      { key: 'borough_complaint_median', label: 'Borough + complaint', format: (v) => `${v} h` },
    ],
  },
];

function formatValue(row, raw) {
  if (raw == null || raw === '') return '—';
  if (row.format) return row.format(raw);
  return String(raw);
}

const rowSx = (colors, isLabel) => ({
  borderColor: colors.border,
  py: 0,
  px: 0,
  height: 34,
  fontSize: '0.8125rem',
  lineHeight: 1.3,
  ...(isLabel
    ? { width: '44%', color: colors.textSecondary, fontWeight: 500 }
    : { color: colors.textPrimary, fontWeight: 600, fontSize: '0.875rem' }),
});

function CompactSection({ section, features, colors }) {
  return (
    <Box sx={{ mb: 0.75 }}>
      <Typography variant="caption" sx={{ ...sectionLabelSx, color: colors.textMuted, display: 'block', mb: 0.35 }}>
        {section.title}
      </Typography>
      <Table size="small">
        <TableBody>
          {section.rows.map((row) => (
            <TableRow key={row.key} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
              <TableCell sx={rowSx(colors, true)}>{row.label}</TableCell>
              <TableCell sx={rowSx(colors, false)}>{formatValue(row, features?.[row.key])}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}

export default function ModelFeatureTable({ request }) {
  const colors = useAppColors();
  const [showAll, setShowAll] = useState(false);
  const features = request?.model_features ?? {};

  return (
    <DashboardCard
      contentSx={{
        p: '20px',
        height: MODEL_BOTTOM_ROW_HEIGHT,
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        '&:last-child': { pb: '20px' },
      }}
    >
      <Typography variant="subtitle2" sx={{ ...cardTitleSx, color: colors.textMuted, mb: 1, flexShrink: 0 }}>
        Model Inputs
      </Typography>

      {!request ? (
        <Typography variant="body2" sx={{ color: colors.textMuted, fontSize: '0.8125rem' }}>No case selected.</Typography>
      ) : (
        <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
            {COMPACT_SECTIONS.map((section) => (
              <CompactSection key={section.title} section={section} features={features} colors={colors} />
            ))}
            <Collapse in={showAll}>
              {EXTRA_SECTIONS.map((section) => (
                <CompactSection key={section.title} section={section} features={features} colors={colors} />
              ))}
            </Collapse>
          </Box>

          <Button
            size="small"
            onClick={() => setShowAll((open) => !open)}
            sx={{
              mt: 'auto',
              pt: 0.75,
              alignSelf: 'flex-start',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.75rem',
              color: colors.primary,
              px: 0,
              minWidth: 0,
              minHeight: 28,
              '&:hover': { bgcolor: alpha(colors.primary, 0.06) },
            }}
          >
            {showAll ? 'Fewer' : 'All features'}
          </Button>
        </Box>
      )}
    </DashboardCard>
  );
}
