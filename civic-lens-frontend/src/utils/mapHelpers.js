import { getPredictedDelayBucket } from './predictionHelpers';

import { SEMANTIC_COLORS } from '../styles/semanticColors';

const MAP_THEME = SEMANTIC_COLORS;

const COMPLAINT_SLOT_KEYS = ['cyan', 'blue', 'yellow', 'pink'];

export function getMapPalette(mode = 'light') {
  return MAP_THEME[mode] ?? MAP_THEME.light;
}

export function getDelayBucketColorMap(mode = 'light') {
  const p = getMapPalette(mode);
  return {
    'Same Day': p.cyan,
    '1–3 Days': p.blue,
    '3–7 Days': p.yellow,
    'More than 1 Week': p.red,
    unknown: p.gray,
  };
}

export const DELAY_BUCKET_LABELS = [
  'Same Day',
  '1–3 Days',
  '3–7 Days',
  'More than 1 Week',
];

const VALID_DELAY_BUCKETS = new Set(DELAY_BUCKET_LABELS);

export function isValidDelayBucket(bucket) {
  return VALID_DELAY_BUCKETS.has(bucket);
}

export function getComplaintTypePalette(mode = 'light') {
  const p = getMapPalette(mode);
  return [...COMPLAINT_SLOT_KEYS.map((key) => p[key]), p.gray];
}

const COMPLAINT_TYPE_PALETTE = getComplaintTypePalette('light');

export const MAX_MAP_POINTS = 2500;

export function isOpenRequest(record) {
  return Number(record?.is_unresolved) === 1;
}

function resolveBucketLabel(rawBucket, hours) {
  if (rawBucket && rawBucket !== 'unknown' && isValidDelayBucket(rawBucket)) {
    return rawBucket;
  }
  if (Number.isFinite(hours) && hours > 0) {
    const derived = getPredictedDelayBucket(hours);
    return isValidDelayBucket(derived) ? derived : null;
  }
  return null;
}

/** Status-aware bucket: predicted_bucket for open, actual_bucket for closed. */
export function getBucket(record) {
  if (!record || typeof record !== 'object') return null;

  if (isOpenRequest(record)) {
    return resolveBucketLabel(
      record.predicted_bucket ?? record.predicted_delay_bucket,
      Number(record.predicted_response_hours),
    );
  }

  return resolveBucketLabel(record.actual_bucket, Number(record.response_hours));
}

export function hasMapBucket(record) {
  return getBucket(record) != null;
}

export function hasValidCoordinates(record) {
  const lat = Number(record?.latitude);
  const lng = Number(record?.longitude);
  return Number.isFinite(lat) && Number.isFinite(lng)
    && lat >= -90 && lat <= 90
    && lng >= -180 && lng <= 180;
}

function sampleEvenly(requests, max = MAX_MAP_POINTS) {
  if (!requests.length || requests.length <= max) return requests;
  const step = requests.length / max;
  const sampled = [];
  for (let i = 0; i < max; i += 1) {
    sampled.push(requests[Math.floor(i * step)]);
  }
  return sampled;
}

export function getMapPlotPoints(requests) {
  const plottable = requests.filter(
    (record) => hasValidCoordinates(record) && hasMapBucket(record),
  );
  return sampleEvenly(plottable, MAX_MAP_POINTS);
}

export function getMarkerRadius(record) {
  const hours = isOpenRequest(record)
    ? Number(record?.predicted_response_hours)
    : Number(record?.response_hours);
  const baseHours = Number.isFinite(hours) && hours > 0 ? hours : 24;
  const bucket = getBucket(record);
  const isMedium = bucket === '3–7 Days';
  const isCritical = bucket === 'More than 1 Week';

  const normalized = Math.sqrt(Math.min(Math.max(baseHours, 0) / 168, 1));
  let radius = 4 + normalized * 2;

  if (isMedium) radius += 0.75;
  if (isCritical) radius += 1;

  return Math.min(Math.max(radius, 4), 8);
}

export function getDelayBucketColor(bucket, mode = 'light') {
  const map = getDelayBucketColorMap(mode);
  return map[bucket] ?? map.unknown;
}

export function buildComplaintTypeColorMap(requests, mode = 'light') {
  const counts = {};
  requests.forEach((record) => {
    const type = String(record?.complaint_type ?? 'Unknown');
    counts[type] = (counts[type] || 0) + 1;
  });

  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const topTypes = sorted.slice(0, 6).map(([type]) => type);
  const colorMap = {};
  const palette = getMapPalette(mode);
  const slotColors = COMPLAINT_SLOT_KEYS.map((key) => palette[key]);

  topTypes.forEach((type, index) => {
    colorMap[type] = index < slotColors.length ? slotColors[index] : palette.gray;
  });
  colorMap.__other = palette.gray;

  return { colorMap, topTypes };
}

export function getComplaintTypeColor(record, colorMap, topTypes) {
  const type = String(record?.complaint_type ?? 'Unknown');
  if (topTypes.includes(type)) return colorMap[type];
  return colorMap.__other ?? COMPLAINT_TYPE_PALETTE[6];
}

export function getMarkerColor(record, colorMode, complaintColorMap, topTypes, mode = 'light') {
  if (colorMode === 'complaintType') {
    return getComplaintTypeColor(record, complaintColorMap, topTypes);
  }
  return getDelayBucketColor(getBucket(record), mode);
}
