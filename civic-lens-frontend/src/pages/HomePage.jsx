import { Box, Grid, Link, Typography } from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CivicLensHeroVisual from '../components/CivicLensHeroVisual';
import HomeProductCard from '../components/HomeProductCard';
import HomeProcessSteps from '../components/HomeProcessSteps';
import { useColorMode } from '../ColorModeContext';
import { getHomeTokens, HOME_HERO_PT, HOME_SECTION_GAP } from '../styles/homeTheme';
import {
  cardSubtitleSx,
  cardTitleSx,
  dataSourceSx,
  heroBodyPrimarySx,
  heroBodySecondarySx,
  pageEyebrowSx,
  pageTitleSx,
} from '../styles/modelViewLayout';

const NYC_311_DATA_URL =
  'https://data.cityofnewyork.us/Social-Services/311-Service-Requests-from-2010-to-Present/erm2-nwe9';

const PRODUCTS = [
  {
    variant: 'map',
    label: 'Map View',
    title: 'Explore service locations',
    text: 'View 311 requests on a real NYC map and identify dense complaint areas, unresolved cases, and high-delay locations.',
    nav: 'map',
  },
  {
    variant: 'dashboard',
    label: 'Dashboard View',
    title: 'Compare city patterns',
    text: 'Track service burden, complaint mix, delay trends, and hotspot previews across boroughs and ZIP codes.',
    nav: 'dashboard',
  },
  {
    variant: 'model',
    label: 'Model View',
    title: 'Explain predicted delays',
    text: 'Select a request to inspect predicted response time, delay bucket, model inputs, and SHAP-based delay factors.',
    nav: 'model',
  },
];

function SectionTitle({ children, subtitle, tokens, centered = false, compact = false }) {
  return (
    <Box
      sx={{
        mb: compact ? { xs: 1.5, md: 2 } : { xs: 2, md: 2.5 },
        textAlign: centered ? 'center' : 'left',
      }}
    >
      <Typography
        sx={{
          ...cardTitleSx,
          fontSize: '16px',
          letterSpacing: '-0.02em',
          color: tokens.textPrimary,
        }}
      >
        {children}
      </Typography>
      {subtitle && (
        <Typography
          sx={{
            ...cardSubtitleSx,
            mt: 0.75,
            color: tokens.textSecondary,
            maxWidth: 640,
            mx: centered ? 'auto' : 0,
          }}
        >
          {subtitle}
        </Typography>
      )}
    </Box>
  );
}

export default function HomePage({ onNavigate }) {
  const { mode } = useColorMode();
  const t = getHomeTokens(mode);

  return (
    <Box sx={{ width: '100%', pb: { xs: 1, md: 2 } }}>
      {/* Hero */}
      <Grid
        container
        spacing={{ xs: 3, md: 4 }}
        sx={{ pt: HOME_HERO_PT, mb: { xs: '40px', md: '52px' }, alignItems: 'center' }}
      >
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography
            sx={{
              ...pageEyebrowSx,
              color: t.primary,
              mb: 1.25,
            }}
          >
            NYC 311 Visual Analytics
          </Typography>
          <Typography
            component="h1"
            sx={{
              ...pageTitleSx,
              color: t.textPrimary,
              mb: 1.5,
            }}
          >
            Understand where city services slow down and why.
          </Typography>
          <Typography
            sx={{
              ...heroBodyPrimarySx,
              color: t.textSecondary,
              mb: 1.25,
            }}
          >
            Civic Lens analyzes more than 9 million NYC 311 service requests to reveal where
            complaints cluster, which neighborhoods face higher service burden, and how long
            requests are likely to take.
          </Typography>
          <Typography
            sx={{
              ...heroBodySecondarySx,
              color: t.textSecondary,
              maxWidth: 520,
              mb: 2,
            }}
          >
            The system combines a{' '}
            <Box component="span" sx={{ fontWeight: 600 }}>
              real NYC map
            </Box>
            , city-level dashboard,{' '}
            <Box component="span" sx={{ fontWeight: 600 }}>
              CatBoost delay prediction
            </Box>
            , and{' '}
            <Box component="span" sx={{ fontWeight: 600 }}>
              SHAP-based explanations
            </Box>{' '}
            so users can move from broad service patterns to the reasons behind a single delayed
            request.
          </Typography>

          <Link
            href={NYC_311_DATA_URL}
            target="_blank"
            rel="noopener noreferrer"
            underline="hover"
            sx={{
              ...dataSourceSx,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.5,
              color: t.textMuted,
              '&:hover': { color: t.primary },
            }}
          >
            Data source: NYC Open Data 311 Service Requests
            <OpenInNewIcon sx={{ fontSize: 14 }} />
          </Link>
        </Grid>
        <Grid
          size={{ xs: 12, md: 6 }}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: { xs: 'center', md: 'flex-end' },
          }}
        >
          <CivicLensHeroVisual mode={mode} />
        </Grid>
      </Grid>

      {/* Product cards */}
      <Box sx={{ mb: HOME_SECTION_GAP }}>
        <SectionTitle tokens={t}>What you can do</SectionTitle>
        <Grid container spacing={2.5}>
          {PRODUCTS.map((item) => (
            <Grid key={item.variant} size={{ xs: 12, md: 4 }}>
              <HomeProductCard
                label={item.label}
                variant={item.variant}
                title={item.title}
                text={item.text}
                mode={mode}
                onClick={() => onNavigate?.(item.nav)}
              />
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Process */}
      <Box sx={{ py: { xs: 0.5, md: 1 }, mb: 1 }}>
        <SectionTitle
          tokens={t}
          centered
          compact
          subtitle="Civic Lens connects raw 311 records with prediction, explanation, and spatial visualization."
        >
          From complaint data to service insight
        </SectionTitle>
        <HomeProcessSteps mode={mode} />
      </Box>

    </Box>
  );
}
