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
    boxShadow: colors.cardShadow,
  };

  return (
    <Card
      elevation={0}
      sx={{
        ...baseSx,
        position: 'relative',
        overflow: 'visible',
        ...(hover && {
          transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
          '&:hover': {
            borderColor: alpha(accent, 0.28),
            boxShadow: colors.cardHoverShadow,
          },
        }),
        ...(selected && {
          borderColor: alpha(accent, 0.35),
          boxShadow: colors.cardHoverShadow,
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
