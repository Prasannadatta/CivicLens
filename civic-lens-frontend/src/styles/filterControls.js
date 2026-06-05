import { alpha } from '@mui/material/styles';
import { getPageAccentColor } from './pageAccents';

export const FILTER_FIELD_HEIGHT = 46;
export const FILTER_ROW_GAP = '14px';
/** Minimal shell — no card background, full content width */
export const filterToolbarShellSx = {
  width: '100%',
  boxSizing: 'border-box',
};

export const filterRowGridSx = (columnCount = 5) => ({
  display: 'grid',
  width: '100%',
  gap: FILTER_ROW_GAP,
  alignItems: 'end',
  gridTemplateColumns: {
    xs: '1fr',
    sm: 'repeat(2, minmax(0, 1fr))',
    md: 'repeat(3, minmax(0, 1fr))',
    lg: `repeat(${columnCount}, minmax(0, 1fr)) auto`,
  },
});

export const filterSecondaryRowSx = {
  display: 'flex',
  flexDirection: { xs: 'column', sm: 'row' },
  alignItems: { xs: 'flex-start', sm: 'center' },
  flexWrap: 'wrap',
  gap: FILTER_ROW_GAP,
  width: '100%',
  mt: FILTER_ROW_GAP,
};

export function getFilterFieldSx(colors, pageOrAccent) {
  const accent =
    typeof pageOrAccent === 'string' && !pageOrAccent.startsWith('#')
      ? getPageAccentColor(colors, pageOrAccent)
      : pageOrAccent;

  return {
    width: '100%',
    minWidth: 0,
    '& .MuiOutlinedInput-root': {
      height: FILTER_FIELD_HEIGHT,
      borderRadius: '12px',
      bgcolor: colors.cardSurface,
      fontSize: '0.875rem',
      color: colors.textPrimary,
      transition: 'border-color 0.15s ease',
      '& fieldset': { borderColor: colors.border },
      '&:hover': { bgcolor: colors.cardSurface },
      '&:hover fieldset': { borderColor: alpha(accent, 0.45) },
      '&.Mui-focused fieldset': { borderColor: accent, borderWidth: '1px' },
    },
    '& .MuiInputLabel-root': {
      color: colors.textSecondary,
      '&.Mui-focused': { color: accent },
    },
    '& .MuiSelect-select': {
      display: 'flex',
      alignItems: 'center',
    },
  };
}

export function getFilterResetButtonSx(colors, pageOrAccent) {
  const accent =
    typeof pageOrAccent === 'string' && !pageOrAccent.startsWith('#')
      ? getPageAccentColor(colors, pageOrAccent)
      : pageOrAccent;

  return {
    height: FILTER_FIELD_HEIGHT,
    px: 1.75,
    borderRadius: '12px',
    borderColor: colors.border,
    color: colors.textSecondary,
    textTransform: 'none',
    fontWeight: 600,
    fontSize: '0.8125rem',
    whiteSpace: 'nowrap',
    boxShadow: 'none',
    alignSelf: { xs: 'stretch', lg: 'end' },
    '&:hover': {
      borderColor: accent,
      color: accent,
      bgcolor: 'transparent',
      boxShadow: 'none',
    },
  };
}

export function getFilterToggleGroupSx(colors, pageOrAccent) {
  const accent =
    typeof pageOrAccent === 'string' && !pageOrAccent.startsWith('#')
      ? getPageAccentColor(colors, pageOrAccent)
      : pageOrAccent;

  return {
    '& .MuiToggleButtonGroup-grouped': {
      borderColor: colors.border,
    },
    '& .MuiToggleButton-root': {
      px: 1.5,
      py: 0.75,
      minHeight: 40,
      fontSize: '0.8125rem',
      fontWeight: 600,
      textTransform: 'none',
      borderColor: colors.border,
      color: colors.textSecondary,
      bgcolor: colors.cardSurface,
      transition: 'color 0.15s ease, border-color 0.15s ease',
      '&:hover': {
        bgcolor: 'transparent',
        color: accent,
        borderColor: alpha(accent, 0.45),
      },
      '&.Mui-selected': {
        bgcolor: alpha(accent, 0.08),
        color: accent,
        borderColor: alpha(accent, 0.32),
        '&:hover': {
          bgcolor: alpha(accent, 0.1),
          color: accent,
        },
      },
    },
  };
}

export function getFilterSwitchSx(colors, pageOrAccent) {
  const accent =
    typeof pageOrAccent === 'string' && !pageOrAccent.startsWith('#')
      ? getPageAccentColor(colors, pageOrAccent)
      : pageOrAccent;

  return {
    '& .MuiSwitch-switchBase.Mui-checked': { color: accent },
    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
      bgcolor: alpha(accent, 0.45),
    },
  };
}

export function getFilterAutocompleteSx(colors, pageOrAccent) {
  return getFilterFieldSx(colors, pageOrAccent);
}
