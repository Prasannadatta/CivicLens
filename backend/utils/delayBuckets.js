export const DELAY_BUCKET_RANGES = {
  'Same Day': { $gt: 0, $lte: 24 },
  '1–3 Days': { $gt: 24, $lte: 72 },
  '3–7 Days': { $gt: 72, $lte: 168 },
  'More than 1 Week': { $gt: 168 },
};

export const DELAY_BUCKET_ORDER = ['Same Day', '1–3 Days', '3–7 Days', 'More than 1 Week'];

/** Derive bucket label from hours using the shared threshold definitions. */
export function delayBucketFromHours(hours) {
  const h = Math.max(0, Number(hours) || 0);
  if (h <= 0) return null;
  if (h <= 24) return 'Same Day';
  if (h <= 72) return '1–3 Days';
  if (h <= 168) return '3–7 Days';
  return 'More than 1 Week';
}

function sanitizeBucket(bucket) {
  return DELAY_BUCKET_ORDER.includes(bucket) ? bucket : null;
}

function resolveBucketLabel(rawBucket, hours) {
  const stored = sanitizeBucket(rawBucket);
  if (stored) return stored;
  return sanitizeBucket(delayBucketFromHours(hours));
}

export function resolvePredictedBucket(record) {
  if (!record || typeof record !== 'object') return null;
  return resolveBucketLabel(
    record.predicted_bucket ?? record.predicted_delay_bucket,
    record.predicted_response_hours,
  );
}

export function resolveActualBucket(record) {
  if (!record || typeof record !== 'object') return null;
  return resolveBucketLabel(record.actual_bucket, record.response_hours);
}

export function getMapBucket(record) {
  if (!record || typeof record !== 'object') return null;
  return Number(record.is_unresolved) === 1
    ? resolvePredictedBucket(record)
    : resolveActualBucket(record);
}

export function normalizeMapPoint(record) {
  if (!record || typeof record !== 'object') return null;
  const predicted_bucket = resolvePredictedBucket(record);
  const actual_bucket = resolveActualBucket(record);
  const normalized = {
    ...record,
    predicted_bucket,
    actual_bucket,
  };
  return getMapBucket(normalized) ? normalized : null;
}

function openBucketMatch(bucketLabel) {
  const range = DELAY_BUCKET_RANGES[bucketLabel];
  const matches = [
    { predicted_bucket: bucketLabel },
    { predicted_delay_bucket: bucketLabel },
  ];
  if (range) matches.push({ predicted_response_hours: range });
  return {
    is_unresolved: 1,
    $or: matches,
  };
}

function closedBucketMatch(bucketLabel) {
  const range = DELAY_BUCKET_RANGES[bucketLabel];
  const matches = [{ actual_bucket: bucketLabel }];
  if (range) matches.push({ response_hours: range });
  return {
    is_unresolved: 0,
    $or: matches,
  };
}

/** Status-aware delay bucket clause for map queries. */
export function buildMapDelayBucketClause(status, bucketLabel) {
  if (!DELAY_BUCKET_RANGES[bucketLabel]) return null;

  if (status === 'Open') return openBucketMatch(bucketLabel);
  if (status === 'Closed') return closedBucketMatch(bucketLabel);
  return { $or: [openBucketMatch(bucketLabel), closedBucketMatch(bucketLabel)] };
}

export function andMongoFilter(base, clause) {
  if (!clause || Object.keys(clause).length === 0) return base;

  const parts = [];
  if (base?.$and) {
    parts.push(...base.$and);
    const { $and, ...rest } = base;
    if (Object.keys(rest).length > 0) parts.push(rest);
  } else if (base && Object.keys(base).length > 0) {
    parts.push(base);
  }
  parts.push(clause);
  return { $and: parts };
}
