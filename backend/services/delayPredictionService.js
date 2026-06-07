const MODEL_VERSION = 'heuristic-fallback-v1';

const FEATURE_LABELS = {
  agency_complaint_median: 'Agency + complaint historical delay',
  agency_workload_24h: 'Recent agency workload',
  complaint_type: 'Complaint type',
  borough: 'Borough',
  urgency_score: 'Urgency score',
};

function num(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function pick(record, key) {
  const mf = record?.model_features ?? {};
  if (record?.[key] != null) return record[key];
  if (mf[key] != null) return mf[key];
  return undefined;
}

function hoursToDays(hours) {
  return Math.max(0, num(hours) / 24);
}

function complaintSeverityMultiplier(complaintType) {
  const type = String(complaintType ?? '').toUpperCase();
  if (type.includes('HEAT') || type.includes('SEWER') || type.includes('WATER')) return 1.25;
  if (type.includes('NOISE') || type.includes('GRAFFITI')) return 0.85;
  return 1.0;
}

function boroughAdjustment(borough) {
  const boosts = {
    Bronx: 1.12,
    Brooklyn: 1.06,
    Queens: 1.03,
    Manhattan: 0.95,
    'Staten Island': 1.08,
  };
  return boosts[borough] ?? 1.0;
}

function parseDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function delayBucket(hours) {
  const h = Math.max(0, num(hours));
  if (h <= 24) return 'Same Day';
  if (h <= 72) return '1–3 Days';
  if (h <= 168) return '3–7 Days';
  return 'More than 1 Week';
}

function riskLevel(hours) {
  const h = Math.max(0, num(hours));
  if (h < 24) return 'Low';
  if (h < 72) return 'Medium';
  if (h < 168) return 'High';
  return 'Critical';
}

function delayTier(hours) {
  const h = Math.max(0, num(hours));
  if (h < 24) return 'low';
  if (h < 72) return 'medium';
  return 'high';
}

function delayRiskScore(hours, urgency) {
  const h = Math.max(0, num(hours));
  const u = Math.max(0, Math.min(1, num(urgency)));
  return Math.round(Math.min(0.99, Math.max(0.05, (h / 168) * 0.45 + u * 0.35)) * 10000) / 10000;
}

function buildShapExplanation(predictedHours, factors) {
  const prediction = Math.max(0, num(predictedHours));
  const baseline = Math.round(prediction * 0.45 * 100) / 100;
  return {
    baseline_value: baseline,
    prediction_value: prediction,
    factors,
  };
}

export function enrichRecordHeuristic(record) {
  if (!record || typeof record !== 'object') {
    return {
      predicted_response_hours: 0,
      predicted_delay_bucket: 'Same Day',
      prediction_risk_level: 'Low',
      delay_risk_score: 0,
      model_version: MODEL_VERSION,
    };
  }

  const workload = num(pick(record, 'agency_workload_24h'));
  const historicalHours = num(
    pick(record, 'agency_complaint_median')
    ?? pick(record, 'agency_median_hours')
    ?? record.response_hours,
  );
  const borough = record.borough ?? '';
  const urgency = num(record.urgency_score);

  const histDays = hoursToDays(historicalHours);
  const workloadDays = hoursToDays(workload);
  const severityMult = complaintSeverityMultiplier(record.complaint_type);
  const boroughMult = boroughAdjustment(borough);

  const created = parseDate(record.created_date ?? record.createdAt);
  let recencyFactor = 1.0;
  if (created) {
    const ageDays = (Date.now() - created.getTime()) / (1000 * 3600 * 24);
    if (ageDays <= 7) recencyFactor = 0.9;
    else if (ageDays <= 30) recencyFactor = 0.98;
  }

  const rawDays = (histDays * 0.55 + workloadDays * 0.25 + urgency * 1.2)
    * severityMult
    * boroughMult
    * recencyFactor;

  const predictedHours = Math.round(Math.max(0.1, rawDays * 24) * 10) / 10;
  const factors = [
    {
      feature: 'agency_complaint_median',
      label: FEATURE_LABELS.agency_complaint_median,
      shap_value: Math.round(histDays * 2.4 * 100) / 100,
      direction: 'increases',
    },
    {
      feature: 'agency_workload_24h',
      label: FEATURE_LABELS.agency_workload_24h,
      shap_value: Math.round(workloadDays * 1.1 * 100) / 100,
      direction: 'increases',
    },
    {
      feature: 'urgency_score',
      label: FEATURE_LABELS.urgency_score,
      shap_value: Math.round(urgency * 8 * 100) / 100,
      direction: 'increases',
    },
  ].sort((a, b) => Math.abs(b.shap_value) - Math.abs(a.shap_value));

  return {
    predicted_response_hours: predictedHours,
    predicted_delay_bucket: delayBucket(predictedHours),
    prediction_risk_level: riskLevel(predictedHours),
    delay_risk_score: delayRiskScore(predictedHours, urgency),
    delay_tier: delayTier(predictedHours),
    prediction_confidence: 0.65,
    model_version: MODEL_VERSION,
    agency_workload_24h: workload,
    shap_explanation: buildShapExplanation(predictedHours, factors),
  };
}

/** @deprecated use enrichRecordHeuristic or catboostPredictionService */
export function predictDelay(requestData) {
  const single = !Array.isArray(requestData);
  const items = single ? [requestData] : requestData;
  const results = items.map((record) => {
    const enriched = enrichRecordHeuristic(record);
    return {
      requestId: record?.unique_key ?? record?._id ?? null,
      predictedDelayHours: enriched.predicted_response_hours,
      riskLevel: enriched.prediction_risk_level,
      explanation: `Heuristic estimate ${enriched.predicted_response_hours} hours`,
      ...enriched,
    };
  });
  return single ? results[0] : results;
}
