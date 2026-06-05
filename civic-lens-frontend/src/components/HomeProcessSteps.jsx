import { Box, Grid, Typography, alpha } from '@mui/material';
import { getHomeTokens } from '../styles/homeTheme';
import { cardSubtitleSx, cardTitleSx } from '../styles/modelViewLayout';

const STEPS = [
  {
    title: 'Collect',
    text: 'NYC 311 records provide complaint type, agency, time, status, ZIP code, and coordinates.',
    accentKey: 'primary',
  },
  {
    title: 'Predict',
    text: 'A CatBoost model estimates response time and delay bucket using workload and historical service patterns.',
    accentKey: 'gold',
  },
  {
    title: 'Explain',
    text: 'SHAP-style factors show why a request is expected to take longer or resolve faster.',
    accentKey: 'pink',
  },
  {
    title: 'Explore',
    text: 'Map and dashboard views reveal hotspots, burden patterns, and city-level delay trends.',
    accentKey: 'cyan',
  },
];

const connectorSx = (tokens) => ({
  flex: 1,
  height: '1px',
  bgcolor: alpha(tokens.primary, tokens.isLight ? 0.14 : 0.2),
});

function StepCircle({ index, accent, tokens }) {
  return (
    <Box
      sx={{
        width: 36,
        height: 36,
        borderRadius: '50%',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: alpha(accent, tokens.isLight ? 0.08 : 0.14),
        border: `2px solid ${alpha(accent, 0.4)}`,
        color: accent,
        fontSize: '0.8rem',
        fontWeight: 800,
      }}
    >
      {index + 1}
    </Box>
  );
}

function StepContent({ step, tokens }) {
  return (
    <>
      <Typography
        sx={{
          ...cardTitleSx,
          color: tokens.textPrimary,
          letterSpacing: '-0.01em',
          mb: 0.5,
        }}
      >
        {step.title}
      </Typography>
      <Typography
        sx={{
          ...cardSubtitleSx,
          color: tokens.textSecondary,
          maxWidth: 260,
          mx: 'auto',
        }}
      >
        {step.text}
      </Typography>
    </>
  );
}

function PipelineStep({ step, index, tokens, isFirst, isLast }) {
  const accent = tokens[step.accentKey] ?? tokens.primary;

  return (
    <Box sx={{ flex: '1 1 0', minWidth: 0 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.25 }}>
        <Box sx={isFirst ? { flex: 1 } : connectorSx(tokens)} />
        <StepCircle index={index} accent={accent} tokens={tokens} />
        <Box sx={isLast ? { flex: 1 } : connectorSx(tokens)} />
      </Box>
      <Box sx={{ textAlign: 'center', px: 0.5 }}>
        <StepContent step={step} tokens={tokens} />
      </Box>
    </Box>
  );
}

function SimpleStep({ step, index, tokens }) {
  const accent = tokens[step.accentKey] ?? tokens.primary;

  return (
    <Box sx={{ textAlign: 'center', px: { xs: 1, sm: 1.5 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1.25 }}>
        <StepCircle index={index} accent={accent} tokens={tokens} />
      </Box>
      <StepContent step={step} tokens={tokens} />
    </Box>
  );
}

export default function HomeProcessSteps({ mode }) {
  const t = getHomeTokens(mode);

  return (
    <Box sx={{ width: '100%', maxWidth: '100%' }}>
      {/* Desktop — horizontal pipeline */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          width: '100%',
          alignItems: 'flex-start',
        }}
      >
        {STEPS.map((step, i) => (
          <PipelineStep
            key={step.title}
            step={step}
            index={i}
            tokens={t}
            isFirst={i === 0}
            isLast={i === STEPS.length - 1}
          />
        ))}
      </Box>

      {/* Tablet — 2 columns, no connectors */}
      <Grid
        container
        spacing={3.5}
        sx={{ display: { xs: 'none', sm: 'flex', md: 'none' }, width: '100%' }}
      >
        {STEPS.map((step, i) => (
          <Grid key={step.title} size={{ xs: 12, sm: 6 }}>
            <SimpleStep step={step} index={i} tokens={t} />
          </Grid>
        ))}
      </Grid>

      {/* Mobile — vertical stack */}
      <Box
        sx={{
          display: { xs: 'flex', sm: 'none' },
          flexDirection: 'column',
          gap: 3.5,
          alignItems: 'center',
          width: '100%',
        }}
      >
        {STEPS.map((step, i) => (
          <SimpleStep key={step.title} step={step} index={i} tokens={t} />
        ))}
      </Box>
    </Box>
  );
}
