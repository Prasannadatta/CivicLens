import Request from '../models/Request.js';
import { buildMongoFilter, parseCaseListSort } from '../utils/queryFilters.js';
import {
  getDefaultRequestFilter,
  getMlEligibleFilter,
  normalizeRequestForApi,
  normalizeRequestsForApi,
} from '../utils/normalizeRequest.js';

const DEFAULT_PAGE_SIZE = Number(process.env.PAGE_SIZE || 5000);
const MAX_PAGE_SIZE = Number(process.env.MAX_PAGE_SIZE || 10000);
const DEFAULT_UNFILTERED_LIMIT = Number(process.env.DEFAULT_UNFILTERED_LIMIT || 10000);
const CASE_LIST_PAGE_SIZE = Number(process.env.CASE_LIST_PAGE_SIZE || 50);
const CASE_LIST_MAX_PAGE = Number(process.env.CASE_LIST_MAX_PAGE || 200);

const CASE_LIST_PROJECTION = {
  unique_key: 1,
  complaint_type: 1,
  borough: 1,
  incident_zip: 1,
  predicted_delay_bucket: 1,
  predicted_response_hours: 1,
  agency: 1,
  status: 1,
  created_date: 1,
  is_unresolved: 1,
};

function parsePagination(req) {
  const caseList = req.query.caseList === '1' || req.query.caseList === 'true';
  const hasFilters = req.query.hasFilters === '1' || req.query.hasFilters === 'true';
  const defaultLimit = caseList
    ? CASE_LIST_PAGE_SIZE
    : (hasFilters ? DEFAULT_PAGE_SIZE : DEFAULT_UNFILTERED_LIMIT);
  const maxLimit = caseList ? CASE_LIST_MAX_PAGE : MAX_PAGE_SIZE;

  const limit = Math.min(
    Math.max(Number(req.query.limit) || defaultLimit, 1),
    maxLimit,
  );
  const skip = Math.max(Number(req.query.skip) || 0, 0);
  return { limit, skip, caseList };
}

function idLookup(id) {
  const isObjectId = /^[a-f\d]{24}$/i.test(String(id));
  return isObjectId
    ? { $or: [{ unique_key: id }, { _id: id }] }
    : { unique_key: id };
}

export async function getAllRequests(req, res) {
  try {
    const filter = buildMongoFilter(req);
    const { limit, skip, caseList } = parsePagination(req);
    const countOnly = req.query.countOnly === '1' || req.query.countOnly === 'true';
    const skipCount = req.query.skipCount === '1'
      || req.query.skipCount === 'true'
      || (caseList && !countOnly && req.query.skipCount !== '0');

    if (caseList && countOnly) {
      const total = await Request.countDocuments(filter);
      return res.json({
        total,
        caseList: true,
        year: filter.created_date?.$gte?.getUTCFullYear?.() ?? null,
      });
    }

    const sort = caseList ? parseCaseListSort(req) : { created_date: -1 };

    let query = Request.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    if (caseList) {
      query = query.select(CASE_LIST_PROJECTION);
    }

    const docs = await query.lean().exec();
    const records = normalizeRequestsForApi(docs);

    let total = null;
    let hasMore;
    if (caseList && skipCount) {
      hasMore = records.length === limit;
    } else {
      total = await Request.countDocuments(filter);
      hasMore = skip + records.length < total;
    }

    res.json({
      records,
      total,
      skip,
      limit,
      hasMore,
      year: filter.created_date?.$gte?.getUTCFullYear?.() ?? null,
      filtered: true,
      caseList: Boolean(caseList),
      countPending: caseList && skipCount,
    });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
}

export async function getRequestFacets(req, res) {
  try {
    const base = getDefaultRequestFilter();
    const [borough, complaint_type, agency, status, season, year] = await Promise.all([
      Request.distinct('borough', base),
      Request.distinct('complaint_type', base),
      Request.distinct('agency', base),
      Request.distinct('status', base),
      Request.distinct('season', base),
      Request.distinct('year', base),
    ]);

    const sortStr = (arr) => arr.filter(Boolean).map(String).sort((a, b) => a.localeCompare(b));
    const sortNum = (arr) => arr.filter((v) => v != null).map(Number).sort((a, b) => b - a);

    res.json({
      borough: sortStr(borough),
      complaint_type: sortStr(complaint_type),
      agency: sortStr(agency),
      status: sortStr(status),
      season: sortStr(season),
      year: sortNum(year),
    });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
}

export async function getRequestById(req, res) {
  try {
    const { id } = req.params;
    const filter = { ...getDefaultRequestFilter(), ...idLookup(id) };

    const doc = await Request.findOne(filter).lean().exec();
    if (!doc) return res.status(404).json({ error: 'Not found' });
    res.json(normalizeRequestForApi(doc));
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
}

export async function getRequestStats(req, res) {
  try {
    const baseFilter = getDefaultRequestFilter();
    const mlFilter = getMlEligibleFilter();

    const [total, mlEligible, resolved, openStatus] = await Promise.all([
      Request.countDocuments(baseFilter),
      Request.countDocuments(mlFilter),
      Request.countDocuments({ ...baseFilter, is_unresolved: 0 }),
      Request.countDocuments({ ...baseFilter, status: 'Open' }),
    ]);

    res.json({
      year: baseFilter.created_date?.$gte?.getUTCFullYear?.() ?? null,
      total,
      mlEligible,
      resolved,
      openStatus,
    });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
}

export async function createRequest(req, res) {
  try {
    const payload = req.body;
    const doc = await Request.create(payload);
    res.status(201).json(normalizeRequestForApi(doc.toObject()));
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
}

export async function updateRequest(req, res) {
  try {
    const { id } = req.params;
    const payload = req.body;
    const doc = await Request.findOneAndUpdate(
      { $or: [{ unique_key: id }, { _id: id }] },
      payload,
      { new: true },
    ).lean().exec();
    if (!doc) return res.status(404).json({ error: 'Not found' });
    res.json(normalizeRequestForApi(doc));
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
}

export async function deleteRequest(req, res) {
  try {
    const { id } = req.params;
    const doc = await Request.findOneAndDelete({ $or: [{ unique_key: id }, { _id: id }] }).lean().exec();
    if (!doc) return res.status(404).json({ error: 'Not found' });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
}

export async function bulkImport(req, res) {
  try {
    const arr = Array.isArray(req.body) ? req.body : req.body.records ?? [];
    if (!arr.length) return res.status(400).json({ error: 'No records' });
    const ops = arr.map((r) => ({
      updateOne: {
        filter: { unique_key: r.unique_key },
        update: { $set: r },
        upsert: true,
      },
    }));
    const result = await Request.bulkWrite(ops);
    res.json({ inserted: result.upsertedCount || 0, matched: result.matchedCount || 0 });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
}
