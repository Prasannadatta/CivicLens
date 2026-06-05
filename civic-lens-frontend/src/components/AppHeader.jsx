import { useState, useEffect } from 'react';
import { Box, Stack, Typography, IconButton, Tooltip, Button, alpha } from '@mui/material';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import { useAppColors } from '../ColorModeContext';
import CivicLensLogo from './CivicLensLogo';
import { getHeaderNavSx } from '../styles/pageAccents';
import { LAYOUT_HEADER_HEIGHT, PAGE_PADDING_X, contentContainerSx } from '../styles/modelViewLayout';

const HEADER_NAV = [
  { id: 'home', label: 'Home' },
  { id: 'model', label: 'Model' },
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'map', label: 'Map' },
];

export default function AppHeader({ currentView, onNavigate, mode, toggleMode }) {
  const colors = useAppColors();
  const [scrolled, setScrolled] = useState(false);
  const isLight = mode === 'light';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <Box
      component="header"
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1200,
        width: '100%',
        height: LAYOUT_HEADER_HEIGHT,
        minHeight: LAYOUT_HEADER_HEIGHT,
        flexShrink: 0,
        bgcolor: colors.shellBg,
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: `1px solid ${colors.border}`,
        boxShadow: scrolled ? `0 4px 20px ${alpha('#000', isLight ? 0.06 : 0.2)}` : 'none',
        transition: 'box-shadow 0.2s ease',
      }}
    >
      <Box
        sx={{
          height: '100%',
          ...contentContainerSx,
          px: PAGE_PADDING_X,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Stack
          direction="row"
          spacing={1.5}
          sx={{ alignItems: 'center', justifyContent: 'space-between', width: '100%' }}
        >
          <Stack
            direction="row"
            spacing={1.25}
            sx={{ alignItems: 'center', flex: 1, minWidth: 0, cursor: onNavigate ? 'pointer' : 'default' }}
            onClick={onNavigate ? () => onNavigate('home') : undefined}
            role={onNavigate ? 'button' : undefined}
            tabIndex={onNavigate ? 0 : undefined}
            onKeyDown={
              onNavigate
                ? (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onNavigate('home');
                    }
                  }
                : undefined
            }
          >
            <CivicLensLogo size={42} mode={mode} />

            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="h6"
                component="h1"
                sx={{
                  fontWeight: 800,
                  letterSpacing: '-0.025em',
                  lineHeight: 1.1,
                  fontSize: '1.375rem',
                  color: colors.textPrimary,
                }}
              >
                Civic Lens
              </Typography>
              <Typography
                variant="body2"
                noWrap
                sx={{
                  display: { xs: 'none', sm: 'block' },
                  color: colors.textSecondary,
                  lineHeight: 1.3,
                  fontSize: '0.8125rem',
                  mt: 0.2,
                }}
              >
                NYC 311 service delay analytics
              </Typography>
            </Box>
          </Stack>

          <Stack
            direction="row"
            spacing={0.5}
            sx={{
              display: { xs: 'none', lg: 'flex' },
              alignItems: 'center',
              flexShrink: 0,
            }}
          >
            {HEADER_NAV.map((item) => {
              const isActive = currentView === item.id;
              return (
                <Button
                  key={item.id}
                  size="small"
                  onClick={() => onNavigate?.(item.id)}
                  sx={getHeaderNavSx(colors, item.id, isActive)}
                >
                  {item.label}
                </Button>
              );
            })}
          </Stack>

          <Tooltip title={mode === 'dark' ? 'Light mode' : 'Dark mode'}>
            <IconButton
              onClick={toggleMode}
              size="small"
              aria-label="Toggle color mode"
              sx={{
                color: colors.textSecondary,
                border: `1px solid ${colors.border}`,
                flexShrink: 0,
                width: 36,
                height: 36,
                '&:hover': {
                  bgcolor: colors.neutralHoverBg,
                  color: colors.textPrimary,
                },
              }}
            >
              {mode === 'dark' ? (
                <LightModeOutlinedIcon fontSize="small" />
              ) : (
                <DarkModeOutlinedIcon fontSize="small" />
              )}
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>
    </Box>
  );
}
