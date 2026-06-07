import { getDefaultRequestFilter } from './normalizeRequest.js';
import {
  DELAY_BUCKET_RANGES,
  andMongoFilter,
  buildMapDelayBucketClause,
} from './delayBuckets.js';

export { DELAY_BUCKET_RANGES };

function isActive(value) {
  return value != null && value !== '' && value !== 'All';
}

function readQueryValue(q, camelKey, snakeKey) {
  return q[camelKey] ?? q[snakeKey];
}

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export const CASE_LIST_SORTS = {
  predicted_delay_desc: { predicted_response_hours: -1, created_date: -1 },
  predicted_delay_asc: { predicted_response_hours: 1, created_date: -1 },
  created_date_desc: { created_date: -1 },
};

export function parseCaseListSort(input = {}) {
  const q = input.query ?? input;
  const sortKey = q.sort || q.caseSort || 'predicted_delay_desc';
  return CASE_LIST_SORTS[sortKey] ?? CASE_LIST_SORTS.predicted_delay_desc;
}

/** Build MongoDB filter from Express query or plain filter object. */
export function buildMongoFilter(input = {}) {
  const filter = getDefaultRequestFilter();
  const q = input.query ?? input;

  if (isActive(q.borough)) filter.borough = q.borough;
  if (isActive(q.agency)) filter.agency = q.agency;
  if (isActive(q.status)) {
    if (q.status === 'Open') {
      filter.is_unresolved = 1;
    } else if (q.status === 'Closed') {
      filter.is_unresolved = 0;
    } else {
      filter.status = q.status;
    }
  }

  const complaintType = readQueryValue(q, 'complaintType', 'complaint_type');
  if (isActive(complaintType)) filter.complaint_type = complaintType;

  if (isActive(q.season)) filter.season = q.season;
  if (isActive(q.year)) filter.year = Number(q.year);

  const mlOnly = q.mlOnly === '1' || q.mlOnly === 'true' || q.mlOnly === true;
  if (mlOnly) {
    filter.$or = [{ is_unresolved: 1 }, { status: 'Open' }];
  }

  const highDelayOnly = q.highDelayOnly === '1' || q.highDelayOnly === 'true' || q.highDelayOnly === true;
  const delayBucket = readQueryValue(q, 'delayBucket', 'delay_bucket');

  if (highDelayOnly) {
    filter.predicted_response_hours = { $gte: 72 };
  } else if (isActive(delayBucket) && DELAY_BUCKET_RANGES[delayBucket]) {
    filter.predicted_response_hours = DELAY_BUCKET_RANGES[delayBucket];
  }

  const caseList = q.caseList === '1' || q.caseList === 'true' || q.caseList === true;
  if (caseList) {
    if (filter.predicted_response_hours == null) {
      filter.predicted_response_hours = { $gt: 0 };
    } else if (typeof filter.predicted_response_hours === 'object') {
      filter.predicted_response_hours = { ...filter.predicted_response_hours, $gt: 0 };
    }
  }

  const search = String(q.search ?? q.q ?? '').trim();
  if (search) {
    const re = new RegExp(escapeRegex(search), 'i');
    const searchClause = {
      $or: [
        { complaint_type: re },
        { borough: re },
        { incident_zip: re },
        { unique_key: re },
        { agency: re },
        { predicted_delay_bucket: re },
      ],
    };
    if (filter.$and) {
      filter.$and.push(searchClause);
    } else {
      filter.$and = [searchClause];
    }
  }

  return filter;
}

function readDelayBucketQuery(q) {
  return readQueryValue(q, 'delayBucket', 'delay_bucket');
}

function isHighDelayQuery(q) {
  return q.highDelayOnly === '1' || q.highDelayOnly === 'true' || q.highDelayOnly === true;
}

/** Map-specific filter: status-aware delay bucket matching on predicted vs actual fields. */
export function buildMapMongoFilter(input = {}) {
  const q = { ...(input.query ?? input) };
  const delayBucket = readDelayBucketQuery(q);
  const highDelayOnly = isHighDelayQuery(q);

  delete q.delay_bucket;
  delete q.delayBucket;
  if (!highDelayOnly) {
    delete q.highDelayOnly;
  }

  const filter = buildMongoFilter({ query: q });

  if (highDelayOnly || !isActive(delayBucket)) {
    return filter;
  }

  const bucketClause = buildMapDelayBucketClause(q.status, delayBucket);
  if (!bucketClause) return filter;

  return andMongoFilter(filter, bucketClause);
}

/** Build MongoDB filter from active selections, excluding one dimension (cross-filtering). */
export function buildMongoFilterExcluding(input = {}, excludeField) {
  const q = { ...(input.query ?? input) };

  switch (excludeField) {
    case 'borough':
      delete q.borough;
      break;
    case 'complaint_type':
      delete q.complaint_type;
      delete q.complaintType;
      break;
    case 'agency':
      delete q.agency;
      break;
    case 'status':
      delete q.status;
      break;
    case 'delay_bucket':
      delete q.delay_bucket;
      delete q.delayBucket;
      break;
    default:
      break;
  }

  return buildMongoFilter({ query: q });
}

export function buildMapMongoFilterExcluding(input = {}, excludeField) {
  const q = { ...(input.query ?? input) };

  switch (excludeField) {
    case 'borough':
      delete q.borough;
      break;
    case 'complaint_type':
      delete q.complaint_type;
      delete q.complaintType;
      break;
    case 'agency':
      delete q.agency;
      break;
    case 'status':
      delete q.status;
      break;
    case 'delay_bucket':
      delete q.delay_bucket;
      delete q.delayBucket;
      break;
    default:
      break;
  }

  return buildMapMongoFilter({ query: q });
}

export function hasActiveQueryFilters(input = {}) {
  const q = input.query ?? input;
  const complaintType = readQueryValue(q, 'complaintType', 'complaint_type');
  const delayBucket = readQueryValue(q, 'delayBucket', 'delay_bucket');
  return Boolean(
    isActive(q.borough)
    || isActive(q.agency)
    || isActive(q.status)
    || isActive(complaintType)
    || isActive(q.season)
    || isActive(q.year)
    || q.mlOnly === '1'
    || q.mlOnly === 'true'
    || q.mlOnly === true
    || q.highDelayOnly === '1'
    || q.highDelayOnly === 'true'
    || q.highDelayOnly === true
    || isActive(delayBucket),
  );
}
