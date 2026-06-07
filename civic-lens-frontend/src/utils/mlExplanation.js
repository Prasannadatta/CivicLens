import { formatHours } from './analytics';

export const ML_MODEL_VERSION = 'catboost_v1';

const SHOWCASE_KEYS = new Set(['68598811', '61999001', '61999002', '61999003']);

const FEATURE_LABELS = {
  agency_complaint_median: 'Agency + complaint historical delay',
  borough_complaint_median: 'Borough + complaint median',
  agency_zip_median: 'Agency + ZIP historical delay',
  agency_workload_24h: 'Recent agency workload',
  agency_volume: 'Agency volume',
  complaint_type: 'Complaint type',
  month: 'Month / seasonality',
  borough: 'Borough',
  agency: 'Agency',
  season: 'Season',
  incident_zip: 'Incident ZIP',
  open_data_channel_type: 'Submission channel',
};

export function getDelayTier(predictedHours) {
  const hours = Number(predictedHours) || 0;
  if (hours < 24) return 'low';
  if (hours < 72) return 'medium';
  return 'high';
}

export function getDelayTierLabel(recordOrTier) {
  if (recordOrTier && typeof recordOrTier === 'object') {
    const bucket = recordOrTier.predicted_delay_bucket;
    if (bucket) return bucket;
    const risk = recordOrTier.prediction_risk_level;
    if (risk) return `${risk} risk`;
    return getDelayTierLabel(getDelayTier(recordOrTier.predicted_response_hours));
  }
  const labels = { low: 'Low delay', medium: 'Moderate delay', high: 'High delay' };
  return labels[recordOrTier] || recordOrTier;
}

function mapShapFactors(record) {
  const shap = record?.shap_explanation;
  const raw = shap?.factors?.length
    ? shap.factors
    : shap?.top_features;

  if (!Array.isArray(raw) || !raw.length) return null;

  return raw.map((row) => {
    const shapValue = Number(row.shap_value) || 0;
    return {
      feature: row.feature,
      label: row.label || FEATURE_LABELS[row.feature] || row.feature,
      value: record.model_features?.[row.feature] ?? record[row.feature] ?? '—',
      shap: shapValue,
      direction: row.direction || (shapValue >= 0 ? 'increases' : 'decreases'),
    };
  });
}

/** Uses embedded `shap_explanation` when present; otherwise returns empty. */
export function buildShapContributions(record) {
  if (!record) return [];
  const mapped = mapShapFactors(record);
  if (mapped) {
    return mapped.sort((a, b) => Math.abs(b.shap) - Math.abs(a.shap));
  }
  return [];
}

export function buildModelFeatureRows(record) {
  const features = record?.model_features;
  const shapRows = buildShapContributions(record);

  if (features && shapRows.length) {
    const shapByFeature = Object.fromEntries(shapRows.map((row) => [row.feature, row]));
    return Object.entries(features).map(([feature, value]) => {
      const shapRow = shapByFeature[feature];
      const shap = shapRow?.shap ?? 0;
      return {
        feature,
        label: shapRow?.label ?? feature.replace(/_/g, ' '),
        value: value ?? '—',
        shap,
        direction: shap >= 0 ? 'increases' : 'decreases',
        impactLabel: shap >= 0 ? `+${formatHours(Math.abs(shap))}` : `−${formatHours(Math.abs(shap))}`,
      };
    });
  }

  return shapRows.map((row) => ({
    ...row,
    direction: row.shap >= 0 ? 'increases' : 'decreases',
    impactLabel: row.shap >= 0 ? `+${formatHours(Math.abs(row.shap))}` : `−${formatHours(Math.abs(row.shap))}`,
  }));
}

export function getPredictionSummary(record) {
  if (!record) {
    return {
      predictedHours: 0,
      actualHours: 0,
      confidence: 0,
      delayTier: 'low',
      delayBucket: 'Same Day',
      riskLevel: 'Low',
      riskScore: 0,
      modelVersion: ML_MODEL_VERSION,
      baselineHours: 0,
    };
  }

  const predicted = Number(record.predicted_response_hours) || 0;
  const actual = Number(record.response_hours) || 0;
  const confidence = Number(record.prediction_confidence) || 0.75;
  const shap = record.shap_explanation;

  return {
    predictedHours: predicted,
    actualHours: actual,
    confidence,
    delayTier: record.delay_tier || getDelayTier(predicted),
    delayBucket: record.predicted_delay_bucket || 'Same Day',
    riskLevel: record.prediction_risk_level || 'Low',
    riskScore: Number(record.delay_risk_score) || 0,
    modelVersion: record.prediction_model || record.model_version || ML_MODEL_VERSION,
    predictionScope: record.prediction_scope || null,
    predictionGeneratedAt: record.prediction_generated_at || null,
    baselineHours: shap?.baseline_value ?? Math.max(0, predicted * 0.45),
    predictionValue: shap?.prediction_value ?? predicted,
  };
}

/** Curated cases — prioritizes recognizable showcase records with ML data. */
export function getDemoCases(requests, limit = 10) {
  const list = (Array.isArray(requests) ? requests : [])
    .filter((record) => record?.ml_eligible !== false && Number(record?.predicted_response_hours) > 0);

  if (!list.length) return [];

  const showcases = list.filter((record) => SHOWCASE_KEYS.has(record.unique_key));
  const others = list
    .filter((record) => !SHOWCASE_KEYS.has(record.unique_key))
    .map((record) => {
      const predicted = Number(record.predicted_response_hours) || 0;
      const actual = Number(record.response_hours) || 0;
      const error = Math.abs(predicted - actual);
      const risk = Number(record.delay_risk_score) || 0;
      const interest = error * 0.35 + risk * 40 + (record.complaint_type?.includes('HEAT') ? 12 : 0);
      return { record, interest };
    })
    .sort((a, b) => b.interest - a.interest)
    .map(({ record }) => record);

  const ordered = [...showcases, ...others];
  return ordered.slice(0, limit);
}

export function getCaseLabel(record) {
  const type = record?.complaint_type || 'Request';
  const short = type.length > 28 ? `${type.slice(0, 26)}…` : type;
  const bucket = record?.predicted_delay_bucket;
  return bucket ? `${short} · ${bucket}` : `${short} · ${record?.borough || 'NYC'}`;
}
