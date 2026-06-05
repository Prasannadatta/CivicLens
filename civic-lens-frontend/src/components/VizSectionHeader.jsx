import { Box, Stack, Typography, Tooltip, Chip, alpha } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useAppColors } from '../ColorModeContext';

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
      spacing={1.25}
      sx={{
        justifyContent: 'space-between',
        alignItems: { xs: 'flex-start', sm: 'flex-start' },
        mb: 1.25,
        flexShrink: 0,
      }}
    >
      <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start', flex: 1, minWidth: 0 }}>
        {Icon && (
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: '9px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              bgcolor: alpha(resolvedIconColor, 0.08),
              border: `1px solid ${alpha(resolvedIconColor, selected ? 0.35 : 0.18)}`,
            }}
          >
            <Icon sx={{ color: resolvedIconColor, fontSize: 17 }} />
          </Box>
        )}

        <Box sx={{ minWidth: 0 }}>
          <Stack direction="row" spacing={0.5} useFlexGap sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
            <Typography
              variant="h6"
              component="h2"
              sx={{
                fontSize: '1rem',
                fontWeight: 700,
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
                    fontSize: 15,
                    color: colors.textSecondary,
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
                color: colors.textSecondary,
                fontSize: '0.8125rem',
                lineHeight: 1.45,
                mt: 0.25,
                maxWidth: 520,
              }}
            >
              {subtitle}
            </Typography>
          )}
          {chips.length > 0 && (
            <Stack direction="row" spacing={0.75} useFlexGap sx={{ flexWrap: 'wrap', mt: 0.75 }}>
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
