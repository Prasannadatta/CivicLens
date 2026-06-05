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
    transition: hover ? 'border-color 0.2s ease, box-shadow 0.2s ease' : undefined,
  };

  return (
    <Card
      elevation={0}
      sx={{
        ...baseSx,
        position: 'relative',
        overflow: 'visible',
        ...(hover && {
          '&:hover': {
            borderColor: alpha(accent, 0.35),
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
          p: '24px',
          '&:last-child': { pb: '24px' },
          height: '100%',
          ...contentSx,
        }}
      >
        {children}
      </CardContent>
    </Card>
  );
}
