import Request from '../models/Request.js';
import {
  buildMongoFilterExcluding,
  buildMapMongoFilterExcluding,
} from '../utils/queryFilters.js';
import {
  DELAY_BUCKET_ORDER,
  DELAY_BUCKET_RANGES,
  andMongoFilter,
  buildMapDelayBucketClause,
} from '../utils/delayBuckets.js';

function sortStr(arr) {
  return arr.filter(Boolean).map(String).sort((a, b) => a.localeCompare(b));
}

function buildFacetFilterExcluding(req, excludeField, useMapBuckets) {
  return useMapBuckets
    ? buildMapMongoFilterExcluding(req, excludeField)
    : buildMongoFilterExcluding(req, excludeField);
}

async function distinctField(req, excludeField, field, useMapBuckets = false) {
  const filter = buildFacetFilterExcluding(req, excludeField, useMapBuckets);
  const values = await Request.distinct(field, filter);
  return sortStr(values);
}

async function distinctDelayBuckets(req) {
  const filter = buildMongoFilterExcluding(req, 'delay_bucket');
  const checks = await Promise.all(
    Object.entries(DELAY_BUCKET_RANGES).map(async ([label, range]) => {
      const count = await Request.countDocuments({
        ...filter,
        predicted_response_hours: range,
      });
      return count > 0 ? label : null;
    }),
  );

  return DELAY_BUCKET_ORDER.filter((label) => checks.includes(label));
}

async function distinctMapDelayBuckets(req) {
  const q = req.query ?? {};
  const filter = buildMapMongoFilterExcluding(req, 'delay_bucket');
  const checks = await Promise.all(
    DELAY_BUCKET_ORDER.map(async (label) => {
      const clause = buildMapDelayBucketClause(q.status, label);
      if (!clause) return null;
      const count = await Request.countDocuments(andMongoFilter(filter, clause));
      return count > 0 ? label : null;
    }),
  );

  return DELAY_BUCKET_ORDER.filter((label) => checks.includes(label));
}

export async function getCascadingFacetOptions(req) {
  const useMapBuckets = req.query?.mapBuckets === '1' || req.query?.mapBuckets === 'true';
  const [borough, complaint_type, agency, status, delay_bucket] = await Promise.all([
    distinctField(req, 'borough', 'borough', useMapBuckets),
    distinctField(req, 'complaint_type', 'complaint_type', useMapBuckets),
    distinctField(req, 'agency', 'agency', useMapBuckets),
    distinctField(req, 'status', 'status', useMapBuckets),
    useMapBuckets ? distinctMapDelayBuckets(req) : distinctDelayBuckets(req),
  ]);

  return {
    borough,
    complaint_type,
    agency,
    status,
    delay_bucket,
  };
}
