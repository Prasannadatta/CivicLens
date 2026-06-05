import { Box, Typography, alpha } from '@mui/material';
import PsychologyOutlinedIcon from '@mui/icons-material/PsychologyOutlined';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import MapOutlinedIcon from '@mui/icons-material/MapOutlined';
import { useAppColors } from '../ColorModeContext';

const NAV_ITEMS = [
  { id: 'model', label: 'Model', icon: PsychologyOutlinedIcon },
  { id: 'dashboard', label: 'Dashboard', icon: DashboardOutlinedIcon },
  { id: 'map', label: 'Map', icon: MapOutlinedIcon, disabled: true, hint: 'Next' },
];

function NavItem({ item, colors, layout, showLabel, isActive, onNavigate }) {
  const Icon = item.icon;
  const isDisabled = item.disabled;

  return (
    <Box
      component={isDisabled ? 'div' : 'button'}
      type={isDisabled ? undefined : 'button'}
      onClick={isDisabled ? undefined : () => onNavigate?.(item.id)}
      aria-current={isActive ? 'page' : undefined}
      aria-disabled={isDisabled || undefined}
      title={isDisabled ? item.hint : item.label}
      sx={{
        display: 'flex',
        flexDirection: layout === 'horizontal' ? 'row' : 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: layout === 'horizontal' ? 0.5 : 0.25,
        width: layout === 'horizontal' ? 'auto' : '100%',
        minWidth: layout === 'horizontal' ? 56 : undefined,
        px: layout === 'horizontal' ? 1 : 0.25,
        py: layout === 'horizontal' ? 0.65 : 0.75,
        border: 'none',
        borderRadius: 2,
        cursor: isDisabled ? 'default' : 'pointer',
        bgcolor: isActive ? alpha(colors.primary, 0.12) : 'transparent',
        color: isActive ? colors.primary : colors.textMuted,
        opacity: isDisabled ? 0.45 : 1,
        transition: 'background-color 0.2s ease, color 0.2s ease',
        '&:hover': isDisabled
          ? undefined
          : {
              bgcolor: alpha(colors.primary, 0.08),
              color: isActive ? colors.primary : colors.textPrimary,
            },
      }}
    >
      <Icon sx={{ fontSize: 20 }} />
      {showLabel && (
        <Typography
          variant="caption"
          sx={{
            fontWeight: isActive ? 700 : 500,
            fontSize: '0.625rem',
            lineHeight: 1,
            letterSpacing: '0.03em',
          }}
        >
          {item.label}
        </Typography>
      )}
    </Box>
  );
}

export default function RightNav({ activeView = 'model', onNavigate }) {
  const colors = useAppColors();

  const shellSx = {
    borderRadius: '20px',
    border: `1px solid ${colors.border}`,
    bgcolor: alpha(colors.cardSurface, 0.98),
    backdropFilter: 'blur(10px)',
    boxShadow: `0 4px 20px ${alpha('#000', 0.06)}`,
    p: '10px',
  };

  return (
    <>
      <Box
        sx={{
          display: 'none',
          '@media (min-width: 1100px)': {
            display: 'flex',
            position: 'fixed',
            right: 24,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 20,
            width: 76,
            flexDirection: 'column',
            gap: 0.35,
          },
          ...shellSx,
        }}
      >
        {NAV_ITEMS.map((item) => (
          <NavItem
            key={item.id}
            item={item}
            colors={colors}
            layout="vertical"
            showLabel
            isActive={activeView === item.id}
            onNavigate={onNavigate}
          />
        ))}
      </Box>

      <Box
        sx={{
          display: 'flex',
          '@media (min-width: 1100px)': { display: 'none' },
          position: 'fixed',
          bottom: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 20,
          flexDirection: 'row',
          gap: 0.35,
          maxWidth: 'calc(100% - 28px)',
          ...shellSx,
        }}
      >
        {NAV_ITEMS.map((item) => (
          <NavItem
            key={item.id}
            item={item}
            colors={colors}
            layout="horizontal"
            showLabel={false}
            isActive={activeView === item.id}
            onNavigate={onNavigate}
          />
        ))}
      </Box>
    </>
  );
}
