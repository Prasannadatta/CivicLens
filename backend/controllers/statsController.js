import {
  getDashboardBundleData,
  getMapBundleData,
  runDashboardAggregation,
  runStatsAggregation,
  fetchFastMapPoints,
  resolveMapPointLimit,
} from '../services/dashboardAggregation.js';
import { buildMongoFilter, buildMapMongoFilter } from '../utils/queryFilters.js';

const isDev = process.env.NODE_ENV !== 'production';

export async function getDashboardBundle(req, res) {
  const started = Date.now();
  try {
    const { payload, cache } = await getDashboardBundleData(req);
    if (isDev) {
      console.debug(`[api] GET /api/dashboard cache=${cache} ${Date.now() - started}ms`);
    }
    res.set('X-Cache', cache);
    res.json(payload);
  } catch (err) {
    console.error('getDashboardBundle failed', err);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
}

export async function getMapBundle(req, res) {
  const started = Date.now();
  try {
    const { payload, cache } = await getMapBundleData(req);
    if (isDev) {
      console.debug(`[api] GET /api/map-bundle cache=${cache} ${Date.now() - started}ms`);
    }
    res.set('X-Cache', cache);
    res.json(payload);
  } catch (err) {
    console.error('getMapBundle failed', err);
    res.status(500).json({ error: 'Failed to fetch map data' });
  }
}

export async function getDashboardStats(req, res) {
  try {
    const filter = buildMongoFilter(req);
    res.json(await runStatsAggregation(filter));
  } catch (err) {
    console.error('getDashboardStats failed', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
}

export async function getMapPoints(req, res) {
  try {
    const filter = buildMapMongoFilter(req);
    const limit = resolveMapPointLimit(req.query?.limit);
    res.json(await fetchFastMapPoints(filter, limit));
  } catch (err) {
    console.error('getMapPoints failed', err);
    res.status(500).json({ error: 'Failed to fetch map points' });
  }
}

export async function getBoroughBurden(req, res) {
  try {
    const filter = buildMongoFilter(req);
    const bundle = await runDashboardAggregation(filter);
    res.json(bundle.boroughBurden);
  } catch (err) {
    console.error('getBoroughBurden failed', err);
    res.status(500).json({ error: 'Failed to fetch borough burden' });
  }
}

export async function getComplaintDrivers(req, res) {
  try {
    const filter = buildMongoFilter(req);
    const limit = Math.min(Number(req.query.limit) || 10, 20);
    const bundle = await runDashboardAggregation(filter);
    res.json({
      complaints: bundle.complaintDrivers.complaints.slice(0, limit),
    });
  } catch (err) {
    console.error('getComplaintDrivers failed', err);
    res.status(500).json({ error: 'Failed to fetch complaint drivers' });
  }
}

export async function getDelayTrend(req, res) {
  try {
    const filter = buildMongoFilter(req);
    const bundle = await runDashboardAggregation(filter);
    res.json(bundle.delayTrend);
  } catch (err) {
    console.error('getDelayTrend failed', err);
    res.status(500).json({ error: 'Failed to fetch delay trend' });
  }
}
