function delayBucket(hours) {
  const h = Math.max(0, Number(hours) || 0);
  if (h <= 24) return 'Same Day';
  if (h <= 72) return '1–3 Days';
  if (h <= 168) return '3–7 Days';
  return 'More than 1 Week';
}

function riskLevel(hours) {
  const h = Math.max(0, Number(hours) || 0);
  if (h < 24) return 'Low';
  if (h < 72) return 'Medium';
  if (h < 168) return 'High';
  return 'Critical';
}

function delayTier(hours) {
  const h = Math.max(0, Number(hours) || 0);
  if (h < 24) return 'low';
  if (h < 72) return 'medium';
  return 'high';
}

function delayRiskScore(hours, urgency) {
  const h = Math.max(0, Number(hours) || 0);
  const u = Math.max(0, Math.min(1, Number(urgency) || 0));
  return Math.round(Math.min(0.99, Math.max(0.05, (h / 168) * 0.45 + u * 0.35)) * 10000) / 10000;
}

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

const ML_FIELD_KEYS = [
  'predicted_response_hours',
  'predicted_delay_bucket',
  'prediction_risk_level',
  'delay_risk_score',
  'delay_tier',
  'prediction_confidence',
  'prediction_model',
  'prediction_generated_at',
  'prediction_scope',
  'model_version',
  'shap_explanation',
  'model_features',
];

export function getShowcaseYear() {
  return Number(process.env.SHOWCASE_YEAR || 2026);
}

/** All 2026 requests — resolved and unresolved. */
export function getDefaultRequestFilter() {
  const year = getShowcaseYear();
  return {
    created_date: {
      $gte: new Date(`${year}-01-01T00:00:00.000Z`),
      $lt: new Date(`${year + 1}-01-01T00:00:00.000Z`),
    },
  };
}

/** ML predictions apply only to open / unresolved requests. */
export function isMlEligible(record) {
  if (!record || typeof record !== 'object') return false;
  if (Number(record.is_unresolved) === 1) return true;
  return String(record.status ?? '').trim() === 'Open';
}

export function getMlEligibleFilter() {
  return {
    ...getDefaultRequestFilter(),
    $or: [{ is_unresolved: 1 }, { status: 'Open' }],
  };
}

function normalizeShapExplanation(shap, predictedHours) {
  if (!shap || typeof shap !== 'object') return shap;

  const topFeatures = Array.isArray(shap.top_features) ? shap.top_features : null;
  const existingFactors = Array.isArray(shap.factors) ? shap.factors : null;
  const raw = existingFactors?.length ? existingFactors : topFeatures;
  if (!raw?.length) return shap;

  const predicted = Number(shap.prediction_value ?? predictedHours) || 0;
  const factors = raw.map((row) => {
    const shapValue = Number(row.shap_value) || 0;
    return {
      feature: row.feature,
      label: row.label || FEATURE_LABELS[row.feature] || row.feature,
      shap_value: shapValue,
      direction: row.direction || (shapValue >= 0 ? 'increases' : 'decreases'),
    };
  });

  const delta = factors.reduce((sum, row) => sum + row.shap_value, 0);
  const baseline = Number.isFinite(Number(shap.baseline_value))
    ? Number(shap.baseline_value)
    : Math.round((predicted - delta) * 100) / 100;

  return {
    ...shap,
    baseline_value: baseline,
    prediction_value: predicted,
    factors,
  };
}

function stripMlFields(record) {
  const cleaned = { ...record, ml_eligible: false };
  ML_FIELD_KEYS.forEach((key) => {
    delete cleaned[key];
  });
  return cleaned;
}

/** Adds display fields for frontend without re-running the model. */
export function normalizeRequestForApi(record) {
  if (!record || typeof record !== 'object') return record;

  if (!isMlEligible(record)) {
    return stripMlFields(record);
  }

  const predicted = Number(record.predicted_response_hours);
  const hasPrediction = Number.isFinite(predicted) && predicted > 0;
  const shap = hasPrediction
    ? normalizeShapExplanation(record.shap_explanation, predicted)
    : undefined;

  return {
    ...record,
    ml_eligible: true,
    shap_explanation: shap,
    model_version: record.model_version || record.prediction_model || null,
    predicted_delay_bucket: record.predicted_delay_bucket || (hasPrediction ? delayBucket(predicted) : undefined),
    prediction_risk_level: record.prediction_risk_level || (hasPrediction ? riskLevel(predicted) : undefined),
    delay_tier: record.delay_tier || (hasPrediction ? delayTier(predicted) : undefined),
    delay_risk_score: record.delay_risk_score ?? (hasPrediction ? delayRiskScore(predicted, record.urgency_score) : undefined),
  };
}

export function normalizeRequestsForApi(records) {
  return (Array.isArray(records) ? records : []).map(normalizeRequestForApi);
}
