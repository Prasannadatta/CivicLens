import { Card, CardContent } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useAppColors } from '../ColorModeContext';

export default function DashboardCard({
  children,
  sx,
  contentSx,
  hover = false,
  selected = false,
  selectedColor,
}) {
  const colors = useAppColors();
  const accent = selectedColor ?? colors.primary;

  const baseSx = {
    background: colors.cardSurface,
    border: `1px solid ${colors.border}`,
    borderRadius: '22px',
    boxShadow: `0 2px 12px ${alpha('#000', 0.04)}`,
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
  };

  return (
    <Card
      elevation={0}
      sx={{
        ...baseSx,
        position: 'relative',
        overflow: 'hidden',
        ...(hover && {
          transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            borderColor: alpha(accent, 0.35),
            boxShadow: `${colors.cardHoverShadow}, 0 0 0 1px ${alpha(accent, 0.18)}`,
          },
        }),
        ...(selected && {
          borderColor: alpha(accent, 0.45),
          boxShadow: `${colors.cardHoverShadow}, 0 0 0 1px ${alpha(accent, 0.24)}`,
        }),
        ...sx,
      }}
    >
      <CardContent
        sx={{
          p: '22px',
          '&:last-child': { pb: '22px' },
          height: '100%',
          ...contentSx,
        }}
      >
        {children}
      </CardContent>
    </Card>
  );
}
