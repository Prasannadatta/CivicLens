import { Box, Typography } from '@mui/material';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import PsychologyOutlinedIcon from '@mui/icons-material/PsychologyOutlined';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import MapOutlinedIcon from '@mui/icons-material/MapOutlined';
import { useAppColors } from '../ColorModeContext';
import { getMobileNavItemSx, getSideNavItemSx } from '../styles/pageAccents';
import { LAYOUT_FOOTER_HEIGHT } from '../styles/modelViewLayout';

const NAV_ITEMS = [
  { id: 'home', label: 'Home', icon: HomeOutlinedIcon },
  { id: 'model', label: 'Model', icon: PsychologyOutlinedIcon },
  { id: 'dashboard', label: 'Dashboard', icon: DashboardOutlinedIcon },
  { id: 'map', label: 'Map', icon: MapOutlinedIcon },
];

function NavItem({ item, colors, layout, showLabel, isActive, onNavigate }) {
  const Icon = item.icon;
  const isDisabled = item.disabled;
  const sx =
    layout === 'horizontal'
      ? getMobileNavItemSx(colors, item.id, isActive, isDisabled)
      : getSideNavItemSx(colors, item.id, isActive, isDisabled);

  return (
    <Box
      component={isDisabled ? 'div' : 'button'}
      type={isDisabled ? undefined : 'button'}
      onClick={isDisabled ? undefined : () => onNavigate?.(item.id)}
      aria-current={isActive ? 'page' : undefined}
      aria-disabled={isDisabled || undefined}
      aria-label={item.label}
      sx={sx}
    >
      <Icon sx={{ fontSize: 19 }} />
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

export default function RightNav({ activeView = 'home', onNavigate }) {
  const colors = useAppColors();

  const shellSx = {
    borderRadius: '18px',
    border: `1px solid ${colors.border}`,
    bgcolor: colors.shellBg,
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    boxShadow: colors.cardShadow,
    p: '8px',
  };

  const mobileBottom = `calc(${LAYOUT_FOOTER_HEIGHT}px + 12px)`;

  return (
    <>
      <Box
        sx={{
          display: 'none',
          '@media (min-width: 1100px)': {
            display: 'flex',
            position: 'fixed',
            left: 24,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 1100,
            width: 72,
            flexDirection: 'column',
            gap: 0.25,
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
          bottom: mobileBottom,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1100,
          flexDirection: 'row',
          gap: 0.25,
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
