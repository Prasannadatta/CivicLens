import { Box, Typography, Tooltip, alpha } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useAppColors } from '../ColorModeContext';
import { MODEL_BOTTOM_ROW_HEIGHT, cardSubtitleSx, cardTitleSx } from '../styles/modelViewLayout';
import DashboardCard from './DashboardCard';

const NYC_BOUNDS = {
  lat: [40.49, 40.92],
  lng: [-74.26, -73.68],
};

const MAP_HEIGHT = 195;

function projectToPercent(lat, lng) {
  const xPct = ((lng - NYC_BOUNDS.lng[0]) / (NYC_BOUNDS.lng[1] - NYC_BOUNDS.lng[0])) * 100;
  const yPct = ((NYC_BOUNDS.lat[1] - lat) / (NYC_BOUNDS.lat[1] - NYC_BOUNDS.lat[0])) * 100;
  return {
    left: Math.min(94, Math.max(6, xPct)),
    top: Math.min(90, Math.max(10, yPct)),
  };
}

export default function RequestLocationPreview({ request }) {
  const colors = useAppColors();

  if (!request) {
    return (
      <DashboardCard
        sx={{ width: '100%' }}
        contentSx={{
          p: '22px',
          height: MODEL_BOTTOM_ROW_HEIGHT,
          width: '100%',
          boxSizing: 'border-box',
          '&:last-child': { pb: '22px' },
        }}
      >
        <Typography variant="subtitle2" sx={{ ...cardTitleSx, color: colors.textSecondary, mb: 1 }}>
          Location
        </Typography>
        <Typography variant="body2" sx={{ ...cardSubtitleSx, color: colors.textSecondary }}>No case selected.</Typography>
      </DashboardCard>
    );
  }

  const lat = Number(request.latitude);
  const lng = Number(request.longitude);
  const hasCoords = Number.isFinite(lat) && Number.isFinite(lng);
  const marker = hasCoords ? projectToPercent(lat, lng) : { left: 50, top: 50 };

  return (
    <DashboardCard
      sx={{ width: '100%' }}
      contentSx={{
        p: '22px',
        height: MODEL_BOTTOM_ROW_HEIGHT,
        width: '100%',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        '&:last-child': { pb: '22px' },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1, flexShrink: 0 }}>
        <Typography variant="subtitle2" sx={{ ...cardTitleSx, color: colors.textSecondary }}>
          Location
        </Typography>
        <Tooltip title="Full NYC map will be added in the Dashboard view." arrow placement="top">
          <InfoOutlinedIcon sx={{ fontSize: 14, color: colors.textSecondary, cursor: 'help' }} />
        </Tooltip>
      </Box>

      <Box
        sx={{
          position: 'relative',
          width: '100%',
          height: MAP_HEIGHT,
          flexShrink: 0,
          borderRadius: 2,
          overflow: 'hidden',
          bgcolor: colors.chartPlotBg,
          border: `1px solid ${colors.border}`,
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `
              linear-gradient(${colors.gridStroke} 1px, transparent 1px),
              linear-gradient(90deg, ${colors.gridStroke} 1px, transparent 1px)
            `,
            backgroundSize: '18px 18px',
            opacity: 0.65,
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            left: `${marker.left}%`,
            top: `${marker.top}%`,
            transform: 'translate(-50%, -50%)',
            width: 10,
            height: 10,
            borderRadius: '50%',
            bgcolor: colors.error,
            border: `2px solid ${colors.textPrimary}`,
            boxShadow: `0 0 0 4px ${alpha(colors.error, 0.2)}`,
          }}
        />
      </Box>

      <Box sx={{ mt: 1.25, minWidth: 0, flex: 1 }}>
        <Typography
          variant="body1"
          noWrap
          title={request.incident_address || 'Address unavailable'}
          sx={{ color: colors.textPrimary, fontWeight: 600, fontSize: '0.9375rem', lineHeight: 1.35 }}
        >
          {request.incident_address || 'Address unavailable'}
        </Typography>
        <Typography variant="body2" sx={{ ...cardSubtitleSx, color: colors.textSecondary, mt: 0.35 }}>
          {request.borough ?? '—'} · ZIP {request.incident_zip ?? '—'}
        </Typography>
        {hasCoords && (
          <Typography
            variant="body2"
            sx={{
              ...cardSubtitleSx,
              color: colors.textSecondary,
              mt: 0.35,
              fontFamily: 'ui-monospace, monospace',
            }}
          >
            {lat.toFixed(5)}, {lng.toFixed(5)}
          </Typography>
        )}
      </Box>
    </DashboardCard>
  );
}
