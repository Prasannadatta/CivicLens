const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const BOROUGH_CENTERS = {
  Manhattan: { lat: 40.7831, lng: -73.9712 },
  Brooklyn: { lat: 40.6782, lng: -73.9442 },
  Queens: { lat: 40.7282, lng: -73.7949 },
  Bronx: { lat: 40.8448, lng: -73.8648 },
  'Staten Island': { lat: 40.5795, lng: -74.1502 },
};

const DELAY_FACTOR_FEATURES = [
  { key: 'complaint_type', label: 'Complaint Type', type: 'categorical' },
  { key: 'agency', label: 'Agency', type: 'categorical' },
  { key: 'borough', label: 'Borough', type: 'categorical' },
  { key: 'hour', label: 'Hour of Day', type: 'numeric' },
  { key: 'is_weekend', label: 'Weekend', type: 'categorical' },
  { key: 'season', label: 'Season', type: 'categorical' },
  { key: 'urgency_score', label: 'Urgency Score', type: 'numeric' },
  { key: 'is_vague_resolution', label: 'Vague Resolution', type: 'categorical' },
];

const EMPTY_KPIS = {
  totalRequests: 0,
  avgResponseHours: 0,
  unresolvedRate: 0,
  avgPredictedHours: 0,
  topComplaintType: '—',
  highRiskCount: 0,
};

function safeArray(requests) {
  return Array.isArray(requests) ? requests : [];
}

function num(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function str(value, fallback = '') {
  return value == null ? fallback : String(value);
}

function mean(values) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function stdDev(values) {
  if (values.length <= 1) return 0;
  const avg = mean(values);
  const variance = values.reduce((sum, value) => sum + (value - avg) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

function round(value, digits = 2) {
  const factor = 10 ** digits;
  return Math.round(num(value) * factor) / factor;
}

function isActiveFilter(value) {
  return value != null && value !== '' && value !== 'All';
}

function isUnresolved(record) {
  if (record?.is_unresolved != null) return num(record.is_unresolved) === 1;
  return ['Open', 'In Progress', 'Pending'].includes(str(record?.status));
}

function normalizeSeries(values) {
  if (!values.length) return [];
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (max === min) return values.map(() => 0.5);
  return values.map((value) => (value - min) / (max - min));
}

function getRecordRisk(record) {
  return num(record?.delay_risk_score);
}

function getRecordResponseHours(record) {
  return num(record?.response_hours);
}

function getRecordPredictedHours(record) {
  return num(record?.predicted_response_hours);
}

export function applyFilters(requests, filters = {}) {
  const list = safeArray(requests);

  return list.filter((record) => {
    if (isActiveFilter(filters.borough) && str(record?.borough) !== filters.borough) return false;
    if (isActiveFilter(filters.complaintType) && str(record?.complaint_type) !== filters.complaintType) return false;
    if (isActiveFilter(filters.agency) && str(record?.agency) !== filters.agency) return false;
    if (isActiveFilter(filters.status) && str(record?.status) !== filters.status) return false;
    if (isActiveFilter(filters.season) && str(record?.season) !== filters.season) return false;
    if (isActiveFilter(filters.year) && num(record?.year) !== num(filters.year)) return false;
    return true;
  });
}

export function getKpis(requests) {
  const list = safeArray(requests);
  if (!list.length) return { ...EMPTY_KPIS };

  const responseHours = list.map(getRecordResponseHours);
  const predictedHours = list.map(getRecordPredictedHours);
  const unresolvedCount = list.filter(isUnresolved).length;
  const highRiskCount = list.filter((record) => getRecordRisk(record) >= 0.75).length;

  const complaintCounts = {};
  list.forEach((record) => {
    const type = str(record?.complaint_type, 'Unknown');
    complaintCounts[type] = (complaintCounts[type] || 0) + 1;
  });

  const topComplaintType = Object.entries(complaintCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';

  return {
    totalRequests: list.length,
    avgResponseHours: round(mean(responseHours), 2),
    unresolvedRate: round(unresolvedCount / list.length, 4),
    avgPredictedHours: round(mean(predictedHours), 2),
    topComplaintType,
    highRiskCount,
  };
}

export function getTopComplaints(requests, limit = 12) {
  const list = safeArray(requests);
  if (!list.length) return [];

  const grouped = {};

  list.forEach((record) => {
    const type = str(record?.complaint_type, 'Unknown');
    if (!grouped[type]) {
      grouped[type] = { complaintType: type, count: 0, totalResponseHours: 0 };
    }
    grouped[type].count += 1;
    grouped[type].totalResponseHours += getRecordResponseHours(record);
  });

  return Object.values(grouped)
    .map((entry) => ({
      complaintType: entry.complaintType,
      count: entry.count,
      avgResponseHours: round(entry.totalResponseHours / entry.count, 2),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export function getMonthlyTimeline(requests) {
  const list = safeArray(requests);
  if (!list.length) return [];

  const grouped = {};

  list.forEach((record) => {
    const year = num(record?.year);
    const month = num(record?.month);
    if (!year || !month) return;

    const key = `${year}-${String(month).padStart(2, '0')}`;
    if (!grouped[key]) {
      grouped[key] = {
        year,
        month,
        label: `${MONTH_LABELS[month - 1] || month} ${year}`,
        count: 0,
        totalResponseHours: 0,
        totalPredictedHours: 0,
        unresolvedCount: 0,
      };
    }

    grouped[key].count += 1;
    grouped[key].totalResponseHours += getRecordResponseHours(record);
    grouped[key].totalPredictedHours += getRecordPredictedHours(record);
    grouped[key].unresolvedCount += isUnresolved(record) ? 1 : 0;
  });

  return Object.values(grouped)
    .sort((a, b) => (a.year - b.year) || (a.month - b.month))
    .map((entry) => ({
      year: entry.year,
      month: entry.month,
      label: entry.label,
      count: entry.count,
      avgResponseHours: round(entry.totalResponseHours / entry.count, 2),
      unresolvedRate: round(entry.unresolvedCount / entry.count, 4),
      avgPredictedHours: round(entry.totalPredictedHours / entry.count, 2),
      avgActual: round(entry.totalResponseHours / entry.count, 2),
      avgPredicted: round(entry.totalPredictedHours / entry.count, 2),
    }));
}

export function getBoroughStats(requests) {
  const list = safeArray(requests);
  if (!list.length) return [];

  const grouped = {};

  list.forEach((record) => {
    const borough = str(record?.borough, 'Unknown');
    if (!grouped[borough]) {
      grouped[borough] = {
        borough,
        count: 0,
        totalResponseHours: 0,
        totalPredictedHours: 0,
        unresolvedCount: 0,
        totalRisk: 0,
      };
    }

    grouped[borough].count += 1;
    grouped[borough].totalResponseHours += getRecordResponseHours(record);
    grouped[borough].totalPredictedHours += getRecordPredictedHours(record);
    grouped[borough].unresolvedCount += isUnresolved(record) ? 1 : 0;
    grouped[borough].totalRisk += getRecordRisk(record);
  });

  const rawStats = Object.values(grouped).map((entry) => ({
    borough: entry.borough,
    count: entry.count,
    avgResponseHours: round(entry.totalResponseHours / entry.count, 2),
    unresolvedRate: round(entry.unresolvedCount / entry.count, 4),
    avgPredictedHours: round(entry.totalPredictedHours / entry.count, 2),
    avgRisk: round(entry.totalRisk / entry.count, 2),
    avgDelayRisk: round(entry.totalRisk / entry.count, 2),
  }));

  const normalizedCounts = normalizeSeries(rawStats.map((entry) => entry.count));
  const normalizedResponse = normalizeSeries(rawStats.map((entry) => entry.avgResponseHours));
  const normalizedUnresolved = normalizeSeries(rawStats.map((entry) => entry.unresolvedRate));
  const normalizedRisk = normalizeSeries(rawStats.map((entry) => entry.avgRisk));

  return rawStats
    .map((entry, index) => {
      const center = BOROUGH_CENTERS[entry.borough] || { lat: 40.7128, lng: -74.006 };
      const burdenScore = round(
        0.3 * normalizedCounts[index]
        + 0.3 * normalizedResponse[index]
        + 0.25 * normalizedUnresolved[index]
        + 0.15 * normalizedRisk[index],
        4,
      );

      return {
        ...entry,
        burdenScore,
        lat: center.lat,
        lng: center.lng,
      };
    })
    .sort((a, b) => b.burdenScore - a.burdenScore);
}

export function getHotspotPoints(requests, limit = 250) {
  const list = safeArray(requests);

  return list
    .filter((record) => Number.isFinite(num(record?.latitude)) && Number.isFinite(num(record?.longitude)))
    .slice(0, limit)
    .map((record) => ({
      id: str(record?.unique_key || record?._id),
      latitude: num(record.latitude),
      longitude: num(record.longitude),
      borough: str(record?.borough, 'Unknown'),
      complaintType: str(record?.complaint_type, 'Unknown'),
      agency: str(record?.agency, 'Unknown'),
      status: str(record?.status, 'Unknown'),
      descriptor: str(record?.descriptor, '—'),
      responseHours: round(getRecordResponseHours(record), 2),
      predictedHours: round(getRecordPredictedHours(record), 2),
      risk: round(getRecordRisk(record), 2),
      label: `${str(record?.complaint_type, 'Request')} · ${str(record?.borough, 'NYC')}`,
      tooltip: `${str(record?.complaint_type)} (${str(record?.descriptor)})`,
      record,
    }));
}

function summarizeBorough(list, boroughName) {
  const stats = getBoroughStats(list).find((entry) => entry.borough === boroughName);
  return stats || {
    borough: boroughName,
    count: 0,
    avgResponseHours: 0,
    unresolvedRate: 0,
    avgPredictedHours: 0,
    avgRisk: 0,
    avgDelayRisk: 0,
    burdenScore: 0,
  };
}

export function getComparisonData(requests, boroughA, boroughB) {
  const list = safeArray(requests);
  const nameA = str(boroughA, 'Borough A');
  const nameB = str(boroughB, 'Borough B');

  const statsA = summarizeBorough(list, nameA);
  const statsB = summarizeBorough(list, nameB);

  const delta = (left, right) => round(left - right, 2);
  const deltaRate = (left, right) => round(left - right, 4);

  return {
    boroughA: statsA,
    boroughB: statsB,
    deltas: {
      count: delta(statsA.count, statsB.count),
      avgResponseHours: delta(statsA.avgResponseHours, statsB.avgResponseHours),
      unresolvedRate: deltaRate(statsA.unresolvedRate, statsB.unresolvedRate),
      avgPredictedHours: delta(statsA.avgPredictedHours, statsB.avgPredictedHours),
      avgRisk: delta(statsA.avgRisk, statsB.avgRisk),
      burdenScore: delta(statsA.burdenScore, statsB.burdenScore),
    },
  };
}

function categoricalImportance(list, field, targetGetter) {
  const groups = {};
  list.forEach((record) => {
    const key = str(record?.[field], 'Unknown');
    if (!groups[key]) groups[key] = [];
    groups[key].push(targetGetter(record));
  });

  const groupMeans = Object.values(groups).map((values) => mean(values));
  if (!groupMeans.length) return 0;
  return stdDev(groupMeans);
}

function numericImportance(list, field, targetGetter) {
  const xs = list.map((record) => num(record?.[field]));
  const ys = list.map(targetGetter);
  const xMean = mean(xs);
  const yMean = mean(ys);
  const xStd = stdDev(xs);
  const yStd = stdDev(ys);

  if (!xStd || !yStd) return 0;

  const covariance = xs.reduce((sum, x, index) => sum + (x - xMean) * (ys[index] - yMean), 0) / xs.length;
  return Math.abs(covariance / (xStd * yStd));
}

export function getDelayFactors(requests) {
  const list = safeArray(requests);
  if (!list.length) return [];

  const targetGetter = getRecordRisk;
  const raw = DELAY_FACTOR_FEATURES.map(({ key, label, type }) => ({
    feature: key,
    label,
    importance: type === 'numeric'
      ? numericImportance(list, key, targetGetter)
      : categoricalImportance(list, key, targetGetter),
  }));

  const total = raw.reduce((sum, item) => sum + item.importance, 0) || 1;

  return raw
    .map((item) => ({
      ...item,
      importance: round(item.importance / total, 4),
      impact: round(item.importance / total, 4),
    }))
    .sort((a, b) => b.importance - a.importance);
}

export function getBoroughCenter(borough) {
  return BOROUGH_CENTERS[borough] || { lat: 40.7128, lng: -74.006 };
}

export function getTreemapData(requests) {
  const list = safeArray(requests);
  const root = { name: 'Complaints', children: [] };
  if (!list.length) return root;

  const agencyMap = {};

  list.forEach((record) => {
    const agency = str(record?.agency, 'Unknown');
    const complaintType = str(record?.complaint_type, 'Unknown');

    if (!agencyMap[agency]) {
      agencyMap[agency] = { name: agency, children: {} };
    }

    if (!agencyMap[agency].children[complaintType]) {
      agencyMap[agency].children[complaintType] = { name: complaintType, value: 0, totalRisk: 0 };
    }

    agencyMap[agency].children[complaintType].value += 1;
    agencyMap[agency].children[complaintType].totalRisk += getRecordRisk(record);
  });

  root.children = Object.values(agencyMap).map((agency) => ({
    name: agency.name,
    children: Object.values(agency.children).map((type) => ({
      name: type.name,
      value: type.value,
      avgRisk: round(type.totalRisk / type.value, 2),
    })),
  }));

  return root;
}

export function getDelayRiskBuckets(requests) {
  const list = safeArray(requests);
  const buckets = [
    { label: 'Low (0–0.25)', min: 0, max: 0.25, count: 0, requests: [] },
    { label: 'Medium (0.25–0.5)', min: 0.25, max: 0.5, count: 0, requests: [] },
    { label: 'High (0.5–0.75)', min: 0.5, max: 0.75, count: 0, requests: [] },
    { label: 'Critical (0.75+)', min: 0.75, max: 1.01, count: 0, requests: [] },
  ];

  list.forEach((record) => {
    const risk = getRecordRisk(record);
    const bucket = buckets.find((entry) => risk >= entry.min && risk < entry.max);
    if (bucket) {
      bucket.count += 1;
      bucket.requests.push(record);
    }
  });

  return buckets;
}

export function getTopRiskRequests(requests, limit = 8) {
  return [...safeArray(requests)]
    .sort((a, b) => getRecordRisk(b) - getRecordRisk(a))
    .slice(0, limit);
}

export function formatHours(hours) {
  const value = num(hours);
  if (value <= 0) return '0m';
  if (value < 1) return `${Math.round(value * 60)}m`;
  if (value < 24) return `${value.toFixed(1)}h`;
  return `${(value / 24).toFixed(1)}d`;
}

export function formatDate(iso) {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export const filterRequests = applyFilters;
export const computeKPIs = getKpis;
export const getDelayTimeline = getMonthlyTimeline;
export const getBoroughBurden = getBoroughStats;
export const getHotspotClusters = getHotspotPoints;
export const getComplaintTypeStats = getTopComplaints;

export { MONTH_LABELS };
