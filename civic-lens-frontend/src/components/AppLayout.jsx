import { Box } from '@mui/material';
import { useAppColors, useColorMode } from '../ColorModeContext';
import AppHeader from './AppHeader';
import AppFooter from './AppFooter';
import PageTransition from './PageTransition';
import {
  LAYOUT_FOOTER_HEIGHT,
  LAYOUT_HEADER_HEIGHT,
  PAGE_PADDING_X,
  CONTENT_TOP_SPACING,
  contentContainerSx,
} from '../styles/modelViewLayout';

export default function AppLayout({ children, currentView, onNavigate }) {
  const colors = useAppColors();
  const { mode, toggleColorMode } = useColorMode();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        bgcolor: colors.background,
      }}
    >
      <AppHeader
        currentView={currentView}
        onNavigate={onNavigate}
        mode={mode}
        toggleMode={toggleColorMode}
      />

      <Box
        component="main"
        sx={{
          ...contentContainerSx,
          pl: PAGE_PADDING_X,
          pr: PAGE_PADDING_X,
          pt: `calc(${LAYOUT_HEADER_HEIGHT}px + ${CONTENT_TOP_SPACING.xs})`,
          '@media (min-width: 600px)': {
            pt: `calc(${LAYOUT_HEADER_HEIGHT}px + ${CONTENT_TOP_SPACING.sm})`,
          },
          '@media (min-width: 900px)': {
            pt: `calc(${LAYOUT_HEADER_HEIGHT}px + ${CONTENT_TOP_SPACING.md})`,
          },
          pb: `calc(${LAYOUT_FOOTER_HEIGHT}px + 32px)`,
        }}
      >
        <PageTransition viewKey={currentView}>{children}</PageTransition>
      </Box>

      <AppFooter />
    </Box>
  );
}
