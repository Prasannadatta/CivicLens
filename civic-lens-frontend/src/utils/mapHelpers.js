import { getPredictedDelayBucket } from '../data/mockRequests';

import { SEMANTIC_COLORS } from '../styles/semanticColors';

/** Civic Lens map palette — aligned with semantic color tokens */
export const MAP_THEME = SEMANTIC_COLORS;

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

/** @deprecated prefer getDelayBucketColorMap(mode) */
export const DELAY_BUCKET_COLORS = getDelayBucketColorMap('light');

export const DELAY_BUCKET_LABELS = [
  'Same Day',
  '1–3 Days',
  '3–7 Days',
  'More than 1 Week',
];

export function getComplaintTypePalette(mode = 'light') {
  const p = getMapPalette(mode);
  return [...COMPLAINT_SLOT_KEYS.map((key) => p[key]), p.gray];
}

/** @deprecated prefer getComplaintTypePalette(mode) */
export const COMPLAINT_TYPE_PALETTE = getComplaintTypePalette('light');

export const DEFAULT_MAP_FILTERS = {
  borough: 'All',
  complaintType: 'All',
  agency: 'All',
  delayBucket: 'All',
  status: 'All',
};

export const MAX_MAP_POINTS = 2500;

function isActiveFilter(value) {
  return value != null && value !== '' && value !== 'All';
}

function isUnresolved(record) {
  if (record?.is_unresolved != null) return Number(record.is_unresolved) === 1;
  return ['Open', 'In Progress', 'Pending'].includes(String(record?.status ?? ''));
}

export function getRequestDelayBucket(record) {
  const bucket = record?.predicted_delay_bucket;
  if (bucket && bucket !== 'unknown') return bucket;
  const hours = Number(record?.predicted_response_hours);
  if (Number.isFinite(hours)) return getPredictedDelayBucket(hours);
  return 'unknown';
}

export function isHighDelayRequest(record) {
  const bucket = getRequestDelayBucket(record);
  if (bucket === '3–7 Days' || bucket === 'More than 1 Week') return true;
  const hours = Number(record?.predicted_response_hours);
  return Number.isFinite(hours) && hours >= 72;
}

export function hasValidCoordinates(record) {
  const lat = Number(record?.latitude);
  const lng = Number(record?.longitude);
  return Number.isFinite(lat) && Number.isFinite(lng)
    && lat >= -90 && lat <= 90
    && lng >= -180 && lng <= 180;
}

export function applyMapFilters(requests, filters = {}, { highDelayOnly = false } = {}) {
  const list = Array.isArray(requests) ? requests : [];

  return list.filter((record) => {
    if (isActiveFilter(filters.borough) && String(record?.borough) !== filters.borough) return false;
    if (isActiveFilter(filters.complaintType) && String(record?.complaint_type) !== filters.complaintType) return false;
    if (isActiveFilter(filters.agency) && String(record?.agency) !== filters.agency) return false;
    if (isActiveFilter(filters.status) && String(record?.status) !== filters.status) return false;
    if (isActiveFilter(filters.delayBucket) && getRequestDelayBucket(record) !== filters.delayBucket) return false;
    if (highDelayOnly && !isHighDelayRequest(record)) return false;
    return true;
  });
}

export function sampleEvenly(requests, max = MAX_MAP_POINTS) {
  if (!requests.length || requests.length <= max) return requests;
  const step = requests.length / max;
  const sampled = [];
  for (let i = 0; i < max; i += 1) {
    sampled.push(requests[Math.floor(i * step)]);
  }
  return sampled;
}

export function getMapPlotPoints(requests) {
  const withCoords = requests.filter(hasValidCoordinates);
  return sampleEvenly(withCoords, MAX_MAP_POINTS);
}

export function getMarkerRadius(record) {
  const hours = Number(record?.predicted_response_hours ?? record?.response_hours) || 24;
  const bucket = getRequestDelayBucket(record);
  const isMedium = bucket === '3–7 Days';
  const isCritical = bucket === 'More than 1 Week';

  const normalized = Math.sqrt(Math.min(Math.max(hours, 0) / 168, 1));
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
  return getDelayBucketColor(getRequestDelayBucket(record), mode);
}

export function getMapStats(requests) {
  const list = Array.isArray(requests) ? requests : [];
  const withCoords = list.filter(hasValidCoordinates);

  if (!list.length) {
    return {
      visibleRequests: 0,
      avgPredictedDelay: 0,
      highDelayCount: 0,
      unresolvedRate: 0,
    };
  }

  const predictedHours = list
    .map((r) => Number(r?.predicted_response_hours))
    .filter((h) => Number.isFinite(h));
  const avgPredictedDelay = predictedHours.length
    ? predictedHours.reduce((sum, h) => sum + h, 0) / predictedHours.length
    : 0;
  const highDelayCount = list.filter(isHighDelayRequest).length;
  const unresolvedCount = list.filter(isUnresolved).length;

  return {
    visibleRequests: withCoords.length,
    avgPredictedDelay: Math.round(avgPredictedDelay * 10) / 10,
    highDelayCount,
    unresolvedRate: Math.round((unresolvedCount / list.length) * 1000) / 1000,
  };
}

export function deriveFilterOptions(requests, field, numeric = false) {
  const values = (Array.isArray(requests) ? requests : [])
    .map((record) => record?.[field])
    .filter((value) => value != null && value !== '');

  const unique = [...new Set(values.map(String))];
  if (numeric) unique.sort((a, b) => Number(b) - Number(a));
  else unique.sort((a, b) => a.localeCompare(b));

  return ['All', ...unique];
}
