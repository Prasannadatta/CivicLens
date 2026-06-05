import { Box, Stack, Typography, Tooltip, Chip, alpha } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useAppColors } from '../ColorModeContext';

/**
 * Shared section header for dashboard visualizations — keeps titles, subtitles,
 * tooltips, and active selection chips consistent across Recharts and D3 panels.
 */
export default function VizSectionHeader({
  icon: Icon,
  iconColor,
  title,
  subtitle,
  tooltip,
  chips = [],
  actions = null,
  selected = false,
}) {
  const colors = useAppColors();
  const resolvedIconColor = iconColor ?? colors.primary;

  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={1.5}
      sx={{
        justifyContent: 'space-between',
        alignItems: { xs: 'flex-start', sm: 'flex-start' },
        mb: 1.5,
      }}
    >
      <Stack direction="row" spacing={1.25} sx={{ alignItems: 'flex-start', flex: 1, minWidth: 0 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            bgcolor: alpha(resolvedIconColor, 0.12),
            border: `1px solid ${alpha(resolvedIconColor, selected ? 0.55 : 0.24)}`,
            boxShadow: selected ? `0 0 20px ${alpha(resolvedIconColor, 0.25)}` : 'none',
            transition: 'box-shadow 0.25s ease, border-color 0.25s ease',
          }}
        >
          {Icon && <Icon sx={{ color: resolvedIconColor, fontSize: 21 }} />}
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <Stack direction="row" spacing={0.75} useFlexGap sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
            <Typography
              variant="h6"
              component="h2"
              sx={{
                fontSize: { xs: '0.98rem', md: '1.05rem' },
                fontWeight: 800,
                letterSpacing: '-0.02em',
                color: colors.textPrimary,
                lineHeight: 1.25,
              }}
            >
              {title}
            </Typography>
            {tooltip && (
              <Tooltip title={tooltip} arrow placement="top">
                <InfoOutlinedIcon
                  sx={{
                    fontSize: 16,
                    color: colors.textMuted,
                    cursor: 'help',
                    '&:hover': { color: colors.primary },
                  }}
                />
              </Tooltip>
            )}
          </Stack>
          {subtitle && (
            <Typography
              variant="body2"
              sx={{
                color: colors.textMuted,
                fontSize: '0.78rem',
                lineHeight: 1.5,
                mt: 0.35,
                maxWidth: 560,
              }}
            >
              {subtitle}
            </Typography>
          )}
          {chips.length > 0 && (
            <Stack direction="row" spacing={0.75} useFlexGap sx={{ flexWrap: 'wrap', mt: 1 }}>
              {chips.map((chip) => (
                <Chip key={chip.key || chip.label} size="small" {...chip} />
              ))}
            </Stack>
          )}
        </Box>
      </Stack>

      {actions && (
        <Stack direction="row" spacing={1} useFlexGap sx={{ alignItems: 'center', flexWrap: 'wrap', flexShrink: 0 }}>
          {actions}
        </Stack>
      )}
    </Stack>
  );
}
